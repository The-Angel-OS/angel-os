// @ts-nocheck
// @ts-nocheck
import type { Payload } from 'payload'
import type { Space, Message, TenantMembership } from '@/payload-types'

export interface SpaceTemplate {
  name: string
  slug: string
  description: string
  channels: ChannelTemplate[]
  defaultMessages: MessageTemplate[]
  businessSettings: {
    type: 'business' | 'creator' | 'service' | 'retail' | 'manufacturing'
    industry: string
    features: string[]
  }
}

export interface ChannelTemplate {
  name: string
  description: string
  type: 'general' | 'announcements' | 'support' | 'sales' | 'team' | 'social'
  isDefault: boolean
  initialMessages: string[]
}

export interface MessageTemplate {
  content: string
  channel: string
  messageType: 'system' | 'announcement' | 'ai_agent'
  metadata?: any
}

// Master KenDev.Co Template - Template 0
export const kendevTemplate: SpaceTemplate = {
  name: "KenDev.Co Digital Studio",
  slug: "kendev-main",
  description: "Full-service digital commerce and AI automation platform",
  channels: [
    {
      name: "welcome",
      description: "New member orientation and platform updates",
      type: "announcements",
      isDefault: true,
      initialMessages: [
        "ðŸŽ‰ Welcome to KenDev.Co Digital Studio! We specialize in AI-powered business automation, custom web development, and digital commerce solutions.",
        "ðŸ“‹ Here's what we offer: Custom AI agents, E-commerce platforms, Business automation, Digital marketing, Content creation systems",
        "ðŸš€ Getting started? Check out our services page or schedule a consultation. We're here to help scale your business with cutting-edge technology."
      ]
    },
    {
      name: "general",
      description: "General discussion and community chat",
      type: "general",
      isDefault: true,
      initialMessages: [
        "Welcome to our community space! Feel free to introduce yourself and let us know how we can help your business grow.",
        "ðŸ’¡ Pro tip: Use this space to ask questions, share ideas, or connect with other entrepreneurs and developers."
      ]
    },
    {
      name: "ai-automation",
      description: "AI agents, automation, and intelligent systems",
      type: "team",
      isDefault: false,
      initialMessages: [
        "ðŸ¤– Welcome to our AI automation hub! This is where we discuss intelligent business solutions, AI agents, and workflow automation.",
        "ðŸ”§ Current AI services: Voice AI assistants, Business intelligence agents, Automated content creation, Lead qualification systems",
        "ðŸ“ˆ Want to see AI in action? Check out our demo spaces or book a consultation to discuss your automation needs."
      ]
    },
    {
      name: "web-development",
      description: "Custom web development and platform solutions",
      type: "team",
      isDefault: false,
      initialMessages: [
        "ðŸ’» Custom web development and platform engineering discussion space.",
        "ðŸ› ï¸ We build: Next.js applications, E-commerce platforms, Multi-tenant systems, API integrations, Database architectures",
        "ðŸ“Š All projects include modern tech stacks, scalable architecture, and performance optimization."
      ]
    },
    {
      name: "support",
      description: "Technical support and client assistance",
      type: "support",
      isDefault: true,
      initialMessages: [
        "ðŸ›Ÿ Need help? Our support team is here to assist with any technical questions or issues.",
        "â° Support hours: Monday-Friday 9AM-6PM EST. Emergency support available for critical issues.",
        "ðŸ“§ For urgent matters, you can also reach us at support@kendev.co"
      ]
    },
    {
      name: "sales-inquiries",
      description: "Business inquiries and project discussions",
      type: "sales",
      isDefault: true,
      initialMessages: [
        "ðŸ’¼ Ready to discuss your project? This is the right place for business inquiries and project scoping.",
        "ðŸ“‹ To get started, please share: Your business goals, Current challenges, Timeline expectations, Budget range",
        "ðŸŽ¯ We'll provide a custom proposal with pricing, timeline, and deliverables within 24 hours."
      ]
    }
  ],
  defaultMessages: [
    {
      content: "ðŸŽ‰ Welcome to KenDev.Co Digital Studio! We're excited to help you transform your business with AI-powered solutions.",
      channel: "welcome",
      messageType: "system"
    }
  ],
  businessSettings: {
    type: "business",
    industry: "technology",
    features: ["ai_agents", "web_development", "ecommerce", "automation", "consulting"]
  }
}

