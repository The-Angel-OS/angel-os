import { NextRequest, NextResponse } from 'next/server'
import { OnboardingIntegrationService } from '@/services/OnboardingIntegrationService'
import { logInfo } from '@/services/SystemMonitorService'

/**
 * Submit onboarding questionnaire
 * 
 * This endpoint connects the existing onboarding form to the existing message pump
 * architecture, using BusinessAgent + Claude-4-Sonnet for conversational guidance
 */
export async function POST(request: NextRequest) {
  try {
    const questionnaireData = await request.json()
    
    logInfo('Onboarding questionnaire submitted', 'Onboarding', {
      organization: questionnaireData.organization,
      businessType: questionnaireData.spaceType
    })

    // Generate session ID for this onboarding conversation
    const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    // Process through existing message pump
    const result = await OnboardingIntegrationService.processOnboardingQuestionnaire(
      questionnaireData,
      sessionId
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.response,
        sessionId,
        provisioningPlan: result.provisioningPlan,
        nextSteps: result.nextSteps,
        chatUrl: `/chat?session=${sessionId}`,
        continueOnboarding: true
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.response
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Onboarding submission error:', error)
    logInfo('Onboarding submission failed', 'Onboarding', {
      error: error instanceof Error ? error.message : String(error)
    })

    return NextResponse.json({
      success: false,
      error: 'Failed to process onboarding questionnaire',
      message: 'Please try again or contact support for assistance.'
    }, { status: 500 })
  }
}

/**
 * Get onboarding status and recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // This would connect to the existing message pump to get onboarding conversation
    // For now, return basic status
    return NextResponse.json({
      success: true,
      sessionId,
      status: 'in_progress',
      message: 'Continue your conversation with LEO to complete site setup',
      chatUrl: `/chat?session=${sessionId}`
    })

  } catch (error) {
    console.error('Error fetching onboarding status:', error)
    return NextResponse.json({ error: 'Failed to fetch onboarding status' }, { status: 500 })
  }
}
