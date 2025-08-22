import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { getReportType, getAllReportTypes } from '@/lib/reportTypes'

// Type-safe date range utility
interface DateRange {
  earliest: string | null
  latest: string | null
}

function calculateDateRange(dates: (string | Date | null | undefined)[]): DateRange {
  const validDates = dates
    .filter((date): date is string | Date => date != null)
    .map(date => new Date(date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())

  if (validDates.length === 0) {
    return { earliest: null, latest: null }
  }

  const first = validDates[0]
  const last = validDates[validDates.length - 1]

  // TypeScript should know these are defined due to length check above
  return {
    earliest: first!.toISOString(),
    latest: last!.toISOString()
  }
}

// Dynamic report generation with JSON search capabilities
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const {
      messageType,
      metaQuery,
      tenantId,
      guardianAngelId,
      dateRange,
      location,
      category,
      status,
      priority,
      limit = 100,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = await request.json()

    // Build the query
    const query: any = {
      where: {
        and: []
      },
      limit,
      page,
      sort: `${sortOrder === 'desc' ? '-' : ''}${sortBy}`
    }

    // Filter by tenant
    if (tenantId) {
      query.where.and.push({
        tenantId: {
          equals: tenantId
        }
      })
    }

    // Filter by Guardian Angel
    if (guardianAngelId) {
      query.where.and.push({
        guardianAngelId: {
          equals: guardianAngelId
        }
      })
    }

    // Filter by message type
    if (messageType) {
      query.where.and.push({
        messageType: {
          equals: messageType
        }
      })
    }

    // Filter by location
    if (location) {
      query.where.and.push({
        location: {
          contains: location
        }
      })
    }

    // Filter by category
    if (category) {
      query.where.and.push({
        category: {
          equals: category
        }
      })
    }

    // Filter by status
    if (status) {
      query.where.and.push({
        status: {
          equals: status
        }
      })
    }

    // Filter by priority
    if (priority) {
      query.where.and.push({
        priority: {
          equals: priority
        }
      })
    }

    // Filter by date range
    if (dateRange) {
      const dateQuery: any = {}
      if (dateRange.from) {
        dateQuery.greater_than_equal = dateRange.from
      }
      if (dateRange.to) {
        dateQuery.less_than_equal = dateRange.to
      }
      if (Object.keys(dateQuery).length > 0) {
        query.where.and.push({
          createdAt: dateQuery
        })
      }
    }

    // Execute the query
    const result = await payload.find({
      collection: 'inventory-messages',
      ...query
    })

    // Type assertion since we know this is inventory-messages collection
    const inventoryMessages = result.docs as any[]

    // Get report type definition
    const reportType = messageType ? getReportType(messageType) : null

    // Filter by metadata query if provided
    let filteredDocs = inventoryMessages
    if (metaQuery && typeof metaQuery === 'object') {
      filteredDocs = inventoryMessages.filter(doc => {
        // InventoryMessage has meta property, so this is safe
        if (doc.meta) {
          return matchesMetaQuery(doc.meta, metaQuery)
        }
        return false
      })
    }

    // Generate aggregated report data
    const reportData = generateReportData(filteredDocs, reportType)

    return NextResponse.json({
      success: true,
      data: {
        messages: filteredDocs,
        totalDocs: filteredDocs.length,
        limit: result.limit,
        totalPages: Math.ceil(filteredDocs.length / result.limit),
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        reportType: reportType,
        reportData: reportData,
        aggregations: generateAggregations(filteredDocs, reportType)
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

// Get available report types
export async function GET() {
  try {
    const reportTypes = getAllReportTypes()
    return NextResponse.json({
      success: true,
      data: reportTypes
    })
  } catch (error) {
    console.error('Error fetching report types:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report types' },
      { status: 500 }
    )
  }
}

// Helper function to match meta queries
function matchesMetaQuery(meta: any, query: any): boolean {
  if (!meta || typeof meta !== 'object') return false

  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('$')) {
      // Handle special operators
      switch (key) {
        case '$and':
          if (!Array.isArray(value)) return false
          return value.every(subQuery => matchesMetaQuery(meta, subQuery))

        case '$or':
          if (!Array.isArray(value)) return false
          return value.some(subQuery => matchesMetaQuery(meta, subQuery))

        case '$not':
          return !matchesMetaQuery(meta, value)

        default:
          return false
      }
    } else if (typeof value === 'object' && value !== null) {
      // Handle field operators
      const fieldValue = meta[key]
      for (const [operator, operandValue] of Object.entries(value)) {
        switch (operator) {
          case '$eq':
            if (fieldValue !== operandValue) return false
            break
          case '$ne':
            if (fieldValue === operandValue) return false
            break
          case '$gt':
            if (fieldValue <= operandValue) return false
            break
          case '$gte':
            if (fieldValue < operandValue) return false
            break
          case '$lt':
            if (fieldValue >= operandValue) return false
            break
          case '$lte':
            if (fieldValue > operandValue) return false
            break
          case '$in':
            if (!Array.isArray(operandValue) || !operandValue.includes(fieldValue)) return false
            break
          case '$nin':
            if (Array.isArray(operandValue) && operandValue.includes(fieldValue)) return false
            break
          case '$regex':
            if (typeof fieldValue !== 'string') return false
            const regex = new RegExp(operandValue)
            if (!regex.test(fieldValue)) return false
            break
          case '$exists':
            if (operandValue && fieldValue === undefined) return false
            if (!operandValue && fieldValue !== undefined) return false
            break
          default:
            return false
        }
      }
    } else {
      // Simple equality check
      if (meta[key] !== value) return false
    }
  }

  return true
}

// Helper function to generate report data
function generateReportData(docs: any[], reportType: any) {
  if (!reportType) return null

  const reportData = {
    summary: {
      totalMessages: docs.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      dateRange: {
        earliest: null as string | null,
        latest: null as string | null
      }
    },
    details: [] as any[]
  }

    // Generate summary statistics
  const statusCounts: Record<string, number> = {}
  const priorityCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}

  docs.forEach(doc => {
    // Count by status
    const status = doc.status || 'unknown'
    statusCounts[status] = (statusCounts[status] || 0) + 1

    // Count by priority
    const priority = doc.priority || 'normal'
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1

    // Count by category
    const category = doc.category || 'general'
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })

    reportData.summary.byStatus = statusCounts
  reportData.summary.byPriority = priorityCounts
  reportData.summary.byCategory = categoryCounts

  // Use the type-safe utility for date range calculation
  reportData.summary.dateRange = calculateDateRange(docs.map(doc => doc.createdAt))

  // Generate detailed records using display fields
  reportData.details = docs.map(doc => {
    const detail: any = {
      id: doc.id,
      title: doc.title,
      location: doc.location,
      createdAt: doc.createdAt,
      status: doc.status,
      priority: doc.priority
    }

    // Add fields specific to report type
    if (reportType.displayFields) {
      reportType.displayFields.forEach((field: string) => {
        if (doc.meta && doc.meta[field] !== undefined) {
          detail[field] = doc.meta[field]
        }
      })
    }

    return detail
  })

  return reportData
}

// Helper function to generate aggregations
function generateAggregations(docs: any[], reportType: any) {
  if (!reportType) return null

  const aggregations: Record<string, any> = {}

  // Generate aggregations based on report type
  if (reportType.id === 'mileage_log') {
    let totalDistance = 0
    let totalDeduction = 0
    const vehicleCounts: Record<string, number> = {}
    const tripTypeCounts: Record<string, number> = {}

    docs.forEach(doc => {
      if (doc.meta) {
        const distance = doc.meta.distance || 0
        const deduction = doc.meta.deduction || 0
        totalDistance += distance
        totalDeduction += deduction

        const vehicle = doc.meta.vehicle || 'unknown'
        vehicleCounts[vehicle] = (vehicleCounts[vehicle] || 0) + 1

        const tripType = doc.meta.tripType || 'business'
        tripTypeCounts[tripType] = (tripTypeCounts[tripType] || 0) + 1
      }
    })

    aggregations.totalDistance = totalDistance
    aggregations.totalDeduction = totalDeduction
    aggregations.averageDistance = docs.length > 0 ? totalDistance / docs.length : 0
    aggregations.byVehicle = vehicleCounts
    aggregations.byTripType = tripTypeCounts
  }

  else if (reportType.id === 'collection_inventory') {
    const collectionCounts: Record<string, number> = {}
    const conditionCounts: Record<string, number> = {}
    const rarityCounts: Record<string, number> = {}
    let totalValue = 0

    docs.forEach(doc => {
      if (doc.meta) {
        const collection = doc.meta.collectionName || 'unknown'
        collectionCounts[collection] = (collectionCounts[collection] || 0) + 1

        const condition = doc.meta.condition || 'unknown'
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1

        const rarity = doc.meta.rarity || 'common'
        rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1

        totalValue += doc.meta.estimatedValue || 0
      }
    })

    aggregations.totalValue = totalValue
    aggregations.averageValue = docs.length > 0 ? totalValue / docs.length : 0
    aggregations.byCollection = collectionCounts
    aggregations.byCondition = conditionCounts
    aggregations.byRarity = rarityCounts
  }

  else if (reportType.id === 'business_inventory') {
    const categoryCounts: Record<string, number> = {}
    const supplierCounts: Record<string, number> = {}
    let totalQuantity = 0
    let totalValue = 0

    docs.forEach(doc => {
      if (doc.meta) {
        const category = doc.meta.category || 'unknown'
        categoryCounts[category] = (categoryCounts[category] || 0) + 1

        const supplier = doc.meta.supplier || 'unknown'
        supplierCounts[supplier] = (supplierCounts[supplier] || 0) + 1

        totalQuantity += doc.meta.quantity || 0
        totalValue += doc.meta.totalValue || 0
      }
    })

    aggregations.totalQuantity = totalQuantity
    aggregations.totalValue = totalValue
    aggregations.byCategory = categoryCounts
    aggregations.bySupplier = supplierCounts
  }

  return aggregations
}
