import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('[InQuicker Auth] OAuth flow initiated')

    // Get the current origin for callback URL
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // For demo purposes, we'll simulate the OAuth flow
    // In production, this would redirect to InQuicker's OAuth server
    const inquickerAuthUrl = new URL('https://app.inquicker.com/oauth/authorize')

    // Add OAuth parameters
    inquickerAuthUrl.searchParams.append('client_id', process.env.INQUICKER_CLIENT_ID || 'demo_client_id')
    inquickerAuthUrl.searchParams.append('redirect_uri', `${origin}/api/inquicker-integration/callback`)
    inquickerAuthUrl.searchParams.append('response_type', 'code')
    inquickerAuthUrl.searchParams.append('scope', 'read:appointments write:appointments read:providers write:providers read:patients write:patients')
    inquickerAuthUrl.searchParams.append('state', 'demo_state_token')

    // For demo purposes, we'll simulate successful authentication
    // In production, you would redirect to InQuicker's OAuth server
    const demoCallbackUrl = new URL('/api/inquicker-integration/callback', origin)
    demoCallbackUrl.searchParams.append('code', 'demo_authorization_code')
    demoCallbackUrl.searchParams.append('state', 'demo_state_token')

    console.log('[InQuicker Auth] Redirecting to demo callback with simulated auth code')

    return NextResponse.redirect(demoCallbackUrl.toString())

  } catch (error) {
    console.error('[InQuicker Auth] OAuth initiation failed:', error)
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 }
    )
  }
}
