import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface SocialPlatform {
  name: string
  enabled: boolean
  credentials: any
  postFormat: 'text' | 'image' | 'video' | 'link' | 'story'
  characterLimit?: number
  hashtagSupport: boolean
  threadingSupport: boolean
}

interface SyndicationResult {
  platform: string
  success: boolean
  postId?: string
  url?: string
  error?: string
  engagement?: {
    likes?: number
    shares?: number
    comments?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const {
      postId,
      action = 'syndicate',
      platforms = 'all',
      customMessage,
      scheduleDate,
      tenantId
    } = body

    switch (action) {
      case 'syndicate':
        return await syndicatePost(payload, { postId, platforms, customMessage, tenantId })

      case 'update_all':
        return await updatePostAcrossPlatforms(payload, { postId, customMessage, tenantId })

      case 'delete_all':
        return await deletePostAcrossPlatforms(payload, { postId, tenantId })

      case 'analyze_engagement':
        return await analyzeEngagementAcrossPlatforms(payload, { postId, tenantId })

      case 'ai_optimize':
        return await aiOptimizeForPlatforms(payload, { postId, tenantId })

      default:
        return NextResponse.json({
          error: 'Invalid action. Use: syndicate, update_all, delete_all, analyze_engagement, ai_optimize'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Social federation error:', error)
    return NextResponse.json({
      error: 'Failed to process social federation request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * POSTS AS SOURCE OF TRUTH - Core Function
 * Syndicate post to all configured social platforms
 */
async function syndicatePost(payload: any, context: any) {
  // 1. Get the source post from Payload
  const post = await payload.findByID({
    collection: 'posts',
    id: context.postId
  })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // 2. Get tenant's social platform configurations
  const platforms = await getTenantSocialPlatforms(payload, context.tenantId)

  // 3. AI-optimize content for each platform
  const optimizedContent = await aiOptimizeForEachPlatform(post, platforms)

  // 4. Syndicate to each platform
  const results: SyndicationResult[] = []

  for (const platform of platforms) {
    if (!platform.enabled) continue

    try {
      const result = await postToPlatform(platform, optimizedContent[platform.name], post)
      results.push(result)

      // Create message event for successful syndication
      if (result.success) {
        await createSyndicationMessage(payload, {
          postId: context.postId,
          platform: platform.name,
          result,
          tenantId: context.tenantId
        })
      }

    } catch (error) {
      results.push({
        platform: platform.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // 5. Update post with syndication metadata
  await payload.update({
    collection: 'posts',
    id: context.postId,
    data: {
      syndication: {
        lastSynced: new Date().toISOString(),
        platforms: results,
        totalReach: results.reduce((sum, r) => sum + (r.engagement?.likes || 0), 0)
      }
    }
  })

  return NextResponse.json({
    success: true,
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug
    },
    syndication: {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  })
}

/**
 * AI CONTENT OPTIMIZATION
 * Optimize post content for each social platform using AI
 */
async function aiOptimizeForEachPlatform(post: any, platforms: SocialPlatform[]) {
  const optimized: Record<string, any> = {}

  for (const platform of platforms) {
    const prompt = `Optimize this blog post content for ${platform.name}:

ORIGINAL POST:
Title: ${post.title}
Content: ${extractTextFromLexical(post.content)}

PLATFORM REQUIREMENTS:
- Character limit: ${platform.characterLimit || 'unlimited'}
- Hashtag support: ${platform.hashtagSupport}
- Threading support: ${platform.threadingSupport}
- Format: ${platform.postFormat}

OPTIMIZATION RULES:
1. Preserve key message and call-to-action
2. Adapt tone for platform audience
3. Add relevant hashtags if supported
4. Create thread if content is too long
5. Include engaging hook for platform

Return JSON with optimized content:
{
  "text": "Optimized post text",
  "hashtags": ["#relevant", "#hashtags"],
  "thread": ["Tweet 1", "Tweet 2"] // if needed
  "callToAction": "Visit our blog to read more",
  "mediaDescription": "Description for accompanying image"
}`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      const data = await response.json()
      optimized[platform.name] = JSON.parse(data.choices[0].message.content)
    } catch (error) {
      // Fallback to basic optimization
      optimized[platform.name] = {
        text: truncateText(extractTextFromLexical(post.content), platform.characterLimit),
        hashtags: [],
        callToAction: `Read more: ${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${post.slug}`
      }
    }
  }

  return optimized
}

/**
 * POST TO INDIVIDUAL PLATFORM
 * Handle posting to specific social media platform
 */
async function postToPlatform(platform: SocialPlatform, content: any, originalPost: any): Promise<SyndicationResult> {
  switch (platform.name) {
    case 'twitter':
      return await postToTwitter(platform.credentials, content, originalPost)

    case 'linkedin':
      return await postToLinkedIn(platform.credentials, content, originalPost)

    case 'bluesky':
      return await postToBluesky(platform.credentials, content, originalPost)

    case 'instagram':
      return await postToInstagram(platform.credentials, content, originalPost)

    case 'discord':
      return await postToDiscord(platform.credentials, content, originalPost)

    default:
      throw new Error(`Unsupported platform: ${platform.name}`)
  }
}

/**
 * PLATFORM-SPECIFIC POSTING FUNCTIONS
 */
async function postToTwitter(credentials: any, content: any, post: any): Promise<SyndicationResult> {
  // Twitter API v2 implementation
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: content.thread ? content.thread[0] : content.text
    })
  })

  const data = await response.json()

  if (response.ok) {
    // If threading is needed, post subsequent tweets
    if (content.thread && content.thread.length > 1) {
      let replyToId = data.data.id
      for (let i = 1; i < content.thread.length; i++) {
        const threadResponse = await fetch('https://api.twitter.com/2/tweets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: content.thread[i],
            reply: { in_reply_to_tweet_id: replyToId }
          })
        })
        const threadData = await threadResponse.json()
        replyToId = threadData.data?.id || replyToId
      }
    }

    return {
      platform: 'twitter',
      success: true,
      postId: data.data.id,
      url: `https://twitter.com/user/status/${data.data.id}`
    }
  } else {
    return {
      platform: 'twitter',
      success: false,
      error: data.error?.message || 'Twitter posting failed'
    }
  }
}

async function postToBluesky(credentials: any, content: any, post: any): Promise<SyndicationResult> {
  // AT Protocol implementation for Bluesky
  const response = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessJwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      repo: credentials.did,
      collection: 'app.bsky.feed.post',
      record: {
        text: content.text,
        createdAt: new Date().toISOString(),
        facets: content.hashtags?.map((tag: string) => ({
          index: { byteStart: 0, byteEnd: tag.length },
          features: [{ $type: 'app.bsky.richtext.facet#tag', tag: tag.replace('#', '') }]
        })) || []
      }
    })
  })

  const data = await response.json()

  return {
    platform: 'bluesky',
    success: response.ok,
    postId: data.uri,
    url: `https://bsky.app/profile/${credentials.handle}/post/${data.uri?.split('/').pop()}`
  }
}

