import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { PhyleEconomyService } from '@/services/PhyleEconomyService'
import { getReportType, validateMessageMeta, calculateFields } from '@/lib/reportTypes'

interface FeedItem {
  id: string
  filename: string
  url: string
  timestamp: Date
  metadata?: any
}

interface ChannelType {
  id: string
  tenantId: string
  guardianAngelId?: string
  name: string
  reportType: string
  feedConfiguration?: {
    feedSource?: string
    feedSettings?: any
    pollingInterval?: number
    filters?: any
  }
  phyleEconomics?: {
    phyleAffiliation?: string
    economicModel?: {
      processingFee?: number
      accuracyBonus?: number
      speedBonus?: number
    }
    economicStats?: {
      totalEarned?: number
      itemsProcessed?: number
      accuracyScore?: number
    }
  }
  processingRules?: {
    autoProcessing?: boolean
    requiresHumanReview?: boolean
    confidenceThreshold?: number
  }
  lastProcessed?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { channelId, feedItems, processingOptions } = await request.json()

    // Get channel configuration
    const channel = await payload.findByID({
      collection: 'channels',
      id: channelId
    }) as any

    if (!channel) {
      return NextResponse.json(
        { success: false, error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Get report type definition
    const reportType = getReportType(channel.reportType)
    if (!reportType) {
      return NextResponse.json(
        { success: false, error: 'Invalid report type' },
        { status: 400 }
      )
    }

    // Process each feed item
    const processedItems = []
    const failedItems = []
    let totalProcessingTime = 0

    for (const feedItem of feedItems) {
      const startTime = Date.now()
      
      try {
        // Analyze the feed item based on channel type
        const analysisResult = await analyzeFeedItem(feedItem, channel, reportType)
        
        // Validate the extracted metadata
        const validation = validateMessageMeta(channel.reportType, analysisResult.meta)
        
        if (!validation.valid && channel.processingRules?.requiresHumanReview) {
          failedItems.push({
            feedItem,
            error: 'Validation failed',
            details: validation.errors,
            requiresReview: true
          })
          continue
        }

        // Calculate derived fields
        const calculatedMeta = calculateFields(channel.reportType, analysisResult.meta)

        // Check confidence threshold
        if (analysisResult.confidence < (channel.processingRules?.confidenceThreshold || 0.8)) {
          if (channel.processingRules?.requiresHumanReview) {
            failedItems.push({
              feedItem,
              error: 'Low confidence',
              confidence: analysisResult.confidence,
              requiresReview: true
            })
            continue
          }
        }

        // Create inventory message
        const inventoryMessage = await payload.create({
          collection: 'inventory-messages',
          data: {
            tenantId: channel.tenantId,
            guardianAngelId: channel.guardianAngelId,
            title: generateMessageTitle(feedItem, reportType, calculatedMeta),
            description: analysisResult.description,
            messageType: channel.reportType,
            category: analysisResult.category,
            location: analysisResult.location,
            geoCoordinates: {
              latitude: analysisResult.geoCoordinates?.latitude || null,
              longitude: analysisResult.geoCoordinates?.longitude || null
            },
            photos: [{
              filename: feedItem.filename,
              url: feedItem.url,
              timestamp: feedItem.timestamp.toISOString()
            }],
            meta: calculatedMeta,
            analysis: analysisResult.analysis,
            confidence: analysisResult.confidence,
            tags: analysisResult.tags,
            status: 'processed' as const,
            priority: determinePriority(calculatedMeta, reportType) as 'low' | 'normal' | 'high' | 'critical',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })

        processedItems.push({
          feedItem,
          inventoryMessage,
          analysisResult,
          processingTime: Date.now() - startTime
        })

        totalProcessingTime += Date.now() - startTime

      } catch (error) {
        console.error('Error processing feed item:', error)
        failedItems.push({
          feedItem,
          error: error instanceof Error ? error.message : 'Unknown error',
          requiresReview: true
        })
      }
    }

    // Calculate quality score
    const qualityScore = calculateQualityScore(processedItems, failedItems)

    // Process economics through PhyleEconomyService
    const economyService = PhyleEconomyService.getInstance()
    const economicResult = await economyService.processWorkCompletion({
      channelId,
      agentId: channel.guardianAngelId || 'system',
      workType: channel.reportType,
      itemsProcessed: processedItems.length,
      qualityScore,
      timeSpent: totalProcessingTime / 1000 / 60, // Convert to minutes
      complexity: calculateComplexity(reportType, processedItems)
    })

    // Generate processing report
    const processingReport = {
      channelId,
      channelName: channel.name,
      reportType: channel.reportType,
      phyleAffiliation: channel.phyleEconomics?.phyleAffiliation,
      summary: {
        totalItems: feedItems.length,
        processedItems: processedItems.length,
        failedItems: failedItems.length,
        successRate: processedItems.length / feedItems.length,
        qualityScore,
        totalProcessingTime: totalProcessingTime / 1000 / 60, // minutes
        averageProcessingTime: totalProcessingTime / feedItems.length / 1000 / 60 // minutes
      },
      economics: economicResult,
      processedData: processedItems.map(item => ({
        id: item.inventoryMessage.id,
        title: item.inventoryMessage.title,
        confidence: item.analysisResult.confidence,
        category: item.analysisResult.category,
        processingTime: item.processingTime
      })),
      failedData: failedItems,
      reportData: await generateChannelReport(channel, processedItems)
    }

    return NextResponse.json({
      success: true,
      data: processingReport
    })

  } catch (error) {
    console.error('Error processing channel feeds:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process channel feeds' },
      { status: 500 }
    )
  }
}

// Get channel processing status
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: 'Channel ID required' },
        { status: 400 }
      )
    }

    const channel = await payload.findByID({
      collection: 'channels',
      id: channelId
    }) as any

    if (!channel) {
      return NextResponse.json(
        { success: false, error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Get recent processing statistics
    const recentMessages = await payload.find({
      collection: 'inventory-messages',
      where: {
        guardianAngelId: { equals: channel.guardianAngelId },
        messageType: { equals: channel.reportType },
        createdAt: { greater_than: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } // Last 7 days
      },
      sort: '-createdAt',
      limit: 100
    })

    const statusSummary = {
      channel: {
        id: channel.id,
        name: channel.name,
        reportType: channel.reportType,
        status: 'active', // Default status
        lastProcessed: channel.lastProcessed
      },
      recentActivity: {
        totalMessages: recentMessages.totalDocs,
        averageConfidence: recentMessages.docs.reduce((sum: number, msg: any) => sum + (msg.confidence || 0), 0) / recentMessages.docs.length,
        statusBreakdown: recentMessages.docs.reduce((acc: any, msg: any) => {
          acc[msg.status] = (acc[msg.status] || 0) + 1
          return acc
        }, {}),
        categoryBreakdown: recentMessages.docs.reduce((acc: any, msg: any) => {
          acc[msg.category] = (acc[msg.category] || 0) + 1
          return acc
        }, {})
      },
      economics: channel.phyleEconomics?.economicStats || {},
      feedConfiguration: channel.feedConfiguration
    }

    return NextResponse.json({
      success: true,
      data: statusSummary
    })

  } catch (error) {
    console.error('Error getting channel status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get channel status' },
      { status: 500 }
    )
  }
}

