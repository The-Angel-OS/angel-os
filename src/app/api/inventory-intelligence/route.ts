import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const {
      imageUrl,
      spaceId,
      tenantId,
      userId,
      shelfLocation,
      expectedProducts,
      action = 'analyze_and_update'
    } = body

    // Validate required fields
    if (!imageUrl || !spaceId || !tenantId) {
      return NextResponse.json({
        error: 'Missing required fields: imageUrl, spaceId, and tenantId are required'
      }, { status: 400 })
    }

    switch (action) {
      case 'analyze_and_update':
        return await analyzeShelfPhoto(payload, {
          imageUrl,
          spaceId,
          tenantId,
          userId,
          shelfLocation,
          expectedProducts
        })

      case 'classify_photo':
        return await classifyInventoryPhoto(imageUrl)

      case 'manual_update':
        return await manualInventoryUpdate(payload, body)

      default:
        return NextResponse.json({
          error: 'Invalid action. Use: analyze_and_update, classify_photo, or manual_update'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Inventory intelligence error:', error)
    return NextResponse.json({
      error: 'Failed to process inventory intelligence request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POINT AND INVENTORY - Core Function
 * Analyze shelf photos and automatically update inventory
 */
async function analyzeShelfPhoto(payload: any, context: any) {
  // 1. AI Vision Analysis
  const visionResult = await performVisionAnalysis(context.imageUrl, context)

  // 2. Match detected items to existing products
  const matchedItems = await matchDetectedItemsToProducts(payload, visionResult.detectedItems, context.tenantId)

  // 3. Update inventory automatically
  const updateResults = await updateInventoryFromDetection(payload, matchedItems)

  // 4. Create message event in the universal system
  await createInventoryUpdateMessage(payload, context, updateResults)

  return NextResponse.json({
    success: true,
    analysis: {
      imageUrl: context.imageUrl,
      detectedItems: matchedItems,
      shelfLocation: context.shelfLocation,
      timestamp: new Date().toISOString(),
      confidence: visionResult.overallConfidence,
      needsHumanReview: visionResult.overallConfidence < 0.8 || updateResults.conflicts.length > 0
    },
    updates: updateResults
  })
}

/**
 * AI Vision Analysis using GPT-4o Vision
 */
async function performVisionAnalysis(imageUrl: string, context: any) {
  const prompt = `Analyze this shelf/inventory photo for business inventory management.

BUSINESS CONTEXT:
- Tenant: ${context.tenantId}
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
async function matchDetectedItemsToProducts(payload: any, detectedItems: any[], tenantId: string): Promise<InventoryItem[]> {
  const matchedItems: InventoryItem[] = []

  for (const item of detectedItems) {
    // Fuzzy search for products by name
    const products = await payload.find({
      collection: 'products',
      where: {
        and: [
          { tenant: { equals: tenantId } },
          {
            or: [
              { title: { contains: item.name } },
              { sku: { contains: item.name } },
              { 'tags.tag': { contains: item.name } }
            ]
          }
        ]
      },
      limit: 5
    })

    if (products.docs.length > 0) {
      const bestMatch = products.docs[0]

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
 * Update inventory automatically based on AI detection
 */
async function updateInventoryFromDetection(payload: any, items: InventoryItem[]): Promise<UpdateResults> {
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
              ...item, // Preserve existing inventory settings
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
        updateResults.errors.push({
          productId: item.productId,
          error: error instanceof Error ? error.message : 'Unknown error'
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
async function createInventoryUpdateMessage(payload: any, context: any, updateResults: UpdateResults) {
  const content = generateInventoryUpdateMessage(updateResults)

  await payload.create({
    collection: 'messages',
    data: {
      content,
      messageType: 'system',
      space: context.spaceId,
      channel: 'inventory',
      author: context.userId || 1,
      businessContext: {
        department: 'operations',
        workflow: 'inventory_management',
        priority: updateResults.conflicts.length > 0 ? 'high' : 'normal'
      },
      metadata: {
        inventoryUpdate: {
          updatedProducts: updateResults.updated.length,
          conflictsCount: updateResults.conflicts.length,
          autoUpdate: true,
          timestamp: new Date().toISOString()
        }
      },
      knowledge: {
        searchable: true,
        category: 'procedure',
        tags: ['inventory', 'automation', 'photo-analysis']
      }
    }
  })
}

/**
 * Generate human-readable inventory update message
 */
function generateInventoryUpdateMessage(updateResults: UpdateResults): string {
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
 * Classify if a photo is inventory-related using AI
 */
async function classifyInventoryPhoto(imageUrl: string) {
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
            text: 'Is this an inventory/shelf/product photo that could be used for stock counting? Answer with JSON: {"isInventoryPhoto": true/false, "confidence": 0.95, "description": "Brief description"}'
          },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      max_tokens: 100,
      temperature: 0
    })
  })

  const data = await response.json()
  return NextResponse.json(JSON.parse(data.choices[0].message.content))
}

/**
 * Manual inventory update (for human review items)
 */
async function manualInventoryUpdate(payload: any, body: any) {
  const { productId, newQuantity, notes } = body

  try {
    await payload.update({
      collection: 'products',
      id: productId,
      data: {
        inventory: {
          quantity: newQuantity,
          trackQuantity: true
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory updated manually',
      productId,
      newQuantity
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update inventory',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Inventory Intelligence API',
    description: 'Point-and-inventory automation using AI vision analysis',
    endpoints: {
      'POST /': 'Main inventory intelligence processing',
      'GET /': 'This help message'
    },
    actions: [
      'analyze_and_update - Full photo analysis and inventory update',
      'classify_photo - Check if photo is inventory-related',
      'manual_update - Manual inventory adjustment'
    ],
    examples: {
      analyze_and_update: {
        imageUrl: 'https://example.com/shelf-photo.jpg',
        spaceId: 'space-123',
        tenantId: 'tenant-456',
        userId: 'user-789',
        shelfLocation: 'Main Storage Room - Shelf A',
        expectedProducts: ['Widget A', 'Widget B']
      },
      classify_photo: {
        action: 'classify_photo',
        imageUrl: 'https://example.com/photo.jpg'
      },
      manual_update: {
        action: 'manual_update',
        productId: 'product-123',
        newQuantity: 25,
        notes: 'Corrected after manual count'
      }
    }
  })
}
