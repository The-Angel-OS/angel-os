/**
 * DatabaseTool - Dynamic database query/update tool for LEO
 * 
 * This tool gives LEO the ability to query and update any collection
 * in the Angel OS database, similar to n8n's MySQL tool but for Payload CMS.
 * 
 * LEO can use this to:
 * - Decrement inventory when orders are shipped
 * - Update order statuses
 * - Create/update any business records
 * - Query business data for intelligent responses
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Config } from '../payload-types'

type CollectionSlug = keyof Config['collections']

interface DatabaseQuery {
  collection: CollectionSlug
  operation: 'find' | 'findByID' | 'create' | 'update' | 'delete'
  where?: any
  data?: any
  id?: string | number
  limit?: number
  sort?: string
  depth?: number
}

interface DatabaseResult {
  success: boolean
  data?: any
  error?: string
  operation: string
  collection: string
  affectedCount?: number
}

export class DatabaseTool {
  private payload: any = null

  constructor() {
    this.initializePayload()
  }

  private async initializePayload() {
    if (!this.payload) {
      this.payload = await getPayload({ config: configPromise })
    }
    return this.payload
  }

  /**
   * Execute a database query/operation
   */
  async execute(query: DatabaseQuery): Promise<DatabaseResult> {
    try {
      const payload = await this.initializePayload()
      
      console.log(`🔧 DatabaseTool executing ${query.operation} on ${query.collection}`)
      
      switch (query.operation) {
        case 'find':
          return await this.handleFind(payload, query)
        case 'findByID':
          return await this.handleFindByID(payload, query)
        case 'create':
          return await this.handleCreate(payload, query)
        case 'update':
          return await this.handleUpdate(payload, query)
        case 'delete':
          return await this.handleDelete(payload, query)
        default:
          throw new Error(`Unsupported operation: ${query.operation}`)
      }
    } catch (error) {
      console.error('DatabaseTool error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        operation: query.operation,
        collection: query.collection
      }
    }
  }

  private async handleFind(payload: any, query: DatabaseQuery): Promise<DatabaseResult> {
    const result = await payload.find({
      collection: query.collection,
      where: query.where || {},
      limit: query.limit || 10,
      sort: query.sort || '-createdAt',
      depth: query.depth || 1
    })

    return {
      success: true,
      data: result,
      operation: 'find',
      collection: query.collection,
      affectedCount: result.totalDocs
    }
  }

  private async handleFindByID(payload: any, query: DatabaseQuery): Promise<DatabaseResult> {
    if (!query.id) {
      throw new Error('ID is required for findByID operation')
    }

    const result = await payload.findByID({
      collection: query.collection,
      id: query.id,
      depth: query.depth || 1
    })

    return {
      success: true,
      data: result,
      operation: 'findByID',
      collection: query.collection,
      affectedCount: 1
    }
  }

  private async handleCreate(payload: any, query: DatabaseQuery): Promise<DatabaseResult> {
    if (!query.data) {
      throw new Error('Data is required for create operation')
    }

    const result = await payload.create({
      collection: query.collection,
      data: query.data
    })

    return {
      success: true,
      data: result,
      operation: 'create',
      collection: query.collection,
      affectedCount: 1
    }
  }

  private async handleUpdate(payload: any, query: DatabaseQuery): Promise<DatabaseResult> {
    if (!query.id) {
      throw new Error('ID is required for update operation')
    }
    if (!query.data) {
      throw new Error('Data is required for update operation')
    }

    const result = await payload.update({
      collection: query.collection,
      id: query.id,
      data: query.data
    })

    return {
      success: true,
      data: result,
      operation: 'update',
      collection: query.collection,
      affectedCount: 1
    }
  }

  private async handleDelete(payload: any, query: DatabaseQuery): Promise<DatabaseResult> {
    if (!query.id) {
      throw new Error('ID is required for delete operation')
    }

    const result = await payload.delete({
      collection: query.collection,
      id: query.id
    })

    return {
      success: true,
      data: result,
      operation: 'delete',
      collection: query.collection,
      affectedCount: 1
    }
  }

  /**
   * Business-specific helper methods for common operations
   */

  /**
   * Update product inventory
   */
  async updateInventory(productId: string | number, newQuantity: number): Promise<DatabaseResult> {
    return await this.execute({
      collection: 'products',
      operation: 'update',
      id: productId,
      data: {
        'inventory.quantity': newQuantity,
        'inventory.lastUpdated': new Date().toISOString()
      }
    })
  }

  /**
   * Decrement inventory when order is shipped
   */
  async decrementInventoryForOrder(orderId: string | number): Promise<DatabaseResult[]> {
    try {
      // First, get the order details
      const orderResult = await this.execute({
        collection: 'orders',
        operation: 'findByID',
        id: orderId,
        depth: 2
      })

      if (!orderResult.success || !orderResult.data) {
        throw new Error('Order not found')
      }

      const order = orderResult.data
      const results: DatabaseResult[] = []

      // Process each item in the order
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.product && item.quantity) {
            // Get current inventory
            const productResult = await this.execute({
              collection: 'products',
              operation: 'findByID',
              id: item.product.id || item.product,
              depth: 1
            })

            if (productResult.success && productResult.data) {
              const currentQuantity = productResult.data.inventory?.quantity || 0
              const newQuantity = Math.max(0, currentQuantity - item.quantity)

              // Update inventory
              const updateResult = await this.updateInventory(
                item.product.id || item.product,
                newQuantity
              )
              results.push(updateResult)
            }
          }
        }
      }

      return results
    } catch (error) {
      return [{
        success: false,
        error: error instanceof Error ? error.message : String(error),
        operation: 'decrementInventoryForOrder',
        collection: 'orders'
      }]
    }
  }

  /**
   * Update order status and trigger inventory changes
   */
  async updateOrderStatus(orderId: string | number, newStatus: string): Promise<DatabaseResult[]> {
    const results: DatabaseResult[] = []

    // Update the order status
    const orderUpdate = await this.execute({
      collection: 'orders',
      operation: 'update',
      id: orderId,
      data: {
        status: newStatus,
        statusUpdatedAt: new Date().toISOString()
      }
    })
    results.push(orderUpdate)

    // If order is being shipped, decrement inventory
    if (newStatus === 'shipped' || newStatus === 'fulfilled') {
      const inventoryResults = await this.decrementInventoryForOrder(orderId)
      results.push(...inventoryResults)
    }

    return results
  }

  /**
   * Create a message in the system (for logging business operations)
   */
  async logBusinessOperation(operation: string, details: any, tenantId: number = 1): Promise<DatabaseResult> {
    return await this.execute({
      collection: 'messages',
      operation: 'create',
      data: {
        content: {
          type: 'system',
          text: `Business operation: ${operation}`,
          metadata: {
            source: 'database-tool',
            operation,
            details,
            timestamp: new Date().toISOString()
          }
        },
        messageType: 'system',
        space: tenantId,
        sender: 1, // System/LEO user
        priority: 'normal'
      }
    })
  }

  /**
   * Query business analytics data
   */
  async getBusinessAnalytics(collection: CollectionSlug, dateRange?: { start: string, end: string }): Promise<DatabaseResult> {
    const where: any = {}
    
    if (dateRange) {
      where.createdAt = {
        greater_than_equal: dateRange.start,
        less_than_equal: dateRange.end
      }
    }

    return await this.execute({
      collection,
      operation: 'find',
      where,
      limit: 100,
      sort: '-createdAt'
    })
  }

  /**
   * Search across multiple collections (for LEO's intelligent responses)
   */
  async searchAcrossCollections(searchTerm: string, collections: CollectionSlug[] = ['products', 'orders', 'contacts']): Promise<{ [key: string]: DatabaseResult }> {
    const results: { [key: string]: DatabaseResult } = {}

    for (const collection of collections) {
      try {
        // Basic text search - can be enhanced with full-text search
        const result = await this.execute({
          collection,
          operation: 'find',
          where: {
            or: [
              { title: { contains: searchTerm } },
              { name: { contains: searchTerm } },
              { description: { contains: searchTerm } }
            ]
          },
          limit: 5
        })
        results[collection] = result
      } catch (error) {
        results[collection] = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          operation: 'search',
          collection
        }
      }
    }

    return results
  }
}

// Export singleton instance
export const databaseTool = new DatabaseTool()
