import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('[InQuicker Callback] OAuth callback received:', { code, state, error })

    if (error) {
      console.error('[InQuicker Callback] OAuth error:', error)
      return NextResponse.redirect('/integrations?error=oauth_failed')
    }

    if (!code || !state) {
      console.error('[InQuicker Callback] Missing code or state')
      return NextResponse.redirect('/integrations?error=missing_params')
    }

    // Verify state to prevent CSRF attacks
    // In production, you would verify against a stored state value
    if (state !== 'demo_state_token') {
      console.error('[InQuicker Callback] Invalid state token')
      return NextResponse.redirect('/integrations?error=invalid_state')
    }

    // Exchange authorization code for access token
    // In production, this would make a request to InQuicker's token endpoint
    const tokenResponse = await exchangeCodeForToken(code)

    if (!tokenResponse.success) {
      console.error('[InQuicker Callback] Token exchange failed:', tokenResponse.error)
      return NextResponse.redirect('/integrations?error=token_exchange_failed')
    }

    // Store the integration credentials
    // In production, you would save these to your database
    const integrationData = {
      provider: 'inquicker',
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt: tokenResponse.expiresAt,
      scope: tokenResponse.scope,
      organizationId: tokenResponse.organizationId,
      facilityId: tokenResponse.facilityId,
      connectedAt: new Date().toISOString(),
    }

    console.log('[InQuicker Callback] Integration successful:', {
      provider: integrationData.provider,
      organizationId: integrationData.organizationId,
      facilityId: integrationData.facilityId,
      scope: integrationData.scope,
    })

    // TODO: Save integration data to database
    // await saveIntegrationData(integrationData)

    // Redirect back to integrations page with success message
    return NextResponse.redirect('/integrations?success=inquicker_connected')

  } catch (error) {
    console.error('[InQuicker Callback] Callback processing failed:', error)
    return NextResponse.redirect('/integrations?error=callback_failed')
  }
}

async function exchangeCodeForToken(code: string) {
  try {
    // For demo purposes, we'll simulate a successful token exchange
    // In production, this would make a POST request to InQuicker's token endpoint

    console.log('[InQuicker Token] Exchanging authorization code for access token')

    // Simulate API call to InQuicker
    const tokenRequestBody = {
      grant_type: 'authorization_code',
      client_id: process.env.INQUICKER_CLIENT_ID || 'demo_client_id',
      client_secret: process.env.INQUICKER_CLIENT_SECRET || 'demo_client_secret',
      code: code,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/inquicker-integration/callback`,
    }

    // In production, you would make this request:
    // const response = await fetch('https://app.inquicker.com/oauth/token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(tokenRequestBody),
    // })

    // For demo purposes, return mock success data
    return {
      success: true,
      accessToken: 'demo_access_token_' + Date.now(),
      refreshToken: 'demo_refresh_token_' + Date.now(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      scope: 'read:appointments write:appointments read:providers write:providers read:patients write:patients',
      organizationId: 'demo_org_bjc_medical',
      facilityId: 'demo_facility_bjc_main',
    }

  } catch (error) {
    console.error('[InQuicker Token] Token exchange failed:', error)
    return {
      success: false,
      error: 'Token exchange failed',
    }
  }
}