// Business Templates for Different Industries
export const businessTemplates: Record<string, SpaceTemplate> = {
  // YouTube Channel/Content Creator Template
  youtube: {
    name: "{CREATOR_NAME} Community",
    slug: "main",
    description: "Join {CREATOR_NAME}'s exclusive community space!",
    channels: [
      {
        name: "announcements",
        description: "Latest video uploads and channel updates",
        type: "announcements",
        isDefault: true,
        initialMessages: [
          "ðŸŽ¬ Welcome to {CREATOR_NAME}'s community! Get notified about new videos, live streams, and exclusive content first.",
          "ðŸ”” Make sure to subscribe and hit the bell icon for notifications!",
          "ðŸ’– Want to support the channel? Check out our donation options and exclusive perks below!"
        ]
      },
      {
        name: "community",
        description: "Chat with other fans and the creator",
        type: "general",
        isDefault: true,
        initialMessages: [
          "ðŸ‘‹ Welcome to our community space! Introduce yourself and let's connect!",
          "ðŸ’¬ This is the place to discuss videos, share ideas, and build friendships with fellow viewers.",
          "ðŸ“ Community guidelines: Be respectful, stay on topic, and help create a positive space for everyone!"
        ]
      },
      {
        name: "support-creator",
        description: "Donations, merchandise, and creator support",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "ðŸ’ Want to support {CREATOR_NAME}? Here are all the ways you can help:",
          "ðŸ’° One-time donations: $5, $10, $25, $50, or custom amount",
          "ðŸ‘• Merchandise: Check out our exclusive designs and products",
          "â­ Monthly supporters get exclusive perks: Early access, behind-the-scenes content, and special recognition!"
        ]
      },
      {
        name: "requests-suggestions",
        description: "Video requests and content suggestions",
        type: "general",
        isDefault: true,
        initialMessages: [
          "ðŸ’¡ Have ideas for future videos? Share your suggestions here!",
          "ðŸŽ¯ Most requested topics get priority for upcoming content.",
          "ðŸ“Š Use reactions to vote on ideas you'd like to see covered!"
        ]
      }
    ],
    defaultMessages: [],
    businessSettings: {
      type: "creator",
      industry: "content-creation",
      features: ["donations", "merchandise", "community", "live_streaming", "exclusive_content"]
    }
  },

  // Non-Profit Organization Template
  nonprofit: {
    name: "{ORGANIZATION_NAME}",
    slug: "main",
    description: "Making a difference in {CAUSE_AREA} - join our mission!",
    channels: [
      {
        name: "mission-updates",
        description: "Latest news about our cause and impact",
        type: "announcements",
        isDefault: true,
        initialMessages: [
          "ðŸŒŸ Welcome to {ORGANIZATION_NAME}! We're dedicated to {CAUSE_AREA} and creating positive change.",
          "ðŸ“ˆ Our impact so far: {IMPACT_STATS}",
          "ðŸŽ¯ Current goal: {CURRENT_CAMPAIGN} - Every contribution makes a difference!"
        ]
      },
      {
        name: "donate-now",
        description: "Support our cause with secure donations",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "â¤ï¸ Ready to make an impact? Your donation directly supports {CAUSE_AREA}.",
          "ðŸ’° Quick donate: $10 â€¢ $25 â€¢ $50 â€¢ $100 â€¢ Custom amount",
          "ðŸ† Monthly donors receive updates on exactly how their contributions are used.",
          "ðŸ“œ All donations are tax-deductible. Receipt provided immediately after donation."
        ]
      },
      {
        name: "volunteer",
        description: "Get involved and volunteer with us",
        type: "general",
        isDefault: true,
        initialMessages: [
          "ðŸ™‹â€â™€ï¸ Want to volunteer? We'd love to have you join our team!",
          "ðŸ“… Current opportunities: {VOLUNTEER_OPPORTUNITIES}",
          "â° Time commitment: Flexible - from 2 hours to ongoing positions",
          "âœï¸ Sign up here and we'll match you with the perfect volunteer role!"
        ]
      },
      {
        name: "community-support",
        description: "Connect with supporters and beneficiaries",
        type: "support",
        isDefault: true,
        initialMessages: [
          "ðŸ¤ This space is for our community to connect, share stories, and support each other.",
          "ðŸ“¢ Share how {ORGANIZATION_NAME} has impacted you or your community!",
          "ðŸ’¬ Questions about our programs? Our team is here to help."
        ]
      }
    ],
    defaultMessages: [],
    businessSettings: {
      type: "service",
      industry: "nonprofit",
      features: ["donations", "volunteering", "community", "tax_receipts", "impact_tracking"]
    }
  },

  // Disaster Relief Template
  disaster_relief: {
    name: "{RELIEF_NAME} Emergency Response",
    slug: "emergency",
    description: "Immediate disaster relief for {AFFECTED_AREA} - urgent help needed",
    channels: [
      {
        name: "urgent-updates",
        description: "Critical updates about the disaster and relief efforts",
        type: "announcements",
        isDefault: true,
        initialMessages: [
          "ðŸš¨ URGENT: {DISASTER_TYPE} has affected {AFFECTED_AREA}. Immediate assistance needed.",
          "ðŸ“ Affected areas: {AFFECTED_LOCATIONS}",
          "âš¡ Most urgent needs: {URGENT_NEEDS}",
          "ðŸ’ Every donation goes directly to relief efforts - 100% of funds reach those in need."
        ]
      },
      {
        name: "donate-emergency",
        description: "Emergency donations for immediate relief",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "ðŸ†˜ EMERGENCY DONATIONS NEEDED NOW",
          "ðŸ’° $25 = Emergency food for 1 family for 3 days",
          "ðŸ  $50 = Temporary shelter materials for 1 family",
          "ðŸš‘ $100 = Medical supplies for 10 people",
          "âš¡ $250 = Generator power for emergency shelter",
          "ðŸŽ¯ Custom amount - every dollar makes a difference in saving lives"
        ]
      },
      {
        name: "volunteer-response",
        description: "Emergency volunteer coordination",
        type: "team",
        isDefault: true,
        initialMessages: [
          "ðŸ‘·â€â™€ï¸ VOLUNTEERS NEEDED: Emergency response teams are organizing now.",
          "ðŸš› Transport volunteers: Help move supplies and people to safety",
          "ðŸ¥ Medical volunteers: Medical professionals urgently needed",
          "ðŸ“‹ Coordination volunteers: Help organize relief efforts",
          "âš ï¸ Safety first: All volunteers receive safety briefing and equipment"
        ]
      },
      {
        name: "resource-requests",
        description: "Request specific resources and supplies",
        type: "support",
        isDefault: true,
        initialMessages: [
          "ðŸ“¦ RESOURCE COORDINATION: Tell us what supplies you can provide or need.",
          "ðŸ¥« Food supplies: Non-perishable items, water, baby formula",
          "ðŸ§¥ Clothing: Weather-appropriate clothing, blankets, shoes",
          "ðŸ  Shelter: Tents, tarps, temporary housing materials",
          "ðŸ”‹ Power: Generators, batteries, charging stations"
        ]
      }
    ],
    defaultMessages: [],
    businessSettings: {
      type: "service",
      industry: "emergency-relief",
      features: ["emergency_donations", "volunteer_coordination", "resource_tracking", "urgent_updates"]
    }
  },

  // Restaurant/Food Service Template
  restaurant: {
    name: "{BUSINESS_NAME}",
    slug: "main",
    description: "Welcome to {BUSINESS_NAME} - great food, great service!",
    channels: [
      {
        name: "welcome",
        description: "Welcome new customers and share daily specials",
        type: "announcements",
        isDefault: true,
        initialMessages: [
          "ðŸ• Welcome to {BUSINESS_NAME}! We're excited to serve you delicious food and create memorable dining experiences.",
          "ðŸ“‹ Today's specials: Check our menu for fresh, locally-sourced ingredients and chef's recommendations.",
          "ðŸ“ž Ready to order? Call us or use our online ordering system. Delivery and pickup available!"
        ]
      },
      {
        name: "orders",
        description: "Place orders and track delivery status",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "ðŸ›’ Place your order here! Our team will confirm and provide estimated delivery/pickup time.",
          "â° Current wait times: Pickup 15-20 mins, Delivery 30-45 mins",
          "ðŸ’³ We accept cash, card, and all major digital payment methods.",
          "ðŸ§¾ Need an invoice? We can generate custom invoices for corporate orders or catering events."
        ]
      },
      {
        name: "feedback",
        description: "Share your dining experience with us",
        type: "general",
        isDefault: true,
        initialMessages: [
          "ðŸ’¬ We'd love to hear about your experience! Your feedback helps us serve you better.",
          "â­ Enjoyed your meal? Please consider leaving us a review on Google or Yelp!"
        ]
      }
    ],
    defaultMessages: [],
    businessSettings: {
      type: "retail",
      industry: "food-beverage",
      features: ["ordering", "delivery", "reviews", "specials", "invoicing"]
    }
  },

  // Professional Services Template (Enhanced with invoicing and contracts)
  service: {
    name: "{BUSINESS_NAME}",
    slug: "main",
    description: "Professional {SERVICE_TYPE} services you can trust",
    channels: [
      {
        name: "welcome",
        description: "Welcome clients and showcase expertise",
        type: "announcements",
        isDefault: true,
        initialMessages: [
          "ðŸ‘‹ Welcome to {BUSINESS_NAME}! We provide professional {SERVICE_TYPE} services with {YEARS_EXPERIENCE} years of experience.",
          "ðŸŽ¯ Our expertise: {SERVICE_AREAS}",
          "ðŸ“… Ready to get started? Book a consultation to discuss your specific needs and goals."
        ]
      },
      {
        name: "consultations",
        description: "Schedule and manage client consultations",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "ðŸ“… Schedule your consultation here! We'll discuss your needs and create a customized service plan.",
          "â° Available time slots: {AVAILABILITY}",
          "ðŸ’¼ Consultation includes: Needs assessment, service recommendations, timeline, and pricing.",
          "ðŸ§¾ After consultation, you'll receive a detailed proposal and service agreement to review and sign."
        ]
      },
      {
        name: "invoicing-payments",
        description: "Secure invoices and payment processing",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "ðŸ’° Invoice and payment center - secure, fast, and professional.",
          "ðŸ§¾ Custom invoices generated for all services with detailed breakdown.",
          "ðŸ’³ Secure payment options: Credit card, bank transfer, PayPal, crypto.",
          "ðŸ“„ All invoices include payment terms and are automatically tracked.",
          "âš¡ Need to send an invoice? Just ask and we'll generate it immediately!"
        ]
      },
      {
        name: "contracts-agreements",
        description: "Secure document signing and contract management",
        type: "team",
        isDefault: true,
        initialMessages: [
          "ðŸ“ Secure contract and agreement management center.",
          "âœï¸ Digital signatures with full legal compliance and encryption.",
          "ðŸ“‹ Document types: Service agreements, rental contracts, NDAs, project contracts.",
          "ðŸ”’ All documents are encrypted and stored securely with audit trails.",
          "âš¡ Ready to sign? Documents can be reviewed and signed in minutes!"
        ]
      },
      {
        name: "support",
        description: "Ongoing client support and questions",
        type: "support",
        isDefault: true,
        initialMessages: [
          "ðŸ›Ÿ Need assistance? Our support team is here to help with any questions about our services.",
          "ðŸ“ž Contact options: Message here, email, phone, or video call.",
          "â° Support hours: {AVAILABILITY}"
        ]
      }
    ],
    defaultMessages: [],
    businessSettings: {
      type: "service",
      industry: "professional-services",
      features: ["consulting", "scheduling", "invoicing", "digital_contracts", "secure_payments", "document_signing"]
    }
  },

  // Creator Template (Enhanced for content monetization)
  creator: {
    name: "{CREATOR_NAME}'s Space",
    slug: "main",
    description: "Exclusive content and community from {CREATOR_NAME}",
    channels: [
      {
        name: "announcements",
        description: "Latest content and exclusive announcements",
        type: "announcements",
        isDefault: true,
        initialMessages: [
          "ðŸŽ‰ Welcome to {CREATOR_NAME}'s exclusive space! Get early access to content and connect with the community.",
          "ðŸ“± Latest content: {RECENT_CONTENT}",
          "ðŸ’Ž Premium members get exclusive content, behind-the-scenes access, and direct creator interaction!"
        ]
      },
      {
        name: "community",
        description: "Connect with other fans and followers",
        type: "general",
        isDefault: true,
        initialMessages: [
          "ðŸ‘‹ Welcome to our amazing community! Introduce yourself and connect with fellow fans.",
          "ðŸ’¬ Share your thoughts on latest content, ask questions, and build friendships!",
          "ðŸŽ¯ Community guidelines: Be respectful, supportive, and help make this a positive space for everyone."
        ]
      },
      {
        name: "exclusive-content",
        description: "Premium content for supporters only",
        type: "team",
        isDefault: false,
        initialMessages: [
          "â­ EXCLUSIVE CONTENT for supporters! Thank you for supporting {CREATOR_NAME}!",
          "ðŸŽ¬ Behind-the-scenes content, early previews, and creator insights.",
          "ðŸ’¬ Direct access to {CREATOR_NAME} for questions and feedback.",
          "ðŸŽ Monthly exclusive content drops and special surprises!"
        ]
      },
      {
        name: "support-creator",
        description: "Support through donations and purchases",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "â¤ï¸ Support {CREATOR_NAME} and help create amazing content!",
          "ðŸ’° One-time support: $5 â€¢ $15 â€¢ $25 â€¢ $50 â€¢ Custom",
          "â­ Monthly support: $5/month â€¢ $15/month â€¢ $25/month (includes exclusive perks)",
          "ðŸ›ï¸ Merchandise: Exclusive designs and limited edition items",
          "ðŸ§¾ Need a custom invoice for business support? Just ask!"
        ]
      }
    ],
    defaultMessages: [],
    businessSettings: {
      type: "creator",
      industry: "content-creation",
      features: ["exclusive_content", "community", "donations", "merchandise", "fan_support", "invoicing"]
    }
  },

  // Retail Template (Enhanced with invoicing)
  retail: {
    name: "{BUSINESS_NAME}",
    slug: "main",
    description: "Quality {PRODUCT_CATEGORY} at {BUSINESS_NAME}",
    channels: [
      {
        name: "store",
        description: "Browse products and make purchases",
        type: "sales",
        isDefault: true,
        initialMessages: [
          "ðŸ›ï¸ Welcome to {BUSINESS_NAME}! Discover amazing {PRODUCT_CATEGORY} at great prices.",
          "â­ Current deals: {CURRENT_DEALS}",
          "ðŸšš Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}!",
          "ðŸ§¾ Business customer? We offer custom invoicing and bulk pricing."
        ]
      },
      {
        name: "support",
        description: "Customer service and product help",
        type: "support",
        isDefault: true,
        initialMessages: [
          "ðŸ›Ÿ Need help? Our customer service team is here to assist with orders, returns, and product questions.",
          "ðŸ“ž Contact us here or call our support line for immediate assistance.",
          "ðŸ“¦ Order tracking, returns, and exchanges made easy!"
        ]
      },
      {
        name: "community",
        description: "Customer reviews and community",
        type: "general",
        isDefault: true,
        initialMessages: [
          "ðŸ’¬ Join our customer community! Share reviews, photos, and tips with other shoppers.",
          "â­ Love your purchase? We'd appreciate a review!",
          "ðŸ“¸ Share photos of your {PRODUCT_CATEGORY} in action!"
        ]
      }
    ],
    defaultMessages: [],
    businessSettings: {
      type: "retail",
      industry: "ecommerce",
      features: ["ecommerce", "customer_service", "reviews", "shipping", "invoicing", "bulk_pricing"]
    }
  }
}

