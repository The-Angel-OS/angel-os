import { getPayload, Payload } from 'payload'
import configPromise from '@payload-config'
import { safeDecrypt } from '../utilities/encryption'

export interface DecryptedTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  scope?: string
  providerAccountId?: string
  providerAccountData?: Record<string, unknown>
}

export interface TokenRefreshResult {
  success: boolean
  tokens?: DecryptedTokens
  error?: string
}

export class OAuthTokenService {
  private payload: Payload | null

  constructor() {
    this.payload = null
  }

  private async getPayloadInstance() {
    if (!this.payload) {
      this.payload = await getPayload({ config: configPromise })
    }
    return this.payload
  }

  /**
   * Get decrypted OAuth tokens for a user and provider
   */
  async getTokens(userId: string | number, provider: string): Promise<DecryptedTokens | null> {
    try {
      const payload = await this.getPayloadInstance()
      
      const linkedAccounts = await payload.find({
        collection: 'linked-accounts',
        where: {
          and: [
            {
              user: {
                equals: userId,
              },
            },
            {
              provider: {
                equals: provider,
              },
            },
            {
              status: {
                equals: 'active',
              },
            },
          ],
        },
        limit: 1,
      })

      if (!linkedAccounts.docs.length) {
        console.log(`No active linked account found for user ${userId} and provider ${provider}`)
        return null
      }

      const account = linkedAccounts.docs[0]
      if (!account) {
        console.error(`No account data found for user ${userId} and provider ${provider}`)
        return null
      }

      // Decrypt the tokens
      const accessToken = safeDecrypt(account.accessToken)
      const refreshToken = account.refreshToken ? safeDecrypt(account.refreshToken) || undefined : undefined

      if (!accessToken) {
        console.error(`Failed to decrypt access token for user ${userId} and provider ${provider}`)
        await this.markAccountAsError(account.id, 'Failed to decrypt access token')
        return null
      }

      // Update last used timestamp
      await payload.update({
        collection: 'linked-accounts',
        id: account.id,
        data: {
          lastUsed: new Date().toISOString(),
        },
      })

      return {
        accessToken,
        refreshToken,
        expiresAt: account.expiresAt ? new Date(account.expiresAt) : undefined,
        scope: account.scope || undefined,
        providerAccountId: account.providerAccountId || undefined,
        providerAccountData: account.providerAccountData && typeof account.providerAccountData === 'object' && !Array.isArray(account.providerAccountData) 
          ? account.providerAccountData as Record<string, unknown> 
          : undefined,
      }
    } catch (error) {
      console.error('Error getting OAuth tokens:', error)
      return null
    }
  }

  /**
   * Check if tokens are expired and need refreshing
   */
  isTokenExpired(tokens: DecryptedTokens): boolean {
    if (!tokens.expiresAt) return false
    
    // Consider token expired if it expires within the next 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    return tokens.expiresAt < fiveMinutesFromNow
  }

