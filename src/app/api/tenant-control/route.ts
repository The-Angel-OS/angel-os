import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { applySpaceTemplate } from '@/endpoints/seed/spaces-template'

interface TenantData {
  name: string
  slug: string
  businessType: string
  domain?: string
  subdomain?: string
  theme?: string
  features?: string[]
  voicePrompt?: string
  serviceType?: string
  yearsExperience?: string
  serviceAreas?: string
  availability?: string
  productCategory?: string
  currentDeals?: string
  freeShippingThreshold?: string
  creatorName?: string
  contentType?: string
  recentContent?: string
}

interface TenantConfiguration {
  theme?: string
  features?: string[]
  domain?: string
  settings?: Record<string, unknown>
}

interface TenantProvisionRequest {
  action: 'provision' | 'deprovision' | 'configure' | 'preview' | 'list' | 'status'
  tenantData?: TenantData
  tenantId?: string
  configuration?: TenantConfiguration
}

// Map business types to valid industry values for Spaces
function getIndustryFromBusinessType(businessType: string): string {
  const mapping: { [key: string]: string } = {
    'service': 'professional-services',
    'retail': 'retail',
    'salon': 'professional-services',
    'cactus-farm': 'agriculture',
    'dumpster-rental': 'professional-services',
    'bedbug-treatment': 'professional-services',
    'other': 'general'
  }
  return mapping[businessType] || 'general'
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body: TenantProvisionRequest = await request.json()

    switch (body.action) {
      case 'provision':
        return await provisionTenant(payload, body.tenantData!)

      case 'deprovision':
        return await deprovisionTenant(payload, body.tenantId!)

      case 'configure':
        return await configureTenant(payload, body.tenantId!, body.configuration!)

      case 'preview':
        return await previewTenant(payload, body.tenantId!)

      case 'list':
        return await listTenants(payload)

      case 'status':
        return await getTenantStatus(payload, body.tenantId!)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Tenant control API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function provisionTenant(payload: any, tenantData: TenantData) {
  try {
    console.log(`[Tenant Control] Provisioning tenant: ${tenantData.name}`)

    // Create the tenant record
    const tenant = await payload.create({
      collection: 'tenants',
      overrideAccess: true,
      data: {
        name: tenantData.name,
        slug: tenantData.slug,
        businessType: tenantData.businessType,
        status: 'setup',
        settings: {
          domain: tenantData.domain || `${tenantData.slug}.spaces.kendev.co`,
          subdomain: tenantData.subdomain || tenantData.slug,
          theme: tenantData.theme || 'default',
          features: tenantData.features || ['basic'],
        },
        provisioning: {
          startedAt: new Date().toISOString(),
          steps: [
            { name: 'create_tenant', status: 'completed', completedAt: new Date().toISOString() },
            { name: 'create_space', status: 'pending' },
            { name: 'seed_content', status: 'pending' },
            { name: 'configure_domain', status: 'pending' },
            { name: 'deploy', status: 'pending' }
          ]
        }
      }
    })

    // Create default space for tenant
    const space = await payload.create({
      collection: 'spaces',
      overrideAccess: true,
      data: {
        name: `${tenantData.name} Main Space`,
        slug: 'main',
        tenant: tenant.id,
        businessIdentity: {
          type: 'business',
          industry: getIndustryFromBusinessType(tenantData.businessType),
          companySize: 'small',
          targetMarket: 'local',
        },
        commerceSettings: {
          enableEcommerce: true,
          enableServices: tenantData.businessType === 'service',
          enableMerchandise: tenantData.businessType === 'content-creation',
        },
        settings: {
          isPublic: true,
          allowMessages: true,
          theme: tenantData.theme || 'business'
        }
      }
    })

    // Create basic pages and content
    await seedTenantContent(payload, tenant.id, space.id, tenantData)

    // Update final provisioning status
    await payload.update({
      collection: 'tenants',
      id: tenant.id,
      overrideAccess: true,
      data: {
        status: 'active',
        'provisioning.completedAt': new Date().toISOString(),
      }
    })

    const domain = `${tenantData.slug}.spaces.kendev.co`
    const previewUrl = `https://${domain}`

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain,
        previewUrl,
        spaceId: space.id,
        status: 'active'
      },
      message: `Tenant "${tenantData.name}" provisioned successfully!`,
      nextSteps: [
        'Site is accessible at: ' + previewUrl,
        'Configure additional settings via the control panel',
        'Add custom domain if needed',
        'Customize theme and content'
      ]
    })

  } catch (error) {
    console.error('Tenant provisioning failed:', error)
    return NextResponse.json({
      error: 'Provisioning failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function deprovisionTenant(payload: any, tenantId: string) {
  try {
    console.log(`[Tenant Control] Deprovisioning tenant: ${tenantId}`)

    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
      overrideAccess: true
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Find and delete associated spaces
    const spaces = await payload.find({
      collection: 'spaces',
      overrideAccess: true,
      where: { tenant: { equals: tenantId } }
    })

    for (const space of spaces.docs) {
      await payload.delete({
        collection: 'spaces',
        id: space.id,
        overrideAccess: true
      })
    }

    // Mark tenant as archived
    await payload.update({
      collection: 'tenants',
      id: tenantId,
      overrideAccess: true,
      data: {
        status: 'archived',
      }
    })

    return NextResponse.json({
      success: true,
      message: `Tenant "${tenant.name}" deprovisioned successfully`,
      tenantId,
    })

  } catch (error) {
    console.error('Tenant deprovisioning failed:', error)
    return NextResponse.json({
      error: 'Deprovisioning failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function configureTenant(payload: any, tenantId: string, configuration: TenantConfiguration) {
  try {
    const tenant = await payload.update({
      collection: 'tenants',
      id: tenantId,
      overrideAccess: true,
      data: {
        settings: configuration,
        lastConfigured: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      tenant,
      message: 'Tenant configuration updated successfully'
    })

  } catch (error) {
    console.error('Tenant configuration failed:', error)
    return NextResponse.json({
      error: 'Configuration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function previewTenant(payload: any, tenantId: string) {
  try {
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
      overrideAccess: true,
      depth: 2
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const domain = tenant.settings?.domain || `${tenant.slug}.spaces.kendev.co`
    const previewUrl = `https://${domain}`

    return NextResponse.json({
      success: true,
      tenant,
      previewUrl,
      previewData: {
        domain,
        status: tenant.status,
        theme: tenant.settings?.theme || 'default'
      }
    })

  } catch (error) {
    console.error('Tenant preview failed:', error)
    return NextResponse.json({
      error: 'Preview failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function listTenants(payload: any) {
  try {
    const tenants = await payload.find({
      collection: 'tenants',
      overrideAccess: true,
      depth: 1,
      sort: '-createdAt',
      where: {
        status: { not_equals: 'archived' }
      }
    })

    const tenantList = tenants.docs.map((tenant: any) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      businessType: tenant.businessType,
      status: tenant.status,
      domain: tenant.settings?.domain || `${tenant.slug}.spaces.kendev.co`,
      previewUrl: `https://${tenant.settings?.domain || `${tenant.slug}.spaces.kendev.co`}`,
      createdAt: tenant.createdAt,
      lastConfigured: tenant.lastConfigured
    }))

    return NextResponse.json({
      success: true,
      tenants: tenantList,
      total: tenants.totalDocs,
      summary: {
        active: tenantList.filter((t: any) => t.status === 'active').length,
        provisioning: tenantList.filter((t: any) => t.status === 'provisioning').length,
        error: tenantList.filter((t: any) => t.status === 'error').length
      }
    })

  } catch (error) {
    console.error('List tenants failed:', error)
    return NextResponse.json({
      error: 'Failed to list tenants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getTenantStatus(payload: any, tenantId: string) {
  try {
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
      overrideAccess: true
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      status: {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status,
        domain: tenant.settings?.domain,
        health: 'healthy',
        lastSeen: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Get tenant status failed:', error)
    return NextResponse.json({
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to seed comprehensive content for new tenant
async function seedTenantContent(payload: any, tenantId: string, spaceId: string, tenantData: TenantData) {
  try {
    // Using the Spaces template system (imported at top)

    // Determine template type from business type
    let templateName = 'service' // default
    const businessType = tenantData.businessType?.toLowerCase() || ''

    if (businessType.includes('youtube') || businessType.includes('channel') || businessType.includes('streamer')) {
      templateName = 'youtube'
    } else if (businessType.includes('nonprofit') || businessType.includes('charity') || businessType.includes('foundation')) {
      templateName = 'nonprofit'
    } else if (businessType.includes('disaster') || businessType.includes('relief') || businessType.includes('emergency')) {
      templateName = 'disaster_relief'
    } else if (businessType.includes('restaurant') || businessType.includes('food') || businessType.includes('pizza')) {
      templateName = 'restaurant'
    } else if (businessType.includes('creator') || businessType.includes('content')) {
      templateName = 'creator'
    } else if (businessType.includes('retail') || businessType.includes('shop') || businessType.includes('store')) {
      templateName = 'retail'
    } else if (businessType.includes('service') || businessType.includes('professional')) {
      templateName = 'service'
    }

    // If voice prompt is provided, generate custom template
    if (tenantData.voicePrompt) {
      console.log(`[Tenant Control] Generating template from voice prompt for tenant ${tenantId}`)
      // Future: Use AI to generate custom template from voice prompt
      // const customTemplate = await generateTemplateFromVoicePrompt(tenantData.voicePrompt, tenantData)
    }

    // Prepare customizations for template
    const customizations = {
      business_name: tenantData.name,
      service_type: tenantData.serviceType || tenantData.businessType || 'professional services',
      years_experience: tenantData.yearsExperience || '5+',
      service_areas: tenantData.serviceAreas || 'consultation, planning, implementation',
      availability: tenantData.availability || 'Monday-Friday 9AM-5PM',
      product_category: tenantData.productCategory || 'quality products',
      current_deals: tenantData.currentDeals || 'Check back for seasonal promotions',
      free_shipping_threshold: tenantData.freeShippingThreshold || '50',
      creator_name: tenantData.creatorName || tenantData.name,
      content_type: tenantData.contentType || 'educational content',
      recent_content: tenantData.recentContent || 'Check our latest updates'
    }

    // Apply the Spaces template
    console.log(`[Tenant Control] Applying '${templateName}' template to tenant ${tenantId}`)
    const { space, channels, messages } = await applySpaceTemplate(
      payload,
      parseInt(tenantId),
      templateName,
      customizations
    )

    // Create home page with template-specific content
    const homeContent = generateHomePageContent(tenantData, templateName)

    await payload.create({
      collection: 'pages',
      data: {
        title: `Welcome to ${tenantData.name}`,
        slug: 'home',
        tenant: tenantId,
        _status: 'published',
        layout: homeContent,
        publishedAt: new Date().toISOString()
      }
    })

    // Create template-specific pages
    await createTemplatePages(payload, tenantId, tenantData, templateName)

    console.log(`[Tenant Control] Successfully seeded tenant ${tenantId} with '${templateName}' template`)
    console.log(`[Tenant Control] Created ${channels.length} channels and ${messages.length} initial messages`)

  } catch (error) {
    console.error('Content seeding failed:', error)
    throw error
  }
}

// Generate home page content based on template type
function generateHomePageContent(tenantData: TenantData, templateName: string) {
  const baseContent = {
    blockType: 'content',
    columns: [
      {
        richText: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [{ type: 'text', text: `Welcome to ${tenantData.name}`, version: 1 }],
                tag: 'h1',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        size: 'full'
      }
    ]
  }

  // Add template-specific content
  const templateContent = getTemplateSpecificContent(tenantData, templateName)
  if (templateContent && templateContent.length > 0 && baseContent.columns[0]?.richText?.root?.children) {
    baseContent.columns[0].richText.root.children.push(...templateContent)
  }

  return [baseContent]
}

// Get template-specific page content
function getTemplateSpecificContent(tenantData: TenantData, templateName: string) {
  const content: any[] = []

  switch (templateName) {
    case 'restaurant':
      content.push(
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: `Delicious food, great service, and a welcoming atmosphere - that's what you'll find at ${tenantData.name}. We're passionate about serving our community with fresh, quality ingredients and memorable dining experiences.`,
            version: 1
          }],
          version: 1
        },
        {
          type: 'heading',
          children: [{ type: 'text', text: 'Order Online', version: 1 }],
          tag: 'h2',
          version: 1
        },
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Ready to enjoy our delicious food? Place your order through our Spaces platform for convenient pickup or delivery!',
            version: 1
          }],
          version: 1
        }
      )
      break

    case 'creator':
      content.push(
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: `Welcome to my creative space! I'm ${tenantData.creatorName || tenantData.name} and I create ${tenantData.contentType || 'engaging content'} for an amazing community. Join our space to connect, get exclusive content, and be part of the creative journey.`,
            version: 1
          }],
          version: 1
        },
        {
          type: 'heading',
          children: [{ type: 'text', text: 'Join the Community', version: 1 }],
          tag: 'h2',
          version: 1
        },
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Connect with fellow fans, get early access to content, and interact directly with me in our exclusive Spaces community!',
            version: 1
          }],
          version: 1
        }
      )
      break

    case 'retail':
      content.push(
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: `Discover amazing ${tenantData.productCategory || 'products'} at ${tenantData.name}. We carefully curate our selection to bring you quality items at great prices, with exceptional customer service every step of the way.`,
            version: 1
          }],
          version: 1
        },
        {
          type: 'heading',
          children: [{ type: 'text', text: 'Shop Now', version: 1 }],
          tag: 'h2',
          version: 1
        },
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: `Browse our collection, get product recommendations, and enjoy free shipping on orders over $${tenantData.freeShippingThreshold || '50'}!`,
            version: 1
          }],
          version: 1
        }
      )
      break

    default: // service
      content.push(
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: `Professional ${tenantData.serviceType || tenantData.businessType || 'services'} you can trust. With ${tenantData.yearsExperience || '5+'} years of experience, we're here to help you achieve your goals with expert guidance and personalized solutions.`,
            version: 1
          }],
          version: 1
        },
        {
          type: 'heading',
          children: [{ type: 'text', text: 'Get Started', version: 1 }],
          tag: 'h2',
          version: 1
        },
        {
          type: 'paragraph',
          children: [{
            type: 'text',
            text: 'Schedule a consultation to discuss your specific needs. We\'ll create a customized plan to help you succeed.',
            version: 1
          }],
          version: 1
        }
      )
  }

  return content
}

