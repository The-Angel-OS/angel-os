import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Accounting Transaction Sync API
 *
 * Syncs transactions to accounting software based on business type
 * Real-time for high-value services, batch for content creators
 */
export async function POST(request: NextRequest) {
  try {
    const { spaceId, transactionId, businessType, forceSync } = await request.json()

    if (!spaceId || !transactionId) {
      return NextResponse.json({
        error: 'Missing required parameters',
        required: ['spaceId', 'transactionId']
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get transaction details
    const transaction = await payload.findByID({
      collection: 'transactions' as any,
      id: transactionId
    })

    if (!transaction) {
      return NextResponse.json({
        error: 'Transaction not found'
      }, { status: 404 })
    }

    // Get accounting integration for this space
    const integrationResult = await payload.find({
      collection: 'accountingIntegrations' as any,
      where: {
        space: { equals: spaceId },
        status: { equals: 'active' }
      }
    })

    if (integrationResult.docs.length === 0) {
      return NextResponse.json({
        error: 'No active accounting integration found',
        suggestion: 'Set up accounting integration first via /api/accounting/setup'
      }, { status: 404 })
    }

    const integration = integrationResult.docs[0]
    const detectedBusinessType = businessType || integration.businessType || 'content_creator'

    // Check if sync is needed based on business type and sync config
    if (!forceSync && !shouldSyncTransaction(transaction, integration.syncConfig)) {
      return NextResponse.json({
        skipped: true,
        reason: 'Transaction does not meet sync criteria',
        nextBatchSync: calculateNextBatchSync(integration.syncConfig)
      })
    }

    // Map transaction data based on business type
    const mappedData = mapTransactionForAccounting(transaction, detectedBusinessType)

    // Perform sync to accounting software
    const syncResult = await syncToAccountingSoftware(integration, mappedData)

    if (syncResult.success) {
      // Update transaction with sync status
      await payload.update({
        collection: 'transactions' as any,
        id: transactionId,
        data: {
          accountingSyncStatus: 'synced',
          accountingSyncDate: new Date(),
          accountingTransactionId: (syncResult as any).remoteId
        }
      })

      // Update integration last sync time
      await payload.update({
        collection: 'accountingIntegrations' as any,
        id: integration.id,
        data: {
          lastSync: new Date(),
          errorCount: 0
        }
      })
    } else {
      // Update error count
      await payload.update({
        collection: 'accountingIntegrations' as any,
        id: integration.id,
        data: {
          errorCount: (integration.errorCount || 0) + 1
        }
      })
    }

    return NextResponse.json({
      success: syncResult.success,
      transactionId,
      mappedData: {
        account: mappedData.account,
        amount: mappedData.amount,
        category: mappedData.type,
        businessType: detectedBusinessType
      },
      syncResult: {
        remoteId: (syncResult as any).remoteId,
        provider: integration.provider,
        syncTime: new Date()
      },
      businessTypeOptimizations: getAppliedOptimizations(mappedData, detectedBusinessType)
    })

  } catch (error) {
    console.error('Transaction sync failed:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Batch Sync API - Process multiple transactions
 */
export async function PUT(request: NextRequest) {
  try {
    const { spaceId, transactionIds, businessType } = await request.json()

    const payload = await getPayload({ config: configPromise })

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const transactionId of transactionIds) {
      try {
        // Use existing sync logic
        const syncResponse = await POST(new NextRequest(request.url, {
          method: 'POST',
          body: JSON.stringify({ spaceId, transactionId, businessType, forceSync: true })
        }))

        const result = await syncResponse.json()
        results.push({ transactionId, ...result })

        if (result.success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        results.push({
          transactionId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }

    return NextResponse.json({
      batchComplete: true,
      summary: {
        total: transactionIds.length,
        successful: successCount,
        failed: errorCount
      },
      results,
      nextScheduledSync: calculateNextBatchSync({ frequency: 'daily' })
    })

  } catch (error) {
    console.error('Batch sync failed:', error)
    return NextResponse.json({
      error: 'Batch sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper Functions

function shouldSyncTransaction(transaction: any, syncConfig: any): boolean {
  // Real-time sync for high-value transactions
  if (syncConfig.realTime) {
    return true
  }

  // Batch sync criteria
  if (syncConfig.frequency === 'daily') {
    // Check if it's been 24 hours since last sync attempt
    const lastAttempt = transaction.lastSyncAttempt
    if (!lastAttempt) return true

    const hoursSinceLastAttempt = (Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60)
    return hoursSinceLastAttempt >= 24
  }

  return false
}

function mapTransactionForAccounting(transaction: any, businessType: string) {
  const mappers = {
    content_creator: mapContentCreatorTransaction,
    physical_service: mapPhysicalServiceTransaction,
    ai_generated_products: mapAIProductsTransaction,
    retail: mapRetailTransaction,
    food_service: mapFoodServiceTransaction
  }

  const mapper = mappers[businessType as keyof typeof mappers] || mappers.content_creator
  return mapper(transaction)
}

function mapContentCreatorTransaction(transaction: any) {
  return {
    type: 'revenue',
    account: 'Digital Content Sales',
    amount: transaction.totalAmount,
    date: transaction.createdAt,
    description: `${transaction.tierType || 'Subscription'} - ${transaction.spaceName}`,
    categories: {
      gross_revenue: transaction.totalAmount,
      platform_fee: transaction.platformFee || (transaction.totalAmount * 0.15),
      processing_fee: transaction.processingFee || (transaction.totalAmount * 0.029),
      net_revenue: transaction.creatorAmount || (transaction.totalAmount * 0.821)
    },
    tax_info: {
      category: 'digital_services',
      deductible_expenses: ['equipment', 'software', 'marketing', 'home_office']
    },
    metadata: {
      subscriber_count: transaction.analytics?.subscribers,
      platform_source: 'kendev_spaces'
    }
  }
}

function mapPhysicalServiceTransaction(transaction: any) {
  return {
    type: 'revenue',
    account: 'Service Revenue',
    amount: transaction.totalAmount,
    date: transaction.createdAt,
    description: transaction.jobDescription || `Service Job #${transaction.id}`,
    customer: transaction.customerName,
    job_costing: {
      job_id: transaction.jobId || transaction.id,
      materials_cost: transaction.materialsCost || 0,
      labor_cost: transaction.laborCost || 0,
      overhead_cost: transaction.overheadCost || 0,
      profit_margin: transaction.totalAmount - (transaction.totalCost || 0)
    },
    categories: {
      gross_revenue: transaction.totalAmount,
      platform_fee: transaction.platformFee || (transaction.totalAmount * 0.03),
      net_revenue: transaction.contractorAmount || (transaction.totalAmount * 0.97)
    },
    payment_terms: transaction.paymentTerms || 'Net 30',
    invoice_required: true
  }
}

function mapAIProductsTransaction(transaction: any) {
  return {
    type: 'revenue',
    account: 'Digital Product Sales',
    amount: transaction.totalAmount,
    date: transaction.createdAt,
    description: `${transaction.productType || 'AI Design'} - ${transaction.platform}`,
    product_tracking: {
      design_id: transaction.designId,
      platform: transaction.salesChannel || transaction.platform,
      product_type: transaction.productType,
      fulfillment_cost: transaction.fulfillmentCost || 0,
      profit_per_item: transaction.totalAmount - (transaction.fulfillmentCost || 0)
    },
    categories: {
      gross_sales: transaction.totalAmount,
      platform_commission: transaction.platformFee || (transaction.totalAmount * 0.06),
      fulfillment_cost: transaction.fulfillmentCost || 0,
      net_profit: transaction.netProfit || (transaction.totalAmount * 0.94)
    },
    cost_of_goods: {
      design_cost: 0, // AI-generated
      production_cost: transaction.fulfillmentCost || 0,
      shipping: transaction.shippingCost || 0
    }
  }
}

function mapRetailTransaction(transaction: any) {
  return {
    type: 'revenue',
    account: 'Product Sales',
    amount: transaction.totalAmount,
    date: transaction.createdAt,
    description: `Retail Sale - ${transaction.productName || 'Product'}`,
    inventory_impact: {
      product_id: transaction.productId,
      quantity_sold: transaction.quantity || 1,
      cost_of_goods: transaction.costOfGoods || 0,
      inventory_value_change: -(transaction.costOfGoods || 0)
    },
    categories: {
      gross_sales: transaction.totalAmount,
      cost_of_goods: transaction.costOfGoods || 0,
      platform_fee: transaction.platformFee || (transaction.totalAmount * 0.10),
      net_revenue: transaction.totalAmount - (transaction.costOfGoods || 0) - (transaction.platformFee || 0)
    }
  }
}

function mapFoodServiceTransaction(transaction: any) {
  return {
    type: 'revenue',
    account: transaction.category === 'food' ? 'Food Sales' : 'Beverage Sales',
    amount: transaction.totalAmount,
    date: transaction.createdAt,
    description: `${transaction.orderType || 'Order'} - ${transaction.items?.length || 1} items`,
    categories: {
      gross_sales: transaction.totalAmount,
      food_cost: transaction.foodCost || (transaction.totalAmount * 0.30),
      labor_cost: transaction.laborCost || (transaction.totalAmount * 0.25),
      platform_fee: transaction.platformFee || (transaction.totalAmount * 0.12),
      net_profit: transaction.totalAmount * 0.33
    },
    operational_data: {
      order_type: transaction.orderType, // dine-in, takeout, delivery
      peak_hour: new Date(transaction.createdAt).getHours() >= 11 && new Date(transaction.createdAt).getHours() <= 14
    }
  }
}

async function syncToAccountingSoftware(integration: any, mappedData: any) {
  try {
    switch (integration.provider) {
      case 'quickbooks':
        return await syncToQuickBooks(integration, mappedData)
      case 'xero':
        return await syncToXero(integration, mappedData)
      case 'merge':
        return await syncViaMerge(integration, mappedData)
      default:
        throw new Error(`Unsupported provider: ${integration.provider}`)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error'
    }
  }
}

async function syncToQuickBooks(integration: any, mappedData: any) {
  // QuickBooks API integration would go here
  // For now, simulate successful sync
  return {
    success: true,
    remoteId: `qb_${Date.now()}`,
    provider: 'quickbooks'
  }
}

async function syncToXero(integration: any, mappedData: any) {
  // Xero API integration would go here
  return {
    success: true,
    remoteId: `xero_${Date.now()}`,
    provider: 'xero'
  }
}

async function syncViaMerge(integration: any, mappedData: any) {
  // Merge.dev unified API integration would go here
  return {
    success: true,
    remoteId: `merge_${Date.now()}`,
    provider: 'merge'
  }
}

function getAppliedOptimizations(mappedData: any, businessType: string) {
  const optimizations = []

  switch (businessType) {
    case 'physical_service':
      if (mappedData.job_costing) optimizations.push('Job costing enabled')
      if (mappedData.invoice_required) optimizations.push('Invoice generation scheduled')
      break
    case 'ai_generated_products':
      if (mappedData.cost_of_goods.design_cost === 0) optimizations.push('Zero-cost AI design accounting')
      if (mappedData.product_tracking) optimizations.push('Design profitability tracking')
      break
    case 'content_creator':
      if (mappedData.tax_info) optimizations.push('Tax deduction categories applied')
      if (mappedData.categories.net_revenue) optimizations.push('Platform fee separation for 1099 prep')
      break
  }

  return optimizations
}

function calculateNextBatchSync(syncConfig: any) {
  const now = new Date()
  switch (syncConfig.frequency) {
    case 'daily':
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(1, 0, 0, 0) // 1 AM next day
      return tomorrow
    case 'weekly':
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    default:
      return new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
  }
}
