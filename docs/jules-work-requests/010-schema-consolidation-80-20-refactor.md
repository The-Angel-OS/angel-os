# 010 - Schema Consolidation: 80/20 Refactor

## 🎯 Objective
Refactor the current heavy collections model back to an elegant 80/20 architecture where 80% of data lives in JSON fields and only 20% requires dedicated collections. This will eliminate the "shooting bricks" migration issues that cost us 20 hours of productivity.

## 📝 Context
The platform has evolved into an 80+ collections model that makes database migrations extremely fragile and time-consuming. We need to return to a more flexible architecture where:
- **Core entities** remain as collections (Users, Tenants, Spaces, Media, Sessions)
- **Business data** moves to JSON fields within these core collections
- **Rapid iteration** becomes possible without schema migrations

### Current Pain Points
- Database migrations frequently fail ("shoot a brick")
- 20+ hours lost productivity on migration issues
- Over-engineered schema for rapidly evolving business requirements
- Complex deployment coordination due to schema dependencies

## 🔧 Technical Requirements

### 1. Core Collections Analysis (Keep These - 20%)
Audit and confirm these essential collections should remain:

```typescript
// Core Platform Collections (Keep)
- Users           // Authentication and user profiles
- Tenants         // Multi-tenant isolation
- Spaces          // Business workspaces
- Media           // File uploads and assets
- Sessions        // Authentication sessions

// Potentially Keep (Evaluate)
- Channels        // If truly needed for structure
- Pages           // If content management is essential
- Posts           // If blog functionality is core
```

### 2. JSON Consolidation Strategy (Move to JSON - 80%)
Move these collections into JSON fields within core collections:

```typescript
// Move to Spaces.data JSON field:
- Messages        → spaces.data.messages[]
- Products        → spaces.data.products[]
- Orders          → spaces.data.orders[]
- Appointments    → spaces.data.appointments[]
- Inventory       → spaces.data.inventory[]
- BusinessAgents  → spaces.data.agents[]
- Forms           → spaces.data.forms[]
- Subscriptions   → spaces.data.subscriptions[]

// Move to Tenants.configuration JSON field:
- TenantMemberships → tenants.configuration.memberships[]
- RevenueSharing    → tenants.configuration.revenue[]
- Integrations      → tenants.configuration.integrations[]

// Move to Users.preferences JSON field:
- UserPreferences   → users.preferences
- ActivityLogs      → users.preferences.activityLog[]
```

### 3. Migration Strategy
Create a phased migration approach:

**Phase 1: Schema Design**
- Design new JSON field structures
- Create TypeScript interfaces for JSON data
- Plan data transformation logic

**Phase 2: Data Migration Scripts**
- Create scripts to move collection data to JSON fields
- Ensure data integrity during migration
- Create rollback procedures

**Phase 3: Application Updates**
- Update all API endpoints to use JSON field queries
- Modify admin interface to work with JSON data
- Update frontend components to handle new data structure

**Phase 4: Collection Cleanup**
- Remove obsolete collections
- Clean up unused imports and types
- Update documentation

### 4. JSON Field Structure Design

```typescript
// Spaces.data JSON field structure
interface SpaceData {
  messages: {
    id: string
    content: MessageContent
    sender: string
    timestamp: string
    messageType: 'user' | 'leo' | 'system' | 'action' | 'intelligence'
    priority: 'low' | 'normal' | 'high' | 'urgent'
    threadId?: string
    replyToId?: string
    reactions?: Record<string, string[]>
    readBy?: string[]
  }[]
  
  products: {
    id: string
    title: string
    description: string
    pricing: {
      basePrice: number
      salePrice?: number
    }
    inventory?: {
      quantity: number
      trackQuantity: boolean
    }
    productType: 'physical' | 'digital' | 'service'
    status: 'draft' | 'published' | 'archived'
  }[]
  
  orders: {
    id: string
    customer: CustomerData
    items: OrderItem[]
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    total: number
    createdAt: string
  }[]
  
  appointments: {
    id: string
    title: string
    customer: CustomerData
    scheduledAt: string
    duration: number
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
    notes?: string
  }[]
  
  businessAgents: {
    id: string
    name: string
    personality: AgentPersonality
    isActive: boolean
    configuration: AgentConfig
  }[]
}

// Tenants.configuration JSON field structure
interface TenantConfiguration {
  memberships: {
    userId: string
    role: 'admin' | 'member' | 'viewer'
    permissions: string[]
    joinedAt: string
  }[]
  
  revenue: {
    platformFee: number
    referralRate: number
    paymentMethods: string[]
    stripeAccountId?: string
  }
  
  integrations: {
    type: string
    config: Record<string, any>
    isActive: boolean
    lastSync?: string
  }[]
  
  businessSettings: {
    businessType: string
    industry: string
    features: string[]
    theme: string
  }
}
```

