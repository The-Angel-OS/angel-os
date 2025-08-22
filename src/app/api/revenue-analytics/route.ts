import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgentFactory } from '@/services/BusinessAgent'
import RevenueService from '@/services/RevenueService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Get tenant information
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
      depth: 1
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Create Business Agent and get analytics
    const businessAgent = BusinessAgentFactory.createForTenant(tenant)
    const analytics = await businessAgent.getRevenueAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Revenue analytics retrieved successfully'
    })

  } catch (error) {
    console.error('[Revenue Analytics API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { action, tenantId, ...params } = body

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    // Get tenant information
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
      depth: 1
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    const businessAgent = BusinessAgentFactory.createForTenant(tenant)

    switch (action) {
      case 'process_monthly_revenue':
        const revenueCalculation = await businessAgent.processMonthlyRevenue()
        return NextResponse.json({
          success: true,
          data: revenueCalculation,
          message: 'Monthly revenue processed successfully'
        })

      case 'adjust_partnership_tier':
        const { newTier, negotiatedTerms } = params
        if (!newTier) {
          return NextResponse.json(
            { error: 'New tier is required' },
            { status: 400 }
          )
        }

        const adjusted = await businessAgent.adjustPartnershipTier(newTier, negotiatedTerms)
        return NextResponse.json({
          success: adjusted,
          message: adjusted ? 'Partnership tier updated successfully' : 'Failed to update partnership tier'
        })

      case 'calculate_commissions':
        // Manual commission calculation for specific period
        const revenueService = new RevenueService()
        const calculation = await revenueService.processMonthlyRevenue(tenantId)

        return NextResponse.json({
          success: true,
          data: calculation,
          message: 'Commission calculation completed'
        })

      case 'bulk_process_revenue':
        // Process revenue for all active tenants (admin only)
        const activeTenantsResult = await payload.find({
          collection: 'tenants',
          where: {
            status: { equals: 'active' }
          },
          limit: 100 // Process in batches
        })

        const results = []
        for (const activeTenant of activeTenantsResult.docs) {
          const agent = BusinessAgentFactory.createForTenant(activeTenant)
          const result = await agent.processMonthlyRevenue()
          results.push({
            tenantId: activeTenant.id,
            tenantName: activeTenant.name,
            result
          })
        }

        return NextResponse.json({
          success: true,
          data: {
            processed: results.length,
            results: results
          },
          message: `Processed revenue for ${results.length} tenants`
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Available actions: process_monthly_revenue, adjust_partnership_tier, calculate_commissions, bulk_process_revenue` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('[Revenue Analytics API] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
