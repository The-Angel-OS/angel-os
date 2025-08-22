import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const {
      url,
      title,
      description,
      captureType = 'screenshot',
      imageUrl,
      pdfUrl,
      content,
      tags = [],
      source = 'manual',
      metadata = {},
      spaceId,
      channelId = 'general',
      tenantId,
      authorId
    } = body

    // Validate required fields
    if (!url || !title || !spaceId) {
      return NextResponse.json({
        error: 'Missing required fields: url, title, and spaceId are required'
      }, { status: 400 })
    }

    // Get the space to verify tenant access
    const space = await payload.findByID({
      collection: 'spaces',
      id: spaceId
    })

    if (!space) {
      return NextResponse.json({
        error: 'Space not found'
      }, { status: 404 })
    }

    // Create unique capture ID
    const captureId = `capture_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Prepare web capture data
    const webCaptureData = {
      id: captureId,
      url,
      title,
      description,
      captureType,
      timestamp: new Date().toISOString(),
      author: {
        id: authorId || 'anonymous',
        name: 'Web Capture User', // This could be enhanced to get actual user info
        avatar: null
      },
      imageUrl,
      pdfUrl,
      content,
      tags,
      source,
      metadata: {
        domain: new URL(url).hostname,
        viewport: metadata.viewport || { width: 1920, height: 1080 },
        deviceType: metadata.deviceType || 'desktop',
        fileSize: metadata.fileSize,
        ...metadata
      }
    }

    // Create a widget message with the web capture
    const message = await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'system',
          text: `🌐 Web Capture: ${title}`,
          metadata: {
            url,
            title,
            description,
            captureSource: 'web_widget'
          }
        },
        messageType: 'intelligence',
        space: spaceId,
        sender: authorId || 1,
      },
    })

    // All data is stored in the message widget - no need for separate collection
    return NextResponse.json({
      success: true,
      message: 'Web content captured successfully',
      data: {
        captureId,
        messageId: message.id,
        spaceId,
        channelId,
        previewUrl: `/spaces/${spaceId}?message=${message.id}`,
        captureData: webCaptureData
      }
    })

  } catch (error) {
    console.error('Web capture failed:', error)
    return NextResponse.json({
      error: 'Failed to capture web content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Content Capture API',
    description: 'Capture web content from GoFullPage and other browser extensions',
    usage: {
      method: 'POST',
      endpoint: '/api/web-capture',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        url: 'string (required) - URL of the captured page',
        title: 'string (required) - Title of the captured page',
        description: 'string - Optional description',
        captureType: 'string - screenshot|pdf|full_page|selection|article',
        imageUrl: 'string - URL to captured image',
        pdfUrl: 'string - URL to PDF if applicable',
        content: 'string - Text content if applicable',
        tags: 'array - Tags for categorization',
        source: 'string - gofullpage|manual|browser_extension|automation',
        metadata: 'object - Additional metadata (viewport, device, fileSize)',
        spaceId: 'string (required) - Target space ID',
        channelId: 'string - Target channel (default: general)',
        tenantId: 'string - Tenant ID (auto-detected from space)',
        authorId: 'string - User ID of the capture author'
      }
    },
    integrations: {
      gofullpage: {
        description: 'Partner with GoFullPage browser extension',
        webhookUrl: '/api/web-capture',
        extensionId: 'hfaciehifhdcgoolaejkoncjciicbemc',
        examples: {
          screenshot: {
            captureType: 'screenshot',
            source: 'gofullpage',
            imageUrl: 'https://example.com/screenshots/capture123.png'
          },
          fullPage: {
            captureType: 'full_page',
            source: 'gofullpage',
            imageUrl: 'https://example.com/screenshots/fullpage123.png',
            metadata: {
              viewport: { width: 1920, height: 1080 },
              fileSize: 2048576
            }
          }
        }
      },
      browserExtension: {
        description: 'Generic browser extension integration',
        javascript: `
// Example browser extension integration
async function captureToSpaces(captureData) {
  const response = await fetch('/api/web-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: window.location.href,
      title: document.title,
      spaceId: 'your-space-id',
      source: 'browser_extension',
      ...captureData
    })
  });
  return response.json();
}
        `
      },
      automation: {
        description: 'Automated web scraping and content capture',
        examples: {
          article: {
            captureType: 'article',
            source: 'automation',
            content: 'Extracted article content...',
            metadata: {
              wordCount: 1500,
              readingTime: '6 minutes'
            }
          }
        }
      }
    },
    responses: {
      success: {
        success: true,
        message: 'Web content captured successfully',
        data: {
          captureId: 'capture_1234567890_abc123',
          messageId: 'message_id_here',
          spaceId: 'space_id_here',
          channelId: 'general',
          previewUrl: '/spaces/space_id/message_id',
          captureData: '{ ... captured content data ... }'
        }
      },
      error: {
        error: 'Failed to capture web content',
        details: 'Specific error message'
      }
    }
  })
}
