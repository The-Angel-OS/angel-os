import { getPayload } from 'payload'
import configPromise from '../payload.config'
import type { Payload } from 'payload'

export interface JobProcessor {
  process(job: any): Promise<any>
}

export class QueueWorkerService {
  public payload: Payload | null = null
  private isRunning = false
  private processingInterval: NodeJS.Timeout | null = null
  private processors: Map<string, JobProcessor> = new Map()

  constructor() {
    this.registerDefaultProcessors()
  }

  async initialize() {
    this.payload = await getPayload({ config: configPromise })
    console.log('[QueueWorkerService] Initialized successfully')
  }

  private ensurePayload(): Payload {
    if (!this.payload) {
      throw new Error('QueueWorkerService not initialized. Call initialize() first.')
    }
    return this.payload
  }

  private registerDefaultProcessors() {
    // AI Generation Queue Processor
    this.processors.set('ai_generation', {
      process: async (job: any) => {
        console.log(`[QueueWorker] Processing AI generation job: ${job.id}`)
        
        // Simulate AI generation processing
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        return {
          status: 'completed',
          result: {
            generatedContent: `AI generated content for ${job.data.generationType}`,
            processingTime: 2000,
            modelUsed: 'gpt-4'
          }
        }
      }
    })

    // Email Queue Processor
    this.processors.set('email', {
      process: async (job: any) => {
        console.log(`[QueueWorker] Processing email job: ${job.id}`)
        
        // Simulate email sending
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return {
          status: 'completed',
          result: {
            messageId: `email_${Date.now()}`,
            recipient: job.data.to,
            subject: job.data.subject
          }
        }
      }
    })

    // Clearwater Cruisin Job Processor
    this.processors.set('clearwater_job', {
      process: async (job: any) => {
        console.log(`[QueueWorker] Processing Clearwater Cruisin job: ${job.id}`)
        
        const { jobType, customerData, serviceDetails } = job.data
        
        // Route to appropriate Guardian Angel
        const guardianAngel = jobType === 'junk_removal' ? 'Marina' : 'Pacific'
        
        // Simulate job processing
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        return {
          status: 'completed',
          result: {
            assignedAngel: guardianAngel,
            estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            quoteGenerated: true,
            customerNotified: true
          }
        }
      }
    })

    // Revenue Processing
    this.processors.set('revenue_processing', {
      process: async (job: any) => {
        console.log(`[QueueWorker] Processing revenue job: ${job.id}`)
        
        const { RevenueService } = await import('./RevenueService')
        const revenueService = new RevenueService()
        
        const result = await revenueService.processMonthlyRevenue(job.data.tenantId)
        
        return {
          status: 'completed',
          result: result
        }
      }
    })
  }

  registerProcessor(jobType: string, processor: JobProcessor) {
    this.processors.set(jobType, processor)
    console.log(`[QueueWorkerService] Registered processor for job type: ${jobType}`)
  }

  async startWorker(intervalMs: number = 5000) {
    if (this.isRunning) {
      console.log('[QueueWorkerService] Worker already running')
      return
    }

    this.isRunning = true
    console.log(`[QueueWorkerService] Starting worker with ${intervalMs}ms interval`)

    this.processingInterval = setInterval(async () => {
      await this.processNextJob()
    }, intervalMs)
  }

  async stopWorker() {
    if (!this.isRunning) {
      console.log('[QueueWorkerService] Worker not running')
      return
    }

    this.isRunning = false
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
    console.log('[QueueWorkerService] Worker stopped')
  }

