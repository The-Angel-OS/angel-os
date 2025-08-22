import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Stripe from 'stripe'

// Initialize Stripe only when we have the secret key (not during build)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil' as any,
}) : null

/**
 * Creator Subscription Creation API
 *
 * Implements Stripe Connect marketplace payments with destination charges
 * Following: https://docs.stripe.com/connect/collect-then-transfer-guide
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe configuration not available',
        message: 'STRIPE_SECRET_KEY is not configured'
      }, { status: 500 })
    }

    const { spaceId, userId, tierType, customAmount } = await request.json()

    if (!spaceId || !userId) {
      return NextResponse.json({
        error: 'Missing required parameters',
        usage: {
          spaceId: 'string - ID of the space to subscribe to',
          userId: 'string - ID of the subscribing user',
          tierType: 'string - Subscription tier (optional)',
          customAmount: 'number - Custom tip/donation amount in cents (optional)'
        }
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get space and user details
    const [space, user] = await Promise.all([
      payload.findByID({ collection: 'spaces', id: spaceId }),
      payload.findByID({ collection: 'users', id: userId })
    ])

    if (!space || !user) {
      return NextResponse.json({
        error: 'Space or user not found'
      }, { status: 404 })
    }

    // Check if monetization is enabled
    if (!space.monetization?.enabled) {
      return NextResponse.json({
        error: 'Monetization not enabled for this space'
      }, { status: 400 })
    }

    // Validate connected account exists (Stripe Connect requirement)
    if (!space.monetization?.merchantAccount) {
      return NextResponse.json({
        error: 'Creator has not completed payment setup',
        message: 'The creator needs to complete their Stripe Connect onboarding first',
        action: 'redirect_to_connect',
        connectUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/connect/accounts`,
        help: {
          title: 'Payment Setup Required',
          description: 'To accept payments, creators must complete Stripe Connect verification',
          steps: [
            'Complete business verification',
            'Add bank account details',
            'Accept terms of service'
          ]
        }
      }, { status: 400 })
    }

    // Verify connected account is ready to accept payments
    try {
      const connectedAccount = await stripe.accounts.retrieve(space.monetization.merchantAccount)

      if (!connectedAccount.charges_enabled) {
        return NextResponse.json({
          error: 'Creator payment account not ready',
          message: 'The creator needs to complete their account verification',
          accountStatus: {
            charges_enabled: connectedAccount.charges_enabled,
            details_submitted: connectedAccount.details_submitted,
            requirements: connectedAccount.requirements?.currently_due || [],
            onboardingUrl: (connectedAccount.requirements?.currently_due?.length || 0) > 0 ?
              `${process.env.NEXT_PUBLIC_SERVER_URL}/api/connect/accounts?userId=${typeof space.tenant === 'object' ? space.tenant.id : space.tenant}` : null
          },
          help: {
            title: 'Account Verification Pending',
            description: 'Creator account verification is still in progress',
            nextSteps: connectedAccount.requirements?.currently_due || []
          }
        }, { status: 400 })
      }
    } catch (error) {
      console.error('Connected account validation error:', error)
      return NextResponse.json({
        error: 'Invalid connected account',
        message: 'Creator payment account not found or accessible',
        details: error instanceof Stripe.errors.StripeError ? error.message : 'Account validation failed'
      }, { status: 400 })
    }

    // Calculate pricing
    const tier = space.monetization.subscriptionTiers?.find((t: any) => t.name === tierType)
    const amount = tier ? tier.price * 100 : 1000 // Default $10 if no tier
    
    // Construct revenue config from new shortened field names
    const revenueConfig = {
      agreementType: space.monetization.revenueAgreementType || 'standard',
      platformFee: space.monetization.revenuePlatformFee || 20,
      contractId: space.monetization.revenueContractId,
      effectiveDate: space.monetization.revenueEffectiveDate,
      reviewDate: space.monetization.revenueReviewDate,
      // AI optimization fields
      aiOptEnabled: space.monetization.aiOptEnabled,
      aiOptVersion: space.monetization.aiOptVersion,
      aiOptFactors: space.monetization.aiOptFactors,
      aiOptFeeMin: space.monetization.aiOptFeeMin,
      aiOptFeeMax: space.monetization.aiOptFeeMax
    }

    const platformFeePercent = calculatePlatformFee(revenueConfig, space)
    const processingFeePercent = 2.9 // Stripe's processing fee

    const totalAmount = customAmount || amount
    const platformFee = Math.round(totalAmount * (platformFeePercent / 100))
    const processingFee = Math.round(totalAmount * (processingFeePercent / 100))
    const creatorAmount = totalAmount - platformFee - processingFee

    // Create Stripe payment with Connect destination charges
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: space.monetization.merchantAccount, // Creator's verified Connect account
      },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never' // Recommended for embedded checkout
      },
      metadata: {
        spaceId,
        userId,
        tierType: tierType || 'default',
        platformFeePercent: platformFeePercent.toString(),
        platformFee: platformFee.toString(),
        creatorAmount: creatorAmount.toString(),
        feeCalculation: 'automatic',
        // Connect-specific metadata for webhook processing
        connectedAccountId: space.monetization.merchantAccount,
        revenueType: 'creator_subscription',
        spaceName: space.name,
        creatorId: typeof space.tenant === 'object' ? space.tenant.id : space.tenant
      },
      // Enhanced description for Connect payments
      description: `${space.name} subscription - ${tierType || 'Support'} tier`,
      statement_descriptor_suffix: space.name.substring(0, 10).toUpperCase(), // Appears on customer's statement
    })

    // Store subscription record with enhanced Connect metadata
    // TODO MIGRATE_TO_JSON: Subscriptions are moving to Spaces.data.subscriptions.
    // This API endpoint needs to be updated to write to the Space.data.subscriptions array
    // instead of the 'subscriptions' collection.
    // This will involve:
    // 1. Fetching the Space document (already fetched as `space`).
    // 2. Appending the new subscription to its `data.subscriptions` array.
    // 3. Updating the Space document.
    // Ensure atomicity or handle concurrent updates if necessary.
    const subscription = await payload.create({
      collection: 'subscriptions' as any, // This will change
      data: {
        user: userId,
        space: spaceId,
        subscriptionTier: tierType || 'default',
        amount: totalAmount,
        platformFee,
        creatorAmount,
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        connectedAccountId: space.monetization.merchantAccount,
        feeBreakdown: {
          totalAmount,
          platformFee,
          platformFeePercent,
          processingFee,
          processingFeePercent,
          creatorReceives: creatorAmount,
          feeReason: getFeeReason(revenueConfig),
          valueJustification: getValueJustification(platformFeePercent),
        },
        connectMetadata: {
          destinationAccount: space.monetization.merchantAccount,
          transferMethod: 'destination_charge',
          feeModel: revenueConfig?.agreementType || 'standard'
        }
      },
    })

    return NextResponse.json({
      success: true,
      subscription,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
      // Enhanced fee transparency following Stripe's best practices
      feeTransparency: {
        youPay: `$${(totalAmount / 100).toFixed(2)}`,
        creatorReceives: `$${(creatorAmount / 100).toFixed(2)} (${((creatorAmount / totalAmount) * 100).toFixed(1)}%)`,
        platformFee: `$${(platformFee / 100).toFixed(2)} (${platformFeePercent}%)`,
        processingFee: `$${(processingFee / 100).toFixed(2)} (${processingFeePercent}%)`,
        breakdown: {
          businessType: (space as any).businessType || 'content_creator',
          message: `${platformFeePercent}% fee optimized for ${(space as any).businessType || 'content_creator'} businesses`,
          valueProvided: getBusinessTypeValueJustification((space as any).businessType || 'content_creator', platformFeePercent),
          comparison: getBusinessTypeComparison((space as any).businessType || 'content_creator', platformFeePercent),
          fairness: `Pay for what you use - not all businesses need the same services`,
          guarantee: "Equitable pricing means creators keep more, customers pay fair rates"
        }
      },
      // Connect payment flow information
      paymentFlow: {
        type: 'destination_charge',
        description: 'Payment processed on platform, instantly transferred to creator',
        timeline: 'Creator receives funds within 2-7 business days',
        security: 'Full PCI compliance and fraud protection included'
      }
    })

  } catch (error) {
    console.error('Subscription creation error:', error)

    // Enhanced error handling for Connect-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        error: 'Payment processing failed',
        type: error.type,
        message: error.message,
        code: error.code,
        // Provide helpful guidance for Connect errors
        guidance: getStripeErrorGuidance(error)
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to create subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get value justification for platform fee
 */
