import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    console.log('🔧 Creating system channel for KenDev.Co Main Space...')
    
    // Create system channel with correct field values
    const systemChannel = await payload.create({
      collection: 'channels',
      data: {
        name: 'system',
        description: 'System channel for LEO AI conversations',
        channelType: 'chat',
        reportType: 'general',
        tenantId: '1',
        guardianAngelId: '1',
        feedConfiguration: {
          feedSource: 'api_webhook',
          feedSettings: { source: 'leo_chat' },
          pollingInterval: 60,
          filters: {
            fileTypes: [],
            keywords: [],
            dateRange: {}
          }
        },
        economics: {
          phyleAffiliation: 'independent_agent',
          model: {
            processingFee: 0,
            accuracyBonus: 0,
            speedBonus: 0,
            volumeDiscounts: [],
            sharing: 'fixed_fee'
          },
          stats: {
            totalEarned: 0,
            itemsProcessed: 0,
            accuracyScore: 0,
            phyleRank: 0,
            reputation: 0
          }
        },
        processingRules: {
          autoProcessing: true,
          requiresHumanReview: false,
          confidenceThreshold: 0.8,
          customPrompts: [],
          outputFormat: 'json'
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

    console.log('✅ System channel created:', systemChannel.id)
    
    return NextResponse.json({
      success: true,
      channel: systemChannel,
      message: 'System channel created successfully'
    })

  } catch (error) {
    console.error('❌ Failed to create system channel:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: 'Failed to create system channel'
    }, { status: 500 })
  }
}