// Template Application Function
export async function applySpaceTemplate(
  payload: Payload,
  tenantId: number,
  templateName: string,
  customizations: Record<string, string> = {}
): Promise<{ space: Space, channels: string[], messages: Message[] }> {
  const template = businessTemplates[templateName]
  if (!template) {
    throw new Error(`Template '${templateName}' not found`)
  }

  // Apply customizations to template
  const customizedTemplate = {
    ...template,
    name: replacePlaceholders(template.name, customizations),
    description: replacePlaceholders(template.description, customizations),
    channels: template.channels.map(channel => ({
      ...channel,
      name: replacePlaceholders(channel.name, customizations),
      description: replacePlaceholders(channel.description, customizations),
      initialMessages: channel.initialMessages.map(msg => replacePlaceholders(msg, customizations))
    }))
  }

  // Create space for this template
  const space = await payload.create({
    collection: 'spaces',
    data: {
      name: customizedTemplate.name,
      slug: customizedTemplate.slug,
      description: customizedTemplate.description,
      tenant: tenantId,
      businessIdentity: {
        type: template.businessSettings.type as any,
        industry: template.businessSettings.industry as any,
      },
      // @ts-ignore
      settings: {
        isPublic: true,
        allowMessages: true,
        theme: 'business'
      }
    } as any
  })

  // Get the tenant's admin user to create messages
  const adminUser = await payload.find({
    collection: 'users',
    where: {
      'tenantMemberships.tenant': { equals: tenantId },
      'tenantMemberships.role': { equals: 'admin' }
    },
    limit: 1
  })

  const messageAuthor = adminUser.docs[0]?.id || 1 // Fallback to user 1

  // Create channels (as space metadata for now, since we don't have a channels collection)
  const channels: string[] = []
  const messages: Message[] = []

  // Create initial messages for each channel
  for (const channelTemplate of customizedTemplate.channels) {
    channels.push(channelTemplate.name)

    for (const messageContent of channelTemplate.initialMessages) {
      const message = await payload.create({
        collection: 'messages',
        data: {
          author: messageAuthor,
          space: space.id,
          channel: channelTemplate.name,
          tenant: tenantId,
          content: messageContent,
          messageType: 'system',
          timestamp: new Date().toISOString(),
          atProtocol: {
            type: 'co.kendev.spaces.template_message',
            did: `did:plc:tenant-${tenantId}-template`,
          },
          businessContext: {
            department: channelTemplate.type === 'sales' ? 'sales' :
                       channelTemplate.type === 'support' ? 'support' : 'general',
            workflow: 'knowledge',
            priority: channelTemplate.type === 'announcements' ? 'high' : 'normal'
          }
        }
      })
      messages.push(message)
    }
  }

  console.log(`[Spaces Template] Applied '${templateName}' template to tenant ${tenantId}`)
  console.log(`[Spaces Template] Created space '${customizedTemplate.name}' with ${channels.length} channels and ${messages.length} messages`)

  return { space, channels, messages }
}