function getValueJustification(feePercent: number): string[] {
  // Note: This function is called from the main API flow where we don't have access to space.businessType
  // For business-type-specific justifications, use getBusinessTypeValueJustification() in the response
  const baseServices = [
    "💰 Equitable pricing based on your business type",
    "🎯 Only pay for services you actually use",
    "🚀 No setup fees, no monthly minimums",
    "📊 Transparent fee breakdown with clear value",
    "🔒 Enterprise-grade security included",
    "💬 Customer support & dispute handling"
  ]

  if (feePercent <= 5) {
    return [...baseServices,
      "⚡ Optimized for high-value transactions",
      "✨ Perfect for service-based businesses"
    ]
  } else if (feePercent <= 12) {
    return [...baseServices,
      "🎉 Competitive rates vs industry alternatives",
      "💡 Complete business automation included"
    ]
  } else if (feePercent <= 20) {
    return [...baseServices,
      "🌟 Full-service creator ecosystem",
      "🤖 AI-powered marketing & automation"
    ]
  } else {
    return [...baseServices,
      "⚡ Enterprise features included",
      "👥 Priority support & custom integrations"
    ]
  }
}

/**
 * Get guidance for Stripe Connect errors
 */
function getStripeErrorGuidance(error: Stripe.errors.StripeError): string {
  switch (error.code) {
    case 'account_invalid':
      return 'The creator\'s payment account needs to complete verification. Please contact the creator.'
    case 'amount_too_large':
      return 'Payment amount exceeds limits. Try a smaller amount or contact support.'
    case 'currency_not_supported':
      return 'Currency not supported for this creator\'s account location.'
    case 'transfer_source_balance_insufficient':
      return 'Insufficient funds for transfer. This is a temporary issue.'
    default:
      return 'Please try again or contact support if the problem persists.'
  }
}