async function postToLinkedIn(credentials: any, content: any, post: any): Promise<SyndicationResult> {
  // LinkedIn API implementation
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      author: `urn:li:person:${credentials.personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  })

  const data = await response.json()

  return {
    platform: 'linkedin',
    success: response.ok,
    postId: data.id,
    url: data.id ? `https://linkedin.com/feed/update/${data.id}` : undefined
  }
}

async function postToDiscord(credentials: any, content: any, post: any): Promise<SyndicationResult> {
  // Discord webhook implementation
  const response = await fetch(credentials.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: content.text,
      embeds: [{
        title: post.title,
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${post.slug}`,
        description: content.text.substring(0, 200) + '...',
        color: 0x00ff00,
        footer: {
          text: 'Published via Spaces Commerce'
        }
      }]
    })
  })

  return {
    platform: 'discord',
    success: response.ok,
    postId: 'discord_webhook',
    url: credentials.channelUrl
  }
}

async function postToInstagram(credentials: any, content: any, post: any): Promise<SyndicationResult> {
  // Instagram Graph API implementation (requires image)
  if (!post.heroImage) {
    return {
      platform: 'instagram',
      success: false,
      error: 'Instagram requires an image - no heroImage found'
    }
  }

  // First, create the media object
  const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${credentials.instagramAccountId}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: post.heroImage.url,
      caption: content.text + ' ' + content.hashtags?.join(' ')
    })
  })

  const mediaData = await mediaResponse.json()

  if (!mediaResponse.ok) {
    return {
      platform: 'instagram',
      success: false,
      error: mediaData.error?.message || 'Instagram media creation failed'
    }
  }

  // Then publish the media
  const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${credentials.instagramAccountId}/media_publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      creation_id: mediaData.id
    })
  })

  const publishData = await publishResponse.json()

  return {
    platform: 'instagram',
    success: publishResponse.ok,
    postId: publishData.id,
    url: publishData.id ? `https://instagram.com/p/${publishData.id}` : undefined
  }
}

/**
 * HELPER FUNCTIONS
 */
async function getTenantSocialPlatforms(payload: any, tenantId: string): Promise<SocialPlatform[]> {
  // This would fetch from a SocialPlatformConfigs collection
  // For now, return default platforms
  return [
    {
      name: 'twitter',
      enabled: true,
      credentials: { accessToken: process.env.TWITTER_ACCESS_TOKEN },
      postFormat: 'text',
      characterLimit: 280,
      hashtagSupport: true,
      threadingSupport: true
    },
    {
      name: 'bluesky',
      enabled: true,
      credentials: {
        accessJwt: process.env.BLUESKY_ACCESS_JWT,
        did: process.env.BLUESKY_DID,
        handle: process.env.BLUESKY_HANDLE
      },
      postFormat: 'text',
      characterLimit: 300,
      hashtagSupport: true,
      threadingSupport: true
    },
    {
      name: 'linkedin',
      enabled: true,
      credentials: {
        accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        personId: process.env.LINKEDIN_PERSON_ID
      },
      postFormat: 'text',
      characterLimit: 3000,
      hashtagSupport: true,
      threadingSupport: false
    }
  ]
}

function extractTextFromLexical(content: any): string {
  // Extract plain text from Lexical JSON content
  if (!content || !content.root || !content.root.children) return ''

  function extractText(node: any): string {
    if (node.type === 'text') {
      return node.text || ''
    }
    if (node.children) {
      return node.children.map(extractText).join('')
    }
    return ''
  }

  return content.root.children.map(extractText).join('\n\n')
}

function truncateText(text: string, limit?: number): string {
  if (!limit || text.length <= limit) return text
  return text.substring(0, limit - 3) + '...'
}

/**
 * Create message event for syndication tracking
 */
async function createSyndicationMessage(payload: any, context: any) {
  const content = `🚀 **Post Syndicated Successfully**

**Platform:** ${context.platform}
**Post URL:** ${context.result.url}
**Engagement:** ${context.result.engagement ? JSON.stringify(context.result.engagement) : 'Tracking...'}

Leo automatically optimized the content for ${context.platform}'s audience and format requirements.`

  await payload.create({
    collection: 'messages',
    data: {
      content,
      messageType: 'system',
      space: context.spaceId || 1,
      channel: 'social-media',
      author: 1, // System user
      businessContext: {
        department: 'marketing',
        workflow: 'social_syndication',
        priority: 'normal'
      },
      metadata: {
        syndication: {
          postId: context.postId,
          platform: context.platform,
          syndicationResult: context.result
        }
      },
      knowledge: {
        searchable: true,
        category: 'marketing',
        tags: ['social-media', 'syndication', context.platform]
      }
    }
  })
}

/**
 * Additional endpoint functions for update/delete/analyze
 */
async function updatePostAcrossPlatforms(payload: any, context: any) {
  // Implementation for updating already syndicated posts
  return NextResponse.json({ message: 'Update functionality coming soon' })
}

async function deletePostAcrossPlatforms(payload: any, context: any) {
  // Implementation for deleting syndicated posts
  return NextResponse.json({ message: 'Delete functionality coming soon' })
}

async function analyzeEngagementAcrossPlatforms(payload: any, context: any) {
  // Implementation for engagement analysis
  return NextResponse.json({ message: 'Engagement analysis coming soon' })
}

async function aiOptimizeForPlatforms(payload: any, context: any) {
  // Implementation for AI content optimization
  return NextResponse.json({ message: 'AI optimization functionality coming soon' })
}

export async function GET() {
  return NextResponse.json({
    service: 'Social Federation API',
    description: 'Posts as source of truth - AI manages syndication to all foreign systems',
    capabilities: [
      'Multi-platform content syndication',
      'AI-powered content optimization per platform',
      'Engagement tracking across platforms',
      'Message-driven audit trail',
      'AT Protocol federation support'
    ],
    supportedPlatforms: [
      'Twitter/X',
      'Bluesky (AT Protocol)',
      'LinkedIn',
      'Instagram',
      'Discord',
      'Facebook (coming soon)',
      'TikTok (coming soon)',
      'YouTube Community (coming soon)'
    ],
    example: {
      action: 'syndicate',
      postId: 'post-123',
      platforms: ['twitter', 'bluesky', 'linkedin'],
      customMessage: 'Custom introduction for social media',
      tenantId: 'tenant-456'
    }
  })
}
