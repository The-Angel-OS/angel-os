import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Anthropic connection...')
    console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY)
    console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0)
    console.log('API Key first 10 chars:', process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'none')
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ 
        error: 'No API key found',
        env: Object.keys(process.env).filter(k => k.includes('ANTHROPIC'))
      })
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY.trim(),
    })

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "Anthropic connection working!" and nothing else.'
      }]
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : 'No text response'

    return NextResponse.json({
      success: true,
      response: text,
      apiKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0
    })

  } catch (error) {
    console.error('Anthropic test failed:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

