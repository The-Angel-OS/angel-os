# Queue System Implementation - Jules Task Specification

## 🎯 **OBJECTIVE**
Implement a comprehensive queue system similar to Cursor's ever-improving architecture for handling background tasks, AI processing, and async operations across the Spaces Commerce platform.

## 🔍 **CURRENT LIMITATIONS IDENTIFIED**

### Immediate Pain Points:
1. **AI Generation Queue** - Has TODO comments for actual processing
2. **Photo Processing** - No background processing for inventory analysis
3. **Social Media Syndication** - Synchronous processing blocks requests
4. **Payment Processing** - No retry mechanisms for failed transactions
5. **Revenue Calculations** - Monthly processing without queuing
6. **Migration Tasks** - No background processing for data migrations
7. **News Intelligence** - Synchronous data synthesis blocking UI

### Architecture Gaps:
- No centralized job management
- No retry mechanisms with exponential backoff
- No priority-based processing
- No dead letter queues for failed jobs
- No monitoring/observability for background tasks
- No rate limiting per tenant
- No graceful degradation under load

## 🏗️ **QUEUE SYSTEM ARCHITECTURE**

### Technology Stack:
- **Queue Engine**: BullMQ (Redis-based, battle-tested)
- **Storage**: Redis for job data, PostgreSQL for job history
- **Monitoring**: Built-in dashboard with real-time metrics
- **Scaling**: Horizontal worker scaling capability

### Core Components:

#### 1. **JobQueue Collection** (Payload CMS)
```typescript
interface JobQueue {
  id: string
  jobType: 'ai_generation' | 'photo_processing' | 'social_syndication' | 'payment_processing' | 'revenue_calculation' | 'migration' | 'news_intelligence'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying' | 'dead'
  priority: 'low' | 'normal' | 'high' | 'critical'
  tenantId: string
  payload: Record<string, any>
  result?: Record<string, any>
  error?: string
  attempts: number
  maxAttempts: number
  createdAt: Date
  processedAt?: Date
  completedAt?: Date
  processingTime?: number
  worker?: string
  metadata: {
    source: string
    userId?: string
    correlationId?: string
    parentJobId?: string
  }
}
```

#### 2. **JobWorker Collection** (Worker Management)
```typescript
interface JobWorker {
  id: string
  workerId: string
  workerType: string
  status: 'active' | 'idle' | 'busy' | 'error' | 'offline'
  lastHeartbeat: Date
  jobsProcessed: number
  averageProcessingTime: number
  currentJob?: string
  capabilities: string[]
  maxConcurrency: number
  tenant?: string // For tenant-specific workers
}
```

#### 3. **QueueService** (Core Service)
```typescript
class QueueService {
  // Job Management
  async addJob(jobType: string, payload: any, options?: JobOptions): Promise<string>
  async getJob(jobId: string): Promise<Job | null>
  async cancelJob(jobId: string): Promise<boolean>
  async retryJob(jobId: string): Promise<boolean>
  
  // Queue Operations
  async pauseQueue(queueName: string): Promise<void>
  async resumeQueue(queueName: string): Promise<void>
  async getQueueStats(queueName: string): Promise<QueueStats>
  
  // Monitoring
  async getActiveJobs(queueName?: string): Promise<Job[]>
  async getFailedJobs(queueName?: string): Promise<Job[]>
  async getCompletedJobs(queueName?: string): Promise<Job[]>
  
  // Bulk Operations
  async addBulkJobs(jobs: BulkJobData[]): Promise<string[]>
  async cleanCompletedJobs(olderThan: Date): Promise<number>
}
```

## 🎯 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1)**
- [ ] Set up Redis infrastructure
- [ ] Create JobQueue and JobWorker collections
- [ ] Implement basic QueueService
- [ ] Create simple job processor framework

### **Phase 2: Core Workers (Week 2)**
- [ ] AI Generation Worker (AIGenerationQueue integration)
- [ ] Photo Processing Worker (PhotoInventoryService)
- [ ] Social Media Worker (ATProtocolService, social-federation)
- [ ] Payment Processing Worker (revenue calculations)

### **Phase 3: Advanced Features (Week 3)**
- [ ] Priority-based processing
- [ ] Retry mechanisms with exponential backoff
- [ ] Dead letter queues
- [ ] Rate limiting per tenant
- [ ] Job dependencies and workflows

### **Phase 4: Monitoring & Optimization (Week 4)**
- [ ] Real-time monitoring dashboard
- [ ] Performance metrics and alerting
- [ ] Auto-scaling based on queue depth
- [ ] Comprehensive logging and debugging

## 🔧 **SPECIFIC INTEGRATIONS NEEDED**

### 1. **AI Generation Queue Integration**
**Current**: `src/collections/AIGenerationQueue.ts` has TODO comments
**Update**: Replace TODO hooks with actual queue job creation

```typescript
// In AIGenerationQueue hooks
afterChange: [
  async ({ doc, operation }) => {
    if (operation === 'create') {
      await QueueService.addJob('ai_generation', {
        generationType: doc.generationType,
        spaceId: doc.space,
        parameters: doc.parameters
      }, {
        priority: 'high',
        maxAttempts: 3,
        correlationId: doc.id
      })
    }
  }
]
```

### 2. **Photo Processing Integration**
**Current**: `PhotoInventoryService.analyzePhotoSequence` is synchronous
**Update**: Queue photo analysis for background processing

