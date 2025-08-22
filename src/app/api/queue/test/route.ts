import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SimpleQueueService } from '@/services/SimpleQueueService'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const queueService = new SimpleQueueService(payload)
    
    // Add a test job
    const job = await queueService.addJob(
      'test-tenant',
      'ai_generation',
      { message: 'Test AI generation job', timestamp: new Date().toISOString() },
      { priority: 1 }
    )

    return NextResponse.json({
      success: true,
      message: 'Test job added to queue',
      job: {
        id: job.id,
        type: job.jobType,
        status: job.status,
        priority: job.priority,
      }
    })
  } catch (error) {
    console.error('Queue test error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add test job' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const queueService = new SimpleQueueService(payload)
    
    // Get queue stats
    const stats = await queueService.getStats()
    
    // Process one job if available
    await queueService.processJobs()
    
    return NextResponse.json({
      success: true,
      stats,
      message: 'Queue status retrieved and one job processed if available'
    })
  } catch (error) {
    console.error('Queue status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get queue status' },
      { status: 500 }
    )
  }
} 