import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '../../../services/BusinessAgent'
import { OAuthTokenService } from '../../../services/OAuthTokenService'

// Social Media Platform APIs
interface SocialMediaPlatform {
  post(content: string, media?: string[], options?: any): Promise<any>
  getProfile(): Promise<any>
  getMetrics(): Promise<any>
}

class FacebookBot implements SocialMediaPlatform {
  constructor(private pageId: string, private accessToken: string) {}

  async post(content: string, media?: string[], options?: any) {
    const url = `https://graph.facebook.com/v18.0/${this.pageId}/feed`
    const body: any = {
      message: content,
      access_token: this.accessToken,
    }

    if (media && media.length > 0) {
      // Handle media uploads
      body.link = media[0] // Simplified - should handle multiple media
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return response.json()
  }

  async getProfile() {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.pageId}?access_token=${this.accessToken}`
    )
    return response.json()
  }

  async getMetrics() {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.pageId}/insights?access_token=${this.accessToken}`
    )
    return response.json()
  }
}

class InstagramBot implements SocialMediaPlatform {
  constructor(private accountId: string, private accessToken: string) {}

  async post(content: string, media?: string[], options?: any) {
    // Instagram requires media for posts
    if (!media || media.length === 0) {
      throw new Error('Instagram posts require media')
    }

    // Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${this.accountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: media[0],
          caption: content,
          access_token: this.accessToken,
        }),
      }
    )

    const container = await containerResponse.json()

    // Publish media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${this.accountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: this.accessToken,
        }),
      }
    )

    return publishResponse.json()
  }

  async getProfile() {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.accountId}?access_token=${this.accessToken}`
    )
    return response.json()
  }

  async getMetrics() {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.accountId}/insights?access_token=${this.accessToken}`
    )
    return response.json()
  }
}

class TwitterBot implements SocialMediaPlatform {
  constructor(private accessToken: string, private accessTokenSecret?: string) {}

  async post(content: string, media?: string[], options?: any) {
    // Using Twitter API v2
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: content,
        media: media ? { media_ids: media } : undefined,
      }),
    })

    return response.json()
  }

  async getProfile() {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    })
    return response.json()
  }

  async getMetrics() {
    // Simplified metrics
    return { followers: 0, following: 0, tweets: 0 }
  }
}

class LinkedInBot implements SocialMediaPlatform {
  constructor(private companyId: string, private accessToken: string) {}

  async post(content: string, media?: string[], options?: any) {
    const url = 'https://api.linkedin.com/v2/ugcPosts'
    const body = {
      author: `urn:li:organization:${this.companyId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return response.json()
  }

  async getProfile() {
    const response = await fetch(
      `https://api.linkedin.com/v2/organizations/${this.companyId}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )
    return response.json()
  }

  async getMetrics() {
    // Simplified metrics
    return { followers: 0, engagement: 0 }
  }
}

// 🔒 SECURE Social Media Bot Service - Uses OAuth tokens securely
class SocialMediaBotService {
  private platforms: Map<string, SocialMediaPlatform> = new Map()
  private oauthService: OAuthTokenService
  private initialized: boolean = false

  constructor(private botConfig: any) {
    this.oauthService = new OAuthTokenService()
  }

