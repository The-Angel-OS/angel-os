# Hidden Products for Gig Workers - Jules Task Specification

## 🎯 **OBJECTIVE**
Implement a comprehensive hidden products system for gig workers that enables flexible employment, time tracking, and hourly payment processing while maintaining tenant-employee relationships. This transforms the platform into a complete workforce management system.

## 💡 **BUSINESS CASE: Eddie's Pool Service Example**

### Current Challenge:
- Eddie's Pool Service needs flexible workers for seasonal demand
- Workers want flexible schedules, not traditional employment
- Need to track time, manage payments, and maintain professional relationships
- Workers should be "invisible" to public customers but trackable internally

### Solution:
```typescript
// Eddie creates hidden products for his workers
{
  title: "Pool Cleaning - Hourly Rate",
  productType: "gig_worker_service",
  visibility: "internal_only", // Hidden from public
  pricing: { basePrice: 25.00, currency: "USD" },
  tenantId: "eddies_pool_service",
  gigWorkerSettings: {
    paymentType: "hourly",
    timeTracking: true,
    workerLevel: "skilled",
    requirements: ["pool_cleaning_certified", "reliable_transport"]
  }
}
```

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Current Product System Enhancement:**
The existing `Products` collection already has excellent foundation:
- ✅ Multi-tenant support (`tenant` relationship)
- ✅ Service-based product types
- ✅ Commission system with custom rates
- ✅ Status management (draft, active, archived)
- ✅ Rich metadata support

### **New Hidden Products Architecture:**

#### 1. **Product Visibility Enhancement**
```typescript
// Add to existing Products collection
{
  name: 'visibility',
  type: 'select',
  required: true,
  defaultValue: 'public',
  options: [
    { label: 'Public', value: 'public' },
    { label: 'Internal Only', value: 'internal_only' }, // NEW
    { label: 'Gig Workers Only', value: 'gig_workers_only' }, // NEW
    { label: 'Management Only', value: 'management_only' }, // NEW
    { label: 'Private', value: 'private' }
  ]
}
```

#### 2. **Gig Worker Product Types**
```typescript
// Add to existing productType options
{
  name: 'productType',
  type: 'select',
  options: [
    // ... existing options
    { label: 'Gig Worker - Hourly', value: 'gig_worker_hourly' }, // NEW
    { label: 'Gig Worker - Task Based', value: 'gig_worker_task' }, // NEW
    { label: 'Gig Worker - Commission', value: 'gig_worker_commission' }, // NEW
    { label: 'Employee - Salary', value: 'employee_salary' }, // NEW
    { label: 'Contractor - Project', value: 'contractor_project' }, // NEW
  ]
}
```

#### 3. **Gig Worker Settings Group**
```typescript
// Add to existing Products collection
{
  name: 'gigWorkerSettings',
  type: 'group',
  label: 'Gig Worker Settings',
  admin: {
    condition: (data) => [
      'gig_worker_hourly',
      'gig_worker_task', 
      'gig_worker_commission',
      'employee_salary',
      'contractor_project'
    ].includes(data.productType)
  },
  fields: [
    {
      name: 'paymentType',
      type: 'select',
      required: true,
      options: [
        { label: 'Hourly Rate', value: 'hourly' },
        { label: 'Per Task/Job', value: 'task' },
        { label: 'Commission Based', value: 'commission' },
        { label: 'Fixed Salary', value: 'salary' },
        { label: 'Project Based', value: 'project' }
      ]
    },
    {
      name: 'timeTracking',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable time tracking for this role'
          }
        },
        {
          name: 'requiresClockInOut',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            condition: (data) => data.gigWorkerSettings?.timeTracking?.enabled
          }
        },
        {
          name: 'allowsManualEntry',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            condition: (data) => data.gigWorkerSettings?.timeTracking?.enabled
          }
        },
        {
          name: 'requiresApproval',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            condition: (data) => data.gigWorkerSettings?.timeTracking?.enabled
          }
        },
        {
          name: 'gpsTracking',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Track GPS location during work hours'
          }
        }
      ]
    },
    {
      name: 'workerRequirements',
      type: 'group',
      fields: [
        {
          name: 'skillLevel',
          type: 'select',
          options: [
            { label: 'Entry Level', value: 'entry' },
            { label: 'Skilled', value: 'skilled' },
            { label: 'Expert', value: 'expert' },
            { label: 'Specialist', value: 'specialist' }
          ],
          defaultValue: 'entry'
        },
        {
          name: 'certifications',
          type: 'array',
          fields: [
            { name: 'certification', type: 'text' }
          ],
          admin: {
            description: 'Required certifications or licenses'
          }
        },
        {
          name: 'equipment',
          type: 'array',
          fields: [
            { name: 'item', type: 'text' }
          ],
          admin: {
            description: 'Required equipment or tools'
          }
        },
        {
          name: 'backgroundCheck',
          type: 'checkbox',
          defaultValue: false
        }
      ]
    },
    {
      name: 'scheduling',
      type: 'group',
      fields: [
        {
          name: 'flexibleSchedule',
          type: 'checkbox',
          defaultValue: true
        },
        {
          name: 'minimumHours',
          type: 'number',
          admin: {
            description: 'Minimum hours per week'
          }
        },
        {
          name: 'maximumHours',
          type: 'number',
          admin: {
            description: 'Maximum hours per week'
          }
        },
        {
          name: 'availabilityWindow',
          type: 'group',
          fields: [
            {
              name: 'startTime',
              type: 'text',
              admin: {
                description: 'Earliest start time (e.g., 8:00 AM)'
              }
            },
            {
              name: 'endTime',
              type: 'text',
              admin: {
                description: 'Latest end time (e.g., 6:00 PM)'
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 🕐 **TIME TRACKING SYSTEM**

### **New Collection: WorkSessions**
```typescript
interface WorkSession {
  id: string
  worker: string // relationship to users
  gigProduct: string // relationship to products (hidden gig worker products)
  tenant: string // relationship to tenants
  