// Helper function to replace placeholders in templates
function replacePlaceholders(text: string, customizations: Record<string, string>): string {
  let result = text
  for (const [key, value] of Object.entries(customizations)) {
    const placeholder = `{${key.toUpperCase()}}`
    result = result.replace(new RegExp(placeholder, 'g'), value)
  }
  return result
}

// Voice Prompt Template Generation (AI Integration)
interface VoiceBusinessContext {
  businessType: string
  industry: string
  keyTerms: string[]
  features: string[]
  confidence: number
}

export async function generateTemplateFromVoicePrompt(
  voicePrompt: string,
  businessContext: VoiceBusinessContext
): Promise<SpaceTemplate> {
  // This would integrate with OpenAI or similar AI service
  // For now, return a basic template based on keywords

  const prompt = voicePrompt.toLowerCase()

  let templateType = 'service'
  if (prompt.includes('restaurant') || prompt.includes('food') || prompt.includes('pizza')) {
    templateType = 'restaurant'
  } else if (prompt.includes('creator') || prompt.includes('content') || prompt.includes('youtube')) {
    templateType = 'creator'
  } else if (prompt.includes('shop') || prompt.includes('store') || prompt.includes('retail')) {
    templateType = 'retail'
  }

  // Start with base template and customize
  const baseTemplate = { ...businessTemplates[templateType] }

  // TODO: Implement AI-powered customization based on voice prompt
  // This would analyze the prompt and generate:
  // - Custom channel names and descriptions
  // - Personalized welcome messages
  // - Industry-specific features
  // - Brand voice and tone

  return baseTemplate
}

