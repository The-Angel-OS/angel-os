import type { CollectionConfig } from 'payload'

export const TenantDistribution: CollectionConfig = {
  slug: 'tenant-distribution',
  admin: {
    useAsTitle: 'tenantName',
    description: 'Tracks tenant distribution across Angel OS network nodes',
    defaultColumns: ['tenantName', 'currentNode', 'status', 'lastMigration'],
    group: 'Platform Management',
    hidden: ({ user }) => {
      // Only show to Host (Super Admin) users, like DNN
      return (user as any)?.globalRole !== 'super_admin'
    },
  },
  access: {
    // Only super admins can manage tenant distribution
    create: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    read: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    update: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    delete: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
  },
  fields: [
    // Tenant Reference
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      unique: true,
      admin: {
        description: 'The tenant being tracked',
      },
    },
    {
      name: 'tenantName',
      type: 'text',
      admin: {
        description: 'Cached tenant name for quick reference',
        readOnly: true,
      },
    },

    // Current Node Assignment
    {
      name: 'currentNode',
      type: 'relationship',
      relationTo: 'angel-os-nodes',
      required: true,
      admin: {
        description: 'Angel OS node currently hosting this tenant',
      },
    },
    {
      name: 'assignedAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When tenant was assigned to current node',
      },
    },

    // Distribution Strategy
    {
      name: 'distributionStrategy',
      type: 'select',
      required: true,
      options: [
        { label: 'Geographic Proximity', value: 'geographic' },
        { label: 'Load Balancing', value: 'load_balance' },
        { label: 'AI Optimization', value: 'ai_optimized' },
        { label: 'Manual Assignment', value: 'manual' },
        { label: 'High Availability', value: 'high_availability' },
        { label: 'Cost Optimization', value: 'cost_optimized' },
      ],
      defaultValue: 'geographic',
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Normal', value: 'normal' },
        { label: 'Low', value: 'low' },
      ],
      defaultValue: 'normal',
    },

    // Migration & Movement
    {
      name: 'migrationStatus',
      type: 'select',
      required: true,
      options: [
        { label: 'Stable', value: 'stable' },
        { label: 'Migration Pending', value: 'migration_pending' },
        { label: 'Migrating', value: 'migrating' },
        { label: 'Migration Failed', value: 'migration_failed' },
        { label: 'Quarantined', value: 'quarantined' },
      ],
      defaultValue: 'stable',
    },
    {
      name: 'targetNode',
      type: 'relationship',
      relationTo: 'angel-os-nodes',
      admin: {
        description: 'Target node for pending migration',
      },
    },
    {
      name: 'migrationReason',
      type: 'select',
      options: [
        { label: 'Load Balancing', value: 'load_balancing' },
        { label: 'Node Maintenance', value: 'node_maintenance' },
        { label: 'Geographic Optimization', value: 'geographic_optimization' },
        { label: 'Performance Issues', value: 'performance_issues' },
        { label: 'User Request', value: 'user_request' },
        { label: 'AI Recommendation', value: 'ai_recommendation' },
        { label: 'Disaster Recovery', value: 'disaster_recovery' },
      ],
    },

    // Performance & Analytics
    {
      name: 'performance',
      type: 'group',
      fields: [
        {
          name: 'averageResponseTime',
          type: 'number',
          admin: {
            description: 'Average response time for this tenant (ms)',
            readOnly: true,
          },
        },
        {
          name: 'dailyActiveUsers',
          type: 'number',
          admin: {
            description: 'Daily active users for this tenant',
            readOnly: true,
          },
        },
        {
          name: 'storageUsage',
          type: 'number',
          admin: {
            description: 'Current storage usage in MB',
            readOnly: true,
          },
        },
        {
          name: 'bandwidthUsage',
          type: 'number',
          admin: {
            description: 'Monthly bandwidth usage in GB',
            readOnly: true,
          },
        },
      ],
    },

    // Network Affinity & Relationships
    {
      name: 'networkAffinity',
      type: 'group',
      fields: [
        {
          name: 'primaryUserRegions',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'US East', value: 'us-east' },
            { label: 'US West', value: 'us-west' },
            { label: 'EU West', value: 'eu-west' },
            { label: 'EU Central', value: 'eu-central' },
            { label: 'Asia Pacific', value: 'asia-pacific' },
            { label: 'Australia', value: 'australia' },
            { label: 'Canada', value: 'canada' },
            { label: 'South America', value: 'south-america' },
          ],
          admin: {
            description: 'Geographic regions where most users are located',
          },
        },
        {
          name: 'connectedTenants',
          type: 'relationship',
          relationTo: 'tenants',
          hasMany: true,
          admin: {
            description: 'Tenants this one frequently interacts with',
          },
        },
        {
          name: 'affinityScore',
          type: 'number',
          admin: {
            description: 'Network affinity score for current placement',
            readOnly: true,
          },
        },
      ],
    },

    // Migration History
    {
      name: 'migrationHistory',
      type: 'array',
      fields: [
        {
          name: 'timestamp',
          type: 'date',
          required: true,
        },
        {
          name: 'fromNode',
          type: 'relationship',
          relationTo: 'angel-os-nodes',
          required: true,
        },
        {
          name: 'toNode',
          type: 'relationship',
          relationTo: 'angel-os-nodes',
          required: true,
        },
        {
          name: 'reason',
          type: 'text',
          required: true,
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Migration duration in seconds',
          },
        },
        {
          name: 'success',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'notes',
          type: 'textarea',
        },
      ],
    },

    // AI & Automation
    {
      name: 'automationRules',
      type: 'group',
      fields: [
        {
          name: 'autoMigrationEnabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow AI to automatically migrate this tenant',
          },
        },
        {
          name: 'maxMigrationsPerMonth',
          type: 'number',
          defaultValue: 2,
          admin: {
            description: 'Maximum migrations allowed per month',
          },
        },
        {
          name: 'migrationWindow',
          type: 'select',
          options: [
            { label: 'Anytime', value: 'anytime' },
            { label: 'Maintenance Hours Only', value: 'maintenance_hours' },
            { label: 'Low Usage Hours', value: 'low_usage_hours' },
            { label: 'Manual Approval Required', value: 'manual_approval' },
          ],
          defaultValue: 'low_usage_hours',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Cache tenant name for quick reference
        if (data.tenant && operation === 'create') {
          try {
            const tenant = await req.payload.findByID({
              collection: 'tenants',
              id: data.tenant,
            })
            data.tenantName = tenant.name
          } catch (error) {
            console.error('Failed to fetch tenant name:', error)
          }
        }

        // Set assignment timestamp for new assignments
        if (operation === 'create' || (data.currentNode && data.currentNode !== data.originalCurrentNode)) {
          data.assignedAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Track migration events
        if (operation === 'update' && previousDoc?.currentNode !== doc.currentNode) {
          console.log(`🚀 Tenant "${doc.tenantName}" migrated from node ${previousDoc.currentNode} to ${doc.currentNode}`)
          
          // Add to migration history
          const migrationEntry = {
            timestamp: new Date().toISOString(),
            fromNode: previousDoc.currentNode,
            toNode: doc.currentNode,
            reason: doc.migrationReason || 'Manual migration',
            success: true,
          }

          await req.payload.update({
            collection: 'tenant-distribution',
            id: doc.id,
            data: {
              migrationHistory: [...(doc.migrationHistory || []), migrationEntry],
              migrationStatus: 'stable',
              targetNode: null,
              migrationReason: null,
            },
          })

          // TODO: Trigger network rebalancing algorithm
          // TODO: Update network topology metrics
          // TODO: Notify affected nodes
        }
      },
    ],
  },
}
