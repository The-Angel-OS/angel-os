/**
 * LEO Tools API - Dynamic Business Operations
 * 
 * This endpoint exposes LEO's enhanced capabilities to the message pump system.
 * LEO can now perform real business operations through natural language commands.
 * 
 * Available tools:
 * - Database operations (query/update any collection)
 * - Image generation and replacement
 * - Inventory management and automation
 * - Order processing and status updates
 * - Business search and analytics
 * - n8n workflow integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'

interface LeoToolRequest {
  tool: string
  parameters: any
  tenantId?: number
  context?: {
    messageId?: string
    channelId?: string
    userId?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🛠️ LEO tools API called')
    const payload = await getPayload({ config: configPromise })
    
    const body: LeoToolRequest = await request.json()
    const { tool, parameters, tenantId = 1, context } = body

    console.log('🔧 LEO tool request:', {
      tool,
      tenantId,
      hasParameters: !!parameters,
      context
    })

    // Initialize BusinessAgent for the tenant
    const agent = new BusinessAgent(tenantId.toString(), 'professional')

    let result: any = { success: false, error: 'Unknown tool' }

    // Route to appropriate tool handler
    switch (tool) {
      case 'database_query':
        result = await handleDatabaseQuery(agent, parameters)
        break
      case 'database_update':
        result = await handleDatabaseUpdate(agent, parameters)
        break
      case 'generate_image':
        result = await handleImageGeneration(agent, parameters)
        break
      case 'replace_image':
        result = await handleImageReplacement(agent, parameters)
        break
      case 'inventory_check':
        result = await handleInventoryCheck(agent, parameters)
        break
      case 'inventory_update':
        result = await handleInventoryUpdate(agent, parameters)
        break
      case 'process_order':
        result = await handleOrderProcessing(agent, parameters)
        break
      case 'business_search':
        result = await handleBusinessSearch(agent, parameters)
        break
      case 'generate_product_images':
        result = await handleProductImageGeneration(agent, parameters)
        break
      case 'analytics_query':
        result = await handleAnalyticsQuery(agent, parameters)
        break
      default:
        result = { success: false, error: `Unknown tool: ${tool}` }
    }

    // Log the tool usage
    await logToolUsage(payload, {
      tool,
      parameters,
      tenantId,
      context,
      success: result.success,
      result: result.success ? 'success' : result.error
    })

    return NextResponse.json({
      success: result.success,
      tool,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ LEO tools API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Handle database queries
 */
async function handleDatabaseQuery(agent: BusinessAgent, parameters: any): Promise<any> {
  const { collection, where, id, limit, sort } = parameters

  if (!collection) {
    return { success: false, error: 'Collection is required' }
  }

  const operation = id ? 'findByID' : 'find'
  const query: any = { collection, operation }

  if (id) query.id = id
  if (where) query.where = where
  if (limit) query.limit = limit
  if (sort) query.sort = sort

  return await agent.executeDatabaseOperation(query)
}

/**
 * Handle database updates
 */
async function handleDatabaseUpdate(agent: BusinessAgent, parameters: any): Promise<any> {
  const { collection, id, data, where } = parameters

  if (!collection || !data) {
    return { success: false, error: 'Collection and data are required' }
  }

  if (!id && !where) {
    return { success: false, error: 'Either id or where clause is required for updates' }
  }

  const operation = id ? 'update' : 'updateMany'
  const query: any = { collection, operation, data }

  if (id) query.id = id
  if (where) query.where = where

  return await agent.executeDatabaseOperation(query)
}

/**
 * Handle image generation
 */
async function handleImageGeneration(agent: BusinessAgent, parameters: any): Promise<any> {
  const { prompt, model, size, quality, style, collection, recordId } = parameters

  if (!prompt) {
    return { success: false, error: 'Prompt is required' }
  }

  const imageRequest = {
    prompt,
    model: model || 'dall-e-3',
    size: size || '1024x1024',
    quality: quality || 'hd',
    style: style || 'vivid'
  }

  if (collection && recordId) {
    (imageRequest as any).collection = collection
    ;(imageRequest as any).recordId = recordId
  }

  return await agent.generateImage(imageRequest)
}

/**
 * Handle image replacement
 */
async function handleImageReplacement(agent: BusinessAgent, parameters: any): Promise<any> {
  const { mediaId, newPrompt } = parameters

  if (!mediaId || !newPrompt) {
    return { success: false, error: 'mediaId and newPrompt are required' }
  }

  // Use the image generator directly for replacement
  return await agent.generateImage({ prompt: newPrompt, mediaId })
}

