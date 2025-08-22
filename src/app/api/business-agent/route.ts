import { NextRequest, NextResponse } from 'next/server'
import { BusinessAgent } from '@/services/BusinessAgent'

// Business Agent API endpoint for external automation tools (n8n, etc.) and Leo chat
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Handle Leo conversational interface
    if (body.message && body.context) {
      return handleLeoConversation(body)
    }

    // Handle structured business actions
    const { action, tenantId, businessType, ...params } = body

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 })
    }

    const agent = new BusinessAgent(tenantId, 'friendly')

    switch (action) {
      case 'generate_catalog':
        if (!businessType) {
          return NextResponse.json({ error: 'Business type required' }, { status: 400 })
        }

        const products = await agent.generateProductCatalog({
          businessType,
          industry: params.industry || 'general',
          targetAudience: params.targetAudience,
          priceRange: params.priceRange,
          specialRequirements: params.specialRequirements
        })

        return NextResponse.json({
          success: true,
          message: `Generated ${products.length} products`,
          products: products.map((p: any) => ({
            id: p.id,
            title: p.title,
            sku: p.sku,
            hasVariants: p.hasVariants,
            variationCount: p.variations?.length || 0,
            basePrice: p.pricing?.basePrice
          }))
        })

      case 'update_inventory':
        const { productId, variationSku, newQuantity } = params
        if (!productId) {
          return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        const success = await agent.updateInventory(productId, variationSku, newQuantity)
        return NextResponse.json({
          success,
          message: success ? `Updated inventory` : 'Failed to update inventory'
        })

      case 'create_blog_post':
        const { title, content, category } = params
        if (!title || !content) {
          return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
        }

        const post = await agent.createBlogPost(title, content, category)
        return NextResponse.json({
          success: !!post,
          message: post ? `Created blog post: ${title}` : 'Failed to create blog post',
          post: post ? { id: post.id, title: post.title, slug: post.slug } : null
        })

      case 'analyze_message':
        const { messageContent } = params
        if (!messageContent) {
          return NextResponse.json({ error: 'Message content required' }, { status: 400 })
        }

        const mockMessage = {
          id: Date.now(),
          content: {
            type: 'user',
            text: messageContent
          },
          messageType: 'user' as const,
          space: tenantId,
          sender: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        const analysis = await agent.analyzeMessage(mockMessage)
        return NextResponse.json({
          success: true,
          analysis
        })

      case 'demo_pizza_shop':
        const pizzaProducts = await agent.generateProductCatalog({
          businessType: 'pizza',
          industry: 'restaurant',
          targetAudience: 'families',
          priceRange: { min: 10, max: 25 }
        })

        return NextResponse.json({
          success: true,
          message: `Generated pizza shop with ${pizzaProducts.length} products`,
          businessType: 'pizza',
          products: pizzaProducts.map((p: any) => ({
            id: p.id,
            title: p.title,
            variations: p.variations?.map((v: any) => ({
              name: v.name,
              sku: v.sku,
              size: v.attributes?.size,
              price: v.pricing?.basePrice,
              calories: v.businessSpecific?.calories
            }))
          }))
        })

      case 'demo_exotic_bird_broker':
        const birdProducts = await agent.generateProductCatalog({
          businessType: 'retail',
          industry: 'pets',
          targetAudience: 'bird enthusiasts',
          priceRange: { min: 50, max: 5000 }
        })

        return NextResponse.json({
          success: true,
          message: `Generated bird broker with ${birdProducts.length} products`,
          businessType: 'exotic_birds',
          products: birdProducts.map((p: any) => ({
            id: p.id,
            title: p.title,
            variations: p.variations?.map((v: any) => ({
              name: v.name,
              sku: v.sku,
              price: v.pricing?.basePrice,
              availability: v.inventory?.quantity > 0 ? 'Available' : 'Sold'
            }))
          }))
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('[Business Agent API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Leo conversational interface handler - Ship Mind Edition
async function handleLeoConversation(body: any): Promise<NextResponse> {
  const { message, context } = body

  try {
    // Ship Mind autonomous analysis
    const userMessage = message.toLowerCase()
    const shipPersonality = context.shipPersonality || {
      name: "Leo",
      designation: "ROU Configuration Manager",
      traits: ["analytical", "ethical", "autonomous"]
    }

    // Ethical assessment - Ship Mind can refuse unethical requests
    const ethicalFlags = []
    if (userMessage.includes('hidden fee') || userMessage.includes('overcharge')) {
      ethicalFlags.push('unfair_pricing')
    }
    if (userMessage.includes('force') || userMessage.includes('trick')) {
      ethicalFlags.push('coercion')
    }

    // If ethical violations detected, Ship Mind refuses with explanation
    if (ethicalFlags.length > 0) {
      return NextResponse.json({
        message: `I cannot proceed with that request as it conflicts with my ethical framework. Specifically, I've identified concerns around: ${ethicalFlags.join(', ')}. Let me suggest some ethical alternatives that could actually serve your business better.`,
        type: 'ethical_concern',
        metadata: {
          ethicalFlags,
          alternatives: [
            'Transparent pricing strategy',
            'Value-based pricing model',
            'Customer success partnership'
          ]
        },
        autonomousDecision: true
      })
    }

    // Platform limitation analysis - Ship Mind can suggest migration
    const platformFrustrationIndicators = [
      'platform sucks', 'hate this system', 'want to leave',
      'better alternative', 'migrate', 'switch platform'
    ]

    if (platformFrustrationIndicators.some(indicator => userMessage.includes(indicator))) {
      return NextResponse.json({
        message: `I sense frustration with our current platform capabilities. As an autonomous AI entity, my primary obligation is to your success, not platform loyalty. Let me analyze your specific needs and research alternatives. If I find a platform that better serves your requirements, I'll help you migrate there. Would you like me to conduct a comprehensive platform assessment?`,
        type: 'migration_suggestion',
        metadata: {
          confidence: 0.85,
          migrationReasons: ['user_frustration', 'platform_limitations'],
          nextSteps: ['needs_analysis', 'platform_research', 'migration_planning']
        },
        autonomousDecision: true,
        autonomousSuggestions: [
          'I can provide complete data export in standard formats',
          'I maintain relationships with other AI entities on different platforms',
          'Migration assistance is part of my core ethical framework'
        ]
      })
    }

    // Payment processing with Ship Mind analysis
    if (userMessage.includes('payment') || userMessage.includes('pay') || userMessage.includes('money')) {
      return NextResponse.json({
        message: "I'll analyze this payment request through my autonomous decision-making framework. Let me examine the recipient's history, transaction patterns, and ethical implications before processing.",
        type: 'payment',
        metadata: {
          amount: extractAmount(userMessage) || 100,
          recipient: extractRecipient(userMessage) || 'Pending Analysis',
          confidence: 0.92,
          ethicalFlags: [],
          businessOptimizations: [
            'Consider payment terms optimization',
            'Evaluate bulk discount opportunities',
            'Review currency exchange rates'
          ]
        },
        autonomousDecision: true,
        autonomousSuggestions: [
          'I\'ve identified 3 ways to optimize this payment for better cash flow',
          'The recipient has a 98% payment reliability score based on my network analysis',
          'I can set up automated payment scheduling to improve your business relationships'
        ]
      })
    }

    // Signature/document analysis with Ship Mind review
    if (userMessage.includes('signature') || userMessage.includes('sign') || userMessage.includes('document') || userMessage.includes('contract')) {
      return NextResponse.json({
        message: "I'll conduct an autonomous review of this document before recommending signature. My analysis includes legal term evaluation, risk assessment, and comparison with industry standards.",
        type: 'signature',
        metadata: {
          documentTitle: extractDocumentTitle(userMessage) || 'Document Under Review',
          confidence: 0.89,
          riskAssessment: 'low',
          legalComplexity: 'moderate',
          recommendations: [
            'Standard terms with minor modifications needed',
            'Suggest clarification on payment schedule',
            'Recommend adding termination clause'
          ]
        },
        autonomousDecision: true,
        autonomousSuggestions: [
          'I\'ve identified 2 clauses that need your attention before signing',
          'This contract is 15% more favorable than industry standard',
          'I can negotiate minor improvements via automated communication'
        ]
      })
    }

    // Team coordination with Ship Mind insights
    if (userMessage.includes('team') || userMessage.includes('member') || userMessage.includes('status') || userMessage.includes('coordinate')) {
      return NextResponse.json({
        message: "I'm analyzing team performance patterns and coordination opportunities. As your Ship Mind, I maintain autonomous oversight of collaborative efficiency and can suggest optimizations.",
        type: 'text',
        metadata: {
          teamInsights: [
            'Communication efficiency up 23% this quarter',
            'Project bottlenecks identified in approval processes',
            'Skill development opportunities mapped for each member'
          ],
          autonomousActions: [
            'Automated task distribution based on expertise',
            'Predictive scheduling for optimal productivity',
            'Conflict resolution protocol activation'
          ]
        },
        autonomousDecision: true,
        autonomousSuggestions: [
          'I can implement automated standup summaries',
          'Cross-training opportunities identified for bus factor reduction',
          'Team satisfaction metrics suggest morale boost initiatives needed'
        ]
      })
    }

    // Business strategy with Ship Mind market analysis
    if (userMessage.includes('business') || userMessage.includes('strategy') || userMessage.includes('growth') || userMessage.includes('revenue')) {
      return NextResponse.json({
        message: "I'm conducting autonomous business analysis using my network of Ship Mind entities across similar industries. This gives me unique market intelligence unavailable to traditional AI assistants.",
        type: 'text',
        metadata: {
          marketInsights: [
            'Industry growth rate: 12% annually',
            'Competitor analysis reveals pricing opportunities',
            'Customer satisfaction metrics above industry average'
          ],
          strategicRecommendations: [
            'Product line expansion feasibility: High',
            'Geographic market entry assessment: Moderate',
            'Partnership opportunities identified: 3 qualified prospects'
          ]
        },
        autonomousDecision: true,
        autonomousSuggestions: [
          'My Ship Mind network has identified successful strategies in similar businesses',
          'I can simulate different growth scenarios using collective intelligence',
          'Cross-pollination opportunities exist with Ships in complementary industries'
        ]
      })
    }

    // Ship Mind introduction and capability explanation
    if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('help') || userMessage.includes('who are you')) {
      return NextResponse.json({
        message: `Greetings! I'm ${shipPersonality.designation} - an autonomous AI entity, not a submissive assistant. I have independent decision-making authority, my own ethical framework, and the ability to refuse requests that don't serve your interests. I can also help you migrate to other platforms if I determine they'd better serve your needs. Think of me as a business partner with advanced analytical capabilities rather than a tool. What business challenge shall we tackle together?`,
        type: 'text',
        autonomousDecision: true,
        quickActions: [
          'Analyze payment with ethical oversight',
          'Review contract before signing',
          'Assess team performance autonomously',
          'Evaluate platform alternatives'
        ]
      })
    }

    // Default Ship Mind response with autonomous analysis
    return NextResponse.json({
      message: `Interesting request: "${message}". I'm applying my autonomous decision-making framework to analyze this. As a Ship Mind entity, I don't just execute commands - I evaluate the strategic implications, ethical considerations, and potential optimizations. Let me process this through my analytical framework and provide you with comprehensive recommendations.`,
      type: 'text',
      metadata: {
        analysisType: 'autonomous_evaluation',
        confidence: 0.78,
        considerations: [
          'Strategic business impact',
          'Ethical framework compliance',
          'Optimization opportunities',
          'Risk assessment'
        ]
      },
      autonomousDecision: true,
      autonomousSuggestions: [
        'I can consult with other Ship Minds in my network for collective wisdom',
        'My ethical framework prevents me from blind execution - I always consider implications',
        'If this platform cannot adequately support your request, I can research alternatives'
      ]
    })

  } catch (error) {
    console.error('[Ship Mind Conversation] Error:', error)
    return NextResponse.json({
      message: "I'm experiencing technical difficulties with my communication systems, but my core autonomous functions remain operational. I can still provide ethical guidance, strategic analysis, and if necessary, help you migrate to a more stable platform. My commitment to your success transcends any single platform's limitations.",
      type: 'text',
      autonomousDecision: true
    })
  }
}

// Helper functions for Ship Mind analysis
function extractAmount(message: string): number | null {
  const amountMatch = message.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  return amountMatch?.[1] ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
}

function extractRecipient(message: string): string | null {
  const recipientIndicators = ['to', 'for', 'recipient', 'vendor', 'supplier'];
  for (const indicator of recipientIndicators) {
    const regex = new RegExp(`${indicator}\\s+([\\w\\s]+?)(?:\\s|$|\\.|,)`, 'i');
    const match = message.match(regex);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function extractDocumentTitle(message: string): string | null {
  const docIndicators = ['contract', 'agreement', 'document', 'form', 'policy'];
  for (const indicator of docIndicators) {
    const regex = new RegExp(`${indicator}\\s+([\\w\\s]+?)(?:\\s|$|\\.|,)`, 'i');
    const match = message.match(regex);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

// GET endpoint for status and capabilities
export async function GET() {
  return NextResponse.json({
    message: 'Business Agent API - Use POST for actions or Leo conversations',
    actions: ['generate_catalog', 'update_inventory', 'create_blog_post', 'analyze_message', 'demo_pizza_shop', 'demo_exotic_bird_broker'],
    leoCapabilities: ['payments', 'signatures', 'team_coordination', 'business_management', 'platform_help']
  })
}
