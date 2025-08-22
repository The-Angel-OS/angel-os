import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const formData = await request.formData()
    
    const sequenceType = formData.get('sequence_type') as 'general' | 'mileage_log' | 'collection_inventory' | 'business_inventory'
    const location = formData.get('location') as string
    const description = formData.get('description') as string
    const tenantId = formData.get('tenant_id') as string
    const guardianAngelId = formData.get('guardian_angel_id') as string

    // Extract photo files
    const photos: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo_') && value instanceof File) {
        photos.push(value)
      }
    }

    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      )
    }

    // Analyze photos based on sequence type
    let analysis
    switch (sequenceType) {
      case 'mileage_log':
        analysis = await analyzeMileageLog(photos, location)
        break
      case 'collection_inventory':
        analysis = await analyzeCollection(photos, description)
        break
      case 'business_inventory':
        analysis = await analyzeBusinessInventory(photos, description)
        break
      default:
        analysis = await analyzeGeneral(photos, description)
    }

    // Store analysis results
    const analysisRecord = await payload.create({
      collection: 'photo-analysis',
      data: {
        tenantId,
        guardianAngelId,
        sequenceType,
        location,
        description,
        photoCount: photos.length,
        analysis: analysis,
        createdAt: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      analysisId: analysisRecord.id,
      ...analysis
    })

  } catch (error) {
    console.error('Photo analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

async function analyzeMileageLog(photos: File[], location: string) {
  // Mock AI analysis for mileage logs
  // In production, this would use actual AI vision models
  
  // Simulate analyzing odometer reading from first photo
  const odometerReading = Math.floor(Math.random() * 100000) + 50000
  
  // Determine vehicle type from odometer style
  const vehicleTypes = ['Honda Civic 2018', 'Toyota Camry 2020', 'Ford F-150 2019']
  const vehicleIdentified = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]

  return {
    detected_items: [
      {
        name: 'Odometer Reading',
        quantity: 1,
        condition: 'Clear',
        confidence: 0.95
      }
    ],
    category: 'mileage_log',
    confidence: 0.95,
    summary: `Detected odometer reading of ${odometerReading.toLocaleString()} miles on ${vehicleIdentified} at ${location}`,
    mileage_data: {
      odometer_reading: odometerReading,
      vehicle_identified: vehicleIdentified,
      location: location,
      date: new Date(),
      mileage_type: 'business',
      purpose: 'Business travel documented via photo'
    }
  }
}

async function analyzeCollection(photos: File[], description: string) {
  // Mock AI analysis for collections
  const collectionTypes = ['beer cans', 'butterflies', 'coins', 'stamps', 'vintage items']
  const detectedType = collectionTypes[Math.floor(Math.random() * collectionTypes.length)]
  
  const itemCount = Math.floor(Math.random() * 50) + 10
  const items = []
  
  for (let i = 0; i < Math.min(itemCount, 10); i++) {
    items.push({
      name: `${detectedType} item ${i + 1}`,
      quantity: 1,
      condition: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
      estimated_value: Math.floor(Math.random() * 100) + 5,
      confidence: 0.8 + Math.random() * 0.2
    })
  }

  return {
    detected_items: items,
    category: 'collection',
    confidence: 0.88,
    summary: `Identified ${itemCount} items in ${detectedType} collection. Estimated total value: $${items.reduce((sum, item) => sum + (item.estimated_value || 0), 0)}`,
    collection_data: {
      collection_type: detectedType,
      total_items: itemCount,
      categorized_items: { [detectedType as string]: itemCount },
      estimated_total_value: items.reduce((sum, item) => sum + (item.estimated_value || 0), 0),
      condition_summary: 'Mixed condition, mostly good to excellent'
    }
  }
}

async function analyzeBusinessInventory(photos: File[], description: string) {
  // Mock AI analysis for business inventory (e.g., vape shop)
  const products = [
    'Disposable Vapes',
    'E-liquids',
    'Vape Mods',
    'Coils',
    'Batteries',
    'Accessories'
  ]
  
  const items = products.map(product => ({
    name: product,
    quantity: Math.floor(Math.random() * 20) + 5,
    condition: 'New',
    estimated_value: Math.floor(Math.random() * 50) + 10,
    location: 'Display Shelf',
    confidence: 0.85 + Math.random() * 0.15
  }))

  const totalValue = items.reduce((sum, item) => sum + (item.estimated_value || 0) * item.quantity, 0)

  return {
    detected_items: items,
    category: 'business_inventory',
    confidence: 0.90,
    summary: `Identified ${items.length} product categories with total inventory value of $${totalValue}`,
    collection_data: {
      collection_type: 'retail_inventory',
      total_items: items.reduce((sum, item) => sum + item.quantity, 0),
      categorized_items: items.reduce((acc, item) => ({
        ...acc,
        [item.name]: item.quantity
      }), {}),
      estimated_total_value: totalValue,
      condition_summary: 'All items in new condition'
    }
  }
}

async function analyzeGeneral(photos: File[], description: string) {
  // General purpose analysis
  const randomItems = [
    'Miscellaneous Items',
    'Household Goods',
    'Electronics',
    'Clothing',
    'Books',
    'Furniture'
  ]
  
  const items = randomItems.slice(0, Math.floor(Math.random() * 4) + 2).map(item => ({
    name: item,
    quantity: Math.floor(Math.random() * 5) + 1,
    condition: ['Good', 'Fair', 'Excellent'][Math.floor(Math.random() * 3)],
    confidence: 0.7 + Math.random() * 0.3
  }))

  return {
    detected_items: items,
    category: 'general',
    confidence: 0.75,
    summary: `Detected ${items.length} categories of items. Analysis based on ${photos.length} photos.`
  }
} 