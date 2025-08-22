import type { CollectionConfig } from 'payload'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'email', 'phone', 'company', 'type', 'crm.status'],
    group: 'CRM',
    description: 'Universal contact management - customers, leads, vendors, partners',
    listSearchableFields: ['displayName', 'email', 'phone', 'company'],
  },
  access: {
    create: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    read: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') {
        // TODO: Implement proper tenant-based filtering
        return true
      }
      return false
    },
    update: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    delete: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
  },
  fields: [
    // CORE IDENTITY (Always present)
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Primary email address',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      admin: {
        description: 'First name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      admin: {
        description: 'Last name',
      },
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        description: 'Display name (auto-generated)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.firstName && data?.lastName) {
              return `${data.firstName} ${data.lastName}`
            } else if (data?.firstName) {
              return data.firstName
            } else if (data?.lastName) {
              return data.lastName
            }
            return data?.email?.split('@')[0] || 'Unknown Contact'
          },
        ],
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Primary phone number',
      },
    },
    {
      name: 'company',
      type: 'text',
      admin: {
        description: 'Company or organization',
      },
    },

    // TENANT & RELATIONSHIP (Foundation for multi-tenancy)
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this contact belongs to',
        position: 'sidebar',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Linked user account (if registered)',
        position: 'sidebar',
      },
    },

    // CONTACT TYPE & CATEGORIZATION
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Lead', value: 'lead' },
        { label: 'Partner', value: 'partner' },
        { label: 'Vendor', value: 'vendor' },
        { label: 'Team Member', value: 'team' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'customer',
      admin: {
        description: 'Type of contact relationship',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Tags for categorization and filtering',
      },
    },

    // COMMUNICATION PREFERENCES
    {
      name: 'preferences',
      type: 'group',
      label: 'Communication Preferences',
      fields: [
        {
          name: 'allowEmail',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow email communication',
          },
        },
        {
          name: 'allowSMS',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Allow SMS communication',
          },
        },
        {
          name: 'allowCalls',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow phone calls',
          },
        },
        {
          name: 'preferredContactTime',
          type: 'select',
          options: [
            { label: 'Morning (9-12)', value: 'morning' },
            { label: 'Afternoon (12-5)', value: 'afternoon' },
            { label: 'Evening (5-8)', value: 'evening' },
            { label: 'Anytime', value: 'anytime' },
          ],
          defaultValue: 'anytime',
        },
      ],
    },

    // OPTIONAL: CRM/SALES FEATURES (Only if needed)
    {
      name: 'crm',
      type: 'group',
      label: 'CRM & Sales',
      admin: {
        description: 'Optional CRM and sales tracking features',
        condition: (data: Record<string, unknown>) => data.type === 'lead' || data.type === 'customer',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Cold', value: 'cold' },
            { label: 'Warm', value: 'warm' },
            { label: 'Hot', value: 'hot' },
            { label: 'Active Customer', value: 'customer' },
            { label: 'Inactive', value: 'inactive' },
          ],
          defaultValue: 'cold',
        },
        {
          name: 'leadScore',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Lead scoring (0-100)',
          },
        },
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Website', value: 'website' },
            { label: 'Referral', value: 'referral' },
            { label: 'Social Media', value: 'social' },
            { label: 'Event', value: 'event' },
            { label: 'Advertisement', value: 'advertisement' },
            { label: 'Direct', value: 'direct' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'website',
        },
        {
          name: 'assignedTo',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Assigned sales rep or account manager',
          },
        },
        {
          name: 'dealValue',
          type: 'number',
          min: 0,
          admin: {
            description: 'Potential deal value (in cents)',
          },
        },
      ],
    },

    // ADDRESSES (Reusable across different contexts)
    {
      name: 'addresses',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Billing', value: 'billing' },
            { label: 'Shipping', value: 'shipping' },
            { label: 'Office', value: 'office' },
            { label: 'Home', value: 'home' },
            { label: 'Other', value: 'other' },
          ],
          defaultValue: 'billing',
        },
        {
          name: 'street',
          type: 'text',
          required: true,
        },
        {
          name: 'street2',
          type: 'text',
          label: 'Suite/Apt',
        },
        {
          name: 'city',
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          type: 'text',
          required: true,
        },
        {
          name: 'zipCode',
          type: 'text',
          required: true,
        },
        {
          name: 'country',
          type: 'select',
          required: true,
          defaultValue: 'US',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'United Kingdom', value: 'GB' },
            { label: 'Australia', value: 'AU' },
          ],
        },
        {
          name: 'isDefault',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Default address for this type',
          },
        },
      ],
      admin: {
        description: 'Contact addresses for billing, shipping, etc.',
      },
    },

    // ACTIVITY TRACKING (Simple and universal)
    {
      name: 'activity',
      type: 'group',
      label: 'Activity Summary',
      admin: {
        description: 'Auto-tracked activity metrics',
      },
      fields: [
        {
          name: 'firstContactDate',
          type: 'date',
          admin: {
            description: 'Date of first contact',
            readOnly: true,
          },
        },
        {
          name: 'lastContactDate',
          type: 'date',
          admin: {
            description: 'Date of last interaction',
            readOnly: true,
          },
        },
        {
          name: 'totalOrders',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of orders',
            readOnly: true,
          },
        },
        {
          name: 'totalSpent',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total amount spent (in cents)',
            readOnly: true,
          },
        },
        {
          name: 'totalInteractions',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total interactions across all channels',
            readOnly: true,
          },
        },
      ],
    },

    // FLEXIBLE CUSTOM FIELDS (Future-proof)
    {
      name: 'customFields',
      type: 'json',
      admin: {
        description: 'Flexible custom data storage (JSON object)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Set first contact date for new contacts
        if (data && !data.activity?.firstContactDate) {
          data.activity = {
            ...data.activity,
            firstContactDate: new Date().toISOString(),
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        console.log(`Contact ${operation}: ${doc.displayName} (${doc.email}) - Type: ${doc.type}`)

        // TODO: Update related records when contact info changes
        // TODO: Sync with user account if linked
        // TODO: Update CRM metrics if applicable
      },
    ],
  },
  indexes: [
    {
      fields: ['email'],
      unique: true,
    },
    {
      fields: ['tenant', 'type'],
    },
    {
      fields: ['tenant', 'crm.status'],
    },
    // Temporarily commented out to fix schema mismatch
    // {
    //   fields: ['tags'],
    // },
  ],
  timestamps: true,
}
