import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const organizationId = url.searchParams.get('organizationId')
    const venueId = url.searchParams.get('venueId')

    // Generate secure state parameter
    const state = Buffer.from(JSON.stringify({
      organizationId,
      venueId,
      timestamp: Date.now(),
      integration: 'google_photos'
    })).toString('base64')

    // Google Photos API OAuth 2.0 configuration
    const googlePhotosAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googlePhotosAuthUrl.searchParams.set('client_id', process.env.GOOGLE_PHOTOS_CLIENT_ID || '')
    googlePhotosAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/google-photos-integration/callback`)
    googlePhotosAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/photoslibrary.readonly')
    googlePhotosAuthUrl.searchParams.set('response_type', 'code')
    googlePhotosAuthUrl.searchParams.set('state', state)
    googlePhotosAuthUrl.searchParams.set('access_type', 'offline')
    googlePhotosAuthUrl.searchParams.set('prompt', 'consent')

    return NextResponse.redirect(googlePhotosAuthUrl.toString())

  } catch (error) {
    console.error('Google Photos OAuth initiation error:', error)
    
    const errorUrl = new URL('/integrations', process.env.NEXT_PUBLIC_BASE_URL!)
    errorUrl.searchParams.set('error', 'google_photos_oauth_failed')
    return NextResponse.redirect(errorUrl.toString())
  }
} 