/**
 * Calculate platform fee based on revenue configuration and business type
 */
function calculatePlatformFee(revenueConfig: any, space: any): number {
  if (!revenueConfig) return getBusinessTypeFee(space, 0) // Business-type-aware default

  const agreementType = revenueConfig.agreementType || 'standard'

  switch (agreementType) {
    case 'standard':
      return getBusinessTypeFee(space, revenueConfig.platformFee)

    case 'volume':
      // Volume-based pricing - still offer discounts for high performers
      const monthlyRevenue = space.analytics?.monthlyRevenue || 0
      const tiers = revenueConfig.negotiatedTerms?.volumeTiers || []

      for (const tier of tiers.sort((a: any, b: any) => b.monthlyRevenue - a.monthlyRevenue)) {
        if (monthlyRevenue >= tier.monthlyRevenue) {
          return tier.feePercentage
        }
      }
      return getBusinessTypeFee(space, revenueConfig.platformFee)

    case 'performance':
      // Performance-based adjustments
      const baseFee = revenueConfig.negotiatedTerms?.performanceMetrics?.baseFee || getBusinessTypeFee(space, 0)
      const bonuses = revenueConfig.negotiatedTerms?.performanceMetrics?.bonusThresholds || []

      let adjustedFee = baseFee
      // Apply performance bonuses (simplified)
      bonuses.forEach((bonus: any) => {
        if (meetsPerformanceThreshold(bonus, space)) {
          adjustedFee -= bonus.feeReduction
        }
      })

      return Math.max(adjustedFee, getMinimumFeeForBusinessType(space.businessType))

    case 'ai-optimized':
      // AI-optimized rate (simplified)
      const aiConfig = revenueConfig.negotiatedTerms?.aiOptimization
      if (aiConfig?.enabled) {
        const min = aiConfig.feeRange?.minimum || getMinimumFeeForBusinessType(space.businessType)
        const max = aiConfig.feeRange?.maximum || getMaximumFeeForBusinessType(space.businessType)
        // Simplified AI calculation - in practice this would be much more sophisticated
        return Math.floor(Math.random() * (max - min + 1)) + min
      }
      return getBusinessTypeFee(space, revenueConfig.platformFee)

    case 'negotiated':
      return revenueConfig.platformFee || getBusinessTypeFee(space, 0)

    default:
      return getBusinessTypeFee(space, 0)
  }
}

/**
 * Get business-type-aware platform fee
 */
function getBusinessTypeFee(space: any, customFee?: number): number {
  if (customFee) return customFee

  const businessType = space.businessType || 'content_creator'
  const monthlyRevenue = space.analytics?.monthlyRevenue || 0

  switch (businessType) {
    case 'content_creator':
    case 'digital_services':
      // Content creators get full marketing ecosystem (15-20%)
      if (monthlyRevenue >= 100000) return 8
      if (monthlyRevenue >= 25000) return 10
      if (monthlyRevenue >= 5000) return 12
      return 15

    case 'physical_service':
    case 'construction':
    case 'consulting':
      // Physical services get basic invoicing/POS (2-5%)
      // Based on transaction value, not monthly revenue
      return 3 // Middle rate, can be adjusted per transaction

    case 'ai_generated_products':
    case 'print_on_demand':
      // AI products get design tools + automation (5-8%)
      if (monthlyRevenue >= 50000) return 4
      if (monthlyRevenue >= 10000) return 5
      if (monthlyRevenue >= 2000) return 6
      return 8

    case 'retail':
    case 'ecommerce':
      // Retail gets inventory + moderate marketing (8-12%)
      if (monthlyRevenue >= 200000) return 6
      if (monthlyRevenue >= 50000) return 8
      if (monthlyRevenue >= 10000) return 10
      return 12

    case 'food_service':
    case 'restaurant':
      // Food service gets order management + local marketing (10-15%)
      if (monthlyRevenue >= 100000) return 8
      if (monthlyRevenue >= 20000) return 10
      if (monthlyRevenue >= 5000) return 12
      return 15

    case 'pos_only':
      // Point of sale only gets basic payment processing (1.5-3%)
      return 2.5 // Middle rate

    default:
      // Default to content creator pricing
      return 15
  }
}

