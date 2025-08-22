import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('[Route4Me Auth] OAuth flow initiated for franchise operations')

    // Get the current origin for callback URL
    const headersList = await headers()
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // For demo purposes, we'll simulate the OAuth flow
    // In production, this would redirect to Route4Me's OAuth server
    const route4meAuthUrl = new URL('https://api.route4me.com/oauth/authorize')

    // Add OAuth parameters for franchise operations
    route4meAuthUrl.searchParams.append('client_id', process.env.ROUTE4ME_CLIENT_ID || 'demo_franchise_client')
    route4meAuthUrl.searchParams.append('redirect_uri', `${origin}/api/route4me-integration/callback`)
    route4meAuthUrl.searchParams.append('response_type', 'code')
    route4meAuthUrl.searchParams.append('scope', 'route:read route:write vehicle:read vehicle:write driver:read driver:write tracking:read')
    route4meAuthUrl.searchParams.append('state', 'demo_franchise_state_token')

    // For demo purposes, we'll simulate successful authentication
    // In production, you would redirect to Route4Me's OAuth server
    const demoCallbackUrl = new URL('/api/route4me-integration/callback', origin)
    demoCallbackUrl.searchParams.append('code', 'demo_franchise_auth_code')
    demoCallbackUrl.searchParams.append('state', 'demo_franchise_state_token')

    console.log('[Route4Me Auth] Redirecting to demo callback for franchise integration')

    return NextResponse.redirect(demoCallbackUrl.toString())

  } catch (error) {
    console.error('[Route4Me Auth] Franchise OAuth initiation failed:', error)
    return NextResponse.json(
      { error: 'Franchise OAuth initiation failed' },
      { status: 500 }
    )
  }
}
