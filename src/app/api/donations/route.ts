import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface DonationData {
  amount: number
  currency: string
  donorName?: string
  donorEmail?: string
  isAnonymous: boolean
  campaign?: string
  cause?: string
  message?: string
  recurring?: {
    enabled: boolean
    frequency: 'monthly' | 'quarterly' | 'annually'
  }
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'crypto'
  tenantId?: string
  spaceId?: string
}

interface DonationRequest {
  action: 'donate' | 'status' | 'list' | 'campaigns' | 'analytics'
  donationData?: DonationData
  donationId?: string
  campaignId?: string
  dateRange?: {
    start: string
    end: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body: DonationRequest = await request.json()

    switch (body.action) {
      case 'donate':
        return await processDonation(payload, body.donationData!)
      case 'status':
        return await getDonationStatus(payload, body.donationId!)
      case 'list':
        return await listDonations(payload, body.donationData?.tenantId, body.dateRange)
      case 'campaigns':
        return await getCampaigns(payload, body.donationData?.tenantId)
      case 'analytics':
        return await getDonationAnalytics(payload, body.donationData?.tenantId, body.dateRange)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Donations API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function processDonation(payload: any, donationData: DonationData) {
  try {
    console.log(`[Donations] Processing ${donationData.currency} ${donationData.amount} donation`)

    // Generate donation ID
    const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

    // Process payment securely
    const paymentResult = await processSecurePayment({
      amount: donationData.amount,
      currency: donationData.currency,
      paymentMethod: donationData.paymentMethod,
      donationId,
      donorEmail: donationData.donorEmail
    })

    if (!paymentResult.success) {
      return NextResponse.json({
        error: 'Payment processing failed',
        details: paymentResult.error
      }, { status: 400 })
    }

    // Create donation record
    const donation = await payload.create({
      collection: 'donations',
      data: {
        donationId,
        amount: donationData.amount,
        currency: donationData.currency,
        donorName: donationData.isAnonymous ? 'Anonymous' : donationData.donorName,
        donorEmail: donationData.isAnonymous ? null : donationData.donorEmail,
        isAnonymous: donationData.isAnonymous,
        campaign: donationData.campaign,
        cause: donationData.cause,
        message: donationData.message,
        paymentMethod: donationData.paymentMethod,
        paymentId: paymentResult.paymentId,
        transactionId: paymentResult.transactionId,
        status: 'completed',
        isRecurring: donationData.recurring?.enabled || false,
        recurringFrequency: donationData.recurring?.frequency,
        tenant: donationData.tenantId,
        space: donationData.spaceId,
        donatedAt: new Date().toISOString(),
        metadata: {
          ip_address: paymentResult.ipAddress,
          user_agent: paymentResult.userAgent
        }
      }
    })

    // Generate tax receipt if email provided
    let receiptUrl = null
    if (!donationData.isAnonymous && donationData.donorEmail) {
      receiptUrl = await generateTaxReceipt(donation)
      await sendDonationReceipt(donation, receiptUrl)
    }

    // Update campaign totals
    if (donationData.campaign) {
      await updateCampaignTotals(payload, donationData.campaign, donationData.amount)
    }

    // Send confirmation and thank you
    await sendDonationConfirmation(donation)

    return NextResponse.json({
      success: true,
      donation: {
        donationId,
        amount: donationData.amount,
        currency: donationData.currency,
        status: 'completed',
        transactionId: paymentResult.transactionId,
        receiptUrl,
        isRecurring: donationData.recurring?.enabled || false
      },
      message: 'Thank you for your generous donation!',
      impact: await calculateImpactMessage(donationData.amount, donationData.cause)
    })

  } catch (error) {
    console.error('Donation processing failed:', error)
    return NextResponse.json({
      error: 'Donation processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getDonationStatus(payload: any, donationId: string) {
  try {
    const donation = await payload.find({
      collection: 'donations',
      where: { donationId: { equals: donationId } }
    })

    if (!donation.docs.length) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    const don = donation.docs[0]

    return NextResponse.json({
      success: true,
      donation: {
        donationId: don.donationId,
        amount: don.amount,
        currency: don.currency,
        status: don.status,
        donatedAt: don.donatedAt,
        campaign: don.campaign,
        cause: don.cause,
        isRecurring: don.isRecurring,
        transactionId: don.transactionId
      }
    })

  } catch (error) {
    console.error('Donation status retrieval failed:', error)
    return NextResponse.json({
      error: 'Failed to get donation status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function listDonations(payload: any, tenantId?: string, dateRange?: any) {
  try {
    const where: any = {}

    if (tenantId) {
      where.tenant = { equals: tenantId }
    }

    if (dateRange) {
      where.donatedAt = {
        greater_than_equal: dateRange.start,
        less_than_equal: dateRange.end
      }
    }

    const donations = await payload.find({
      collection: 'donations',
      where,
      sort: '-donatedAt',
      limit: 100
    })

    const totalAmount = donations.docs.reduce((sum: number, don: any) => sum + don.amount, 0)
    const averageDonation = donations.docs.length > 0 ? totalAmount / donations.docs.length : 0

    return NextResponse.json({
      success: true,
      donations: donations.docs.map((don: any) => ({
        donationId: don.donationId,
        amount: don.amount,
        currency: don.currency,
        donorName: don.donorName,
        campaign: don.campaign,
        cause: don.cause,
        donatedAt: don.donatedAt,
        isRecurring: don.isRecurring
      })),
      summary: {
        total: donations.totalDocs,
        totalAmount,
        averageDonation: Math.round(averageDonation * 100) / 100,
        currency: donations.docs[0]?.currency || 'USD'
      }
    })

  } catch (error) {
    console.error('Donation listing failed:', error)
    return NextResponse.json({
      error: 'Failed to list donations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getCampaigns(payload: any, tenantId?: string) {
  try {
    const campaigns = [
      {
        id: 'emergency-relief',
        name: 'Emergency Relief Fund',
        description: 'Immediate assistance for families in crisis',
        goal: 50000,
        raised: 32450,
        donors: 156,
        active: true,
        urgency: 'high'
      },
      {
        id: 'education-support',
        name: 'Education Support Program',
        description: 'Scholarships and school supplies for underprivileged children',
        goal: 25000,
        raised: 18200,
        donors: 89,
        active: true,
        urgency: 'medium'
      },
      {
        id: 'creator-support',
        name: 'Creator Support Fund',
        description: 'Help support content creation and community building',
        goal: 10000,
        raised: 7500,
        donors: 234,
        active: true,
        urgency: 'low'
      }
    ]

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map(campaign => ({
        ...campaign,
        progress: Math.round((campaign.raised / campaign.goal) * 100),
        remaining: campaign.goal - campaign.raised
      }))
    })

  } catch (error) {
    console.error('Campaign retrieval failed:', error)
    return NextResponse.json({
      error: 'Failed to get campaigns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getDonationAnalytics(payload: any, tenantId?: string, dateRange?: any) {
  try {
    // This would typically query actual data
    const analytics = {
      totalDonations: 45,
      totalAmount: 15750,
      averageDonation: 350,
      recurringDonors: 12,
      oneTimeDonors: 33,
      topCampaigns: [
        { name: 'Emergency Relief', amount: 8500, percentage: 54 },
        { name: 'Education Support', amount: 4200, percentage: 27 },
        { name: 'Creator Support', amount: 3050, percentage: 19 }
      ],
      monthlyTrend: [
        { month: 'Jan', amount: 2100 },
        { month: 'Feb', amount: 3200 },
        { month: 'Mar', amount: 4100 },
        { month: 'Apr', amount: 6350 }
      ],
      donorRetention: {
        newDonors: 28,
        returningDonors: 17,
        retentionRate: 38
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
      insights: [
        'Donation volume increased 95% this quarter',
        'Emergency campaigns show highest conversion rates',
        'Monthly donors contribute 3x more on average',
        'Mobile donations account for 68% of total volume'
      ]
    })

  } catch (error) {
    console.error('Analytics retrieval failed:', error)
    return NextResponse.json({
      error: 'Failed to get analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions
async function processSecurePayment(paymentData: any): Promise<{
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  ipAddress?: string;
  userAgent?: string;
  error?: string;
}> {
  console.log(`Processing secure donation payment: ${paymentData.currency} ${paymentData.amount}`)
  
  try {
    // TODO: Integrate with Stripe, PayPal, etc.
    // For now, simulate successful payment
    return {
      success: true,
      paymentId: `pay_${Date.now()}`,
      transactionId: `txn_${Date.now()}`,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment processing failed'
    }
  }
}

async function generateTaxReceipt(donation: any): Promise<string> {
  console.log(`Generating tax receipt for donation ${donation.donationId}`)
  // TODO: Generate PDF receipt
  return `${process.env.NEXT_PUBLIC_SITE_URL}/receipt/${donation.donationId}`
}

async function sendDonationReceipt(donation: any, receiptUrl: string) {
  console.log(`Sending donation receipt to ${donation.donorEmail}`)
  // TODO: Send email with receipt
}

async function sendDonationConfirmation(donation: any) {
  console.log(`Sending donation confirmation for ${donation.donationId}`)
  // TODO: Send thank you email/message
}

async function updateCampaignTotals(payload: any, campaignId: string, amount: number) {
  console.log(`Updating campaign ${campaignId} totals by ${amount}`)
  // TODO: Update campaign progress
}

async function calculateImpactMessage(amount: number, cause?: string): Promise<string> {
  if (cause === 'disaster_relief') {
    if (amount >= 250) return 'Your donation can provide emergency shelter for a family!'
    if (amount >= 100) return 'Your donation can provide medical supplies for 10 people!'
    if (amount >= 50) return 'Your donation can provide shelter materials for a family!'
    if (amount >= 25) return 'Your donation can provide emergency food for 3 days!'
  }

  if (cause === 'education') {
    if (amount >= 100) return 'Your donation can provide school supplies for 5 children!'
    if (amount >= 50) return 'Your donation can provide textbooks for 2 students!'
  }

  return 'Thank you for making a difference in our community!'
}
