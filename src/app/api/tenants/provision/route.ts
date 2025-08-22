import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { applySpaceTemplate } from '@/endpoints/seed/spaces-template'

interface OnboardingData {
  interests: string[]
  workStyle: {
    preferred: 'remote' | 'hybrid' | 'in-office'
    experience: 'entry' | 'mid' | 'senior'
    availability: 'full-time' | 'part-time' | 'contract'
  }
  accountType: 'individual' | 'business' | 'enterprise'
  businessInfo?: {
    businessName: string
    industry: string
    size: string
    description: string
  }
}

// Template mapping based on onboarding data
const TEMPLATE_MAPPING: Record<string, string> = {
  'technology': 'service',
  'healthcare': 'service', 
  'ecommerce': 'retail',
  'consulting': 'service',
  'education': 'service',
  'finance': 'service',
  'marketing': 'service',
  'design': 'creator'
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const { onboardingData, templateKey } = body as {
      onboardingData: OnboardingData
      templateKey?: string
    }

    // Get current user (assuming authenticated)
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Determine template based on interests
    const primaryInterest = onboardingData.interests[0] || 'technology'
    const selectedTemplate = templateKey || TEMPLATE_MAPPING[primaryInterest] || 'service'

    // Generate business name if not provided
    const businessName = onboardingData.businessInfo?.businessName || 
      `${user.firstName || 'User'}'s ${primaryInterest.charAt(0).toUpperCase() + primaryInterest.slice(1)} Business`

    // Create tenant
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: businessName,
        slug: generateSlug(businessName),
        domain: `${generateSlug(businessName)}.angelos.dev`, // Your domain
        subdomain: generateSlug(businessName),
        businessType: determineBusinessType(onboardingData),
        status: 'active',
        configuration: {
          primaryColor: getPrimaryColor(onboardingData.interests),
          contactEmail: user.email,
          contactPhone: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US'
          }
        },
        features: getFeatures(onboardingData),
        limits: getLimits(onboardingData.accountType)
        // Note: onboardingData removed as it's not in Tenant schema
      }
    })

    // Update user with tenant assignment
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        tenant: tenant.id
      }
    })

    // Apply space template with customizations
    const customizations = {
      BUSINESS_NAME: businessName,
      CREATOR_NAME: user.firstName || 'User',
      SERVICE_TYPE: onboardingData.interests.join(', '),
      INDUSTRY: onboardingData.businessInfo?.industry || primaryInterest,
      YEARS_EXPERIENCE: getYearsFromLevel(onboardingData.workStyle.experience)
    }

    const { space, channels, messages } = await applySpaceTemplate(
      payload,
      tenant.id,
      selectedTemplate,
      customizations
    )

    // Create initial products/services based on interests
    await createInitialProducts(payload, tenant.id, onboardingData)

    // Create initial content (pages, posts)
    await createInitialContent(payload, tenant.id, onboardingData, customizations)

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
      },
      space: {
        id: space.id,
        name: space.name,
        channels: channels.length,
        messages: messages.length
      },
      redirectUrl: '/dashboard'
    })

  } catch (error) {
    console.error('Tenant provisioning failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to provision tenant',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// Helper functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 50)
}

function determineBusinessType(data: OnboardingData): 'service' | 'retail' | 'other' {
  if (data.accountType === 'individual') return 'service'
  if (data.interests.includes('ecommerce')) return 'retail'
  if (data.interests.includes('healthcare')) return 'service'
  if (data.interests.includes('design')) return 'service'
  return 'service'
}

function getPrimaryColor(interests: string[]): string {
  const colorMap: Record<string, string> = {
    technology: '#3b82f6', // blue
    healthcare: '#10b981', // green
    finance: '#f59e0b',    // amber
    design: '#8b5cf6',     // purple
    marketing: '#ef4444',  // red
    education: '#06b6d4',  // cyan
  }
  return colorMap[interests[0] || 'technology'] || '#3b82f6'
}

function getFeatures(data: OnboardingData) {
  const baseFeatures: any = {
    spaces: true,
    crm: data.accountType !== 'individual',
    memberPortal: true
  }

  // Add features based on interests
  if (data.interests.includes('ecommerce')) {
    baseFeatures.ecommerce = true
  }
  
  if (data.interests.includes('technology')) {
    baseFeatures.vapi = true
    baseFeatures.n8n = true
  }

  return baseFeatures
}

function getLimits(accountType: string) {
  const limits: Record<string, any> = {
    individual: { maxUsers: 5, maxProducts: 20, maxStorage: 100 },
    business: { maxUsers: 50, maxProducts: 100, maxStorage: 1000 },
    enterprise: { maxUsers: 1000, maxProducts: 1000, maxStorage: 10000 }
  }
  return limits[accountType] || limits.business
}

function getYearsFromLevel(level: string): string {
  const mapping: Record<string, string> = {
    entry: '1-2',
    mid: '3-5', 
    senior: '6+'
  }
  return mapping[level] || '3-5'
}

async function createInitialProducts(payload: any, tenantId: number, data: OnboardingData) {
  // Create sample products based on interests
  const productTemplates: Record<string, any[]> = {
    technology: [
      { title: 'AI Consultation', price: 500, category: 'consulting' },
      { title: 'Automation Setup', price: 1500, category: 'implementation' }
    ],
    healthcare: [
      { title: 'Health Assessment', price: 200, category: 'service' },
      { title: 'Wellness Program', price: 800, category: 'program' }
    ],
    // Add more templates...
  }

  const templates = productTemplates[data.interests[0] || 'technology'] || productTemplates.technology
  
  if (!templates) return // Safety check
  
  for (const template of templates) {
    await payload.create({
      collection: 'products',
      data: {
        title: template.title,
        slug: generateSlug(template.title),
        description: `Professional ${template.title.toLowerCase()} service`,
        tenant: tenantId,
        pricing: { basePrice: template.price, currency: 'USD' },
        status: 'active',
        productType: 'business_service'
      }
    })
  }
}

async function createInitialContent(payload: any, tenantId: number, data: OnboardingData, customizations: Record<string, string>) {
  // Create welcome post
  await payload.create({
    collection: 'posts',
    data: {
      title: `Welcome to ${customizations.BUSINESS_NAME}!`,
      slug: 'welcome-post',
      tenant: tenantId,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: `We're excited to have you here! This is your personalized ${data.interests.join(', ')} workspace.`,
                  version: 1
                }
              ],
              version: 1
            }
          ],
          version: 1
        }
      },
      status: 'published'
    }
  })
}