  /**
   * Refresh OAuth tokens for a specific provider
   */
  async refreshTokens(userId: string | number, provider: string): Promise<TokenRefreshResult> {
    try {
      const currentTokens = await this.getTokens(userId, provider)
      
      if (!currentTokens || !currentTokens.refreshToken) {
        return {
          success: false,
          error: 'No refresh token available',
        }
      }

      // Refresh logic per provider
      let newTokens: {
        access_token?: string
        refresh_token?: string
        expires_in?: number
      }
      
      switch (provider) {
        case 'twitter':
          newTokens = await this.refreshTwitterTokens(currentTokens.refreshToken)
          break
        case 'linkedin':
          newTokens = await this.refreshLinkedInTokens(currentTokens.refreshToken)
          break
        case 'facebook':
        case 'instagram':
          newTokens = await this.refreshFacebookTokens(currentTokens.refreshToken)
          break
        case 'google':
        case 'youtube':
          newTokens = await this.refreshGoogleTokens(currentTokens.refreshToken)
          break
        default:
          return {
            success: false,
            error: `Token refresh not implemented for provider: ${provider}`,
          }
      }

      if (!newTokens.access_token) {
        return {
          success: false,
          error: 'Failed to refresh token - no access token received',
        }
      }

      // Update the linked account with new tokens
      const payload = await this.getPayloadInstance()
      
      await payload.update({
        collection: 'linked-accounts',
        where: {
          and: [
            { user: { equals: userId } },
            { provider: { equals: provider } },
          ],
        },
        data: {
          accessToken: newTokens.access_token, // Will be encrypted by beforeChange hook
          refreshToken: newTokens.refresh_token || currentTokens.refreshToken,
          expiresAt: newTokens.expires_in 
            ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
            : currentTokens.expiresAt?.toISOString(),
          status: 'active',
          lastUsed: new Date().toISOString(),
        },
      })

      console.log(`Successfully refreshed tokens for user ${userId} and provider ${provider}`)

      return {
        success: true,
        tokens: {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || currentTokens.refreshToken,
          expiresAt: newTokens.expires_in 
            ? new Date(Date.now() + newTokens.expires_in * 1000)
            : currentTokens.expiresAt,
          scope: currentTokens.scope,
          providerAccountId: currentTokens.providerAccountId,
          providerAccountData: currentTokens.providerAccountData,
        },
      }
    } catch (error) {
      console.error('Error refreshing OAuth tokens:', error)
      return {
        success: false,
        error: `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Get valid tokens, refreshing if necessary
   */
  async getValidTokens(userId: string | number, provider: string): Promise<DecryptedTokens | null> {
    const tokens = await this.getTokens(userId, provider)
    
    if (!tokens) {
      return null
    }

    // Check if tokens need refreshing
    if (this.isTokenExpired(tokens)) {
      console.log(`Tokens expired for user ${userId} and provider ${provider}, attempting refresh...`)
      
      const refreshResult = await this.refreshTokens(userId, provider)
      
      if (refreshResult.success && refreshResult.tokens) {
        return refreshResult.tokens
      } else {
        console.error(`Failed to refresh tokens: ${refreshResult.error}`)
        await this.markAccountAsError(
          userId, 
          provider, 
          `Token refresh failed: ${refreshResult.error}`
        )
        return null
      }
    }

    return tokens
  }

  /**
   * Mark a linked account as having an error
   */
  private async markAccountAsError(accountIdOrUserId: string | number, providerOrError: string, errorMessage?: string) {
    try {
      const payload = await this.getPayloadInstance()
      
      // If we have userId and provider, find the account
      if (typeof accountIdOrUserId === 'string' && !errorMessage) {
        await payload.update({
          collection: 'linked-accounts',
          id: accountIdOrUserId,
          data: {
            status: 'error',
            errorMessage: providerOrError,
          },
        })
      } else {
        // Find account by userId and provider
        await payload.update({
          collection: 'linked-accounts',
          where: {
            and: [
              { user: { equals: accountIdOrUserId } },
              { provider: { equals: providerOrError } },
            ],
          },
          data: {
            status: 'error',
            errorMessage: errorMessage || 'Unknown error',
          },
        })
      }
    } catch (error) {
      console.error('Error marking account as error:', error)
    }
  }

  /**
   * Platform-specific token refresh methods
   */
  private async refreshTwitterTokens(refreshToken: string) {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    return await response.json()
  }

  private async refreshLinkedInTokens(refreshToken: string) {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }),
    })

    return await response.json()
  }

  private async refreshFacebookTokens(refreshToken: string) {
    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.FACEBOOK_CLIENT_ID!,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
      }),
    })

    return await response.json()
  }

  private async refreshGoogleTokens(refreshToken: string) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    })

    return await response.json()
  }

  /**
   * Revoke OAuth tokens for a provider
   */
  async revokeTokens(userId: string | number, provider: string): Promise<boolean> {
    try {
      const tokens = await this.getTokens(userId, provider)
      
      if (!tokens) {
        return false
      }

      // Revoke tokens with the provider
      let revokeSuccess = false
      
      switch (provider) {
        case 'twitter':
          revokeSuccess = await this.revokeTwitterTokens(tokens.accessToken)
          break
        case 'google':
        case 'youtube':
          revokeSuccess = await this.revokeGoogleTokens(tokens.accessToken)
          break
        // Add other providers as needed
        default:
          console.log(`Token revocation not implemented for provider: ${provider}`)
          revokeSuccess = true // Assume success for providers without revocation
      }

      // Mark account as revoked in our database
      const payload = await this.getPayloadInstance()
      
      await payload.update({
        collection: 'linked-accounts',
        where: {
          and: [
            { user: { equals: userId } },
            { provider: { equals: provider } },
          ],
        },
        data: {
          status: 'revoked',
        },
      })

      console.log(`Revoked tokens for user ${userId} and provider ${provider}`)
      return revokeSuccess
    } catch (error) {
      console.error('Error revoking OAuth tokens:', error)
      return false
    }
  }

  private async revokeTwitterTokens(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.twitter.com/2/oauth2/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          token: accessToken,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Error revoking Twitter tokens:', error)
      return false
    }
  }

  private async revokeGoogleTokens(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
        method: 'POST',
      })

      return response.ok
    } catch (error) {
      console.error('Error revoking Google tokens:', error)
      return false
    }
  }
} 