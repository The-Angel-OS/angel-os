import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('[Route4Me Callback] Franchise OAuth callback received:', { code, state, error })

    if (error) {
      console.error('[Route4Me Callback] Franchise OAuth error:', error)
      return NextResponse.redirect('/integrations?error=franchise_oauth_failed')
    }

    if (!code || !state) {
      console.error('[Route4Me Callback] Missing franchise OAuth parameters')
      return NextResponse.redirect('/integrations?error=missing_franchise_params')
    }

    // Verify state to prevent CSRF attacks
    if (state !== 'demo_franchise_state_token') {
      console.error('[Route4Me Callback] Invalid franchise state token')
      return NextResponse.redirect('/integrations?error=invalid_franchise_state')
    }

    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code)

    if (!tokenResponse.success) {
      console.error('[Route4Me Callback] Franchise token exchange failed:', tokenResponse.error)
      return NextResponse.redirect('/integrations?error=franchise_token_failed')
    }

    // Store the franchise integration credentials
    const integrationData = {
      provider: 'route4me',
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt: tokenResponse.expiresAt,
      scope: tokenResponse.scope,
      franchiseId: tokenResponse.franchiseId,
      territory: tokenResponse.territory,
      vehicleCount: tokenResponse.vehicleCount,
      connectedAt: new Date().toISOString(),
    }

    console.log('[Route4Me Callback] Franchise integration successful:', {
      provider: integrationData.provider,
      franchiseId: integrationData.franchiseId,
      territory: integrationData.territory,
      vehicleCount: integrationData.vehicleCount,
      scope: integrationData.scope,
    })

    // TODO: Save franchise integration data to database
    // await saveFranchiseIntegrationData(integrationData)

    // Redirect back to integrations page with success message
    return NextResponse.redirect('/integrations?success=route4me_connected&category=Operations')

  } catch (error) {
    console.error('[Route4Me Callback] Franchise callback processing failed:', error)
    return NextResponse.redirect('/integrations?error=franchise_callback_failed')
  }
}

async function exchangeCodeForToken(code: string) {
  try {
    console.log('[Route4Me Token] Exchanging franchise authorization code for access token')

    // Simulate API call to Route4Me for franchise operations
    const tokenRequestBody = {
      grant_type: 'authorization_code',
      client_id: process.env.ROUTE4ME_CLIENT_ID || 'demo_franchise_client',
      client_secret: process.env.ROUTE4ME_CLIENT_SECRET || 'demo_franchise_secret',
      code: code,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/route4me-integration/callback`,
    }

    // In production, you would make this request:
    // const response = await fetch('https://api.route4me.com/oauth/token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(tokenRequestBody),
    // })

    // For demo purposes, return mock franchise data
    return {
      success: true,
      accessToken: 'demo_franchise_token_' + Date.now(),
      refreshToken: 'demo_franchise_refresh_' + Date.now(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      scope: 'route:read route:write vehicle:read vehicle:write driver:read driver:write tracking:read',
      franchiseId: 'demo_junkking_sf_001',
      territory: 'San Francisco Bay Area',
      vehicleCount: 3,
    }

  } catch (error) {
    console.error('[Route4Me Token] Franchise token exchange failed:', error)
    return {
      success: false,
      error: 'Franchise token exchange failed',
    }
  }
}
