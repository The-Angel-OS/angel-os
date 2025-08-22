import { NextRequest, NextResponse } from 'next/server'
import { queueWorker } from '../../../../services/QueueWorkerService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (!queueWorker.payload) {
      await queueWorker.initialize()
    }

    switch (action) {
      case 'stats':
        const stats = await queueWorker.getQueueStats()
        return NextResponse.json({
          success: true,
          stats,
          timestamp: new Date().toISOString()
        })

      case 'start':
        await queueWorker.startWorker()
        return NextResponse.json({
          success: true,
          message: 'Queue worker started',
          timestamp: new Date().toISOString()
        })

      case 'stop':
        await queueWorker.stopWorker()
        return NextResponse.json({
          success: true,
          message: 'Queue worker stopped',
          timestamp: new Date().toISOString()
        })

      default:
        const defaultStats = await queueWorker.getQueueStats()
        return NextResponse.json({
          success: true,
          message: 'Queue worker API ready',
          stats: defaultStats,
          actions: ['stats', 'start', 'stop'],
          timestamp: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('[Queue Worker API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobType, data, priority } = body

    if (!queueWorker.payload) {
      await queueWorker.initialize()
    }

    const jobId = await queueWorker.addJob(jobType, data, priority)

    return NextResponse.json({
      success: true,
      jobId,
      message: `Job ${jobId} added to queue`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Queue Worker API] Error adding job:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 