import type { CollectionConfig } from 'payload'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organizationType', 'primaryDomain', 'createdAt'],
    group: 'Business',
    description: 'Top-level organizations like BJC Medical Group, Junk King Corporate',
  },
  access: {
    create: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    read: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      // Users can read organizations they're part of
      return { 'members.user': { equals: req.user?.id } }
    },
    update: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return { 'members.user': { equals: req.user?.id } }
    },
    delete: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Organization name (e.g., BJC Medical Group, Junk King Corporate)',
      },
    },
    {
      name: 'organizationType',
      type: 'select',
      required: true,
      options: [
        { label: 'Medical Network', value: 'medical_network' },
        { label: 'Franchise System', value: 'franchise_system' },
        { label: 'Mobile Service Network', value: 'mobile_service' },
        { label: 'Multi-Location Business', value: 'multi_location' },
        { label: 'Service Marketplace', value: 'service_marketplace' },
        { label: 'Professional Services', value: 'professional_services' },
      ],
      defaultValue: 'multi_location',
    },
    {
      name: 'primaryDomain',
      type: 'text',
      admin: {
        description: 'Primary website domain (e.g., bjc.org)',
        placeholder: 'example.com',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of the organization',
      },
    },
    {
      name: 'logo',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Organization logo',
      },
    },
    {
      name: 'members',
      type: 'array',
      label: 'Organization Members',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Organization Admin', value: 'org_admin' },
            { label: 'Location Manager', value: 'location_manager' },
            { label: 'Provider', value: 'provider' },
            { label: 'Staff', value: 'staff' },
            { label: 'Viewer', value: 'viewer' },
          ],
          defaultValue: 'viewer',
        },
        {
          name: 'accessLevel',
          type: 'select',
          options: [
            { label: 'Full Access', value: 'full' },
            { label: 'Limited Access', value: 'limited' },
            { label: 'Read Only', value: 'readonly' },
          ],
          defaultValue: 'limited',
        },
      ],
    },
    {
      name: 'crmIntegration',
      type: 'group',
      label: 'CRM Integration Settings',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable CRM synchronization for this organization',
          },
        },
        {
          name: 'crmType',
          type: 'select',
          options: [
            { label: 'Epic (Medical)', value: 'epic' },
            { label: 'Salesforce', value: 'salesforce' },
            { label: 'HubSpot', value: 'hubspot' },
            { label: 'Custom CRM', value: 'custom' },
            { label: 'Other', value: 'other' },
          ],
          admin: {
            condition: (data) => data?.enabled === true,
          },
        },
        {
          name: 'syncSchedule',
          type: 'select',
          options: [
            { label: 'Real-time', value: 'realtime' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Manual', value: 'manual' },
          ],
          defaultValue: 'daily',
          admin: {
            condition: (data) => data?.enabled === true,
          },
        },
        {
          name: 'apiEndpoint',
          type: 'text',
          admin: {
            condition: (data) => data?.enabled === true,
            description: 'CRM API endpoint URL',
          },
        },
        {
          name: 'lastSync',
          type: 'date',
          admin: {
            readOnly: true,
            condition: (data) => data?.enabled === true,
            description: 'Last successful synchronization',
          },
        },
        {
          name: 'syncStatus',
          type: 'select',
          options: [
            { label: 'Success', value: 'success' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
            { label: 'Never Synced', value: 'never' },
          ],
          defaultValue: 'never',
          admin: {
            readOnly: true,
            condition: (data) => data?.enabled === true,
          },
        },
      ],
    },
    {
      name: 'billingSettings',
      type: 'group',
      label: 'Billing & Revenue Settings',
      fields: [
        {
          name: 'consolidatedBilling',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Bill organization as whole vs individual locations',
          },
        },
        {
          name: 'billingContact',
          type: 'group',
          fields: [
            { name: 'name', type: 'text' },
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
          ],
        },
        {
          name: 'sharing',
          type: 'group',
          fields: [
            {
              name: 'orgRate',
              type: 'number',
              defaultValue: 2.0,
              min: 0,
              max: 50,
              admin: {
                description: 'Organization-level platform fee %',
                step: 0.1,
              },
            },
            {
              name: 'locRate',
              type: 'number',
              defaultValue: 1.0,
              min: 0,
              max: 50,
              admin: {
                description: 'Individual location additional fee %',
                step: 0.1,
              },
            },
            {
              name: 'discounts',
              type: 'array',
              fields: [
                {
                  name: 'minLocs',
                  type: 'number',
                  required: true,
                },
                {
                  name: 'percent',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 100,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'opsSettings',
      type: 'group',
      label: 'Operational Settings',
      fields: [
        {
          name: 'timezone',
          type: 'text',
          defaultValue: 'America/New_York',
          admin: {
            description: 'Primary timezone for the organization',
          },
        },
        {
          name: 'hours',
          type: 'group',
          fields: [
            {
              name: 'schedule',
              type: 'array',
              fields: [
                {
                  name: 'dayOfWeek',
                  type: 'select',
                  options: [
                    { label: 'Monday', value: 'monday' },
                    { label: 'Tuesday', value: 'tuesday' },
                    { label: 'Wednesday', value: 'wednesday' },
                    { label: 'Thursday', value: 'thursday' },
                    { label: 'Friday', value: 'friday' },
                    { label: 'Saturday', value: 'saturday' },
                    { label: 'Sunday', value: 'sunday' },
                  ],
                },
                { name: 'openTime', type: 'text', admin: { placeholder: '09:00' } },
                { name: 'closeTime', type: 'text', admin: { placeholder: '17:00' } },
                { name: 'isClosed', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
        {
          name: 'contactInfo',
          type: 'group',
          fields: [
            { name: 'mainPhone', type: 'text' },
            { name: 'mainEmail', type: 'email' },
            { name: 'supportEmail', type: 'email' },
            { name: 'emergencyContact', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'integration',
      type: 'group',
      label: 'Platform Integration',
      fields: [
        {
          name: 'websites',
          type: 'array',
          label: 'Associated Websites',
          fields: [
            {
              name: 'domain',
              type: 'text',
              required: true,
              admin: {
                placeholder: 'bjcmedicalgroup.org',
              },
            },
            {
              name: 'purpose',
              type: 'select',
              options: [
                { label: 'Main Website', value: 'main' },
                { label: 'Booking Portal', value: 'booking' },
                { label: 'Provider Directory', value: 'directory' },
                { label: 'Patient Portal', value: 'patient_portal' },
                { label: 'Mobile App', value: 'mobile' },
                { label: 'Admin Dashboard', value: 'admin' },
              ],
              defaultValue: 'main',
            },
            {
              name: 'isActive',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'integrationNotes',
              type: 'textarea',
              admin: {
                description: 'Special integration requirements or notes',
              },
            },
          ],
        },
        {
          name: 'apiAccess',
          type: 'group',
          fields: [
            {
              name: 'hasApiKey',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'apiKeyCreatedAt',
              type: 'date',
              admin: {
                readOnly: true,
                condition: (data) => data?.hasApiKey === true,
              },
            },
            {
              name: 'webhookUrl',
              type: 'text',
              admin: {
                condition: (data) => data?.hasApiKey === true,
                description: 'Webhook endpoint for real-time updates',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics & Reporting',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'frequency',
          type: 'select',
          options: [
            { label: 'Real-time', value: 'realtime' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
          defaultValue: 'weekly',
        },
        {
          name: 'recipients',
          type: 'array',
          fields: [
            { name: 'email', type: 'email', required: true },
            { name: 'role', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Pending Setup', value: 'pending' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        // Auto-assign organization admin role to creator
        if (operation === 'create' && req.user && !data.members?.length) {
          data.members = [{
            user: req.user.id,
            role: 'org_admin',
            accessLevel: 'full'
          }]
        }
        return data
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'create') {
          // Log organization creation
          console.log(`[Organizations] Created new organization: ${doc.name} (${doc.organizationType})`)

          // TODO: Send welcome email
          // TODO: Create default Guardian Angel for organization
        }
      },
    ],
  },
}
