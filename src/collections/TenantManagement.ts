import type { CollectionConfig } from 'payload'
import { superAdminOnlyAccess } from './shared/tenantAccess'

export const TenantManagement: CollectionConfig = {
  slug: 'tenant-management',
  labels: {
    singular: 'Tenant Management',
    plural: 'Tenant Management',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'subdomain', 'status', 'plan', 'userCount', 'storageUsed'],
    group: 'Platform Management',
    description: 'Super admin tenant management and provisioning',
    hidden: ({ user }) => {
      // Only show to Host (Super Admin) users, like DNN
      return (user as any)?.globalRole !== 'super_admin'
    },
  },
  access: superAdminOnlyAccess, // Only super admins can access
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Tenant display name',
      },
    },
    {
      name: 'subdomain',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique subdomain identifier',
      },
      validate: (value: any) => {
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Subdomain must contain only lowercase letters, numbers, and hyphens'
        }
        if (value.length < 3 || value.length > 63) {
          return 'Subdomain must be between 3 and 63 characters'
        }
        return true
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Pending Setup', value: 'pending' },
        { label: 'Archived', value: 'archived' },
        { label: 'Trial', value: 'trial' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Current tenant status',
      },
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Starter', value: 'starter' },
        { label: 'Professional', value: 'professional' },
        { label: 'Business', value: 'business' },
        { label: 'Enterprise', value: 'enterprise' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'free',
      admin: {
        description: 'Subscription plan',
      },
    },
    {
      name: 'billing',
      type: 'group',
      fields: [
        {
          name: 'monthlyRevenue',
          type: 'number',
          admin: {
            description: 'Monthly recurring revenue',
            step: 0.01,
          },
        },
        {
          name: 'billingCycle',
          type: 'select',
          options: [
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Annually', value: 'annually' },
          ],
          defaultValue: 'monthly',
        },
        {
          name: 'nextBillingDate',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'paymentStatus',
          type: 'select',
          options: [
            { label: 'Current', value: 'current' },
            { label: 'Past Due', value: 'past-due' },
            { label: 'Cancelled', value: 'cancelled' },
            { label: 'Trial', value: 'trial' },
          ],
          defaultValue: 'current',
        },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Primary tenant owner/admin',
      },
    },
    {
      name: 'usage',
      type: 'group',
      admin: {
        description: 'Current usage statistics',
      },
      fields: [
        {
          name: 'userCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Current number of users',
            readOnly: true,
          },
        },
        {
          name: 'storageUsed',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Storage used in MB',
            readOnly: true,
          },
        },
        {
          name: 'apiCallsThisMonth',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'API calls this month',
            readOnly: true,
          },
        },
        {
          name: 'lastActivity',
          type: 'date',
          admin: {
            description: 'Last user activity',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'limits',
      type: 'group',
      fields: [
        {
          name: 'maxUsers',
          type: 'number',
          defaultValue: 10,
          admin: {
            description: 'Maximum number of users',
          },
        },
        {
          name: 'maxStorage',
          type: 'number',
          defaultValue: 1000,
          admin: {
            description: 'Maximum storage in MB',
          },
        },
        {
          name: 'maxApiCalls',
          type: 'number',
          defaultValue: 10000,
          admin: {
            description: 'Maximum API calls per month',
          },
        },
        {
          name: 'maxProducts',
          type: 'number',
          defaultValue: 100,
          admin: {
            description: 'Maximum number of products',
          },
        },
        {
          name: 'maxOrders',
          type: 'number',
          defaultValue: 1000,
          admin: {
            description: 'Maximum orders per month',
          },
        },
      ],
    },
    {
      name: 'features',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'CRM', value: 'crm' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Projects', value: 'projects' },
        { label: 'Advanced Analytics', value: 'analytics' },
        { label: 'API Access', value: 'api' },
        { label: 'Custom Branding', value: 'branding' },
        { label: 'Priority Support', value: 'priority-support' },
        { label: 'Webhooks', value: 'webhooks' },
        { label: 'SSO Integration', value: 'sso' },
        { label: 'White Label', value: 'white-label' },
      ],
      admin: {
        description: 'Enabled features for this tenant',
      },
    },
    {
      name: 'provisioningTemplate',
      type: 'select',
      options: [
        { label: 'Basic Business', value: 'basic-business' },
        { label: 'E-commerce Store', value: 'ecommerce-store' },
        { label: 'Service Provider', value: 'service-provider' },
        { label: 'Creative Agency', value: 'creative-agency' },
        { label: 'SaaS Company', value: 'saas-company' },
        { label: 'Non-profit', value: 'non-profit' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Template used for initial provisioning',
      },
    },
    {
      name: 'customization',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          admin: {
            description: 'Primary brand color (hex)',
          },
          validate: (value: any) => {
            if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
              return 'Must be a valid hex color (e.g., #3b82f6)'
            }
            return true
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Tenant logo',
          },
        },
        {
          name: 'customDomain',
          type: 'text',
          admin: {
            description: 'Custom domain (if configured)',
          },
        },
        {
          name: 'customCSS',
          type: 'code',
          admin: {
            description: 'Custom CSS overrides',
            language: 'css',
          },
        },
      ],
    },
    {
      name: 'integrations',
      type: 'group',
      fields: [
        {
          name: 'stripe',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'accountId',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
              },
            },
            {
              name: 'webhookEndpoint',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
              },
            },
          ],
        },
        {
          name: 'mailchimp',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'apiKey',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
              },
            },
            {
              name: 'audienceId',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
              },
            },
          ],
        },
        {
          name: 'googleAnalytics',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'trackingId',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'customSettings',
      type: 'json',
      admin: {
        description: 'Custom tenant-specific settings and configurations',
      },
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'Admin notes about this tenant',
      },
    },
    {
      name: 'provisioning',
      type: 'group',
      admin: {
        description: 'Provisioning status and history',
      },
      fields: [
        {
          name: 'isProvisioned',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Has initial provisioning been completed?',
          },
        },
        {
          name: 'provisionedAt',
          type: 'date',
          admin: {
            description: 'When provisioning was completed',
            readOnly: true,
          },
        },
        {
          name: 'provisioningLog',
          type: 'array',
          admin: {
            description: 'Provisioning activity log',
          },
          fields: [
            {
              name: 'action',
              type: 'text',
              required: true,
            },
            {
              name: 'status',
              type: 'select',
              options: [
                { label: 'Success', value: 'success' },
                { label: 'Failed', value: 'failed' },
                { label: 'Pending', value: 'pending' },
              ],
              required: true,
            },
            {
              name: 'details',
              type: 'textarea',
            },
            {
              name: 'timestamp',
              type: 'date',
              defaultValue: () => new Date().toISOString(),
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Set provisioned date when status changes to active
        if (data.status === 'active' && !data.provisioning?.provisionedAt) {
          data.provisioning = {
            ...data.provisioning,
            isProvisioned: true,
            provisionedAt: new Date().toISOString(),
          }
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Trigger provisioning workflow for new tenants
        if (operation === 'create') {
          try {
            // Add initial provisioning log entry
            await req.payload.update({
              collection: 'tenant-management',
              id: doc.id,
              data: {
                provisioning: {
                  ...doc.provisioning,
                  provisioningLog: [
                    {
                      action: 'Tenant Created',
                      status: 'success',
                      details: `Tenant ${doc.name} created with subdomain ${doc.subdomain}`,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                },
              },
            })
          } catch (error) {
            console.error('Error updating provisioning log:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}
