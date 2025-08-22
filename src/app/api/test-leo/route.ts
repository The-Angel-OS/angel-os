import { NextRequest, NextResponse } from 'next/server'
import { BusinessAgent } from '@/services/BusinessAgent'

export async function POST(request: NextRequest) {
  try {
    let body: any = {}
    let message = "Hello LEO, are you working?"
    
    try {
      body = await request.json()
      message = body.message || message
    } catch (jsonError) {
      console.log('📝 No JSON body provided, using default message')
    }

    console.log('🧪 Testing LEO with message:', message)
    
    // Test BusinessAgent directly
    const agent = new BusinessAgent('1', 'friendly')
    
    console.log('🤖 BusinessAgent created, testing response...')
    
    const response = await agent.generateIntelligentResponse(
      message,
      {
        customerName: 'Test User',
        previousMessages: [],
        urgency: 'normal'
      }
    )

    console.log('✅ LEO response received:', response.substring(0, 100) + '...')

    return NextResponse.json({
      success: true,
      message: 'LEO test completed',
      response,
      debug: {
        anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY,
        anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
        agentTenantId: '1',
        agentPersonality: 'friendly'
      }
    })

  } catch (error) {
    console.error('🚨 LEO test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      debug: {
        anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY,
        anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('🧪 GET test - Testing LEO without JSON parsing')
    
    // Test BusinessAgent directly with GET request
    const agent = new BusinessAgent('1', 'friendly')
    
    const response = await agent.generateIntelligentResponse(
      "Hello LEO, this is a GET test",
      {
        customerName: 'Test User',
        previousMessages: [],
        urgency: 'normal'
      }
    )

    return NextResponse.json({
      success: true,
      message: 'LEO GET test completed',
      response,
      debug: {
        anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY,
        anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🚨 LEO GET test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      debug: {
        anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY,
        anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}