  // Time Tracking
  clockInTime: Date
  clockOutTime?: Date
  totalHours?: number
  breakTime?: number
  
  // Location (if GPS enabled)
  clockInLocation?: {
    latitude: number
    longitude: number
    address: string
  }
  clockOutLocation?: {
    latitude: number
    longitude: number
    address: string
  }
  
  // Work Details
  taskDescription: string
  clientJob?: string // relationship to specific customer jobs
  notes?: string
  
  // Approval Workflow
  status: 'in_progress' | 'completed' | 'pending_approval' | 'approved' | 'rejected'
  approvedBy?: string // relationship to users
  approvedAt?: Date
  rejectionReason?: string
  
  // Payment
  hourlyRate: number
  calculatedPay: number
  paymentStatus: 'pending' | 'processed' | 'paid'
  paymentDate?: Date
  
  // Metadata
  metadata: {
    deviceInfo?: string
    ipAddress?: string
    photos?: string[] // work progress photos
  }
}
```

### **New Collection: WorkerAssignments**
```typescript
interface WorkerAssignment {
  id: string
  worker: string // relationship to users
  gigProduct: string // relationship to products
  tenant: string // relationship to tenants
  
  // Assignment Details
  assignedBy: string // relationship to users
  assignedAt: Date
  startDate: Date
  endDate?: Date
  
  // Status
  status: 'active' | 'paused' | 'completed' | 'terminated'
  terminationReason?: string
  
  // Performance
  totalHoursWorked: number
  totalPayEarned: number
  averageHourlyRate: number
  performanceRating: number // 1-5 scale
  
  // Worker Profile for this Assignment
  workerProfile: {
    skills: string[]
    certifications: string[]
    preferredSchedule: string
    availability: string[]
    notes: string
  }
}
```

## 💰 **PAYMENT PROCESSING INTEGRATION**

### **Enhanced Revenue Service Integration**
```typescript
// Add to existing RevenueService
class GigWorkerPaymentService {
  async processWorkerPayment(workSessionId: string): Promise<PaymentResult> {
    const session = await this.getWorkSession(workSessionId)
    
    // Calculate payment
    const payment = {
      amount: session.totalHours * session.hourlyRate,
      workerId: session.worker,
      tenantId: session.tenant,
      paymentType: 'gig_worker_hourly',
      taxWithholding: this.calculateTaxWithholding(session),
      platformFee: this.calculatePlatformFee(session)
    }
    
    // Process via existing commission system
    return await this.processImmediateCommission(
      session.tenant,
      session.gigProduct,
      payment.amount,
      'gig_worker_payment',
      `worker_payment_${workSessionId}`
    )
  }
  
  async generatePayStub(workerId: string, period: string): Promise<PayStub> {
    // Generate detailed pay stub with hours, rates, taxes, etc.
  }
  
