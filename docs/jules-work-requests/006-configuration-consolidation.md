# 006 - Configuration Consolidation (JSON-Based Settings Management)

## 🎯 Objective
Consolidate scattered configuration settings across multiple collections into centralized JSON-based configuration management, implementing the Big Tech pattern for dynamic feature management and simplified system administration.

## 📝 Context
Angel OS currently has configuration settings scattered across multiple collections, making it difficult to manage features, settings, and business logic. This task consolidates these settings into a unified JSON-based configuration system that enables dynamic feature management without code changes.

### Current State
- **Configuration scattered** across 15+ collections
- **Feature flags** mixed with business logic
- **Settings management** requires database changes
- **No centralized configuration** for system-wide settings
- **Complex relationships** between configuration collections

### Target Architecture
The consolidated configuration system should provide:
- **Centralized Settings Management** - All configuration in dedicated collections
- **Dynamic Feature Flags** - Enable/disable features without code changes
- **Environment-Specific Config** - Different settings for dev/staging/production
- **Hierarchical Configuration** - Global, tenant, space, and user-level settings
- **Real-Time Updates** - Configuration changes without server restarts

## 🔧 Technical Requirements

### 1. Configuration Hierarchy Structure
Implement a hierarchical configuration system:

```typescript
interface ConfigurationHierarchy {
  global: GlobalConfiguration
  tenant: TenantConfiguration
  space: SpaceConfiguration
  user: UserConfiguration
}

interface GlobalConfiguration {
  system: SystemSettings
  features: FeatureFlags
  integrations: IntegrationSettings
  security: SecuritySettings
  performance: PerformanceSettings
}

interface TenantConfiguration {
  tenantId: string
  branding: BrandingSettings
  billing: BillingSettings
  features: FeatureOverrides
  limits: UsageLimits
  integrations: TenantIntegrations
}

interface SpaceConfiguration {
  spaceId: string
  tenantId: string
  businessSettings: BusinessSettings
  uiCustomization: UICustomization
  workflows: WorkflowSettings
  automations: AutomationSettings
}

interface UserConfiguration {
  userId: string
  preferences: UserPreferences
  permissions: UserPermissions
  notifications: NotificationSettings
  customizations: UserCustomizations
}
```

### 2. Feature Flag Management
Implement comprehensive feature flag system:

```typescript
interface FeatureFlags {
  // Leo AI Features
  leoAI: {
    enabled: boolean
    shipMindPersonality: boolean
    browserAutomation: boolean
    businessIntelligence: boolean
    ethicalReasoning: boolean
  }
  
  // Andrew Martin Control Panel
  andrewMartinUI: {
    enabled: boolean
    spaceCloning: boolean
    businessAnalytics: boolean
    revenueInsights: boolean
    guardianAngelNetwork: boolean
  }
  
  // Dynamic Widgets
  dynamicWidgets: {
    enabled: boolean
    businessMetrics: boolean
    paymentProcessor: boolean
    documentSigner: boolean
    researchResults: boolean
  }
  
  // Business Intelligence
  businessIntelligence: {
    enabled: boolean
    realTimeAnalytics: boolean
    predictiveInsights: boolean
    competitiveIntelligence: boolean
    marketResearch: boolean
  }
  
  // Integrations
  integrations: {
    stripe: boolean
    vapi: boolean
    socialMedia: boolean
    accounting: boolean
    browserAutomation: boolean
  }
}

interface FeatureOverrides {
  [featurePath: string]: boolean | FeatureConfig
}

interface FeatureConfig {
  enabled: boolean
  config: Record<string, any>
  rolloutPercentage?: number
  targetUsers?: string[]
  expirationDate?: Date
}
```

### 3. Business Settings Consolidation
Consolidate business-related settings:

