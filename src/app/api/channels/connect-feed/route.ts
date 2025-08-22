import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

interface FeedConnectionConfig {
  feedType: 'rss' | 'api' | 'webhook' | 'email' | 'ftp' | 'csv'
  feedUrl?: string
  apiKey?: string
  credentials?: {
    username: string
    password: string
  }
  pollingInterval?: number
  webhookSecret?: string
  filters?: {
    keywords?: string[]
    categories?: string[]
    dateRange?: {
      start: string
      end: string
    }
  }
}

interface ChannelType {
  id: number
  tenantId: string
  name: string
  reportType: string
  feedConfiguration?: {
    feedSource?: string
    feedSettings?: any
    pollingInterval?: number
    filters?: any
  }
  status?: string
  lastProcessed?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { channelId, feedConfig } = await request.json() as {
      channelId: string
      feedConfig: FeedConnectionConfig
    }

    // Validate required fields
    if (!channelId || !feedConfig) {
      return NextResponse.json(
        { success: false, error: 'Channel ID and feed configuration are required' },
        { status: 400 }
      )
    }

    // Get existing channel
    const channel = await payload.findByID({
      collection: 'channels',
      id: parseInt(channelId)
    })

    if (!channel) {
      return NextResponse.json(
        { success: false, error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Test the feed connection
    const connectionTest = await testFeedConnection(feedConfig)
    
    if (!connectionTest.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to feed',
          details: connectionTest.error
        },
        { status: 400 }
      )
    }

    // Update channel with feed configuration
    const updatedChannel = await payload.update({
      collection: 'channels',
      id: parseInt(channelId),
      data: {
        feedConfiguration: {
          feedSource: 'api_webhook' as const,
          feedSettings: JSON.stringify(feedConfig),
          pollingInterval: feedConfig.pollingInterval || 300,
          filters: {
            keywords: feedConfig.filters?.keywords?.map(keyword => ({ keyword, id: Math.random().toString() })) || [],
            fileTypes: [],
            dateRange: feedConfig.filters?.dateRange ? {
              from: feedConfig.filters.dateRange.start,
              to: feedConfig.filters.dateRange.end
            } : undefined
          }
        },
        status: 'active',
        lastProcessed: new Date().toISOString()
      }
    })

    // Setup polling/webhook based on feed type
    const integrationResult = await setupFeedIntegration(channelId, feedConfig)

    return NextResponse.json({
      success: true,
      data: {
        channel: updatedChannel,
        integration: integrationResult,
        testResult: connectionTest
      }
    })

  } catch (error) {
    console.error('Error connecting channel feed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect channel feed' },
      { status: 500 }
    )
  }
}

// Get feed configuration for a channel
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
      id: parseInt(channelId)
    })

    if (!channel) {
      return NextResponse.json(
        { success: false, error: 'Channel not found' },
        { status: 404 }
      )
    }

    const feedConfig = channel.feedConfiguration || {}

    return NextResponse.json({
      success: true,
      data: {
        channelId,
        channelName: channel.name,
        feedConfiguration: feedConfig,
        status: channel.status || 'inactive',
        lastProcessed: channel.lastProcessed
      }
    })

  } catch (error) {
    console.error('Error getting feed configuration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get feed configuration' },
      { status: 500 }
    )
  }
}

// Test feed connection
async function testFeedConnection(feedConfig: FeedConnectionConfig): Promise<{
  success: boolean
  error?: string
  data?: any
}> {
  try {
    switch (feedConfig.feedType) {
      case 'rss':
        return await testRSSFeed(feedConfig.feedUrl!)
      case 'api':
        return await testAPIFeed(feedConfig.feedUrl!, feedConfig.apiKey)
      case 'webhook':
        return await testWebhookFeed(feedConfig.webhookSecret!)
      case 'email':
        return await testEmailFeed(feedConfig.credentials!)
      case 'ftp':
        return await testFTPFeed(feedConfig.credentials!)
      case 'csv':
        return await testCSVFeed(feedConfig.feedUrl!)
      default:
        return { success: false, error: 'Unsupported feed type' }
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Test RSS feed
async function testRSSFeed(feedUrl: string) {
  try {
    const response = await fetch(feedUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    if (!text.includes('<rss') && !text.includes('<feed')) {
      throw new Error('Invalid RSS/Atom feed format')
    }
    
    return { success: true, data: { feedUrl, format: 'rss' } }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'RSS feed test failed' 
    }
  }
}

// Test API feed
async function testAPIFeed(feedUrl: string, apiKey?: string) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`
    }
    
    const response = await fetch(feedUrl, { headers })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'API feed test failed' 
    }
  }
}

// Test webhook feed
async function testWebhookFeed(secret: string) {
  // For webhook testing, we just validate that we can generate a webhook URL
  const webhookUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/webhooks/channel-feed?secret=${secret}`
  
  return { 
    success: true, 
    data: { 
      webhookUrl,
      instructions: 'Configure your service to send POST requests to this URL'
    } 
  }
}

// Test email feed
async function testEmailFeed(credentials: { username: string; password: string }) {
  // Email testing would require actual email server integration
  // For now, we'll simulate a successful connection
  return { 
    success: true, 
    data: { 
      message: 'Email credentials validated (simulated)',
      username: credentials.username
    } 
  }
}

// Test FTP feed
async function testFTPFeed(credentials: { username: string; password: string }) {
  // FTP testing would require actual FTP client
  // For now, we'll simulate a successful connection
  return { 
    success: true, 
    data: { 
      message: 'FTP credentials validated (simulated)',
      username: credentials.username
    } 
  }
}

// Test CSV feed
async function testCSVFeed(feedUrl: string) {
  try {
    const response = await fetch(feedUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    const lines = text.split('\n')
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row')
    }
    
    return { 
      success: true, 
      data: { 
        feedUrl, 
        format: 'csv',
        rows: lines.length - 1,
        columns: lines[0]?.split(',').length || 0
      } 
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'CSV feed test failed' 
    }
  }
}

// Setup feed integration (polling, webhooks, etc.)
async function setupFeedIntegration(channelId: string, feedConfig: FeedConnectionConfig) {
  // This would integrate with actual scheduling systems
  // For now, we'll return a simulated setup result
  
  const integrationId = `integration_${channelId}_${Date.now()}`
  
  return {
    integrationId,
    type: feedConfig.feedType,
    status: 'active',
    nextPoll: feedConfig.pollingInterval 
      ? new Date(Date.now() + (feedConfig.pollingInterval * 1000)).toISOString()
      : null,
    webhook: feedConfig.feedType === 'webhook' 
      ? `${process.env.NEXT_PUBLIC_SERVER_URL}/api/webhooks/channel-feed?channel=${channelId}`
      : null
  }
} 