  async process1099Generation(workerId: string, year: number): Promise<Tax1099> {
    // Generate 1099 forms for gig workers
  }
}
```

## 🎯 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1)**
- [ ] Enhance Products collection with visibility and gig worker settings
- [ ] Create WorkSessions collection
- [ ] Create WorkerAssignments collection
- [ ] Basic time tracking API endpoints

### **Phase 2: Time Tracking UI (Week 2)**
- [ ] Clock in/out interface for workers
- [ ] Time tracking dashboard for managers
- [ ] GPS tracking integration (optional)
- [ ] Photo upload for work progress

### **Phase 3: Payment Processing (Week 3)**
- [ ] Integrate with existing revenue service
- [ ] Automated payroll calculations
- [ ] Pay stub generation
- [ ] Tax withholding calculations

### **Phase 4: Management Tools (Week 4)**
- [ ] Worker assignment dashboard
- [ ] Performance tracking
- [ ] Scheduling tools
- [ ] Reporting and analytics

## 🔧 **SPECIFIC INTEGRATIONS**

### **1. Products Collection Enhancement**
**File**: `src/collections/Products.ts`
**Changes**: Add visibility field, gig worker product types, and gigWorkerSettings group

### **2. Time Tracking API**
**New File**: `src/app/api/time-tracking/route.ts`
```typescript
// POST /api/time-tracking/clock-in
// POST /api/time-tracking/clock-out
// GET /api/time-tracking/sessions
// PUT /api/time-tracking/approve
```

### **3. Worker Dashboard Component**
**New File**: `src/components/GigWorkerDashboard/index.tsx`
```typescript
// Real-time clock in/out
// Current work session display
// Pay tracking
// Schedule management
```

### **4. Manager Dashboard Component**
**New File**: `src/components/WorkerManagement/index.tsx`
```typescript
// Active workers overview
// Time approval workflow
// Performance metrics
// Payment processing
```

## 📊 **BUSINESS INTELLIGENCE INTEGRATION**

### **Worker Analytics Dashboard**
- Hours worked by worker/department
- Labor cost analysis
- Productivity metrics
- Schedule optimization insights
- Payment processing status

### **Automated Reporting**
- Weekly payroll summaries
- Monthly labor cost reports
- Worker performance reviews
- Tax reporting preparation
- Compliance tracking

## 🔐 **SECURITY & COMPLIANCE**

### **Data Privacy**
- Worker personal information encryption
- GPS tracking consent management
- Photo/document secure storage
- GDPR compliance for worker data

### **Financial Compliance**
- Tax withholding calculations
- 1099 form generation
- Labor law compliance tracking
- Minimum wage enforcement
- Overtime calculation rules

### **Access Control**
- Workers can only see their own data
- Managers can see their team's data
- Tenant admins can see all tenant workers
- Financial data has restricted access

## 📱 **MOBILE CONSIDERATIONS**

### **Worker Mobile App Features**
- Quick clock in/out with GPS
- Work session photos
- Schedule viewing
- Pay stub access
- Direct messaging with managers

### **Manager Mobile Features**
- Real-time worker status
- Approval workflows
- Emergency contact system
- Performance alerts

## 🎯 **SUCCESS METRICS**

### **Operational Metrics**
- Average time to clock in/out: < 30 seconds
- Time tracking accuracy: > 98%
- Payment processing time: < 24 hours
- Worker satisfaction rating: > 4.5/5

### **Business Metrics**
- Labor cost reduction: 15-25%
- Scheduling efficiency improvement: 30%
- Administrative time reduction: 40%
- Worker retention improvement: 20%

## 🔄 **FUTURE ENHANCEMENTS**

### **Advanced Features**
- AI-powered scheduling optimization
- Predictive labor demand forecasting
- Automated worker matching
- Performance-based pay adjustments

### **Integration Opportunities**
- Payroll service integrations (ADP, Gusto)
- Background check services
- Skills assessment platforms
- Insurance provider APIs

## 📋 **DELIVERABLES**

### **Code Deliverables**
1. **Enhanced Products Collection** - Visibility and gig worker settings
2. **WorkSessions Collection** - Time tracking data model
3. **WorkerAssignments Collection** - Worker-tenant relationships
4. **Time Tracking API** - Clock in/out and session management
5. **GigWorkerPaymentService** - Payment processing integration
6. **Worker Dashboard Components** - UI for workers and managers
7. **Mobile-Responsive Interface** - Touch-friendly time tracking

### **Documentation**
1. **Gig Worker System Guide** - Complete usage documentation
2. **Time Tracking Best Practices** - Operational guidelines
3. **Payment Processing Guide** - Financial workflows
4. **Compliance Checklist** - Legal and regulatory requirements
5. **API Documentation** - Technical integration guide

### **Testing**
1. **Time Tracking Accuracy Tests** - Precision validation
2. **Payment Calculation Tests** - Financial accuracy
3. **Multi-Tenant Isolation Tests** - Data security
4. **Mobile Interface Tests** - Cross-device compatibility
5. **Performance Tests** - High-volume usage scenarios

---

## 🎯 **EDDIE'S POOL SERVICE - COMPLETE WORKFLOW**

### **Setup Phase:**
1. Eddie creates hidden product: "Pool Cleaning Technician - $25/hour"
2. Sets requirements: Pool cleaning certification, reliable transport
3. Enables GPS tracking and photo documentation

### **Worker Onboarding:**
1. Sarah applies for gig worker role
2. Eddie approves her assignment
3. Sarah gets access to worker dashboard and mobile app

### **Daily Operations:**
1. Sarah clocks in at customer location (GPS verified)
2. Takes before/after photos of pool work
3. Clocks out with work notes
4. Time automatically calculated and queued for approval

### **Payment Processing:**
1. Eddie approves Sarah's time weekly
2. Payment automatically processed via existing revenue system
3. Sarah receives pay stub and direct deposit
4. Platform takes small commission for workforce management

### **Business Intelligence:**
1. Eddie sees labor cost per job
2. Identifies most efficient workers
3. Optimizes scheduling based on data
4. Scales workforce based on seasonal demand

**This transforms Eddie's Pool Service from a solo operation to a scalable business with flexible workforce management, all while maintaining the personal touch and quality control.**

---

**Implementation Priority: HIGH - This creates a new revenue stream and competitive advantage by transforming any business into a workforce management platform.** 