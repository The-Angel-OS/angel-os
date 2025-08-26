/**
 * ImageGenerationPipeline - AI Image Generation → Media Object → Storage Upload
 * 
 * This pipeline allows LEO to:
 * 1. Generate images using AI models (OpenAI DALL-E, Stability AI, etc.)
 * 2. Create media objects in Payload CMS
 * 3. Upload to configured storage provider (Vercel Blob, S3, etc.)
 * 
 * Usage examples:
 * - Generate product images for inventory
 * - Create marketing visuals
 * - Generate avatars or logos
 * - Create social media content
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import OpenAI from 'openai'
// Using Payload CMS Vercel Blob storage adapter instead of direct import

interface ImageGenerationRequest {
  prompt: string
  model?: 'dall-e-3' | 'dall-e-2' | 'stability-ai'
  size?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  n?: number // Number of images to generate
  tenantId?: number
  collection?: string // Which collection to associate the media with
  recordId?: string | number // Specific record to associate with
}

interface ImageGenerationResult {
  success: boolean
  images?: {
    url: string
    mediaId: number
    filename: string
    storageUrl: string
  }[]
  error?: string
  metadata?: {
    prompt: string
    model: string
    generatedAt: string
    cost?: number
  }
}

export class ImageGenerationPipeline {
  private openai: OpenAI | null = null
  private payload: any = null

  constructor() {
    this.initializeServices()
  }

  private async initializeServices() {
    // Initialize OpenAI
    const openaiKey = process.env.OPENAI_API_KEY?.trim()
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey })
    }

    // Initialize Payload
    if (!this.payload) {
      this.payload = await getPayload({ config: configPromise })
    }
  }

  /**
   * Generate image(s) and create media objects
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      await this.initializeServices()

      if (!this.openai) {
        throw new Error('OpenAI API key not configured')
      }

      console.log(`🎨 Generating image with prompt: "${request.prompt.substring(0, 50)}..."`)

      // Generate image using OpenAI DALL-E
      const response = await this.openai.images.generate({
        model: request.model || 'dall-e-3',
        prompt: request.prompt,
        size: request.size || '1024x1024',
        quality: request.quality || 'standard',
        style: request.style || 'vivid',
        n: request.n || 1,
        response_format: 'url'
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No images generated')
      }

      const results = []
      
      for (let i = 0; i < response.data.length; i++) {
        const imageData = response.data[i]
        if (!imageData || !imageData.url) continue

        // Download the image
        const imageResponse = await fetch(imageData.url)
        if (!imageResponse.ok) {
          throw new Error(`Failed to download generated image: ${imageResponse.status}`)
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const imageBlob = new Blob([imageBuffer], { type: 'image/png' })

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `generated-${timestamp}-${i + 1}.png`

        // Create media object in Payload CMS (Payload will handle Vercel Blob upload automatically)
        const mediaObject = await this.createMediaObject({
          filename,
          imageBuffer,
          mimeType: 'image/png',
          filesize: imageBuffer.byteLength,
          prompt: request.prompt,
          model: request.model || 'dall-e-3',
          tenantId: request.tenantId || 1,
          collection: request.collection,
          recordId: request.recordId
        })

        results.push({
          url: imageData.url,
          mediaId: mediaObject.id,
          filename,
          storageUrl: mediaObject.url || imageData.url
        })
      }

      console.log(`✅ Generated ${results.length} image(s) successfully`)

      return {
        success: true,
        images: results,
        metadata: {
          prompt: request.prompt,
          model: request.model || 'dall-e-3',
          generatedAt: new Date().toISOString(),
          cost: this.estimateCost(request.model || 'dall-e-3', request.size || '1024x1024', request.n || 1)
        }
      }

    } catch (error) {
      console.error('Image generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Upload image using Payload's media system (handles Vercel Blob automatically)
   */
  private async uploadViaPayload(imageBuffer: ArrayBuffer, filename: string, mimeType: string): Promise<any> {
    try {
      // Convert ArrayBuffer to Buffer for Payload
      const buffer = Buffer.from(imageBuffer)
      
      // Create a file-like object that Payload expects
      const file = {
        data: buffer,
        mimetype: mimeType,
        name: filename,
        size: buffer.length
      }

      // Use Payload's create method which will handle storage automatically
      const mediaObject = await this.payload.create({
        collection: 'media',
        data: {
          alt: `AI generated image: ${filename}`,
        },
        file
      })

      return mediaObject
    } catch (error) {
      console.error('Payload media upload failed:', error)
      throw new Error(`Failed to upload via Payload: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Create media object in Payload CMS using the upload method
   */
  private async createMediaObject(data: {
    filename: string
    imageBuffer: ArrayBuffer
    mimeType: string
    filesize: number
    prompt: string
    model: string
    tenantId: number
    collection?: string
    recordId?: string | number
  }): Promise<any> {
    try {
      // Use the uploadViaPayload method which handles storage automatically
      const mediaObject = await this.uploadViaPayload(
        data.imageBuffer,
        data.filename,
        data.mimeType
      )

      // Update the media object with AI generation metadata
      const updatedMedia = await this.payload.update({
        collection: 'media',
        id: mediaObject.id,
        data: {
          alt: `AI generated image: ${data.prompt.substring(0, 100)}`,
          metadata: {
            aiGenerated: true,
            prompt: data.prompt,
            model: data.model,
            generatedAt: new Date().toISOString(),
            tenantId: data.tenantId,
            relatedCollection: data.collection,
            relatedRecord: data.recordId
          }
        }
      })

      console.log(`📁 Created media object: ${updatedMedia.id}`)
      return updatedMedia
    } catch (error) {
      console.error('Media object creation failed:', error)
      throw error
    }
  }

  /**
   * Estimate cost for image generation
   */
  private estimateCost(model: string, size: string, count: number): number {
    // OpenAI DALL-E pricing (as of 2024)
    const pricing: { [key: string]: { [key: string]: number } } = {
      'dall-e-3': {
        '1024x1024': 0.040,
        '1792x1024': 0.080,
        '1024x1792': 0.080
      },
      'dall-e-2': {
        '1024x1024': 0.020,
        '512x512': 0.018,
        '256x256': 0.016
      }
    }

    const modelPricing = pricing[model]
    if (!modelPricing) return 0

    const sizePrice = modelPricing[size]
    if (!sizePrice) return 0

    return sizePrice * count
  }

  /**
   * Generate product image for inventory
   */
  async generateProductImage(productName: string, description: string, productId: string | number): Promise<ImageGenerationResult> {
    const prompt = `Professional product photography of ${productName}. ${description}. Clean white background, high quality, commercial photography style, well-lit, sharp focus.`

    return await this.generateImage({
      prompt,
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'hd',
      style: 'natural',
      collection: 'products',
      recordId: productId
    })
  }

  /**
   * Generate marketing visual
   */
  async generateMarketingVisual(businessName: string, campaign: string, style: string = 'modern'): Promise<ImageGenerationResult> {
    const prompt = `${style} marketing visual for ${businessName}. ${campaign}. Professional, eye-catching, brand-focused design.`

    return await this.generateImage({
      prompt,
      model: 'dall-e-3',
      size: '1792x1024',
      quality: 'hd',
      style: 'vivid'
    })
  }

  /**
   * Generate avatar or logo
   */
  async generateAvatar(description: string, style: string = 'professional'): Promise<ImageGenerationResult> {
    const prompt = `${style} avatar or logo. ${description}. Clean, simple, memorable design suitable for business use.`

    return await this.generateImage({
      prompt,
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'hd',
      style: 'natural'
    })
  }

  /**
   * Replace image anywhere in the system
   */
  async replaceImage(mediaId: string | number, newPrompt: string): Promise<ImageGenerationResult> {
    try {
      // Get existing media object
      const existingMedia = await this.payload.findByID({
        collection: 'media',
        id: mediaId
      })

      if (!existingMedia) {
        throw new Error('Media object not found')
      }

      // Generate new image
      const result = await this.generateImage({
        prompt: newPrompt,
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'hd'
      })

      if (!result.success || !result.images || result.images.length === 0) {
        throw new Error('Failed to generate replacement image')
      }

      const newImage = result.images[0]
      if (!newImage) {
        throw new Error('No image data returned')
      }

      // Update existing media object
      await this.payload.update({
        collection: 'media',
        id: mediaId,
        data: {
          filename: newImage.filename,
          url: newImage.storageUrl,
          alt: `AI generated image: ${newPrompt.substring(0, 100)}`,
          metadata: {
            ...existingMedia.metadata,
            aiGenerated: true,
            prompt: newPrompt,
            model: 'dall-e-3',
            replacedAt: new Date().toISOString()
          }
        }
      })

      console.log(`🔄 Replaced image ${mediaId} with new generated image`)
      return result

    } catch (error) {
      console.error('Image replacement failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
}

// Export singleton instance
export const imageGenerationPipeline = new ImageGenerationPipeline()
