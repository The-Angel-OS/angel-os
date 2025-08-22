import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const formData = await request.formData()
    
    // Extract feedback data
    const feedbackData: any = {
      entityType: formData.get('entityType'),
      entityId: formData.get('entityId'),
      entityTitle: formData.get('entityTitle'),
      tenant: formData.get('tenant'),
      space: formData.get('space'),
      
      ratings: {
        overall: parseInt(formData.get('ratings.overall') as string) || 0,
        quality: parseInt(formData.get('ratings.quality') as string) || 0,
        value: parseInt(formData.get('ratings.value') as string) || 0,
        service: parseInt(formData.get('ratings.service') as string) || 0,
        recommendationScore: parseInt(formData.get('ratings.recommendationScore') as string) || 0,
      },
      
      content: {
        review: formData.get('content.review') || '',
        positives: formData.get('content.positives') || '',
        improvements: formData.get('content.improvements') || '',
        suggestions: formData.get('content.suggestions') || '',
        testimonial: formData.get('content.testimonial') || '',
      },
      
      customerName: formData.get('customerInfo.name') || '',
      customerEmail: formData.get('customerInfo.email') || '',
      isAnonymous: formData.get('customerInfo.isAnonymous') === 'true',
      
      metadata: {
        platform: 'web',
        source: request.nextUrl.pathname,
        responseTime: 0, // Could be tracked client-side
        deviceInfo: request.headers.get('user-agent') || 'unknown',
      },
    }
    
    // Handle media uploads
    const mediaAttachments = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('media_') && value instanceof File) {
        try {
          const mediaDoc = await payload.create({
            collection: 'media',
            data: {
              alt: `Feedback photo for ${feedbackData.entityTitle}`,
              // Note: tenant field removed as it may not exist in Media collection
            },
            file: {
              name: value.name,
              data: Buffer.from(await value.arrayBuffer()),
              mimetype: value.type,
              size: value.size,
            },
          })
          mediaAttachments.push(mediaDoc.id)
        } catch (error) {
          console.error('Error uploading feedback media:', error)
        }
      }
    }
    
    feedbackData.mediaAttachments = mediaAttachments
    
    // Handle context responses
    const contextResponses: any[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('contextResponses.')) {
        const parts = key.split('.')
        const indexStr = parts[1]
        const field = parts[2]
        
        if (indexStr && field) {
          const index = parseInt(indexStr)
          if (!isNaN(index)) {
            if (!contextResponses[index]) {
              contextResponses[index] = {}
            }
            contextResponses[index][field] = value
          }
        }
      }
    }
    feedbackData.contextResponses = contextResponses.filter(Boolean)
    
    // AI Analysis with LEO
    let aiAnalysis = null
    try {
      const agent = new BusinessAgent(feedbackData.tenant, 'professional')
      const analysisPrompt = `Analyze this customer feedback:
        
Entity: ${feedbackData.entityType} - ${feedbackData.entityTitle}
Overall Rating: ${feedbackData.ratings.overall}/5
Review: ${feedbackData.content.review}
Positives: ${feedbackData.content.positives}
Improvements: ${feedbackData.content.improvements}

Please provide:
1. Sentiment (positive/neutral/negative)
2. Urgency level (low/medium/high/critical)  
3. Key topics mentioned
4. Suggested response actions
5. Whether this requires immediate follow-up`

      const analysis = await agent.generateIntelligentResponse(analysisPrompt, {
        customerName: 'Business Owner',
        urgency: 'normal'
      })
      
      // Parse AI response into structured data
      aiAnalysis = {
        sentiment: feedbackData.ratings.overall >= 4 ? 'positive' : 
                  feedbackData.ratings.overall >= 3 ? 'neutral' : 'negative',
        confidence: 0.85,
        keyTopics: extractTopics(feedbackData.content.review),
        urgency: feedbackData.ratings.overall <= 2 ? 'high' : 'low',
        suggestedActions: analysis,
      }
      
    } catch (error) {
      console.error('AI analysis failed:', error)
      // Continue without AI analysis
    }
    
    // Create feedback record
    const feedback = await payload.create({
      collection: 'feedback' as any,
      data: {
        ...feedbackData,
        aiAnalysis,
        status: 'pending',
        isPublic: !feedbackData.isAnonymous && feedbackData.ratings.overall >= 4,
        followUp: {
          required: feedbackData.ratings.overall <= 3,
          status: 'pending'
        }
      }
    })
    
    console.log(`✅ Feedback created: ${feedback.id} for ${feedbackData.entityType}:${feedbackData.entityId}`)
    
    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        message: 'Thank you for your feedback! We appreciate your input.',
        followUpRequired: feedbackData.ratings.overall <= 3
      }
    })
    
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to submit feedback',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const onlyPublic = searchParams.get('public') === 'true'
    
    const where: any = {}
    
    if (entityType && entityId) {
      where.entityType = { equals: entityType }
      where.entityId = { equals: entityId }
    }
    
    if (onlyPublic) {
      where.isPublic = { equals: true }
      where.status = { equals: 'approved' }
    }
    
    const feedback = await payload.find({
      collection: 'feedback' as any,
      where,
      limit,
      sort: '-createdAt',
      depth: 2
    })
    
    // Calculate summary statistics
    const summary = {
      totalFeedback: feedback.totalDocs,
      averageRating: feedback.docs.length > 0 
        ? feedback.docs.reduce((sum: number, f: any) => sum + (f.ratings?.overall || 0), 0) / feedback.docs.length
        : 0,
      ratingDistribution: {
        5: feedback.docs.filter((f: any) => f.ratings?.overall === 5).length,
        4: feedback.docs.filter((f: any) => f.ratings?.overall === 4).length,
        3: feedback.docs.filter((f: any) => f.ratings?.overall === 3).length,
        2: feedback.docs.filter((f: any) => f.ratings?.overall === 2).length,
        1: feedback.docs.filter((f: any) => f.ratings?.overall === 1).length,
      },
      npsScore: calculateNPS(feedback.docs)
    }
    
    return NextResponse.json({
      success: true,
      feedback: feedback.docs,
      summary,
      pagination: {
        totalDocs: feedback.totalDocs,
        totalPages: feedback.totalPages,
        page: feedback.page,
        hasNextPage: feedback.hasNextPage,
        hasPrevPage: feedback.hasPrevPage
      }
    })
    
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feedback'
    }, { status: 500 })
  }
}

// Helper functions
function extractTopics(text: string): string[] {
  if (!text) return []
  
  const keywords = ['quality', 'service', 'price', 'value', 'staff', 'location', 'timing', 'experience']
  const topics = []
  
  for (const keyword of keywords) {
    if (text.toLowerCase().includes(keyword)) {
      topics.push(keyword)
    }
  }
  
  return topics
}

function calculateNPS(feedback: any[]): number {
  if (feedback.length === 0) return 0
  
  const scores = feedback
    .map(f => f.ratings?.recommendationScore)
    .filter(score => score !== undefined && score !== null)
  
  if (scores.length === 0) return 0
  
  const promoters = scores.filter(score => score >= 9).length
  const detractors = scores.filter(score => score <= 6).length
  
  return Math.round(((promoters - detractors) / scores.length) * 100)
}