// Template Export/Import Functions (for the "drag and drop handbag" concept)
export interface TemplatePackage {
  metadata: {
    name: string
    version: string
    description: string
    author: string
    businessType: string
    createdAt: string
  }
  template: SpaceTemplate
  assets: {
    images: Array<{ name: string, url: string, type: string }>
    documents: Array<{ name: string, content: string, type: string }>
  }
  customizations: Record<string, string>
}

export async function exportTenantAsTemplate(
  payload: Payload,
  tenantId: number,
  templateName: string
): Promise<TemplatePackage> {
  // Find tenant and associated spaces
  const tenant = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
    depth: 2
  })

  const spaces = await payload.find({
    collection: 'spaces',
    where: { tenant: { equals: tenantId } }
  })

  const messages = await payload.find({
    collection: 'messages',
    where: { tenant: { equals: tenantId } }
  })

  // Create template package
  const templatePackage: TemplatePackage = {
    metadata: {
      name: templateName,
      version: '1.0.0',
      description: `Template exported from ${tenant.name}`,
      author: tenant.name,
      businessType: tenant.businessType || 'general',
      createdAt: new Date().toISOString()
    },
    template: {
      name: tenant.name,
      slug: 'main',
      description: (tenant as any).description || `Welcome to ${tenant.name}`,
      channels: extractChannelsFromMessages(messages.docs),
      defaultMessages: messages.docs.map(msg => ({
        content: msg.content,
        channel: msg.channel || 'general',
        messageType: msg.messageType as any,
        metadata: msg.metadata
      })),
      businessSettings: {
        type: tenant.businessType as any || 'business',
        industry: 'general',
        features: (tenant as any).settings?.features || []
      }
    } as SpaceTemplate,
    assets: {
      images: [], // TODO: Extract and include images
      documents: [] // TODO: Extract and include documents
    },
    customizations: (tenant as any).settings || {}
  }

  return templatePackage
}

