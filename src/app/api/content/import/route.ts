import { NextRequest, NextResponse } from 'next/server'
import { importPostsFromExternal, analyzeChannelContent } from '@/utilities/content-import'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action,
      sourceUrl,
      authorFilter,
      categoryFilter,
      dateRange,
      tenantId,
      dryRun = false,
      channelUrl
    } = body

    // Handle different import actions
    switch (action) {
      case 'import-posts': {
        if (!sourceUrl) {
          return NextResponse.json(
            { error: 'sourceUrl is required for post import' },
            { status: 400 }
          )
        }

        const result = await importPostsFromExternal({
          sourceUrl,
          authorFilter,
          categoryFilter,
          dateRange,
          tenantId,
          dryRun,
          batchSize: 5 // Smaller batches for API calls
        })

        return NextResponse.json({
          success: result.success,
          message: `Import completed: ${result.imported} imported, ${result.skipped} skipped`,
          data: result
        })
      }

      case 'analyze-channel': {
        if (!channelUrl) {
          return NextResponse.json(
            { error: 'channelUrl is required for channel analysis' },
            { status: 400 }
          )
        }

        const analysis = await analyzeChannelContent(channelUrl)
        
        return NextResponse.json({
          success: true,
          message: 'Channel analysis completed',
          data: analysis
        })
      }

      case 'import-kendev-posts': {
        // Specific handler for spaces.kendev.co
        const result = await importPostsFromExternal({
          sourceUrl: 'https://spaces.kendev.co',
          authorFilter: 'kenneth.courtney@gmail.com', // Your email
          tenantId: tenantId || 1,
          dryRun,
          batchSize: 5
        })

        return NextResponse.json({
          success: result.success,
          message: `KenDev posts import: ${result.imported} imported, ${result.skipped} skipped`,
          data: result
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: import-posts, analyze-channel, or import-kendev-posts' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Content import API error:', error)
    return NextResponse.json(
      { 
        error: 'Import failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check import status or get available sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'sources': {
        // Return available import sources
        return NextResponse.json({
          success: true,
          sources: [
            {
              name: 'KenDev Spaces',
              url: 'https://spaces.kendev.co',
              description: 'Import posts from the prototype spaces.kendev.co',
              type: 'payload-cms',
              recommended: true
            },
            {
              name: 'Custom Payload CMS',
              url: 'custom',
              description: 'Import from any Payload CMS 3.0 instance',
              type: 'payload-cms',
              recommended: false
            }
          ]
        })
      }

      case 'test-connection': {
        const sourceUrl = searchParams.get('sourceUrl')
        if (!sourceUrl) {
          return NextResponse.json(
            { error: 'sourceUrl parameter is required' },
            { status: 400 }
          )
        }

        try {
          // Test connection to source
          const response = await fetch(`${sourceUrl}/api/posts?limit=1`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Angel-OS-Import/1.0'
            }
          })

          if (response.ok) {
            const data = await response.json()
            return NextResponse.json({
              success: true,
              message: 'Connection successful',
              available: data.totalDocs || 0,
              samplePost: data.docs?.[0]?.title || 'No posts found'
            })
          } else {
            return NextResponse.json({
              success: false,
              message: `Connection failed: ${response.status} ${response.statusText}`
            })
          }
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Connection error: ${error instanceof Error ? error.message : String(error)}`
          })
        }
      }

      default:
        return NextResponse.json({
          success: true,
          message: 'Content Import API',
          endpoints: {
            'POST /api/content/import': 'Import content from external sources',
            'GET /api/content/import?action=sources': 'List available import sources',
            'GET /api/content/import?action=test-connection&sourceUrl=URL': 'Test connection to source'
          }
        })
    }

  } catch (error) {
    console.error('Content import API GET error:', error)
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}


