import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Stripe from 'stripe'

// Initialize Stripe only when we have the secret key (not during build)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil' as any,
}) : null

/**
 * Create Connected Account for Creator/Business
 *
 * Following Stripe's collect-then-transfer guide:
 * https://docs.stripe.com/connect/collect-then-transfer-guide
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe configuration not available',
        message: 'STRIPE_SECRET_KEY is not configured'
      }, { status: 500 })
    }

    const { userId, businessInfo, accountType = 'express' } = await request.json()

    if (!userId) {
      return NextResponse.json({
        error: 'userId is required',
        usage: {
          userId: 'string - User ID from PayloadCMS',
          businessInfo: 'object - Optional business information to prefill',
          accountType: 'express|standard|custom - Stripe account type (default: express)'
        }
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get user details
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Create connected account following Stripe guidelines
    const accountData: any = {
      controller: {
        losses: { payments: 'application' },
        fees: { payer: 'application' },
        stripe_dashboard: { type: accountType }
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      tos_acceptance: {
        service_agreement: 'recipient'
      }
    }

    // Prefill information if available (recommended by Stripe)
    if (user.email) {
      accountData.email = user.email
    }

    if (businessInfo?.individual) {
      accountData.individual = {
        email: user.email,
        first_name: businessInfo.individual.firstName || user.firstName,
        last_name: businessInfo.individual.lastName || user.lastName,
        phone: businessInfo.individual.phone,
        address: businessInfo.individual.address
      }
    }

    if (businessInfo?.business) {
      accountData.business_profile = {
        name: businessInfo.business.name,
        url: businessInfo.business.website,
        support_phone: businessInfo.business.phone,
        support_email: businessInfo.business.email || user.email,
        product_description: businessInfo.business.description
      }

      if (businessInfo.business.address) {
        accountData.company = {
          name: businessInfo.business.name,
          address: businessInfo.business.address
        }
      }
    }

    // Create the connected account
    const account = await stripe.accounts.create(accountData)

    // Update user record with connected account ID
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        stripeConnect: {
          stripeConnectAccountId: account.id,
          stripeAccountStatus: 'created'
        }
      } as any
    })

    // Generate account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/connect/refresh?account=${account.id}`,
      return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/connect/complete?account=${account.id}`,
      type: 'account_onboarding'
    })

    return NextResponse.json({
      success: true,
      message: 'Connected account created successfully',
      account: {
        id: account.id,
        status: account.charges_enabled ? 'active' : 'pending_verification',
        onboardingUrl: accountLink.url,
        requirements: account.requirements
      },
      onboarding: {
        url: accountLink.url,
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        instructions: [
          '1. Complete the onboarding form with business details',
          '2. Provide required identity verification documents',
          '3. Add bank account for payouts',
          '4. Accept Stripe Connect terms of service',
          '5. Return to platform to start accepting payments'
        ]
      },
      nextSteps: {
        message: 'Account created but needs verification to accept payments',
        requirements: account.requirements?.currently_due || [],
        capabilities: account.capabilities
      }
    })

  } catch (error) {
    console.error('Connect account creation error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: 'Stripe account creation failed',
        type: error.type,
        message: error.message,
        details: error.decline_code || error.code
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to create connected account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get Connected Account Status and Requirements
 */
export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe configuration not available',
        message: 'STRIPE_SECRET_KEY is not configured'
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const accountId = searchParams.get('accountId')

    if (!userId && !accountId) {
      return NextResponse.json({
        error: 'Either userId or accountId parameter is required'
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    let stripeAccountId = accountId

    // Get account ID from user if not provided directly
    if (!stripeAccountId && userId) {
      const user = await payload.findByID({
        collection: 'users',
        id: userId,
      })

      // Check for Stripe Connect account ID (using any to work around type issues)
      const userWithStripe = user as any
      if (!userWithStripe?.stripeConnect?.stripeConnectAccountId) {
        return NextResponse.json({
          error: 'User does not have a connected account',
          hasAccount: false,
          needsCreation: true
        }, { status: 404 })
      }

      stripeAccountId = userWithStripe.stripeConnect.stripeConnectAccountId
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId!)

    // Check if account needs onboarding continuation
    const needsOnboarding = !account.details_submitted ||
                           (account.requirements?.currently_due?.length || 0) > 0 ||
                           !account.charges_enabled

    let accountLink = null
    if (needsOnboarding) {
      accountLink = await stripe.accountLinks.create({
        account: stripeAccountId!,
        refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/connect/refresh?account=${stripeAccountId}`,
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/connect/complete?account=${stripeAccountId}`,
        type: 'account_onboarding'
      })
    }

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        country: account.country,
        currency: account.default_currency,
        status: {
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted
        },
        requirements: {
          currently_due: account.requirements?.currently_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          past_due: account.requirements?.past_due || [],
          pending_verification: account.requirements?.pending_verification || []
        },
        capabilities: account.capabilities,
        business_profile: account.business_profile
      },
      onboarding: needsOnboarding ? {
        required: true,
        url: accountLink?.url,
        requirements: account.requirements?.currently_due || [],
        message: 'Account verification required to accept payments'
      } : {
        required: false,
        message: 'Account fully verified and ready to accept payments'
      }
    })

  } catch (error) {
    console.error('Connect account status error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: 'Failed to retrieve account status',
        type: error.type,
        message: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to get account status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Update Connected Account
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe configuration not available',
        message: 'STRIPE_SECRET_KEY is not configured'
      }, { status: 500 })
    }

    const { accountId, updates } = await request.json()

    if (!accountId) {
      return NextResponse.json({
        error: 'accountId is required'
      }, { status: 400 })
    }

    // Update account settings
    const account = await stripe.accounts.update(accountId, updates)

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
      account: {
        id: account.id,
        status: account.charges_enabled ? 'active' : 'pending_verification',
        capabilities: account.capabilities
      }
    })

  } catch (error) {
    console.error('Connect account update error:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: 'Failed to update account',
        type: error.type,
        message: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to update account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
