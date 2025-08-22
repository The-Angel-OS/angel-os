import { Payload } from 'payload'

// Simple types for the queue service
type JobType = 'ai_generation' | 'photo_processing' | 'social_media' | 'revenue_analytics' | 'email_processing'
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface JobData {
  id: number | string
  tenant: number | string
  jobType: JobType
  status: JobStatus
  priority: number
  data: any
  result?: any
  error?: string
  attempts: number
  maxAttempts: number
  scheduledFor?: string
  processedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export class SimpleQueueService {
  constructor(private payload: Payload) {}

  /**
   * Add a job to the queue
   */
  async addJob(
    tenantId: string,
    type: JobType,
    payload: any,
    options: {
      priority?: number
      maxAttempts?: number
      scheduledFor?: Date
    } = {}
  ): Promise<JobData> {
    const job = await this.payload.create({
      collection: 'job-queue',
      data: {
        tenant: parseInt(tenantId),
        jobType: type,
        data: payload,
        status: 'pending' as JobStatus,
        priority: options.priority || 0,
        maxAttempts: options.maxAttempts || 3,
        scheduledFor: options.scheduledFor?.toISOString(),
        attempts: 0,
      },
    })

    return job as JobData
  }

  /**
   * Get next job to process
   */
  async getNextJob(): Promise<JobData | null> {
    const jobs = await this.payload.find({
      collection: 'job-queue',
      where: {
        and: [
          { status: { equals: 'pending' } },
          {
            or: [
              { scheduledFor: { exists: false } },
              { scheduledFor: { less_than_equal: new Date().toISOString() } },
            ],
          },
        ],
      },
      sort: '-priority,createdAt',
      limit: 1,
    })

    return jobs.docs[0] as JobData || null
  }

  /**
   * Mark job as processing
   */
  async startProcessing(jobId: string): Promise<JobData> {
    const job = await this.payload.update({
      collection: 'job-queue',
      id: jobId,
      data: {
        status: 'processing' as JobStatus,
        processedAt: new Date().toISOString(),
      },
    })

    return job as JobData
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, result?: any): Promise<JobData> {
    const job = await this.payload.update({
      collection: 'job-queue',
      id: jobId,
      data: {
        status: 'completed' as JobStatus,
        result,
        completedAt: new Date().toISOString(),
      },
    })

    return job as JobData
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, error: string): Promise<JobData> {
    const job = await this.payload.findByID({
      collection: 'job-queue',
      id: jobId,
    }) as JobData

    const newAttempts = job.attempts + 1
    const shouldRetry = newAttempts < job.maxAttempts

    const updatedJob = await this.payload.update({
      collection: 'job-queue',
      id: jobId,
      data: {
        status: (shouldRetry ? 'pending' : 'failed') as JobStatus,
        error,
        attempts: newAttempts,
        // Reset processing time if retrying
        processedAt: shouldRetry ? null : job.processedAt,
      },
    })

    return updatedJob as JobData
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    const [pending, processing, completed, failed] = await Promise.all([
      this.payload.count({ collection: 'job-queue', where: { status: { equals: 'pending' } } }),
      this.payload.count({ collection: 'job-queue', where: { status: { equals: 'processing' } } }),
      this.payload.count({ collection: 'job-queue', where: { status: { equals: 'completed' } } }),
      this.payload.count({ collection: 'job-queue', where: { status: { equals: 'failed' } } }),
    ])

    return {
      pending: pending.totalDocs,
      processing: processing.totalDocs,
      completed: completed.totalDocs,
      failed: failed.totalDocs,
    }
  }

  /**
   * Process jobs in a simple loop (for development/testing)
   */
  async processJobs(): Promise<void> {
    const job = await this.getNextJob()
    if (!job) return

    try {
      await this.startProcessing(String(job.id))
      
      // Simple job processing based on type
      let result: any = null
      
      switch (job.jobType) {
        case 'ai_generation':
          result = await this.processAIGeneration(job.data)
          break
        case 'photo_processing':
          result = await this.processPhoto(job.data)
          break
        case 'social_media':
          result = await this.processSocialMedia(job.data)
          break
        case 'revenue_analytics':
          result = await this.processRevenueAnalytics(job.data)
          break
        case 'email_processing':
          result = await this.processEmail(job.data)
          break
        default:
          throw new Error(`Unknown job type: ${job.jobType}`)
      }

      await this.completeJob(String(job.id), result)
    } catch (error) {
      await this.failJob(String(job.id), error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Simple job processors (stubs for now)
  private async processAIGeneration(payload: any): Promise<any> {
    // TODO: Implement AI generation logic
    return { message: 'AI generation completed', payload }
  }

  private async processPhoto(payload: any): Promise<any> {
    // TODO: Implement photo processing logic
    return { message: 'Photo processing completed', payload }
  }

  private async processSocialMedia(payload: any): Promise<any> {
    // TODO: Implement social media posting logic
    return { message: 'Social media posting completed', payload }
  }

  private async processRevenueAnalytics(payload: any): Promise<any> {
    // TODO: Implement revenue analytics logic
    return { message: 'Revenue analytics completed', payload }
  }

  private async processEmail(payload: any): Promise<any> {
    // TODO: Implement email processing logic
    return { message: 'Email processing completed', payload }
  }
} 