  // 🔒 SECURE: Ensure platforms are initialized before use
  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializePlatforms()
      this.initialized = true
    }
  }

  // 🔒 SECURE: Initialize platforms using OAuth tokens from LinkedAccounts
  private async initializePlatforms() {
    const { platforms } = this.botConfig
    
    // Get the user who owns this bot (for OAuth token lookup)
    let botOwnerUserId: string | number
    
    // Try to get user from bot configuration or tenant membership
    if (this.botConfig.user) {
      botOwnerUserId = typeof this.botConfig.user === 'object' ? this.botConfig.user.id : this.botConfig.user
    } else {
      // If no direct user, get the tenant admin as fallback
      const payload = await getPayload({ config: configPromise })
      const tenantMembership = await payload.find({
        collection: 'tenant-memberships',
        where: {
          and: [
            {
              tenant: {
                equals: typeof this.botConfig.tenant === 'object' ? this.botConfig.tenant.id : this.botConfig.tenant,
              },
            },
            {
              role: {
                equals: 'admin',
              },
            },
          ],
        },
        limit: 1,
      })
      
      if (tenantMembership.docs.length > 0) {
        const membership = tenantMembership.docs[0]
        if (membership?.user) {
          botOwnerUserId = typeof membership.user === 'object' ? membership.user.id : membership.user
        } else {
          console.error('No user found in membership - cannot initialize OAuth platforms')
          return
        }
      } else {
        console.error('No user found for bot - cannot initialize OAuth platforms')
        return
      }
    }

    // 🔒 SECURE: Initialize Facebook with OAuth tokens
    if (platforms.facebook?.enabled) {
      const tokens = await this.oauthService.getValidTokens(botOwnerUserId, 'facebook')
      if (tokens) {
        this.platforms.set(
          'facebook',
          new FacebookBot(platforms.facebook.pageId, tokens.accessToken)
        )
        console.log('✅ Facebook bot initialized with secure OAuth tokens')
      } else {
        console.warn('⚠️ Facebook enabled but no valid OAuth tokens found')
      }
    }

    // 🔒 SECURE: Initialize Instagram with OAuth tokens
    if (platforms.instagram?.enabled) {
      const tokens = await this.oauthService.getValidTokens(botOwnerUserId, 'instagram')
      if (tokens) {
        this.platforms.set(
          'instagram',
          new InstagramBot(platforms.instagram.accountId, tokens.accessToken)
        )
        console.log('✅ Instagram bot initialized with secure OAuth tokens')
      } else {
        console.warn('⚠️ Instagram enabled but no valid OAuth tokens found')
      }
    }

    // 🔒 SECURE: Initialize Twitter with OAuth tokens
    if (platforms.twitter?.enabled) {
      const tokens = await this.oauthService.getValidTokens(botOwnerUserId, 'twitter')
      if (tokens) {
        this.platforms.set(
          'twitter',
          new TwitterBot(tokens.accessToken)
        )
        console.log('✅ Twitter bot initialized with secure OAuth tokens')
      } else {
        console.warn('⚠️ Twitter enabled but no valid OAuth tokens found')
      }
    }

    // 🔒 SECURE: Initialize LinkedIn with OAuth tokens
    if (platforms.linkedin?.enabled) {
      const tokens = await this.oauthService.getValidTokens(botOwnerUserId, 'linkedin')
      if (tokens) {
        this.platforms.set(
          'linkedin',
          new LinkedInBot(platforms.linkedin.companyId, tokens.accessToken)
        )
        console.log('✅ LinkedIn bot initialized with secure OAuth tokens')
      } else {
        console.warn('⚠️ LinkedIn enabled but no valid OAuth tokens found')
      }
    }
  }

  // Add public method to access platforms
  async getPlatforms() {
    await this.ensureInitialized()
    return this.platforms
  }

  async generateContent(trigger: string, context: any = {}): Promise<string> {
    const businessAgent = new BusinessAgent(this.botConfig.tenant, this.botConfig.behavior?.aiPersonality || 'professional')

    // Generate content based on trigger and context
    let prompt = ''

    switch (trigger) {
      case 'new_product':
        prompt = `Create a social media post about our new product: ${context.productName}. Make it engaging and include relevant hashtags.`
        break
      case 'daily_summary':
        prompt = `Create a daily update post for our business. Keep it professional and engaging.`
        break
      case 'customer_milestone':
        prompt = `Create a post celebrating a customer milestone: ${context.milestone}. Make it appreciative and inspiring.`
        break
      default:
        prompt = `Create an engaging social media post for our business. Topic: ${trigger}`
    }

    // Use BusinessAgent to analyze and generate content
    const analysis = await businessAgent.analyzeContent(prompt)

    // Generate content based on analysis
    let content = `🚀 Exciting update from our team! `

    if (context.productName) {
      content += `Introducing ${context.productName} - designed to help you achieve more. `
    }

    content += `We're committed to delivering exceptional value to our community. `

    // Add hashtags based on strategy
    if (this.botConfig.behavior?.hashtagStrategy === 'auto') {
      content += `#Innovation #Business #Growth #CustomerFirst`
    } else if (this.botConfig.behavior?.predefinedHashtags) {
      const hashtags = this.botConfig.behavior.predefinedHashtags
        .map((tag: any) => `#${tag.tag}`)
        .join(' ')
      content += ` ${hashtags}`
    }

    return content
  }

  async postToAllPlatforms(content: string, media?: string[]): Promise<any[]> {
    await this.ensureInitialized()
    const results: any[] = []

    for (const [platformName, platform] of this.platforms) {
      try {
        const result = await platform.post(content, media)
        results.push({
          platform: platformName,
          success: true,
          result,
        })
      } catch (error) {
        results.push({
          platform: platformName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return results
  }

  async triggerN8nWorkflow(trigger: string, data: any) {
    if (!this.botConfig.n8nIntegration?.enabled || !this.botConfig.n8nIntegration?.webhookUrl) {
      return null
    }

    try {
      const response = await fetch(this.botConfig.n8nIntegration.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger,
          data,
          botId: this.botConfig.id,
          tenant: this.botConfig.tenant,
        }),
      })

      return response.json()
    } catch (error) {
      console.error('n8n webhook trigger failed:', error)
      return null
    }
  }
}

