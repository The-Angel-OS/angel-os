import type { Payload } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface InventoryItem {
  productId: string
  sku: string
  name: string
  currentQuantity: number
  detectedQuantity: number
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface PhotoAnalysisResult {
  imageUrl: string
  detectedItems: InventoryItem[]
  shelfLocation?: string
  timestamp: string
  confidence: number
  needsHumanReview: boolean
}

interface UpdateResult {
  productId: string
  oldQuantity: number
  newQuantity: number
  confidence: number
}

interface ConflictResult {
  item: string
  reason: string
  action: string
}

interface ErrorResult {
  productId: string
  error: string
}

interface UpdateResults {
  updated: UpdateResult[]
  conflicts: ConflictResult[]
  errors: ErrorResult[]
}

export class InventoryIntelligenceService {
  private payload: Payload | null = null
  private tenantId: string

  constructor(tenantId: string) {
    this.tenantId = tenantId
  }

  async initialize() {
    this.payload = await getPayload({ config: configPromise })
  }

  private ensurePayload(): Payload {
    if (!this.payload) {
      throw new Error('InventoryIntelligenceService not initialized. Call initialize() first.')
    }
    return this.payload
  }

  /**
   * POINT AND INVENTORY - Core Function
   * Analyze shelf photos and automatically update inventory
   */
  async analyzeShelfPhoto(imageUrl: string, context: {
    spaceId: string
    userId: string
    shelfLocation?: string
    expectedProducts?: string[]
  }): Promise<PhotoAnalysisResult> {
    
    // 1. AI Vision Analysis
    const visionResult = await this.performVisionAnalysis(imageUrl, context)
    
    // 2. Match detected items to existing products
    const matchedItems = await this.matchDetectedItemsToProducts(visionResult.detectedItems)
    
    // 3. Update inventory automatically
    const updateResults = await this.updateInventoryFromDetection(matchedItems)
    
    // 4. Create message event in the universal system
    await this.createInventoryUpdateMessage(context, updateResults)
    
    return {
      imageUrl,
      detectedItems: matchedItems,
      shelfLocation: context.shelfLocation,
      timestamp: new Date().toISOString(),
      confidence: visionResult.overallConfidence,
      needsHumanReview: visionResult.overallConfidence < 0.8 || updateResults.conflicts.length > 0
    }
  }

  /**
   * AI Vision Analysis using GPT-4o Vision
   */
  private async performVisionAnalysis(imageUrl: string, context: any) {
    const prompt = `Analyze this shelf/inventory photo for business inventory management.

BUSINESS CONTEXT:
- Tenant: ${this.tenantId}
- Location: ${context.shelfLocation || 'Unknown'}
- Expected Products: ${context.expectedProducts?.join(', ') || 'Auto-detect'}

DETECTION TASKS:
1. Identify all visible products/items
2. Count quantities of each item
3. Estimate shelf position/organization
4. Detect any missing or misplaced items
5. Note any quality issues (damaged, expired, etc.)

Return JSON with this structure:
{
  "detectedItems": [
    {
      "name": "Product Name",
      "estimatedQuantity": 12,
      "confidence": 0.95,
      "boundingBox": {"x": 100, "y": 200, "width": 50, "height": 75},
      "notes": "Clearly visible, well-organized",
      "qualityIssues": []
    }
  ],
  "overallConfidence": 0.92,
  "shelfOrganization": "good",
  "recommendedActions": ["restock item X", "reorganize section Y"]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
          ]
        }],
        max_tokens: 2000,
        temperature: 0.1
      })
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  }

  /**
   * Match AI-detected items to existing products in database
   */
  private async matchDetectedItemsToProducts(detectedItems: any[]): Promise<InventoryItem[]> {
    const payload = this.ensurePayload()
    const matchedItems: InventoryItem[] = []

    for (const item of detectedItems) {
      // Fuzzy search for products by name
      const products = await payload.find({
        collection: 'products',
        where: {
          and: [
            { tenant: { equals: this.tenantId } },
            {
              or: [
                { title: { contains: item.name } },
                { sku: { contains: item.name } }
              ]
            }
          ]
        },
        limit: 5
      })

      if (products.docs.length > 0) {
        const bestMatch = products.docs[0]
        if (!bestMatch) continue
        
        matchedItems.push({
          productId: bestMatch.id.toString(),
          sku: bestMatch.sku || '',
          name: bestMatch.title,
          currentQuantity: bestMatch.inventory?.quantity || 0,
          detectedQuantity: item.estimatedQuantity,
          confidence: item.confidence,
          boundingBox: item.boundingBox
        })
      } else {
        // Create unmatched item for human review
        matchedItems.push({
          productId: '',
          sku: '',
          name: item.name,
          currentQuantity: 0,
          detectedQuantity: item.estimatedQuantity,
          confidence: item.confidence * 0.5, // Lower confidence for unmatched
          boundingBox: item.boundingBox
        })
      }
    }

    return matchedItems
  }

  /**
   * Automatically update inventory based on detection
   */
  private async updateInventoryFromDetection(items: InventoryItem[]): Promise<UpdateResults> {
    const payload = this.ensurePayload()
    const updateResults: UpdateResults = {
      updated: [],
      conflicts: [],
      errors: []
    }

    for (const item of items) {
      if (!item.productId) {
        updateResults.conflicts.push({
          item: item.name,
          reason: 'Product not found in database',
          action: 'requires_human_review'
        })
        continue
      }

      // Check if update makes sense
      const quantityDifference = Math.abs(item.currentQuantity - item.detectedQuantity)
      const percentageDifference = quantityDifference / Math.max(item.currentQuantity, 1)

      // Auto-update if difference is reasonable and confidence is high
      if (item.confidence > 0.85 && percentageDifference < 0.5) {
        try {
          await payload.update({
            collection: 'products',
            id: item.productId,
            data: {
              inventory: {
                quantity: item.detectedQuantity,
                trackQuantity: true
              }
            }
          })

          updateResults.updated.push({
            productId: item.productId,
            oldQuantity: item.currentQuantity,
            newQuantity: item.detectedQuantity,
            confidence: item.confidence
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          updateResults.errors.push({
            productId: item.productId,
            error: errorMessage
          })
        }
      } else {
        updateResults.conflicts.push({
          item: item.name,
          reason: `Large quantity change (${item.currentQuantity} → ${item.detectedQuantity}) or low confidence (${item.confidence})`,
          action: 'requires_human_review'
        })
      }
    }

    return updateResults
  }

  /**
   * Create message event in universal Messages system
   */
  private async createInventoryUpdateMessage(context: any, updateResults: UpdateResults) {
    const payload = this.ensurePayload()
    const content = this.generateInventoryUpdateMessage(updateResults)

    await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'system',
          text: `📦 Inventory Analysis: ${updateResults.updated.length > 0 ? 'Updated' : 'Processed'}`,
          metadata: {
            updatedProducts: updateResults.updated.length,
            conflictsCount: updateResults.conflicts.length,
            autoUpdate: true,
            timestamp: new Date().toISOString()
          }
        },
        messageType: 'intelligence',
        space: parseInt(context.spaceId),
        sender: parseInt(context.userId),
        businessIntelligence: {
          department: 'inventory',
          workflow: 'analysis',
          priority: updateResults.conflicts.length > 0 ? 'high' : 'normal',
          analysisData: updateResults
        }
      }
    })
  }

  /**
   * Generate human-readable inventory update message
   */
  private generateInventoryUpdateMessage(updateResults: UpdateResults): string {
    let message = '📸 **Auto-Inventory Update from Photo Analysis**\n\n'

    if (updateResults.updated.length > 0) {
      message += '✅ **Updated Products:**\n'
      updateResults.updated.forEach((update: UpdateResult) => {
        message += `- Product ${update.productId}: ${update.oldQuantity} → ${update.newQuantity} (${(update.confidence * 100).toFixed(1)}% confidence)\n`
      })
      message += '\n'
    }

    if (updateResults.conflicts.length > 0) {
      message += '⚠️ **Requires Human Review:**\n'
      updateResults.conflicts.forEach((conflict: ConflictResult) => {
        message += `- ${conflict.item}: ${conflict.reason}\n`
      })
      message += '\n'
    }

    message += `🤖 **Leo's Analysis**: Processed ${updateResults.updated.length + updateResults.conflicts.length} items with smart confidence filtering.`

    return message
  }

  /**
   * Google Photos Webhook Handler
   */
  async handleGooglePhotosWebhook(albumId: string, newPhotos: string[]) {
    // Filter for inventory-related photos (could use AI classification)
    const inventoryPhotos = await this.classifyPhotosAsInventory(newPhotos)

    for (const photoUrl of inventoryPhotos) {
      await this.analyzeShelfPhoto(photoUrl, {
        spaceId: 'default', // Could be derived from album metadata
        userId: 'system',
        shelfLocation: 'Auto-detected from Google Photos'
      })
    }
  }

  /**
   * Classify if photos are inventory-related using AI
   */
  private async classifyPhotosAsInventory(photoUrls: string[]): Promise<string[]> {
    const inventoryPhotos = []

    for (const photoUrl of photoUrls) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Is this an inventory/shelf/product photo? Answer with just "YES" or "NO".'
              },
              { type: 'image_url', image_url: { url: photoUrl } }
            ]
          }],
          max_tokens: 10,
          temperature: 0
        })
      })

      const data = await response.json()
      if (data.choices[0].message.content.trim() === 'YES') {
        inventoryPhotos.push(photoUrl)
      }
    }

    return inventoryPhotos
  }
} 