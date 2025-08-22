import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface TelemetryData {
  action: string
  tenantId: string
  spaceId: string
  userId?: string
  timestamp?: string
  metadata?: Record<string, any>
  result?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const telemetryData = await request.json()

    if (!telemetryData.tenantId || !telemetryData.spaceId) {
      return NextResponse.json({ error: 'Tenant ID and Space ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Store telemetry data as a message for unified processing
    const telemetryMessage = await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'system',
          text: `Telemetry: ${telemetryData.action} - ${telemetryData.component || 'unknown'}`,
          metadata: {
            telemetryData,
            action: telemetryData.action,
            component: telemetryData.component
          }
        },
        messageType: 'system',
        space: parseInt(telemetryData.spaceId),
        sender: parseInt(telemetryData.userId) || 1,
      },
    })

    // Update space statistics - commented out since stats field doesn't exist
    // if (telemetryData.spaceId) {
    //   try {
    //     await payload.update({
    //       collection: 'spaces',
    //       id: telemetryData.spaceId,
    //       data: {
    //         'stats.lastActivity': new Date().toISOString()
    //       }
    //     })
    //   } catch (error) {
    //     console.error('Failed to update space stats:', error)
    //   }
    // }

    // Process specific telemetry actions
    switch (telemetryData.action) {
      case 'address_verification':
        await processAddressVerification(payload, telemetryData)
        break
      case 'user_login':
        await processUserLogin(payload, telemetryData)
        break
      case 'file_upload':
        await processFileUpload(payload, telemetryData)
        break
      case 'component_error':
        await processComponentError(payload, telemetryData)
        break
      default:
        console.log(`[Telemetry] Unknown action: ${telemetryData.action}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Telemetry data recorded',
      messageId: telemetryMessage.id
    })

  } catch (error) {
    console.error('[Telemetry API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Process address verification telemetry
async function processAddressVerification(payload: any, telemetryData: any) {
  try {
    const metadata = telemetryData.metadata || {}

    // Create a CRM contact entry if address verification was successful
    if (metadata.result === 'eligible') {
      await payload.create({
        collection: 'contacts',
        data: {
          firstName: metadata.firstName || 'Unknown',
          lastName: metadata.lastName || 'Unknown',
          email: metadata.email,
          phone: metadata.phone,
          address: {
            street: metadata.address,
            city: metadata.city,
            state: metadata.state,
            zipCode: metadata.zipCode
          },
          tenant: parseInt(telemetryData.tenantId),
          leadSource: 'address_verification_widget',
          status: 'qualified',
          tags: ['address_verified', 'housing_eligible'],
          notes: `Address verification completed. Status: ${metadata.result}. Distance from restrictions: ${metadata.distance}ft`
        }
      })
    }

    // Create alert for non-eligible addresses
    if (metadata.result === 'not_eligible') {
      await payload.create({
        collection: 'messages',
        data: {
          content: `Address verification failed: ${metadata.address} is not eligible due to proximity restrictions`,
          messageType: 'system_alert',
          channel: 'alerts',
          tenant: parseInt(telemetryData.tenantId),
          space: parseInt(telemetryData.spaceId),
          author: 1,
          atProtocol: {
            type: 'co.kendev.spaces.alert',
            did: `did:plc:${telemetryData.tenantId}-alert`,
          },
          timestamp: new Date().toISOString(),
          businessContext: {
            department: 'operations',
            workflow: 'support',
            priority: 'high'
          }
        }
      })
    }
  } catch (error) {
    console.error('[Telemetry] Address verification processing failed:', error)
  }
}

// Process user login telemetry
async function processUserLogin(payload: any, telemetryData: any) {
  try {
    // Update user's last login timestamp
    if (telemetryData.userId) {
      await payload.update({
        collection: 'users',
        id: telemetryData.userId,
        data: {
          lastLogin: new Date().toISOString()
        }
      })
    }

    // Track login analytics
    await payload.create({
      collection: 'messages',
      data: {
        content: `User login: ${telemetryData.metadata?.userEmail || 'Unknown'}`,
        messageType: 'system',
        channel: 'analytics',
        tenant: parseInt(telemetryData.tenantId),
        space: parseInt(telemetryData.spaceId),
        author: parseInt(telemetryData.userId) || 1,
        atProtocol: {
          type: 'co.kendev.spaces.analytics',
          did: `did:plc:${telemetryData.tenantId}-analytics`,
        },
        timestamp: new Date().toISOString(),
        businessContext: {
          department: 'operations',
          workflow: 'analytics',
          priority: 'normal'
        }
      }
    })
  } catch (error) {
    console.error('[Telemetry] User login processing failed:', error)
  }
}

// Process file upload telemetry
async function processFileUpload(payload: any, telemetryData: any) {
  try {
    const metadata = telemetryData.metadata || {}

    await payload.create({
      collection: 'messages',
      data: {
        content: `File uploaded: ${metadata.fileName} (${metadata.fileSize} bytes)`,
        messageType: 'system',
        channel: 'file_uploads',
        tenant: parseInt(telemetryData.tenantId),
        space: parseInt(telemetryData.spaceId),
        author: parseInt(telemetryData.userId) || 1,
        atProtocol: {
          type: 'co.kendev.spaces.upload',
          did: `did:plc:${telemetryData.tenantId}-upload`,
        },
        timestamp: new Date().toISOString(),
        businessContext: {
          department: 'operations',
          workflow: 'file_management',
          priority: 'normal'
        }
      }
    })
  } catch (error) {
    console.error('[Telemetry] File upload processing failed:', error)
  }
}

// Process component error telemetry
async function processComponentError(payload: any, telemetryData: any) {
  try {
    const metadata = telemetryData.metadata || {}

    await payload.create({
      collection: 'messages',
      data: {
        content: `Component error in ${telemetryData.component}: ${metadata.error}`,
        messageType: 'system_alert',
        channel: 'errors',
        tenant: parseInt(telemetryData.tenantId),
        space: parseInt(telemetryData.spaceId),
        author: 1,
        atProtocol: {
          type: 'co.kendev.spaces.error',
          did: `did:plc:${telemetryData.tenantId}-error`,
        },
        timestamp: new Date().toISOString(),
        businessContext: {
          department: 'operations',
          workflow: 'error_handling',
          priority: 'urgent'
        }
      }
    })
  } catch (error) {
    console.error('[Telemetry] Component error processing failed:', error)
  }
}

// GET endpoint for telemetry dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const spaceId = searchParams.get('spaceId')
    const timeframe = searchParams.get('timeframe') || '24h'

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Calculate time range
    const now = new Date()
    const hoursBack = timeframe === '1h' ? 1 : timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 24
    const startTime = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000))

    // Query telemetry messages
    const whereClause: any = {
      and: [
        { tenant: { equals: parseInt(tenantId) } },
        { channel: { equals: 'telemetry' } },
        { createdAt: { greater_than: startTime.toISOString() } }
      ]
    }

    if (spaceId) {
      whereClause.and.push({ space: { equals: parseInt(spaceId) } })
    }

    const telemetryMessages = await payload.find({
      collection: 'messages',
      where: whereClause,
      limit: 1000,
      sort: '-createdAt'
    })

    // Process telemetry data for dashboard
    const analytics: {
      totalEvents: number
      eventsByType: Record<string, number>
      eventsByComponent: Record<string, number>
      errorCount: number
      averageResponseTime: number
      topComponents: Array<{component: string, count: number}>
      recentEvents: Array<{timestamp: string, component?: string, action?: string, result?: string}>
    } = {
      totalEvents: telemetryMessages.docs.length,
      eventsByType: {},
      eventsByComponent: {},
      errorCount: 0,
      averageResponseTime: 0,
      topComponents: [],
      recentEvents: telemetryMessages.docs.slice(0, 10).map((msg: any) => ({
        timestamp: msg.createdAt,
        component: msg.businessContext?.component,
        action: msg.businessContext?.action,
        result: msg.businessContext?.metadata?.result
      }))
    }

    // Aggregate analytics
    telemetryMessages.docs.forEach((msg: any) => {
      const context = msg.businessContext || {}
      const action = context.action || 'unknown'
      const component = context.component || 'unknown'

      // Count by action type
      analytics.eventsByType[action] = (analytics.eventsByType[action] || 0) + 1

      // Count by component
      analytics.eventsByComponent[component] = (analytics.eventsByComponent[component] || 0) + 1

      // Count errors
      if (action === 'component_error' || context.metadata?.result === 'error') {
        analytics.errorCount++
      }
    })

    // Calculate top components
    analytics.topComponents = Object.entries(analytics.eventsByComponent)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([component, count]) => ({ component, count: count as number }))

    return NextResponse.json({
      success: true,
      timeframe,
      analytics
    })

  } catch (error) {
    console.error('[Telemetry Dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
