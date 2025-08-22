import type { CollectionConfig } from 'payload'

export const Workflows: CollectionConfig = {
  slug: 'workflows',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'triggerCollection', 'tenant', 'createdAt'],
  },
  fields: [
    // Workflow Identification
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-readable name for this workflow',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of what this workflow does',
      },
    },
    
    // Multi-tenant Support
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    
    // Workflow Status
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
      defaultValue: 'draft',
    },
    
    // Trigger Configuration
    {
      name: 'trigger',
      type: 'group',
      fields: [
        {
          name: 'collection',
          type: 'select',
          options: [
            { label: 'Posts', value: 'posts' },
            { label: 'Pages', value: 'pages' },
            { label: 'Products', value: 'products' },
            { label: 'Messages', value: 'messages' },
            { label: 'Forms', value: 'forms' },
            { label: 'Users', value: 'users' },
            { label: 'Orders', value: 'orders' },
          ],
          required: true,
          admin: {
            description: 'Which collection triggers this workflow',
          },
        },
        {
          name: 'event',
          type: 'select',
          options: [
            { label: 'Created', value: 'created' },
            { label: 'Updated', value: 'updated' },
            { label: 'Deleted', value: 'deleted' },
            { label: 'Published', value: 'published' },
            { label: 'Status Changed', value: 'status_changed' },
            { label: 'Custom Event', value: 'custom' },
          ],
          required: true,
          admin: {
            description: 'What event triggers this workflow',
          },
        },
        {
          name: 'conditions',
          type: 'json',
          admin: {
            description: 'JSON conditions that must be met for workflow to trigger',
          },
        },
        {
          name: 'customEventName',
          type: 'text',
          admin: {
            condition: (data) => data.trigger?.event === 'custom',
            description: 'Name of custom event to listen for',
          },
        },
      ],
    },
    
    // Workflow Steps
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Human-readable name for this step',
          },
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Create Record', value: 'create_record' },
            { label: 'Update Record', value: 'update_record' },
            { label: 'Send Email', value: 'send_email' },
            { label: 'Send SMS', value: 'send_sms' },
            { label: 'API Call', value: 'api_call' },
            { label: 'AI Analysis', value: 'ai_analysis' },
            { label: 'Conditional Logic', value: 'conditional' },
            { label: 'Delay/Wait', value: 'delay' },
            { label: 'Custom Function', value: 'custom_function' },
          ],
          required: true,
        },
        {
          name: 'config',
          type: 'json',
          required: true,
          admin: {
            description: 'Configuration specific to this step type',
          },
        },
        {
          name: 'targetCollection',
          type: 'select',
          options: [
            { label: 'Posts', value: 'posts' },
            { label: 'Pages', value: 'pages' },
            { label: 'Products', value: 'products' },
            { label: 'Messages', value: 'messages' },
            { label: 'Forms', value: 'forms' },
            { label: 'Users', value: 'users' },
            { label: 'Orders', value: 'orders' },
          ],
          admin: {
            condition: (data, siblingData) => 
              siblingData.type === 'create_record' || siblingData.type === 'update_record',
            description: 'Which collection this step operates on',
          },
        },
        {
          name: 'automation',
          type: 'select',
          options: [
            { label: 'Fully Automated', value: 'automated' },
            { label: 'Human Review Required', value: 'human_review' },
            { label: 'AI Assisted', value: 'ai_assisted' },
            { label: 'Manual Only', value: 'manual' },
          ],
          required: true,
          defaultValue: 'human_review',
        },
        {
          name: 'aiAssisted',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Use AI to help with this step',
          },
        },
        {
          name: 'retryConfig',
          type: 'group',
          fields: [
            {
              name: 'maxRetries',
              type: 'number',
              defaultValue: 3,
              min: 0,
              max: 10,
            },
            {
              name: 'retryDelay',
              type: 'number',
              defaultValue: 300,
              admin: {
                description: 'Delay between retries in seconds',
              },
            },
          ],
        },
        {
          name: 'order',
          type: 'number',
          required: true,
          admin: {
            description: 'Order of execution (1, 2, 3, etc.)',
          },
        },
      ],
    },
    
    // Business Context
    {
      name: 'businessContext',
      type: 'group',
      fields: [
        {
          name: 'department',
          type: 'select',
          options: [
            { label: 'Sales', value: 'sales' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Operations', value: 'operations' },
            { label: 'Support', value: 'support' },
            { label: 'Finance', value: 'finance' },
            { label: 'Human Resources', value: 'hr' },
          ],
          admin: {
            description: 'Which department this workflow serves',
          },
        },
        {
          name: 'process',
          type: 'select',
          options: [
            { label: 'Lead Generation', value: 'lead_generation' },
            { label: 'Customer Onboarding', value: 'customer_onboarding' },
            { label: 'Order Processing', value: 'order_processing' },
            { label: 'Content Publishing', value: 'content_publishing' },
            { label: 'Customer Support', value: 'customer_support' },
            { label: 'Project Management', value: 'project_management' },
            { label: 'Quality Assurance', value: 'quality_assurance' },
            { label: 'Compliance', value: 'compliance' },
          ],
          admin: {
            description: 'What business process this workflow supports',
          },
        },
        {
          name: 'priority',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Normal', value: 'normal' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ],
          required: true,
          defaultValue: 'normal',
        },
      ],
    },
    
    // Angel OS Ethical AI Framework
    {
      name: 'ethicalFramework',
      type: 'group',
      fields: [
        {
          name: 'humanApprovalRequired',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Require human approval before executing this workflow',
          },
        },
        {
          name: 'biasCheckpoints',
          type: 'array',
          fields: [
            {
              name: 'checkpoint',
              type: 'text',
              required: true,
              admin: {
                description: 'Description of bias check to perform',
              },
            },
            {
              name: 'stepNumber',
              type: 'number',
              required: true,
              admin: {
                description: 'Which step to check for bias',
              },
            },
          ],
          admin: {
            description: 'Bias detection checkpoints for AI-assisted steps',
          },
        },
        {
          name: 'valueAlignment',
          type: 'select',
          options: [
            { label: 'Guardian Angel Support', value: 'guardian_angel' },
            { label: 'Justice Advocacy', value: 'justice_advocacy' },
            { label: 'Economic Empowerment', value: 'economic_empowerment' },
            { label: 'Community Building', value: 'community_building' },
            { label: 'Transparency', value: 'transparency' },
            { label: 'Privacy Protection', value: 'privacy_protection' },
          ],
          hasMany: true,
          admin: {
            description: 'Angel OS values this workflow aligns with',
          },
        },
        {
          name: 'guardianAngelTrigger',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Can trigger Guardian Angel assistance if needed',
          },
        },
      ],
    },
    
    // Performance Tracking
    {
      name: 'performance',
      type: 'group',
      fields: [
        {
          name: 'executionCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Total number of times this workflow has executed',
          },
        },
        {
          name: 'successCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of successful executions',
          },
        },
        {
          name: 'failureCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of failed executions',
          },
        },
        {
          name: 'averageExecutionTime',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Average execution time in seconds',
          },
        },
        {
          name: 'lastExecutedAt',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When this workflow last executed',
          },
        },
      ],
    },
    
    // Notification Settings
    {
      name: 'notifications',
      type: 'group',
      fields: [
        {
          name: 'notifyOnSuccess',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Send notification when workflow completes successfully',
          },
        },
        {
          name: 'notifyOnFailure',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Send notification when workflow fails',
          },
        },
        {
          name: 'notificationRecipients',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Users to notify about workflow status',
          },
        },
        {
          name: 'slackWebhook',
          type: 'text',
          admin: {
            description: 'Slack webhook URL for notifications',
          },
        },
      ],
    },
    
    // Scheduling (Future Enhancement)
    {
      name: 'scheduling',
      type: 'group',
      fields: [
        {
          name: 'isScheduled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Run this workflow on a schedule instead of event-based',
          },
        },
        {
          name: 'cronExpression',
          type: 'text',
          admin: {
            condition: (data) => data.scheduling?.isScheduled,
            description: 'Cron expression for scheduled execution',
          },
        },
        {
          name: 'timezone',
          type: 'select',
          options: [
            { label: 'UTC', value: 'UTC' },
            { label: 'Eastern Time', value: 'America/New_York' },
            { label: 'Central Time', value: 'America/Chicago' },
            { label: 'Mountain Time', value: 'America/Denver' },
            { label: 'Pacific Time', value: 'America/Los_Angeles' },
          ],
          defaultValue: 'UTC',
          admin: {
            condition: (data) => data.scheduling?.isScheduled,
          },
        },
      ],
    },
    
    // Version Control
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: {
        readOnly: true,
        description: 'Version number of this workflow',
      },
    },
    {
      name: 'changeLog',
      type: 'array',
      fields: [
        {
          name: 'version',
          type: 'number',
          required: true,
        },
        {
          name: 'changes',
          type: 'textarea',
          required: true,
        },
        {
          name: 'changedBy',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'changedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
        },
      ],
      admin: {
        readOnly: true,
        description: 'History of changes to this workflow',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }: { data: any; operation: string }) => {
        // Increment version on updates
        if (operation === 'update') {
          data.version = (data.version || 1) + 1
        }
        
        // Validate step order
        if (data.steps && data.steps.length > 0) {
          const orders = data.steps.map((step: any) => step.order)
          const uniqueOrders = [...new Set(orders)]
          if (orders.length !== uniqueOrders.length) {
            throw new Error('Step order numbers must be unique')
          }
        }
        
        // Ensure ethical framework is present for AI-assisted workflows
        const hasAISteps = data.steps?.some((step: any) => step.aiAssisted)
        if (hasAISteps && !data.ethicalFramework?.valueAlignment?.length) {
          throw new Error('AI-assisted workflows must have value alignment specified')
        }
        
        return data
      },
    ],
    afterChange: [
      ({ doc, operation }: { doc: any; operation: string }) => {
        // Log workflow creation/updates for audit trail
        console.log(`Workflow ${doc.name} ${operation}d by tenant ${doc.tenant}`)
        
        // TODO: Implement workflow registration with execution engine
        // This would integrate with the actual workflow orchestration system
        
        return doc
      },
    ],
  },
} 