```typescript
interface BusinessSettings {
  // From BusinessIntelligence collection
  analytics: {
    enabled: boolean
    dashboards: DashboardConfig[]
    metrics: MetricConfig[]
    reporting: ReportingConfig
    alerts: AlertConfig[]
  }
  
  // From Integrations collection
  integrations: {
    stripe: {
      enabled: boolean
      publicKey: string
      webhookEndpoint: string
      features: string[]
    }
    vapi: {
      enabled: boolean
      apiKey: string
      phoneNumbers: PhoneConfig[]
      voiceSettings: VoiceConfig
    }
    accounting: {
      enabled: boolean
      provider: 'quickbooks' | 'xero' | 'freshbooks'
      syncFrequency: 'hourly' | 'daily' | 'weekly'
      categories: CategoryMapping[]
    }
  }
  
  // From Subscriptions collection
  subscriptions: {
    enabled: boolean
    plans: SubscriptionPlan[]
    billing: BillingConfig
    features: SubscriptionFeatures
  }
  
  // From Inventory collection
  inventory: {
    enabled: boolean
    tracking: InventoryTracking
    categories: InventoryCategory[]
    automation: InventoryAutomation
  }
}
```

### 4. UI and UX Configuration
Consolidate UI/UX settings:

```typescript
interface UICustomization {
  theme: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    mode: 'light' | 'dark' | 'auto'
  }
  
  layout: {
    sidebar: 'collapsed' | 'expanded' | 'auto'
    density: 'compact' | 'comfortable' | 'spacious'
    navigation: 'top' | 'side' | 'both'
  }
  
  branding: {
    logo: string
    favicon: string
    companyName: string
    tagline: string
    colors: BrandColors
  }
  
  widgets: {
    enabled: string[]
    layout: WidgetLayout[]
    customizations: WidgetCustomization[]
  }
}

interface WorkflowSettings {
  automation: {
    enabled: boolean
    triggers: WorkflowTrigger[]
    actions: WorkflowAction[]
    conditions: WorkflowCondition[]
  }
  
  approvals: {
    enabled: boolean
    workflows: ApprovalWorkflow[]
    escalation: EscalationRules
  }
  
  notifications: {
    enabled: boolean
    channels: NotificationChannel[]
    templates: NotificationTemplate[]
  }
}
```

### 5. Configuration Collection Definitions
Create consolidated configuration collections:

```typescript
// Global Configuration Collection
export const GlobalConfig: CollectionConfig = {
  slug: 'global-config',
  admin: {
    group: 'Configuration',
    useAsTitle: 'name'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true
    },
    {
      name: 'environment',
      type: 'select',
      options: [
        { label: 'Development', value: 'development' },
        { label: 'Staging', value: 'staging' },
        { label: 'Production', value: 'production' }
      ],
      required: true
    },
    {
      name: 'configuration',
      type: 'json',
      required: true,
      // Global system configuration
    },
    {
      name: 'featureFlags',
      type: 'json',
      required: true,
      // System-wide feature flags
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      // Configuration version for rollback
    }
  ],
  hooks: {
    beforeChange: [
      // Validate configuration schema
      // Check feature flag dependencies
      // Version management
    ],
    afterChange: [
      // Notify configuration changes
      // Update cached configuration
      // Trigger system updates
    ]
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin'
  }
}

// Tenant Configuration Collection
export const TenantConfig: CollectionConfig = {
  slug: 'tenant-config',
  admin: {
    group: 'Configuration',
    useAsTitle: 'tenant'
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      unique: true
    },
    {
      name: 'configuration',
      type: 'json',
      required: true,
      // Tenant-specific configuration
    },
    {
      name: 'featureOverrides',
      type: 'json',
      // Tenant-specific feature overrides
    },
    {
      name: 'businessSettings',
      type: 'json',
      // Consolidated business settings
    },
    {
      name: 'integrations',
      type: 'json',
      // Tenant-specific integrations
    }
  ],
  hooks: {
    beforeChange: [
      // Validate tenant configuration
      // Check feature compatibility
      // Apply business rules
    ],
    afterChange: [
      // Update tenant cache
      // Notify configuration changes
      // Update related spaces
    ]
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      return {
        tenant: {
          equals: req.user?.tenant
        }
      }
    }
  }
}

// Space Configuration Collection
export const SpaceConfig: CollectionConfig = {
  slug: 'space-config',
  admin: {
    group: 'Configuration',
    useAsTitle: 'space'
  },
  fields: [
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      unique: true
    },
    {
      name: 'configuration',
      type: 'json',
      required: true,
      // Space-specific configuration
    },
    {
      name: 'uiCustomization',
      type: 'json',
      // UI/UX customization
    },
    {
      name: 'workflows',
      type: 'json',
      // Workflow configuration
    },
    {
      name: 'automations',
      type: 'json',
      // Automation settings
    }
  ],
  hooks: {
    beforeChange: [
      // Validate space configuration
      // Check tenant limits
      // Apply inheritance rules
    ],
    afterChange: [
      // Update space cache
      // Notify users
      // Update UI configuration
    ]
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return {
        space: {
          in: req.user.spaces || []
        }
      }
    }
  }
}
```

