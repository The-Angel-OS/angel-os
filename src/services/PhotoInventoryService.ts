import { getPayload } from 'payload'
import config from '@payload-config'

interface PhotoSequence {
  id: string
  photos: string[]
  type: 'mileage_log' | 'collection_inventory' | 'business_inventory' | 'general'
  location?: string
  timestamp: Date
  tenantId: string
}

interface InventoryAnalysis {
  detected_items: InventoryItem[]
  category: string
  confidence: number
  summary: string
  mileage_data?: MileageLogEntry
  collection_data?: CollectionData
}

interface InventoryItem {
  name: string
  quantity: number
  condition: string
  estimated_value?: number
  location?: string
  confidence: number
}

interface MileageLogEntry {
  odometer_reading: number
  vehicle_identified: string
  location: string
  date: Date
  mileage_type: 'business' | 'personal'
  purpose?: string
}

interface CollectionData {
  collection_type: string
  total_items: number
  categorized_items: Record<string, number>
  estimated_total_value?: number
  condition_summary: string
}

export class PhotoInventoryService {
  
  /**
   * Analyze a sequence of photos for inventory purposes
   */
  static async analyzePhotoSequence(
    photos: File[],
    sequenceType: string,
    location: string,
    description: string,
    tenantId: string
  ): Promise<InventoryAnalysis> {
    const payload = await getPayload({ config })

    // Upload photos to storage
    const uploadedPhotos = await Promise.all(
      photos.map(async (photo) => {
        // Convert browser File to Payload File format
        const buffer = await photo.arrayBuffer()
        const payloadFile = {
          data: Buffer.from(buffer),
          mimetype: photo.type,
          name: photo.name,
          size: photo.size,
        }
        
        const media = await payload.create({
          collection: 'media',
          data: {},
          file: payloadFile,
        })
        return media
      })
    )

    // Determine sequence type if auto-detect
    let detectedType = sequenceType
    if (sequenceType === 'auto_detect') {
      detectedType = await this.detectSequenceType(photos, description)
    }

    // Perform specific analysis based on type
    let analysis: InventoryAnalysis
    switch (detectedType) {
      case 'mileage_log':
        analysis = await this.analyzeMileageSequence(uploadedPhotos, location)
        break
      case 'collection_inventory':
        analysis = await this.analyzeCollectionSequence(uploadedPhotos, description)
        break
      case 'business_inventory':
        analysis = await this.analyzeBusinessSequence(uploadedPhotos, description)
        break
      default:
        analysis = await this.analyzeGeneralSequence(uploadedPhotos, description)
    }

    // Store analysis results
    await payload.create({
      collection: 'photo-analysis',
      data: {
        tenantId,
        sequenceType: detectedType as 'general' | 'mileage_log' | 'collection_inventory' | 'business_inventory',
        location,
        description,
        photoCount: photos.length,
        analysis: analysis as any,
        confidence: analysis.confidence,
        category: analysis.category,
        createdAt: new Date().toISOString(),
      },
    })

    return analysis
  }

  /**
   * Auto-detect sequence type based on photo content and description
   */
  private static async detectSequenceType(
    photos: File[],
    description: string
  ): Promise<string> {
    // Simple heuristics for demo - in production would use AI vision
    const desc = description.toLowerCase()
    
    if (desc.includes('odometer') || desc.includes('mileage') || desc.includes('miles')) {
      return 'mileage_log'
    }
    
    if (desc.includes('collection') || desc.includes('organize') || desc.includes('catalog')) {
      return 'collection_inventory'
    }
    
    if (desc.includes('inventory') || desc.includes('stock') || desc.includes('shop') || desc.includes('store')) {
      return 'business_inventory'
    }

    // If multiple photos, likely inventory
    if (photos.length >= 3) {
      return 'business_inventory'
    }

    return 'general'
  }