// Helper function to analyze feed items
async function analyzeFeedItem(feedItem: FeedItem, channel: any, reportType: any): Promise<{
  confidence: number
  description: string
  category: string
  location: string
  geoCoordinates?: { latitude: number; longitude: number } | null
  tags: any[]
  analysis: any
  meta: any
}> {
  // This would integrate with actual AI analysis services
  // For now, we'll simulate analysis based on the report type
  
  const analysis = {
    confidence: 0.85,
    description: `Auto-generated analysis for ${feedItem.filename}`,
    category: 'auto-processed',
    location: 'Unknown',
    geoCoordinates: null as { latitude: number; longitude: number } | null,
    tags: [],
    analysis: {},
    meta: {}
  }

  // Simulate different analysis based on report type
  if (reportType.id === 'mileage_log') {
    analysis.meta = {
      startMileage: Math.floor(Math.random() * 100000),
      endMileage: Math.floor(Math.random() * 100000) + 100,
      vehicle: 'Auto-detected Vehicle',
      purpose: 'Business travel',
      rate: 0.655,
      tripType: 'business'
    }
    analysis.category = 'mileage'
    analysis.description = 'Mileage log extracted from photo'
  } else if (reportType.id === 'collection_inventory') {
    analysis.meta = {
      speciesName: 'Auto-detected Species',
      collectionName: 'Photo Collection',
      condition: 'good',
      rarity: 'common',
      estimatedValue: Math.floor(Math.random() * 100)
    }
    analysis.category = 'collection'
    analysis.description = 'Collection item identified from photo'
  }

  return analysis
}

// Helper function to generate message title
function generateMessageTitle(feedItem: FeedItem, reportType: any, meta: any): string {
  const timestamp = new Date().toLocaleDateString()
  
  if (reportType.id === 'mileage_log') {
    return `Mileage Log - ${meta.vehicle} - ${timestamp}`
  } else if (reportType.id === 'collection_inventory') {
    return `Collection Item - ${meta.speciesName} - ${timestamp}`
  }
  
  return `${reportType.name} - ${feedItem.filename} - ${timestamp}`
}

// Helper function to determine priority
function determinePriority(meta: any, reportType: any): 'low' | 'normal' | 'high' | 'critical' {
  // Business logic to determine priority based on metadata
  if (reportType.id === 'mileage_log' && meta.distance > 500) {
    return 'high'
  }
  if (reportType.id === 'collection_inventory' && meta.rarity === 'very_rare') {
    return 'high'
  }
  return 'normal'
}

// Helper function to calculate quality score
function calculateQualityScore(processed: any[], failed: any[]): number {
  const total = processed.length + failed.length
  if (total === 0) return 0
  
  const avgConfidence = processed.reduce((sum, item) => sum + item.analysisResult.confidence, 0) / processed.length
  const successRate = processed.length / total
  
  return (avgConfidence * 0.7) + (successRate * 0.3)
}

// Helper function to calculate complexity
function calculateComplexity(reportType: any, processedItems: any[]): number {
  // Base complexity on report type and number of fields
  const baseComplexity = Object.keys(reportType.metaSchema).length / 10
  const itemComplexity = processedItems.length * 0.1
  
  return Math.min(10, baseComplexity + itemComplexity)
}

// Helper function to generate channel report
async function generateChannelReport(channel: any, processedItems: any[]) {
  const reportData = {
    channelSummary: {
      name: channel.name,
      type: channel.reportType,
      phyle: channel.phyleEconomics?.phyleAffiliation,
      itemsProcessed: processedItems.length
    },
    aggregatedData: {},
    insights: []
  }

  // Generate aggregations based on report type
  if (channel.reportType === 'mileage_log') {
    const totalDistance = processedItems.reduce((sum, item) => sum + (item.inventoryMessage.meta.distance || 0), 0)
    const totalDeduction = processedItems.reduce((sum, item) => sum + (item.inventoryMessage.meta.deduction || 0), 0)
    
    reportData.aggregatedData = {
      totalDistance,
      totalDeduction,
      averageDistance: totalDistance / processedItems.length,
      vehicles: [...new Set(processedItems.map(item => item.inventoryMessage.meta.vehicle))]
    }
  }

  return reportData
} 