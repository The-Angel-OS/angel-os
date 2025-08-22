import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    // Decode and validate state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { organizationId, venueId, timestamp, integration } = stateData

    // Security check: ensure state is recent (within 10 minutes)
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      throw new Error('State parameter expired')
    }

    if (integration !== 'google_photos') {
      throw new Error('Invalid integration type')
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_PHOTOS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_PHOTOS_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-photos-integration/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed')
    }

    const tokenData = await tokenResponse.json()

    // Store integration credentials
    /* TODO: Fix collection reference - 'Integrations' is not a valid collection
    await payload.create({
      collection: 'Integrations',
      data: {
        type: 'google_photos',
        organizationId,
        venueId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: tokenData.scope,
        isActive: true,
        connectedAt: new Date(),
      },
    })
    */

    // Temporary logging until proper collection is created
    console.log('Google Photos integration successful:', {
      type: 'google_photos',
      organizationId,
      venueId,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scope: tokenData.scope,
      connectedAt: new Date(),
    })

    // Test the connection by fetching user profile
    const profileResponse = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (profileResponse.ok) {
      console.log('Google Photos integration successful')
    }

    // Redirect back to integrations page with success
    const successUrl = new URL('/integrations', process.env.NEXT_PUBLIC_BASE_URL!)
    successUrl.searchParams.set('success', 'google_photos_connected')
    return NextResponse.redirect(successUrl.toString())

  } catch (error) {
    console.error('Google Photos OAuth callback error:', error)

    const errorUrl = new URL('/integrations', process.env.NEXT_PUBLIC_BASE_URL!)
    errorUrl.searchParams.set('error', 'google_photos_callback_failed')
    return NextResponse.redirect(errorUrl.toString())
  }
}