  /**
   * Analyze mileage log sequence (odometer + location photos)
   */
  private static async analyzeMileageSequence(
    photos: any[],
    location: string
  ): Promise<InventoryAnalysis> {
    // Mock AI analysis - in production would use actual vision AI
    const odometerReading = Math.floor(Math.random() * 100000) + 50000
    const vehicleTypes = ['Honda Civic 2018', 'Toyota Camry 2020', 'Ford F-150 2019']
    const vehicle = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]

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
      summary: `Detected odometer reading of ${odometerReading.toLocaleString()} miles on ${vehicle} at ${location}`,
      mileage_data: {
        odometer_reading: odometerReading,
        vehicle_identified: vehicle || 'Unknown Vehicle',
        location,
        date: new Date(),
        mileage_type: 'business',
        purpose: 'Business travel documented via photo'
      }
    }
  }

  /**
   * Analyze collection inventory (beer cans, butterflies, etc.)
   */
  private static async analyzeCollectionSequence(
    photos: any[],
    description: string
  ): Promise<InventoryAnalysis> {
    const collectionTypes = ['beer cans', 'butterflies', 'coins', 'stamps', 'vintage items']
    const detectedType = collectionTypes[Math.floor(Math.random() * collectionTypes.length)]
    
    const itemCount = Math.floor(Math.random() * 50) + 10
    const items: InventoryItem[] = []
    
    for (let i = 0; i < Math.min(itemCount, 10); i++) {
      items.push({
        name: `${detectedType} item ${i + 1}`,
        quantity: 1,
        condition: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)] as string,
        estimated_value: Math.floor(Math.random() * 100) + 5,
        confidence: 0.8 + Math.random() * 0.2
      })
    }

    const totalValue = items.reduce((sum, item) => sum + (item.estimated_value || 0), 0)

    return {
      detected_items: items,
      category: 'collection',
      confidence: 0.88,
      summary: `Identified ${itemCount} items in ${detectedType} collection. Estimated total value: $${totalValue}`,
      collection_data: {
        collection_type: detectedType || 'unknown',
        total_items: itemCount,
        categorized_items: { [detectedType || 'unknown']: itemCount },
        estimated_total_value: totalValue,
        condition_summary: 'Mixed condition, mostly good to excellent'
      }
    }
  }

  /**
   * Analyze business inventory (vape shop, retail, etc.)
   */
  private static async analyzeBusinessSequence(
    photos: any[],
    description: string
  ): Promise<InventoryAnalysis> {
    // Mock analysis for vape shop inventory
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
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      detected_items: items,
      category: 'business_inventory',
      confidence: 0.90,
      summary: `Identified ${items.length} product categories with ${totalItems} total items. Estimated inventory value: $${totalValue}`,
      collection_data: {
        collection_type: 'retail_inventory',
        total_items: totalItems,
        categorized_items: items.reduce((acc, item) => ({
          ...acc,
          [item.name]: item.quantity
        }), {}),
        estimated_total_value: totalValue,
        condition_summary: 'All items in new condition, ready for sale'
      }
    }
  }

  /**
   * General purpose analysis
   */
  private static async analyzeGeneralSequence(
    photos: any[],
    description: string
  ): Promise<InventoryAnalysis> {
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
      condition: ['Good', 'Fair', 'Excellent'][Math.floor(Math.random() * 3)] as string,
      confidence: 0.7 + Math.random() * 0.3
    }))

    return {
      detected_items: items,
      category: 'general',
      confidence: 0.75,
      summary: `Detected ${items.length} categories of items. Analysis based on ${photos.length} photos.`
    }
  }

  /**
   * Connect to Google Photos and analyze recent albums
   */
  static async syncGooglePhotosAlbums(tenantId: string): Promise<void> {
    const payload = await getPayload({ config })

    // Get Google Photos integration credentials - simplified for demo
    const googlePhotosConfig = {
      accessToken: process.env.GOOGLE_PHOTOS_ACCESS_TOKEN || 'demo_token',
      type: 'google_photos',
      tenantId: tenantId,
      isActive: true
    }

    if (!googlePhotosConfig.accessToken || googlePhotosConfig.accessToken === 'demo_token') {
      throw new Error('Google Photos integration not configured')
    }

    // Fetch albums from Google Photos
    const albumsResponse = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        'Authorization': `Bearer ${googlePhotosConfig.accessToken}`,
      },
    })

    if (!albumsResponse.ok) {
      throw new Error('Failed to fetch Google Photos albums')
    }

    const albumsData = await albumsResponse.json()

    // Process albums for potential inventory sequences
    for (const album of albumsData.albums || []) {
      // Look for albums with inventory-related names
      const albumTitle = album.title.toLowerCase()
      if (this.isInventoryAlbum(albumTitle)) {
        await this.processGooglePhotosAlbum(album, tenantId, googlePhotosConfig.accessToken)
      }
    }
  }

  /**
   * Check if album title suggests inventory content
   */
  private static isInventoryAlbum(title: string): boolean {
    const inventoryKeywords = [
      'inventory', 'collection', 'mileage', 'odometer',
      'business', 'shop', 'catalog', 'organize'
    ]
    
    return inventoryKeywords.some(keyword => title.includes(keyword))
  }

  /**
   * Process a Google Photos album for inventory analysis
   */
  private static async processGooglePhotosAlbum(
    album: any,
    tenantId: string,
    accessToken: string
  ): Promise<void> {
    // Fetch photos in album
    const photosResponse = await fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems:search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: album.id,
          pageSize: 50
        }),
      }
    )

    if (!photosResponse.ok) {
      console.error(`Failed to fetch photos for album ${album.title}`)
      return
    }

    const photosData = await photosResponse.json()
    
    // Group photos by date for sequence analysis
    const photoGroups = this.groupPhotosByDate(photosData.mediaItems || [])
    
    // Analyze each group as a potential inventory sequence
    for (const [date, photos] of Object.entries(photoGroups)) {
      if (photos.length >= 2) { // Minimum for sequence
        // This would trigger analysis of the photo group
        console.log(`Found photo sequence from ${date} with ${photos.length} photos in album ${album.title}`)
      }
    }
  }

  /**
   * Group photos by date taken
   */
  private static groupPhotosByDate(photos: any[]): Record<string, any[]> {
    return photos.reduce((groups, photo) => {
      const date = photo.mediaMetadata.creationTime.split('T')[0] // YYYY-MM-DD
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(photo)
      return groups
    }, {})
  }
} 