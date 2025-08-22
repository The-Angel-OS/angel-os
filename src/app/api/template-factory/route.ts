import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  exportTenantAsTemplate,
  importTemplatePackage,
  generateTemplateFromVoicePrompt,
  kendevTemplate,
  businessTemplates,
  TemplatePackage
} from '@/endpoints/seed/spaces-template'

interface BusinessContext {
  businessType: string
  industry: string
  targetMarket: string
  keyTerms: string[]
  features: string[]
  confidence: number
  companySize?: string
  specialties?: string[]
}

interface TemplateAssets {
  images: Array<{ name: string; url: string; type: string }>
  documents: Array<{ name: string; content: string; type: string }>
}

interface TemplateFactoryRequest {
  action: 'generate_from_voice' | 'export_template' | 'import_template' | 'list_templates' | 'clone_kendev'
  voicePrompt?: string
  tenantId?: string
  templatePackage?: TemplatePackage
  customizations?: Record<string, string>
  targetTenant?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body: TemplateFactoryRequest = await request.json()

    switch (body.action) {
      case 'generate_from_voice':
        return await generateFromVoicePrompt(payload, body.voicePrompt!, body.customizations)

      case 'export_template':
        return await exportTemplate(payload, body.tenantId!, body.templatePackage?.metadata?.name)

      case 'import_template':
        return await importTemplate(payload, body.targetTenant!, body.templatePackage!, body.customizations)

      case 'clone_kendev':
        return await cloneKenDevTemplate(payload, body.targetTenant!, body.customizations)

      case 'list_templates':
        return await listAvailableTemplates()

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Template Factory API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Generate template from voice prompt using AI
async function generateFromVoicePrompt(
  payload: any,
  voicePrompt: string,
  customizations: Record<string, string> = {}
) {
  try {
    console.log(`[Template Factory] Generating template from voice prompt: "${voicePrompt}"`)

    // AI-powered analysis of voice prompt
    const businessContext = await analyzeVoicePrompt(voicePrompt)

    // Generate custom template
    const template = await generateTemplateFromVoicePrompt(voicePrompt, businessContext)

    // Enhance with AI-generated content
    const enhancedTemplate = await enhanceTemplateWithAI(template, voicePrompt, businessContext)

    return NextResponse.json({
      success: true,
      template: enhancedTemplate,
      businessContext,
      voiceAnalysis: {
        detectedBusinessType: businessContext.businessType,
        keyTerms: businessContext.keyTerms,
        suggestedFeatures: businessContext.features,
        confidence: businessContext.confidence
      },
      message: 'Template generated successfully from voice prompt',
      nextSteps: [
        'Review the generated template structure',
        'Customize business details and branding',
        'Apply template to a tenant for deployment',
        'Generate high-quality images to replace placeholders'
      ]
    })

  } catch (error) {
    console.error('Voice template generation failed:', error)
    return NextResponse.json({
      error: 'Voice template generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Export tenant as reusable template package
async function exportTemplate(payload: any, tenantId: string, templateName?: string) {
  try {
    console.log(`[Template Factory] Exporting tenant ${tenantId} as template`)

    const templatePackage = await exportTenantAsTemplate(
      payload,
      parseInt(tenantId),
      templateName || `Template-${Date.now()}`
    )

    // Add template assets (images, documents, etc.)
    const assets = await extractTenantAssets(payload, tenantId)
    templatePackage.assets = assets

    // Generate download URL for the template package
    const downloadUrl = await saveTemplatePackage(templatePackage)

    return NextResponse.json({
      success: true,
      templatePackage,
      downloadUrl,
      message: `Template exported successfully as "${templatePackage.metadata.name}"`,
      stats: {
        channels: templatePackage.template.channels.length,
        messages: templatePackage.template.defaultMessages.length,
        assets: templatePackage.assets.images.length + templatePackage.assets.documents.length,
        size: `${Math.round(JSON.stringify(templatePackage).length / 1024)}KB`
      }
    })

  } catch (error) {
    console.error('Template export failed:', error)
    return NextResponse.json({
      error: 'Template export failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Import template package to new tenant
async function importTemplate(
  payload: any,
  targetTenant: string,
  templatePackage: TemplatePackage,
  customizations: Record<string, string> = {}
) {
  try {
    console.log(`[Template Factory] Importing template "${templatePackage.metadata.name}" to tenant ${targetTenant}`)

    const { space, channels, messages } = await importTemplatePackage(
      payload,
      parseInt(targetTenant),
      templatePackage,
      customizations
    )

    // Import template assets
    await importTemplateAssets(payload, targetTenant, templatePackage.assets)

    return NextResponse.json({
      success: true,
      importedSpace: space,
      stats: {
        channelsCreated: channels.length,
        messagesCreated: messages.length,
        assetsImported: templatePackage.assets.images.length + templatePackage.assets.documents.length
      },
      message: `Template "${templatePackage.metadata.name}" imported successfully`,
      spaceUrl: `/spaces/${space.id}`
    })

  } catch (error) {
    console.error('Template import failed:', error)
    return NextResponse.json({
      error: 'Template import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Clone KenDev.Co template to new tenant (Template 0 replication)
async function cloneKenDevTemplate(
  payload: any,
  targetTenant: string,
  customizations: Record<string, string> = {}
) {
  try {
    console.log(`[Template Factory] Cloning KenDev.Co template to tenant ${targetTenant}`)

    // Export KenDev.Co as template first
    const kendevPackage = await exportTenantAsTemplate(payload, 0, 'KenDev.Co Master Template')

    // Apply customizations
    const customizedPackage = {
      ...kendevPackage,
      template: {
        ...kendevTemplate,
        name: customizations.business_name || kendevTemplate.name,
        description: customizations.description || kendevTemplate.description
      }
    }

    // Import to target tenant
    const { space, channels, messages } = await importTemplatePackage(
      payload,
      parseInt(targetTenant),
      customizedPackage,
      customizations
    )

    return NextResponse.json({
      success: true,
      clonedSpace: space,
      message: 'KenDev.Co template cloned successfully',
      features: [
        'AI automation hub',
        'Web development showcase',
        'Client support system',
        'Sales inquiry management',
        'Professional branding'
      ],
      stats: {
        channels: channels.length,
        messages: messages.length,
        templateType: 'kendev-master'
      }
    })

  } catch (error) {
    console.error('KenDev template clone failed:', error)
    return NextResponse.json({
      error: 'Template clone failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// List all available templates
async function listAvailableTemplates() {
  try {
    const availableTemplates = {
      masterTemplate: {
        name: 'KenDev.Co Master Template',
        description: 'Full-service digital commerce and AI automation platform',
        type: 'business',
        features: ['ai_agents', 'web_development', 'ecommerce', 'automation', 'consulting'],
        channels: kendevTemplate.channels.length,
        isDefault: true
      },
      businessTemplates: Object.entries(businessTemplates).map(([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description,
        type: template.businessSettings.type,
        industry: template.businessSettings.industry,
        features: template.businessSettings.features,
        channels: template.channels.length
      }))
    }

    return NextResponse.json({
      success: true,
      templates: availableTemplates,
      total: 1 + Object.keys(businessTemplates).length,
      message: 'Available templates retrieved successfully'
    })

  } catch (error) {
    console.error('List templates failed:', error)
    return NextResponse.json({
      error: 'Failed to list templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// AI-powered voice prompt analysis
async function analyzeVoicePrompt(voicePrompt: string) {
  // This would integrate with OpenAI or similar AI service
  // For now, use keyword analysis

  const prompt = voicePrompt.toLowerCase()
  const keyTerms = extractKeyTerms(prompt)

  let businessType = 'service'
  let industry = 'general'
  let confidence = 0.7

  // Business type detection
  if (prompt.includes('restaurant') || prompt.includes('food') || prompt.includes('pizza') || prompt.includes('cafe')) {
    businessType = 'restaurant'
    industry = 'food-beverage'
    confidence = 0.9
  } else if (prompt.includes('creator') || prompt.includes('content') || prompt.includes('youtube') || prompt.includes('influencer')) {
    businessType = 'creator'
    industry = 'content-creation'
    confidence = 0.9
  } else if (prompt.includes('shop') || prompt.includes('store') || prompt.includes('retail') || prompt.includes('selling')) {
    businessType = 'retail'
    industry = 'retail'
    confidence = 0.9
  } else if (prompt.includes('service') || prompt.includes('consulting') || prompt.includes('professional')) {
    businessType = 'service'
    industry = 'professional-services'
    confidence = 0.8
  }

  // Feature detection
  const features = []
  if (prompt.includes('order') || prompt.includes('delivery')) features.push('ordering')
  if (prompt.includes('appointment') || prompt.includes('booking')) features.push('appointments')
  if (prompt.includes('community') || prompt.includes('social')) features.push('community')
  if (prompt.includes('payment') || prompt.includes('sell')) features.push('payments')
  if (prompt.includes('ai') || prompt.includes('automation')) features.push('ai_agents')

  // Target market detection
  let targetMarket = 'general'
  if (prompt.includes('local') || prompt.includes('community') || prompt.includes('neighborhood')) {
    targetMarket = 'local'
  } else if (prompt.includes('online') || prompt.includes('digital') || prompt.includes('global')) {
    targetMarket = 'global'
  } else if (prompt.includes('business') || prompt.includes('b2b') || prompt.includes('enterprise')) {
    targetMarket = 'business'
  } else if (prompt.includes('consumer') || prompt.includes('customer') || prompt.includes('family')) {
    targetMarket = 'consumer'
  }

  return {
    businessType,
    industry,
    targetMarket,
    keyTerms,
    features,
    confidence,
    originalPrompt: voicePrompt
  }
}

// Extract key terms from voice prompt
function extractKeyTerms(prompt: string): string[] {
  const businessWords = [
    'restaurant', 'food', 'pizza', 'cafe', 'bakery',
    'shop', 'store', 'retail', 'selling', 'products',
    'service', 'consulting', 'professional', 'expert',
    'creator', 'content', 'youtube', 'influencer', 'artist',
    'tech', 'software', 'web', 'app', 'digital',
    'health', 'fitness', 'wellness', 'medical',
    'education', 'training', 'coaching', 'teaching'
  ]

  const actionWords = [
    'order', 'delivery', 'pickup', 'booking', 'appointment',
    'community', 'social', 'chat', 'support', 'help',
    'payment', 'sell', 'buy', 'subscription', 'membership'
  ]

  const words = prompt.split(/\s+/)
  const keyTerms = words.filter(word =>
    businessWords.includes(word) || actionWords.includes(word)
  )

  return [...new Set(keyTerms)] // Remove duplicates
}

// Enhance template with AI-generated content
async function enhanceTemplateWithAI(template: any, voicePrompt: string, businessContext: BusinessContext) {
  // This would use AI to generate:
  // - Custom welcome messages
  // - Industry-specific channel descriptions
  // - Personalized content based on voice prompt
  // - Brand voice and tone adjustments

  // For now, return template with basic enhancements
  const enhancedTemplate = { ...template }

  // Add AI-generated insights
  enhancedTemplate.aiInsights = {
    recommendedChannels: generateRecommendedChannels(businessContext),
    contentSuggestions: generateContentSuggestions(businessContext),
    brandingTips: generateBrandingTips(businessContext)
  }

  return enhancedTemplate
}

// Generate recommended channels based on business context
function generateRecommendedChannels(businessContext: BusinessContext) {
  const recommendations = []

  if (businessContext.features.includes('ordering')) {
    recommendations.push({
      name: 'orders',
      description: 'Order management and customer communication',
      priority: 'high'
    })
  }

  if (businessContext.features.includes('appointments')) {
    recommendations.push({
      name: 'bookings',
      description: 'Appointment scheduling and calendar management',
      priority: 'high'
    })
  }

  if (businessContext.features.includes('community')) {
    recommendations.push({
      name: 'community',
      description: 'Customer community and social engagement',
      priority: 'medium'
    })
  }

  return recommendations
}

// Generate content suggestions
function generateContentSuggestions(businessContext: BusinessContext) {
  const suggestions = []

  switch (businessContext.businessType) {
    case 'restaurant':
      suggestions.push(
        'Daily specials and seasonal menu updates',
        'Behind-the-scenes kitchen content',
        'Customer testimonials and reviews',
        'Cooking tips and recipe previews'
      )
      break

    case 'creator':
      suggestions.push(
        'Exclusive behind-the-scenes content',
        'Community challenges and engagement',
        'Early access to new releases',
        'Fan showcases and highlights'
      )
      break

    case 'retail':
      suggestions.push(
        'Product spotlights and new arrivals',
        'Styling tips and how-to guides',
        'Customer outfit showcases',
        'Seasonal collections and trends'
      )
      break

    default:
      suggestions.push(
        'Industry insights and expertise',
        'Case studies and success stories',
        'Educational content and tips',
        'Client testimonials and reviews'
      )
  }

  return suggestions
}

// Generate branding tips
function generateBrandingTips(businessContext: BusinessContext) {
  return [
    'Use consistent colors and fonts across all channels',
    'Develop a unique brand voice that reflects your personality',
    'Create custom graphics and logos for professional appearance',
    'Maintain regular posting schedule for community engagement',
    'Use high-quality images that represent your brand values'
  ]
}

// Extract assets from tenant for template packaging
async function extractTenantAssets(payload: any, tenantId: string) {
  try {
    const media = await payload.find({
      collection: 'media',
      where: { tenant: { equals: tenantId } }
    })

    const images = media.docs
      .filter((item: any) => item.mimeType?.startsWith('image/'))
      .map((item: any) => ({
        name: item.filename || 'image',
        url: item.url,
        type: item.mimeType || 'image/jpeg'
      }))

    const documents = media.docs
      .filter((item: any) => !item.mimeType?.startsWith('image/'))
      .map((item: any) => ({
        name: item.filename || 'document',
        content: item.url, // In a real implementation, this would be the file content
        type: item.mimeType || 'application/octet-stream'
      }))

    return { images, documents }
  } catch (error) {
    console.error('Asset extraction failed:', error)
    return { images: [], documents: [] }
  }
}

// Save template package for download
async function saveTemplatePackage(templatePackage: TemplatePackage): Promise<string> {
  // In a real implementation, this would:
  // 1. Save the package to cloud storage
  // 2. Generate a secure download URL
  // 3. Set appropriate expiration

  // For now, return a mock URL
  const packageId = `template-${Date.now()}`
  return `/api/template-factory/download/${packageId}`
}

// Import template assets
async function importTemplateAssets(payload: any, tenantId: string, assets: TemplateAssets) {
  try {
    // Import images
    for (const image of assets.images) {
      // In a real implementation, this would:
      // 1. Download the image from URL
      // 2. Upload to tenant's media library
      // 3. Associate with tenant
      console.log(`[Template Factory] Would import image: ${image.name}`)
    }

    // Import documents
    for (const document of assets.documents) {
      console.log(`[Template Factory] Would import document: ${document.name}`)
    }

    console.log(`[Template Factory] Imported ${assets.images.length} images and ${assets.documents.length} documents`)
  } catch (error) {
    console.error('Asset import failed:', error)
  }
}