export async function importTemplatePackage(
  payload: Payload,
  tenantId: number,
  templatePackage: TemplatePackage,
  customizations: Record<string, string> = {}
): Promise<{ space: Space, channels: string[], messages: Message[] }> {

  // Merge provided customizations with package customizations
  const allCustomizations = { ...templatePackage.customizations, ...customizations }

  // Apply the template from the package
  return await applySpaceTemplate(
    payload,
    tenantId,
    'custom',
    allCustomizations
  )
}

// Helper function to extract channel information from messages
function extractChannelsFromMessages(messages: Message[]): ChannelTemplate[] {
  const channelMap = new Map<string, ChannelTemplate>()

  for (const message of messages) {
    const channelName = message.channel || 'general'

    if (!channelMap.has(channelName)) {
      channelMap.set(channelName, {
        name: channelName,
        description: `${channelName} discussion`,
        type: determineChannelType(channelName),
        isDefault: channelName === 'general' || channelName === 'welcome',
        initialMessages: []
      })
    }

    const channel = channelMap.get(channelName)!
    if (channel.initialMessages.length < 3) { // Limit to first 3 messages
      channel.initialMessages.push(message.content)
    }
  }

  return Array.from(channelMap.values())
}

function determineChannelType(channelName: string): ChannelTemplate['type'] {
  const name = channelName.toLowerCase()
  if (name.includes('welcome') || name.includes('announcement')) return 'announcements'
  if (name.includes('support') || name.includes('help')) return 'support'
  if (name.includes('sales') || name.includes('order')) return 'sales'
  if (name.includes('team') || name.includes('staff')) return 'team'
  if (name.includes('social') || name.includes('community')) return 'social'
  return 'general'
}
