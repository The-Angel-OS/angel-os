/**
 * n8n Integration Webhook Endpoint
 * 
 * This endpoint allows n8n workflows to:
 * 1. Send data to Angel OS for processing
 * 2. Trigger LEO actions and business automation
 * 3. Receive processed results back to n8n
 * 
 * Supports bidirectional communication between n8n and Angel OS
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 n8n webhook called')
    const payload = await getPayload({ config: configPromise })
    
    const body = await request.json()
    const { 
      action, 
      data, 
      tenantId = 1, 
      workflowId, 
      executionId,
      callbackUrl 
    } = body

    console.log('📝 n8n webhook request:', {
      action,
      tenantId,
      workflowId,
      executionId,
      hasCallbackUrl: !!callbackUrl
    })

    // Initialize BusinessAgent for the tenant
    const agent = new BusinessAgent(tenantId.toString(), 'professional')

    let result: any = { success: false, error: 'Unknown action' }

    // Route to appropriate handler based on action
    switch (action) {
      case 'database_operation':
        result = await handleDatabaseOperation(agent, data)
        break
      case 'generate_image':
        result = await handleImageGeneration(agent, data)
        break
      case 'process_order':
        result = await handleOrderProcessing(agent, data)
        break
      case 'inventory_management':
        result = await handleInventoryManagement(agent, data)
        break
      case 'business_search':
        result = await handleBusinessSearch(agent, data)
        break
      case 'leo_conversation':
        result = await handleLeoConversation(agent, data)
        break
      case 'workflow_trigger':
        result = await handleWorkflowTrigger(payload, data, tenantId)
        break
      default:
        result = { success: false, error: `Unknown action: ${action}` }
    }

    // Log the n8n interaction
    await logN8nInteraction(payload, {
      action,
      workflowId,
      executionId,
      tenantId,
      success: result.success,
      result: result.success ? 'success' : result.error
    })

    // If callback URL is provided, send result back to n8n
    if (callbackUrl && result.success) {
      try {
        await fetch(callbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: true,
            data: result,
            executionId,
            timestamp: new Date().toISOString()
          })
        })
        console.log('✅ Callback sent to n8n')
      } catch (callbackError) {
        console.warn('⚠️ Failed to send callback to n8n:', callbackError)
      }
    }

    return NextResponse.json({
      success: result.success,
      data: result,
      executionId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ n8n webhook error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Handle database operations from n8n
 */
async function handleDatabaseOperation(agent: BusinessAgent, data: any): Promise<any> {
  try {
    const { collection, operation, where, id, updateData, createData } = data

    const dbOperation: any = {
      collection,
      operation
    }

    if (where) dbOperation.where = where
    if (id) dbOperation.id = id
    if (updateData) dbOperation.data = updateData
    if (createData) dbOperation.data = createData

    return await agent.executeDatabaseOperation(dbOperation)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle image generation from n8n
 */
async function handleImageGeneration(agent: BusinessAgent, data: any): Promise<any> {
  try {
    const { prompt, model, size, quality, style, productId } = data

    const imageRequest: any = {
      prompt,
      model: model || 'dall-e-3',
      size: size || '1024x1024',
      quality: quality || 'hd',
      style: style || 'vivid'
    }

    if (productId) {
      imageRequest.collection = 'products'
      imageRequest.recordId = productId
    }

    return await agent.generateImage(imageRequest)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle order processing from n8n
 */
async function handleOrderProcessing(agent: BusinessAgent, data: any): Promise<any> {
  try {
    const { orderId, newStatus, reason } = data

    if (!orderId || !newStatus) {
      throw new Error('orderId and newStatus are required')
    }

    return await agent.processOrderStatusChange(orderId, newStatus, reason)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle inventory management from n8n
 */
async function handleInventoryManagement(agent: BusinessAgent, data: any): Promise<any> {
  try {
    const { action, productId, quantity } = data

    if (!action) {
      throw new Error('action is required')
    }

    return await agent.manageInventory(action, productId, quantity)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle business search from n8n
 */
async function handleBusinessSearch(agent: BusinessAgent, data: any): Promise<any> {
  try {
    const { searchTerm, collections } = data

    if (!searchTerm) {
      throw new Error('searchTerm is required')
    }

    return await agent.searchBusiness(searchTerm, collections)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle LEO conversation from n8n
 */
async function handleLeoConversation(agent: BusinessAgent, data: any): Promise<any> {
  try {
    const { message, context } = data

    if (!message) {
      throw new Error('message is required')
    }

    const response = await agent.handleConversationalRequest(message)

    return {
      success: true,
      response,
      context
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle workflow triggers (Angel OS → n8n)
 */
async function handleWorkflowTrigger(payload: any, data: any, tenantId: number): Promise<any> {
  try {
    const { triggerType, triggerData } = data

    // Create a workflow record to track the trigger
    const workflow = await payload.create({
      collection: 'workflows',
      data: {
        name: `n8n Trigger: ${triggerType}`,
        description: `Triggered from n8n workflow`,
        trigger: {
          type: 'webhook',
          source: 'n8n',
          event: triggerType
        },
        steps: [{
          name: 'Process n8n Data',
          type: 'custom_function',
          config: triggerData,
          targetCollection: null,
          automation: 'automated',
          order: 1
        }],
        businessContext: {
          department: 'operations',
          process: 'workflow_automation',
          priority: 'normal'
        },
        status: 'active',
        tenant: tenantId
      }
    })

    return {
      success: true,
      workflowId: workflow.id,
      message: 'Workflow trigger created successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Log n8n interactions for analytics
 */
async function logN8nInteraction(payload: any, data: {
  action: string
  workflowId?: string
  executionId?: string
  tenantId: number
  success: boolean
  result: string
}): Promise<void> {
  try {
    await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'system',
          text: `n8n workflow interaction: ${data.action}`,
          metadata: {
            source: 'n8n-webhook',
            action: data.action,
            workflowId: data.workflowId,
            executionId: data.executionId,
            success: data.success,
            result: data.result,
            timestamp: new Date().toISOString()
          }
        },
        messageType: 'system',
        space: data.tenantId,
        sender: 1, // System user
        priority: 'normal'
      }
    })
  } catch (error) {
    console.warn('Failed to log n8n interaction:', error)
  }
}

// GET endpoint for n8n to test connectivity
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Angel OS n8n webhook endpoint is active',
    timestamp: new Date().toISOString(),
    availableActions: [
      'database_operation',
      'generate_image', 
      'process_order',
      'inventory_management',
      'business_search',
      'leo_conversation',
      'workflow_trigger'
    ]
  })
}
