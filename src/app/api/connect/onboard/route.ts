import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Stripe from 'stripe'

// Initialize Stripe only when we have the secret key (not during build)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil' as any,
}) : null

/**
 * Generate Account Onboarding Link
 *
 * Following Stripe's onboarding guide:
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

    const { userId, businessInfo } = await request.json()

    if (!userId) {
      return NextResponse.json({
        error: 'userId is required'
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

    // Check for existing Stripe Connect account (using any to work around type issues)
    const userWithStripe = user as any
    let accountId = userWithStripe.stripeConnect?.stripeConnectAccountId

    // Create account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        controller: {
          losses: { payments: 'application' },
          fees: { payer: 'application' },
          stripe_dashboard: { type: 'express' }
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        email: user.email,
        // Prefill if available
        ...(businessInfo && {
          individual: businessInfo.individual && {
            email: user.email,
            first_name: businessInfo.individual.firstName,
            last_name: businessInfo.individual.lastName
          }
        })
      })

      accountId = account.id

      // Update user record
      await payload.update({
        collection: 'users',
        id: userId,
        data: {
          stripeConnect: {
            stripeConnectAccountId: accountId,
            stripeAccountStatus: 'created'
          }
        } as any
      })
    }

    // Generate account link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/connect/refresh?userId=${userId}`,
      return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/connect/complete?userId=${userId}`,
      type: 'account_onboarding'
    })

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    })

  } catch (error) {
    console.error('Onboarding link error:', error)
    return NextResponse.json({
      error: 'Failed to generate onboarding link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Handle Refresh URL - regenerate account link when expired
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.redirect(
        new URL('/connect/error?message=Missing user ID', process.env.NEXT_PUBLIC_SERVER_URL!)
      )
    }

    const payload = await getPayload({ config: configPromise })

    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!(user as any)?.stripeConnect?.stripeConnectAccountId) {
      return NextResponse.redirect(
        new URL('/connect/error?message=No connected account found', process.env.NEXT_PUBLIC_SERVER_URL!)
      )
    }

    // Generate new account link
    if (!stripe) {
      return NextResponse.redirect(
        new URL('/connect/error?message=Stripe not configured', process.env.NEXT_PUBLIC_SERVER_URL!)
      )
    }
    
    const accountLink = await stripe.accountLinks.create({
              account: (user as any).stripeConnect?.stripeConnectAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/connect/refresh?userId=${userId}`,
      return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/connect/complete?userId=${userId}`,
      type: 'account_onboarding'
    })

    // Redirect to new onboarding URL
    return NextResponse.redirect(accountLink.url)

  } catch (error) {
    console.error('Refresh URL error:', error)
    return NextResponse.redirect(
      new URL('/connect/error?message=Failed to refresh onboarding', process.env.NEXT_PUBLIC_SERVER_URL!)
    )
  }
}