### 6. Configuration Management Service
Create a service for managing configuration:

```typescript
export class ConfigurationManager {
  private configCache: Map<string, any> = new Map()
  private featureFlagCache: Map<string, boolean> = new Map()

  async getConfiguration(
    type: 'global' | 'tenant' | 'space' | 'user',
    id?: string
  ): Promise<any> {
    // Retrieve configuration from cache or database
    // Apply inheritance rules
    // Return merged configuration
  }

  async getFeatureFlag(
    featurePath: string,
    context: ConfigurationContext
  ): Promise<boolean> {
    // Check feature flag at appropriate level
    // Apply rollout rules
    // Return feature state
  }

  async updateConfiguration(
    type: 'global' | 'tenant' | 'space' | 'user',
    id: string,
    updates: Partial<any>
  ): Promise<void> {
    // Validate configuration updates
    // Apply updates to database
    // Update cache
    // Notify subscribers
  }

  async enableFeature(
    featurePath: string,
    context: ConfigurationContext,
    config?: FeatureConfig
  ): Promise<void> {
    // Enable feature at appropriate level
    // Update configuration
    // Notify system components
  }

  async disableFeature(
    featurePath: string,
    context: ConfigurationContext
  ): Promise<void> {
    // Disable feature at appropriate level
    // Update configuration
    // Notify system components
  }

  private async invalidateCache(key: string): Promise<void> {
    // Remove from cache
    // Notify other instances
    // Trigger cache refresh
  }
}
```

## 📁 Files to Create

### New Files to Create
- `src/collections/GlobalConfig.ts` - Global configuration collection
- `src/collections/TenantConfig.ts` - Tenant configuration collection
- `src/collections/SpaceConfig.ts` - Space configuration collection
- `src/collections/UserConfig.ts` - User configuration collection
- `src/services/ConfigurationManager.ts` - Configuration management service
- `src/types/configuration.ts` - Configuration type definitions
- `src/utilities/FeatureFlagManager.ts` - Feature flag management
- `src/utilities/ConfigurationValidator.ts` - Configuration validation
- `src/hooks/configurationHooks.ts` - Configuration lifecycle hooks

### Files to Modify
- `src/collections/index.ts` - Add new configuration collections
- `src/payload.config.ts` - Include configuration collections
- `src/migrations/index.ts` - Add configuration migration

### Files to Remove (After Migration)
- Collections that will be consolidated into JSON configuration
- Redundant configuration-related collections
- Scattered settings collections

### Files to Review for Context
- `docs/jules-work-requests/005-json-migration-utilities.md` - Migration utilities
- `docs/REFACTORING_STATUS_ANALYSIS.md` - Collections to consolidate
- `src/collections/*.ts` - All collections for consolidation analysis

## ✅ Acceptance Criteria