### 5. Query Optimization
Implement efficient JSON querying:

```typescript
// PostgreSQL JSON operators for complex queries
// Example: Find messages by type in a space
const messages = await payload.find({
  collection: 'spaces',
  where: {
    'data.messages': {
      contains: {
        messageType: 'leo'
      }
    }
  }
})

// Example: Find products by price range
const products = await payload.find({
  collection: 'spaces',
  where: {
    'data.products': {
      contains: {
        'pricing.basePrice': {
          greater_than: 10,
          less_than: 100
        }
      }
    }
  }
})
```

## 📁 Files to Create/Modify

### New Files to Create
- `scripts/migrate-to-json-schema.ts` - Migration script
- `scripts/rollback-json-migration.ts` - Rollback script
- `src/types/space-data.ts` - JSON field type definitions
- `src/types/tenant-configuration.ts` - Tenant config types
- `src/utilities/json-query-helpers.ts` - JSON query utilities
- `docs/JSON_SCHEMA_MIGRATION_GUIDE.md` - Migration documentation

### Files to Modify
- `src/collections/Spaces.ts` - Add data JSON field
- `src/collections/Tenants.ts` - Add configuration JSON field
- `src/collections/Users.ts` - Add preferences JSON field
- All API routes that query the collections being consolidated
- Frontend components that display this data
- Admin interface components

### Files to Eventually Remove
- Most collection files in `src/collections/` (after migration)
- Related type definitions
- Unused API routes

## ✅ Acceptance Criteria

### Must Have
1. **Migration Safety** - Complete data preservation during migration
2. **Query Performance** - JSON queries perform as well as collection queries
3. **Admin Interface** - Payload admin works seamlessly with JSON fields
4. **API Compatibility** - Frontend continues to work without breaking changes
5. **Rollback Capability** - Ability to revert if issues arise

### Performance Requirements
- JSON field queries execute in <100ms for typical dataset sizes
- Admin interface loads JSON data without performance degradation
- Bulk operations (like message imports) remain efficient

### Data Integrity
- Zero data loss during migration
- All relationships preserved in JSON structure
- Proper indexing for searchable JSON fields

## 🧪 Testing Strategy

### Migration Testing
```bash
# Test migration script with copy of production data
npm run test:migration

# Verify data integrity after migration
npm run test:data-integrity

# Performance benchmark JSON queries
npm run test:json-performance
```

### Rollback Testing
```bash
# Test rollback procedure
npm run test:rollback

# Verify original structure restored
npm run test:rollback-integrity
```

## 📊 Success Metrics

- **Migration Time**: Complete migration in <30 minutes
- **Zero Downtime**: Migration runs without service interruption
- **Performance**: JSON queries within 10% of original collection performance
- **Developer Experience**: Faster iterations without migration headaches
- **Deployment Speed**: 50% reduction in deployment complexity

## 🚨 Risk Mitigation

### Backup Strategy
- Full database backup before migration
- Incremental backups during migration process
- Point-in-time recovery capability

### Rollback Plan
- Automated rollback script tested in staging
- Data validation checkpoints throughout migration
- Emergency rollback procedure documented

### Performance Monitoring
- JSON query performance monitoring
- Memory usage tracking for large JSON fields
- Admin interface responsiveness metrics

---

**Priority**: High
**Estimated Effort**: 2-3 weeks
**Dependencies**: None (can start immediately)
**Impact**: Eliminates migration fragility, enables rapid development

This refactor will restore the platform's ability to iterate quickly without the constant fear of "shooting brick" migrations, returning us to a more agile development cycle. 