/**
 * Get minimum fee for business type
 */
function getMinimumFeeForBusinessType(businessType: string): number {
  switch (businessType) {
    case 'pos_only': return 1.5
    case 'physical_service':
    case 'construction':
    case 'consulting': return 1.5
    case 'ai_generated_products':
    case 'print_on_demand': return 4
    case 'retail':
    case 'ecommerce': return 6
    case 'food_service':
    case 'restaurant': return 8
    default: return 8 // Content creators minimum
  }
}

/**
 * Get maximum fee for business type
 */
function getMaximumFeeForBusinessType(businessType: string): number {
  switch (businessType) {
    case 'pos_only': return 3
    case 'physical_service':
    case 'construction':
    case 'consulting': return 5
    case 'ai_generated_products':
    case 'print_on_demand': return 8
    case 'retail':
    case 'ecommerce': return 12
    case 'food_service':
    case 'restaurant': return 15
    default: return 20 // Content creators maximum
  }
}

/**
 * Get human-readable fee reason
 */
function getFeeReason(revenueConfig: any): string {
  const type = revenueConfig?.agreementType || 'standard'

  switch (type) {
    case 'standard':
      return 'Business-type optimized rate - fair pricing based on services provided'
    case 'volume':
      return 'Volume discount applied based on monthly revenue performance'
    case 'performance':
      return 'Performance-based rate with bonuses for platform promotion and quality content'
    case 'ai-optimized':
      return 'AI-optimized rate based on value delivered and market conditions'
    case 'negotiated':
      return 'Custom negotiated rate per partnership agreement'
    default:
      return 'Equitable pricing based on your business type and value received'
  }
}

/**
 * Get business-type-specific value justification
 */
function getBusinessTypeValueJustification(businessType: string, feePercent: number): string[] {
  switch (businessType) {
    case 'content_creator':
    case 'digital_services':
      return [
        "🎯 Social media automation ($3K/month value)",
        "🌐 Custom website & storefront ($500/month value)",
        "📊 Business analytics & optimization ($200/month value)",
        "🤖 AI-powered content marketing ($400/month value)",
        "⚡ 24/7 platform infrastructure ($100/month value)",
        "💳 Payment processing & security (included)",
        "🎉 Customer support & dispute handling"
      ]

    case 'physical_service':
    case 'construction':
    case 'consulting':
      return [
        "📝 Professional invoicing & estimates",
        "💳 Secure payment processing",
        "👥 Basic customer management",
        "📄 Receipt & documentation generation",
        "📊 Payment tracking & reporting",
        "🔒 PCI compliant security",
        `✨ Fair ${feePercent}% rate vs QuickBooks $50/month + 2.9%`
      ]

    case 'ai_generated_products':
    case 'print_on_demand':
      return [
        "🎨 AI-powered design generation (unlimited)",
        "🔄 Cross-platform automation (CafePress, Etsy, etc.)",
        "📈 Market trend analysis & suggestions",
        "🎯 SEO optimization for better visibility",
        "📊 Performance analytics across platforms",
        "🚀 Inventory-free business model support",
        `💰 Save $1000s vs hiring designers at $50-200 per design`
      ]

    case 'retail':
    case 'ecommerce':
      return [
        "📦 Product catalog & inventory management",
        "🚀 Basic marketing automation",
        "🚛 Order fulfillment coordination",
        "👥 Customer analytics & insights",
        "🔍 SEO optimization for discoverability",
        "💳 Secure payment processing",
        `💡 Complete e-commerce vs Shopify $29/month + 2.9% + apps`
      ]

    case 'food_service':
    case 'restaurant':
      return [
        "🍕 Online menu & ordering system",
        "📍 Local SEO & marketing",
        "🎁 Customer loyalty programs",
        "🚚 Delivery/pickup coordination",
        "📱 Social media management",
        "📊 Restaurant analytics & insights",
        `🏆 Complete solution vs multiple services costing $500+/month`
      ]

    case 'pos_only':
      return [
        "💳 Credit card processing",
        "🧾 Professional receipt generation",
        "📊 Basic sales tracking",
        "📈 Payment reporting",
        "🔒 Secure payment handling",
        `✨ Just ${feePercent}% vs Square's 2.6% + monthly fees`
      ]

    default:
      return [
        "🎯 Business-optimized platform features",
        "💳 Secure payment processing",
        "📊 Analytics & reporting",
        "🔒 Enterprise-grade security",
        "💬 Customer support included"
      ]
  }
}