### Must Have
1. **Hierarchical Configuration** - Global, tenant, space, and user-level settings
2. **Feature Flag Management** - Dynamic feature enabling/disabling
3. **Configuration Validation** - Schema validation for all configuration
4. **Real-Time Updates** - Configuration changes without server restarts
5. **Migration Support** - Tools to migrate existing configuration
6. **Cache Management** - Efficient configuration caching and invalidation

### Configuration Requirements
- **Inheritance Rules** - Lower levels inherit from higher levels
- **Override Capabilities** - Ability to override inherited settings
- **Version Management** - Track configuration changes and rollback
- **Environment Support** - Different configurations for different environments
- **Validation** - Comprehensive validation of configuration changes

### Feature Flag Requirements
- **Granular Control** - Feature flags at multiple levels
- **Rollout Management** - Gradual rollout to percentage of users
- **Dependency Checking** - Ensure feature dependencies are met
- **Expiration Support** - Automatic feature flag expiration
- **Audit Trail** - Track all feature flag changes

### Performance Requirements
- **Fast Configuration Retrieval** - Cached configuration access
- **Efficient Updates** - Minimal impact configuration updates
- **Scalable Architecture** - Support for large numbers of tenants/spaces
- **Real-Time Propagation** - Quick propagation of configuration changes

### Testing Verification
```bash
# Test configuration management
pnpm test -- configuration-manager

# Test feature flag functionality
pnpm test -- feature-flags

# Test configuration validation
pnpm test -- configuration-validation

# Test configuration inheritance
pnpm test -- configuration-inheritance

# Test migration utilities
pnpm test -- configuration-migration
```

## 🔗 Related Work

### Dependencies
- **✅ Task 004**: Messages collection enhancement (configuration examples)
- **✅ Task 005**: JSON migration utilities (needed for data migration)

### Follow-up Tasks
- **Task 007**: Andrew Martin Control Panel (uses configuration system)
- **Task 008**: Dynamic Widget System (uses feature flags)
- **Task 009**: Leo Interface Enhancement (uses configuration)

### Integration Points
- **All Collections** - Many collections will be consolidated
- **Feature Systems** - All features will use feature flags
- **UI Components** - UI will reflect configuration settings
- **API Endpoints** - Configuration-driven API behavior

---

## 🔄 Migration Strategy

### Phase 1: Configuration Collection Setup (1-2 hours)
1. **Create configuration collections** - Global, tenant, space, user config
2. **Implement configuration service** - ConfigurationManager class
3. **Add validation system** - Configuration schema validation
4. **Create feature flag system** - FeatureFlagManager utility

### Phase 2: Data Migration (2-3 hours)
1. **Migrate existing settings** - Use Task 005 migration utilities
2. **Consolidate scattered configuration** - Move settings to JSON
3. **Set up inheritance rules** - Implement configuration hierarchy
4. **Validate migrated data** - Ensure data integrity

### Phase 3: System Integration (1-2 hours)
1. **Update system components** - Use new configuration system
2. **Implement feature flag checks** - Replace hardcoded feature logic
3. **Add cache management** - Implement configuration caching
4. **Test end-to-end** - Verify complete system functionality

## 🕉️ Implementation Notes

The configuration consolidation represents a major architectural improvement that will make Angel OS much more flexible and maintainable. This system enables rapid feature deployment, A/B testing, and dynamic system behavior without code changes.

Key principles to maintain:
- **Flexibility** - Configuration should support future requirements
- **Performance** - Fast configuration access through caching
- **Security** - Proper access control for configuration changes
- **Reliability** - Robust validation and error handling

The consolidated configuration system will enable:
- **Rapid Feature Deployment** - Enable features without code deployment
- **A/B Testing** - Test features with subset of users
- **Environment Management** - Different settings for different environments
- **Simplified Administration** - Centralized configuration management

**Remember**: Configuration is the nervous system of Angel OS - it should be flexible, reliable, and easy to manage while maintaining the sacred principles of lifting people up and enabling Guardian Angels.

**Om Shanti Om** - Peace in the unified configuration! 🌟 