  async processNextJob(): Promise<boolean> {
    try {
      const payload = this.ensurePayload()

      // Find next pending job
      const jobs = await payload.find({
        collection: 'job-queue',
        where: {
          status: { equals: 'pending' }
        },
        sort: 'priority',
        limit: 1
      })

      if (jobs.docs.length === 0) {
        return false // No jobs to process
      }

      const job = jobs.docs[0]
      if (!job) {
        return false // No job available
      }
      
      console.log(`[QueueWorkerService] Processing job ${job.id} of type ${job.jobType}`)

      // Mark job as processing
      await payload.update({
        collection: 'job-queue',
        id: job.id,
        data: {
          status: 'processing',
          startedAt: new Date().toISOString()
        }
      })

      // Get processor for job type
      const processor = this.processors.get(job.jobType)
      if (!processor) {
        throw new Error(`No processor registered for job type: ${job.jobType}`)
      }

      // Process the job
      const result = await processor.process(job)

      // Update job with result
      await payload.update({
        collection: 'job-queue',
        id: job.id,
        data: {
          status: result.status,
          result: result.result,
          completedAt: new Date().toISOString(),
          attempts: (job.attempts || 0) + 1
        }
      })

      console.log(`[QueueWorkerService] Job ${job.id} completed successfully`)
      return true

    } catch (error) {
      console.error('[QueueWorkerService] Error processing job:', error)
      await this.handleJobError(error)
      return false
    }
  }

  // TODO: Fix JobQueue collection field schema before re-enabling
  private async handleJobError(error: any) {
    console.error('[QueueWorkerService] Job error (error handling temporarily disabled):', error)
    /*
    try {
      const payload = this.ensurePayload()
      
      // Find jobs that were being processed but may have errors
      const jobs = await payload.find({
        collection: 'job-queue',
        where: {
          status: { equals: 'processing' }
        },
        limit: 1
      })

      if (jobs.docs.length > 0) {
        const job = jobs.docs[0]
        if (!job) return
        
        const attempts = (job.attempts || 0) + 1
        const maxAttempts = 3

        if (attempts >= maxAttempts) {
          // Mark as failed - DISABLED: failedAt field doesn't exist in schema
          await payload.update({
            collection: 'job-queue',
            id: job.id,
            data: {
              status: 'failed',
              error: error.message,
              attempts: attempts
            }
          })
          console.log(`[QueueWorkerService] Job ${job.id} failed after ${attempts} attempts`)
        } else {
          // Retry later - DISABLED: retryAt field doesn't exist in schema
          await payload.update({
            collection: 'job-queue',
            id: job.id,
            data: {
              status: 'pending',
              error: error.message,
              attempts: attempts
            }
          })
          console.log(`[QueueWorkerService] Job ${job.id} will retry (attempt ${attempts}/${maxAttempts})`)
        }
      }
    } catch (updateError) {
      console.error('[QueueWorkerService] Error updating failed job:', updateError)
    }
    */
  }

  async addJob(jobType: string, data: any, priority: number = 0): Promise<string> {
    const payload = this.ensurePayload()

    const job = await payload.create({
      collection: 'job-queue',
      data: {
        tenant: 1, // TODO: Pass tenant ID properly in addJob method
        jobType,
        data,
        priority,
        status: 'pending',
        attempts: 0
      }
    })

    console.log(`[QueueWorkerService] Added job ${job.id} of type ${jobType}`)
    return job.id.toString()
  }

  async getJobStatus(jobId: string): Promise<any> {
    const payload = this.ensurePayload()
    return await payload.findByID({
      collection: 'job-queue',
      id: jobId
    })
  }

  async getQueueStats(): Promise<any> {
    const payload = this.ensurePayload()

    const [pending, processing, completed, failed] = await Promise.all([
      payload.find({ collection: 'job-queue', where: { status: { equals: 'pending' } } }),
      payload.find({ collection: 'job-queue', where: { status: { equals: 'processing' } } }),
      payload.find({ collection: 'job-queue', where: { status: { equals: 'completed' } } }),
      payload.find({ collection: 'job-queue', where: { status: { equals: 'failed' } } })
    ])

    return {
      pending: pending.totalDocs,
      processing: processing.totalDocs,
      completed: completed.totalDocs,
      failed: failed.totalDocs,
      total: pending.totalDocs + processing.totalDocs + completed.totalDocs + failed.totalDocs
    }
  }
}

// Global queue worker instance
export const queueWorker = new QueueWorkerService() 