```typescript
// In PhotoInventoryService
static async analyzePhotoSequence(photos: File[], ...args) {
  const jobId = await QueueService.addJob('photo_processing', {
    photos: await this.uploadPhotos(photos),
    sequenceType,
    location,
    description,
    tenantId
  }, {
    priority: 'normal',
    maxAttempts: 2
  })
  
  return { jobId, status: 'queued' }
}
```

### 3. **Social Media Syndication**
**Current**: `social-federation/route.ts` processes synchronously
**Update**: Queue syndication for parallel processing

### 4. **Revenue Calculations**
**Current**: `RevenueService.processMonthlyRevenue` blocks
**Update**: Queue monthly revenue processing

### 5. **Migration Tasks**
**Current**: `migration-validation.ts` has no background processing
**Update**: Queue large migration tasks

## 📊 **MONITORING DASHBOARD REQUIREMENTS**

### Real-time Metrics:
- Jobs per minute by type
- Average processing time
- Success/failure rates
- Queue depth by priority
- Worker utilization
- Memory/CPU usage per worker

### Historical Analytics:
- Daily/weekly job volume trends
- Performance degradation alerts
- Tenant-specific usage patterns
- Cost optimization recommendations

### Alerting System:
- Failed job threshold alerts
- Queue depth warnings
- Worker health monitoring
- Performance degradation detection

## 🚀 **PERFORMANCE TARGETS**

### Throughput:
- **AI Generation**: 10 jobs/minute
- **Photo Processing**: 50 photos/minute
- **Social Syndication**: 100 posts/minute
- **Payment Processing**: 200 transactions/minute

### Latency:
- Job pickup: < 1 second
- Status updates: < 500ms
- Dashboard refresh: < 2 seconds

### Reliability:
- 99.9% job completion rate
- < 0.1% jobs to dead letter queue
- < 5 second recovery from worker failures

## 🔐 **SECURITY & TENANT ISOLATION**

### Job Isolation:
- Tenant-scoped job access
- Encrypted job payloads for sensitive data
- Audit logs for all job operations

### Rate Limiting:
- Per-tenant job submission limits
- Priority-based fair queuing
- Abuse detection and throttling

### Data Protection:
- PII handling in job payloads
- Secure job result storage
- Automatic cleanup of completed jobs

## 📋 **DELIVERABLES**

### Code Deliverables:
1. **Redis Configuration** - Docker setup and connection management
2. **Collection Schemas** - JobQueue and JobWorker collections
3. **QueueService** - Core service implementation
4. **Worker Framework** - Base classes for job processors
5. **Specialized Workers** - AI, Photo, Social, Payment workers
6. **Monitoring Dashboard** - Real-time queue monitoring UI
7. **Integration Updates** - Update existing services to use queues

### Documentation:
1. **Queue System Architecture** - Technical overview
2. **Worker Development Guide** - How to create new workers
3. **Job Scheduling Best Practices** - When and how to queue jobs
4. **Monitoring & Troubleshooting** - Operations guide
5. **Performance Tuning** - Optimization strategies

### Testing:
1. **Unit Tests** - Core service functionality
2. **Integration Tests** - End-to-end job processing
3. **Load Tests** - Performance under high load
4. **Failure Tests** - Retry and error handling
5. **Tenant Isolation Tests** - Security validation

## 🎯 **SUCCESS CRITERIA**

### Technical Success:
- [ ] All existing async operations moved to queue system
- [ ] Sub-second job pickup times
- [ ] 99.9% job completion rate
- [ ] Real-time monitoring dashboard functional
- [ ] Comprehensive test coverage (>90%)

### Business Success:
- [ ] Improved user experience (no blocking operations)
- [ ] Reduced server load during peak times
- [ ] Better error handling and recovery
- [ ] Scalability for future growth
- [ ] Operational visibility into system health

## 🚨 **CRITICAL IMPLEMENTATION NOTES**

### 1. **Existing Service Integration**
- **DO NOT** break existing APIs during migration
- Implement queue processing as background enhancement
- Maintain synchronous fallbacks for critical operations

### 2. **Data Migration Strategy**
- Migrate existing AIGenerationQueue records to new system
- Preserve job history and audit trails
- Test migration thoroughly before production deployment

### 3. **Deployment Strategy**
- Deploy Redis infrastructure first
- Roll out workers gradually by job type
- Monitor performance impact during deployment
- Have rollback plan for each phase

### 4. **Error Handling Priority**
- Payment processing jobs must never be lost
- AI generation failures should retry intelligently
- Photo processing should handle large file uploads gracefully
- Social media syndication should handle API rate limits

## 🔄 **FUTURE ENHANCEMENTS**

### Phase 2 Features:
- Multi-region job distribution
- Advanced job scheduling (cron-like)
- Job result caching and optimization
- Machine learning for job prioritization

### Integration Opportunities:
- Webhook notifications for job completion
- External API integrations via queue
- Batch processing optimizations
- Real-time job streaming for live updates

---

**This queue system will transform the Spaces Commerce platform from a synchronous, blocking architecture to a modern, scalable, async-first system that can handle enterprise-level workloads while maintaining excellent user experience.**

**Implementation Priority: CRITICAL - This unlocks all other advanced features and enables true scalability.** 