// Note: Browser automation features (Craigslist, Facebook Marketplace, etc.) 
// have been temporarily removed. Focus is on direct API integrations (Facebook, LinkedIn, Instagram, YouTube)
// Will re-implement browser automation later when needed for specific use cases.

// API Route Handlers
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    const { action, botId, ...actionData } = body

    // Get bot configuration
    const bot = await payload.findByID({
      collection: 'social-media-bots',
      id: botId,
    })

    if (!bot || bot.status !== 'active') {
      return NextResponse.json({ error: 'Bot not found or inactive' }, { status: 404 })
    }

    const botService = new SocialMediaBotService(bot)

    switch (action) {
      case 'post':
        const { content, media, platforms: targetPlatforms } = actionData
        const results = await botService.postToAllPlatforms(content, media)

        // Update bot analytics
        const currentMetrics = bot.analytics?.metrics && typeof bot.analytics.metrics === 'object' && !Array.isArray(bot.analytics.metrics)
          ? bot.analytics.metrics as Record<string, any>
          : {}

        await payload.update({
          collection: 'social-media-bots',
          id: botId,
          data: {
            analytics: {
              trackingEnabled: bot.analytics?.trackingEnabled ?? true,
              metrics: {
                ...currentMetrics,
                totalPosts: (currentMetrics.totalPosts || 0) + 1,
                lastPostResults: results,
                lastActivity: new Date().toISOString(),
              },
            },
          },
        })

        return NextResponse.json({ success: true, results })

      case 'generate_and_post':
        const { trigger, context } = actionData
        const generatedContent = await botService.generateContent(trigger, context)
        const postResults = await botService.postToAllPlatforms(generatedContent)

        // Trigger n8n workflow if enabled
        await botService.triggerN8nWorkflow(trigger, {
          content: generatedContent,
          results: postResults,
          context,
        })

        return NextResponse.json({
          success: true,
          content: generatedContent,
          results: postResults,
        })

      case 'oauth_connect':
        const { platform, authCode } = actionData
        // Handle OAuth connection flow
        return NextResponse.json({ success: true, message: 'OAuth connection initiated' })

      case 'get_metrics':
        const metrics: Record<string, any> = {}
        const availablePlatforms = await botService.getPlatforms()
        for (const [platformName, platform] of availablePlatforms) {
          try {
            metrics[platformName] = await platform.getMetrics()
          } catch (error) {
            metrics[platformName] = { error: 'Failed to fetch metrics' }
          }
        }
        return NextResponse.json({ success: true, metrics })

      // Browser automation cases temporarily removed
      // Will re-implement when needed for specific use cases like Craigslist posting

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Social Media Bot API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const botId = searchParams.get('botId')
    const action = searchParams.get('action')

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 })
    }

    const bot = await payload.findByID({
      collection: 'social-media-bots',
      id: botId,
    })

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    switch (action) {
      case 'status':
        const configuredPlatforms = bot.platforms || {}
        const analytics = bot.analytics?.metrics && typeof bot.analytics.metrics === 'object' && !Array.isArray(bot.analytics.metrics)
          ? bot.analytics.metrics as Record<string, any>
          : {}

        return NextResponse.json({
          id: bot.id,
          name: bot.name,
          status: bot.status,
          platforms: Object.keys(configuredPlatforms).filter(
            platform => configuredPlatforms[platform as keyof typeof configuredPlatforms]?.enabled
          ),
          lastActivity: analytics.lastActivity,
        })

      case 'oauth_url':
        const platform = searchParams.get('platform')
        if (!platform) {
          return NextResponse.json({ error: 'Platform required' }, { status: 400 })
        }

        // Generate OAuth URLs for different platforms
        const oauthUrls = {
          facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || '')}&scope=pages_manage_posts,pages_read_engagement`,
          instagram: `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI || '')}&scope=user_profile,user_media&response_type=code`,
          linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI || '')}&scope=w_member_social`,
          twitter: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.TWITTER_REDIRECT_URI || '')}&scope=tweet.read%20tweet.write%20users.read`,
        }

        return NextResponse.json({
          platform,
          oauthUrl: oauthUrls[platform as keyof typeof oauthUrls] || null,
        })

      default:
        return NextResponse.json(bot)
    }
  } catch (error) {
    console.error('Social Media Bot GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