// Create template-specific pages
async function createTemplatePages(payload: any, tenantId: string, tenantData: TenantData, templateName: string) {
  const pages = []

  switch (templateName) {
    case 'restaurant':
      pages.push(
        { title: 'Menu', slug: 'menu', content: 'Our delicious menu items and daily specials.' },
        { title: 'Order Online', slug: 'order', content: 'Place your order for pickup or delivery.' },
        { title: 'About Us', slug: 'about', content: `Learn more about ${tenantData.name} and our story.` }
      )
      break

    case 'creator':
      pages.push(
        { title: 'Content', slug: 'content', content: 'Browse my latest content and creations.' },
        { title: 'Community', slug: 'community', content: 'Join our exclusive community space.' },
        { title: 'About', slug: 'about', content: `Learn more about ${tenantData.creatorName || tenantData.name}.` }
      )
      break

    case 'retail':
      pages.push(
        { title: 'Shop', slug: 'shop', content: 'Browse our product catalog.' },
        { title: 'About', slug: 'about', content: `Learn more about ${tenantData.name}.` },
        { title: 'Shipping', slug: 'shipping', content: 'Shipping information and policies.' }
      )
      break

    default: // service
      pages.push(
        { title: 'Services', slug: 'services', content: `Professional ${tenantData.serviceType || 'services'} tailored to your needs.` },
        { title: 'About', slug: 'about', content: `Learn more about ${tenantData.name} and our expertise.` },
        { title: 'Contact', slug: 'contact', content: 'Schedule a consultation or get in touch.' }
      )
  }

  // Create the pages
  for (const page of pages) {
    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        tenant: tenantId,
        _status: 'published',
        layout: [
          {
            blockType: 'content',
            columns: [
              {
                richText: {
                  root: {
                    type: 'root',
                    children: [
                      {
                        type: 'heading',
                        children: [{ type: 'text', text: page.title, version: 1 }],
                        tag: 'h1',
                        version: 1
                      },
                      {
                        type: 'paragraph',
                        children: [{
                          type: 'text',
                          text: page.content,
                          version: 1
                        }],
                        version: 1
                      }
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1
                  }
                },
                size: 'full'
              }
            ]
          }
        ],
        publishedAt: new Date().toISOString()
      }
    })
  }
}