/**
 * Get business-type-specific competitive comparison
 */
function getBusinessTypeComparison(businessType: string, feePercent: number): string {
  switch (businessType) {
    case 'content_creator':
    case 'digital_services':
      return `OnlyFans: 20% | YouTube: 30% | Patreon: 5-12%+fees | Our Platform: ${feePercent}%`

    case 'physical_service':
    case 'construction':
    case 'consulting':
      return `QuickBooks: $50/month + 2.9% | FreshBooks: $60/month + 3.5% | Our Platform: ${feePercent}% only`

    case 'ai_generated_products':
    case 'print_on_demand':
      return `Hiring designers: $50-200 each | Platform tools: $200+/month | Our Platform: ${feePercent}% + unlimited AI`

    case 'retail':
    case 'ecommerce':
      return `Shopify: $29/month + 2.9% + apps | Amazon: 15% + FBA | Our Platform: ${feePercent}% all-in`

    case 'food_service':
    case 'restaurant':
      return `DoorDash: 15-30% | UberEats: 15-30% | Toast: $69/month + fees | Our Platform: ${feePercent}%`

    case 'pos_only':
      return `Square: 2.6% + monthly fees | PayPal: 2.9% + $30/month | Our Platform: ${feePercent}%`

    default:
      return `Industry average: 10-30% | Traditional setup: $200+/month | Our Platform: ${feePercent}%`
  }
}

/**
 * Check if performance threshold is met (simplified)
 */
function meetsPerformanceThreshold(bonus: any, space: any): boolean {
  // Simplified performance checking - in practice this would query analytics
  switch (bonus.metric) {
    case 'mau':
      return (space.analytics?.monthlyActiveUsers || 0) >= bonus.threshold
    case 'growth':
      return (space.analytics?.revenueGrowth || 0) >= bonus.threshold
    case 'quality':
      return (space.analytics?.contentQualityScore || 0) >= bonus.threshold
    case 'promotion':
      return space.analytics?.platformPromotion || false
    default:
      return false
  }
}

/**
 * Get User Subscriptions
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

    if (!userId) {
      return NextResponse.json({
        error: 'userId parameter is required'
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get user's active subscriptions
    // TODO MIGRATE_TO_JSON: Subscriptions are moving to Spaces.data.subscriptions.
    // This GET endpoint, if it's meant to fetch these types of subscriptions (rather than spaceMemberships),
    // will need to be updated.
    // It would involve:
    // 1. Querying Spaces where `data.subscriptions` array contains entries for the given `userId`.
    // 2. This is a complex query for JSON arrays and might require fetching relevant spaces
    //    and then filtering their `data.subscriptions` arrays in application code, or using advanced DB functions.
    // The current code fetches `spaceMemberships`, which is different from the `subscriptions`
    // being created in the POST handler (which are payment/tier subscriptions).
    // If this GET is for `spaceMemberships`, it's unaffected by `Subscriptions` collection removal.
    // If this GET is intended to fetch what the POST creates, it needs a major rewrite.
    // For now, assuming it's about `spaceMemberships` based on collection slug.
    const subscriptions = await payload.find({
      collection: 'space-memberships', // This seems to be fetching space *memberships*, not *payment subscriptions*.
                                      // If it were fetching payment subscriptions, this would need to change.
      where: {
        user: {
          equals: userId,
        },
      },
    })

    const activeSubscriptions = subscriptions.docs.filter(sub => sub.status === 'active')
    const pendingSubscriptions = subscriptions.docs.filter(sub => sub.status === 'pending')

    return NextResponse.json({
      success: true,
      userId,
      subscriptions: subscriptions.docs,
      activeSubscriptions,
      pendingSubscriptions,
      totalSubscriptions: subscriptions.docs.length,
      hasActiveSubscription: activeSubscriptions.length > 0,
      membershipRoles: activeSubscriptions.map(sub => sub.role),
    })

  } catch (error) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json({
      error: 'Failed to get subscriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
