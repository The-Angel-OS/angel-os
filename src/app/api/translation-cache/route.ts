import { NextRequest, NextResponse } from 'next/server'
import { getCacheStats, invalidateCache } from '@/utilities/translationCache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'stats':
        const stats = getCacheStats()
        return NextResponse.json({
          success: true,
          cache: {
            ...stats,
            message: `Translation cache contains ${stats.totalEntries} entries across ${stats.languages.length} languages`
          }
        })

      default:
        return NextResponse.json({
          success: true,
          message: 'Translation Cache Management API',
          endpoints: {
            'GET ?action=stats': 'Get cache statistics',
            'POST {action: "invalidate", pattern?: string}': 'Invalidate cache entries'
          }
        })
    }

  } catch (error) {
    console.error('[Translation Cache API] Error:', error)
    return NextResponse.json(
      {
        error: 'Cache management failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, pattern } = body

    switch (action) {
      case 'invalidate':
        const deletedCount = invalidateCache(pattern)
        return NextResponse.json({
          success: true,
          message: pattern
            ? `Invalidated ${deletedCount} cache entries matching: ${pattern}`
            : `Cleared all ${deletedCount} cache entries`,
          deletedCount
        })

      case 'warm_cache':
        // TODO: Implement cache warming for popular content
        return NextResponse.json({
          success: true,
          message: 'Cache warming not implemented yet'
        })

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('[Translation Cache API] POST Error:', error)
    return NextResponse.json(
      {
        error: 'Cache operation failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
