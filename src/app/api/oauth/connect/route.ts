import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { signIn } from '@/lib/auth'

/**
 * OAuth Connection Flow API
 * 
 * This endpoint demonstrates how to initiate secure OAuth connections
 * using the Auth.js framework with encrypted token storage.
 */
export async function POST(request: NextRequest) {
  try {
    const { provider, userId, callbackUrl } = await request.json()

    // Validate required parameters
    if (!provider || !userId) {
      return NextResponse.json({
        error: 'Provider and userId are required',
        usage: {
          provider: 'twitter|linkedin|facebook|instagram|google|github|discord',
          userId: 'string - ID of the user connecting the account',
          callbackUrl: 'string - Optional redirect URL after connection'
        }
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Verify user exists and is authenticated
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    // Generate OAuth connection URL
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const oauthUrl = `${baseUrl}/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl || `${baseUrl}/oauth/success`)}`

    return NextResponse.json({
      success: true,
      message: `OAuth connection initiated for ${provider}`,
      oauthUrl,
      provider,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      },
      instructions: [
        '1. User visits the oauthUrl to begin OAuth flow',
        '2. User grants permissions on the provider platform',
        '3. Auth.js handles the callback and stores encrypted tokens',
        '4. LinkedAccounts collection is updated with secure tokens',
        '5. Social media bots can now use secure tokens via OAuthTokenService'
      ],
      security: {
        tokenEncryption: 'AES-256-GCM with unique IV per token',
        tokenStorage: 'LinkedAccounts collection with tenant isolation',
        refreshHandling: 'Automatic token refresh before expiration',
        revocation: 'Secure token revocation on disconnection'
      }
    })

  } catch (error) {
    console.error('OAuth connection error:', error)
    return NextResponse.json({
      error: 'Failed to initiate OAuth connection',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get OAuth Connection Status
 * 
 * Check which platforms a user has connected and their status.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        error: 'userId parameter is required'
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get all linked accounts for the user
    const linkedAccounts = await payload.find({
      collection: 'linked-accounts',
      where: {
        user: {
          equals: userId,
        },
      },
    })

    const connections = linkedAccounts.docs.map(account => ({
      provider: account.provider,
      status: account.status,
      connectedAt: account.createdAt,
      lastUsed: account.lastUsed,
      expiresAt: account.expiresAt,
      scope: account.scope,
      errorMessage: account.errorMessage,
    }))

    const availableProviders = [
      'twitter',
      'linkedin', 
      'facebook',
      'instagram',
      'google',
      'github',
      'discord'
    ]

    const connectedProviders = connections.map(c => c.provider) as string[]
    const availableForConnection = availableProviders.filter(p => !connectedProviders.includes(p))

    return NextResponse.json({
      success: true,
      userId,
      connections,
      connectedProviders,
      availableForConnection,
      totalConnections: connections.length,
      activeConnections: connections.filter(c => c.status === 'active').length,
      expiredConnections: connections.filter(c => c.status === 'expired').length,
      architecture: {
        message: 'This demonstrates the secure OAuth architecture in action',
        tokenSecurity: 'All tokens are encrypted with AES-256-GCM',
        multiTenant: 'Each connection is isolated by tenant',
        autoRefresh: 'Tokens are automatically refreshed when needed',
        usage: 'Social media bots retrieve decrypted tokens on-demand'
      }
    })

  } catch (error) {
    console.error('OAuth status error:', error)
    return NextResponse.json({
      error: 'Failed to get OAuth status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 