/**
 * Handle inventory checks
 */
async function handleInventoryCheck(agent: BusinessAgent, parameters: any): Promise<any> {
  const { productId } = parameters
  return await agent.manageInventory('check', productId)
}

/**
 * Handle inventory updates
 */
async function handleInventoryUpdate(agent: BusinessAgent, parameters: any): Promise<any> {
  const { productId, quantity } = parameters

  if (!productId || quantity === undefined) {
    return { success: false, error: 'productId and quantity are required' }
  }

  return await agent.manageInventory('update', productId, quantity)
}

/**
 * Handle order processing
 */
async function handleOrderProcessing(agent: BusinessAgent, parameters: any): Promise<any> {
  const { orderId, newStatus, reason } = parameters

  if (!orderId || !newStatus) {
    return { success: false, error: 'orderId and newStatus are required' }
  }

  return await agent.processOrderStatusChange(orderId, newStatus, reason)
}

/**
 * Handle business search
 */
async function handleBusinessSearch(agent: BusinessAgent, parameters: any): Promise<any> {
  const { searchTerm, collections } = parameters

  if (!searchTerm) {
    return { success: false, error: 'searchTerm is required' }
  }

  return await agent.searchBusiness(searchTerm, collections)
}

/**
 * Handle product image generation
 */
async function handleProductImageGeneration(agent: BusinessAgent, parameters: any): Promise<any> {
  const { productId, regenerate } = parameters

  if (!productId) {
    return { success: false, error: 'productId is required' }
  }

  return await agent.generateProductImages(productId, regenerate || false)
}

/**
 * Handle analytics queries
 */
async function handleAnalyticsQuery(agent: BusinessAgent, parameters: any): Promise<any> {
  const { collection, dateRange, metrics } = parameters

  if (!collection) {
    return { success: false, error: 'collection is required' }
  }

  // Use the database tool for analytics
  return await agent.executeDatabaseOperation({
    collection,
    operation: 'find',
    where: dateRange ? {
      createdAt: {
        greater_than_equal: dateRange.start,
        less_than_equal: dateRange.end
      }
    } : {},
    limit: 100,
    sort: '-createdAt'
  })
}

/**
 * Log tool usage for analytics
 */
async function logToolUsage(payload: any, data: {
  tool: string
  parameters: any
  tenantId: number
  context?: any
  success: boolean
  result: string
}): Promise<void> {
  try {
    await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'system',
          text: `LEO used tool: ${data.tool}`,
          metadata: {
            source: 'leo-tools',
            tool: data.tool,
            parameters: data.parameters,
            context: data.context,
            success: data.success,
            result: data.result,
            timestamp: new Date().toISOString()
          }
        },
        messageType: 'system',
        space: data.tenantId,
        sender: 1, // LEO/System user
        priority: 'low'
      }
    })
  } catch (error) {
    console.warn('Failed to log tool usage:', error)
  }
}

// GET endpoint to list available tools
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'LEO Tools API - Available business automation tools',
    timestamp: new Date().toISOString(),
    availableTools: {
      database_query: {
        description: 'Query any collection in the database',
        parameters: ['collection', 'where?', 'id?', 'limit?', 'sort?']
      },
      database_update: {
        description: 'Update records in any collection',
        parameters: ['collection', 'data', 'id?', 'where?']
      },
      generate_image: {
        description: 'Generate AI images and upload to storage',
        parameters: ['prompt', 'model?', 'size?', 'quality?', 'style?', 'collection?', 'recordId?']
      },
      replace_image: {
        description: 'Replace existing image with new AI-generated one',
        parameters: ['mediaId', 'newPrompt']
      },
      inventory_check: {
        description: 'Check inventory levels and identify low stock',
        parameters: ['productId?']
      },
      inventory_update: {
        description: 'Update product inventory quantities',
        parameters: ['productId', 'quantity']
      },
      process_order: {
        description: 'Update order status and trigger automation',
        parameters: ['orderId', 'newStatus', 'reason?']
      },
      business_search: {
        description: 'Search across multiple business collections',
        parameters: ['searchTerm', 'collections?']
      },
      generate_product_images: {
        description: 'Generate images for specific products',
        parameters: ['productId', 'regenerate?']
      },
      analytics_query: {
        description: 'Query business analytics data',
        parameters: ['collection', 'dateRange?', 'metrics?']
      }
    }
  })
}
