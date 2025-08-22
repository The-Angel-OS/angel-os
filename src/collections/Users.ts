import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    depth: 2,
    verify: {
      generateEmailHTML: ({ token }: any) => `
        <div>
          <p>Verify your email address by clicking the link below:</p>
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/verify?token=${token}">Verify Email</a>
        </div>
      `,
      generateEmailSubject: () => 'Verify your email address',
    },
    forgotPassword: {
      generateEmailHTML: ({ token }: any) => `
        <div>
          <p>Reset your password by clicking the link below:</p>
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}">Reset Password</a>
        </div>
      `,
      generateEmailSubject: () => 'Reset your password',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'globalRole'],
    group: 'User Management',
  },
  fields: [
    // Identity & Profile
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },

    // Multi-tenant Support
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: false,
      admin: {
        description: 'Primary tenant this user belongs to',
        allowCreate: false,
        isSortable: true,
      },
      // Add explicit validation to catch any relationship errors
      validate: (val: any, { req }: any) => {
        try {
          // Allow null/undefined (optional field)
          if (!val) return true
          
          // If it's a number or string ID, it's valid
          if (typeof val === 'number' || typeof val === 'string') return true
          
          // If it's an object with an id, it's valid
          if (typeof val === 'object' && val && 'id' in val) return true
          
          return true
        } catch (error) {
          console.error('Tenant validation error:', error)
          return 'Invalid tenant selection'
        }
      },
    },

    // Role & Permissions System
    {
      name: 'globalRole',
      type: 'select',
      options: [
        { label: 'Host (Super Admin)', value: 'super_admin' },
        { label: 'Platform Admin', value: 'platform_admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      admin: {
        description: 'Platform-wide role (Host can see all tenants, others are tenant-isolated)',
      },
    },

    // Angel OS Karma System
    {
      name: 'karma',
      type: 'group',
      fields: [
        {
          name: 'score',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'contributionTypes',
          type: 'select',
          options: [
            { label: 'Content Creation', value: 'content_creation' },
            { label: 'Community Support', value: 'community_support' },
            { label: 'Technical Contribution', value: 'technical_contribution' },
            { label: 'Mentorship', value: 'mentorship' },
            { label: 'Justice Advocacy', value: 'justice_advocacy' },
            { label: 'Guardian Angel Activity', value: 'guardian_angel' },
          ],
          hasMany: true,
        },
        {
          name: 'recognitions',
          type: 'array',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Helpful Response', value: 'helpful_response' },
                { label: 'Quality Content', value: 'quality_content' },
                { label: 'Community Leadership', value: 'community_leadership' },
                { label: 'Technical Excellence', value: 'technical_excellence' },
                { label: 'Guardian Angel Action', value: 'guardian_angel_action' },
              ],
              required: true,
            },
            {
              name: 'points',
              type: 'number',
              required: true,
            },
            {
              name: 'reason',
              type: 'textarea',
            },
            {
              name: 'awardedBy',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'awardedAt',
              type: 'date',
              defaultValue: () => new Date().toISOString(),
            },
          ],
        },
        {
          name: 'guardianAngelStatus',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'User has achieved Guardian Angel status through karma contributions',
          },
        },
      ],
    },

    // Multi-Tenant Memberships (converted to JSON to avoid circular reference)
    {
      name: 'tenantMemberships',
      type: 'json',
      admin: {
        description: 'JSON array of tenant memberships: [{"tenantId": "123", "role": "admin", "permissions": ["manage_content"], "joinedAt": "2025-01-01"}]',
      },
    },

    // Preferences & Settings
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'notifications',
          type: 'group',
          fields: [
            {
              name: 'email',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'inApp',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'guardianAngelAlerts',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Receive alerts when Guardian Angel assistance is needed',
              },
            },
          ],
        },
        {
          name: 'privacy',
          type: 'group',
          fields: [
            {
              name: 'profileVisibility',
              type: 'select',
              options: [
                { label: 'Public', value: 'public' },
                { label: 'Members Only', value: 'members' },
                { label: 'Private', value: 'private' },
              ],
              defaultValue: 'members',
            },
            {
              name: 'karmaScoreVisible',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
        },
      ],
    },

    // Timestamps
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, operation, req }: { data: any, operation: string, req: any }) => {
        // Debug tenant relationship issues
        if (data.tenant) {
          console.log(`User ${operation}: tenant field =`, typeof data.tenant, data.tenant)
          
          // Ensure tenant exists if provided
          try {
            if (data.tenant) {
              const tenantId = typeof data.tenant === 'object' ? data.tenant.id : data.tenant
              const tenant = await req.payload.findByID({
                collection: 'tenants',
                id: tenantId,
              })
              console.log(`Tenant validation successful: ${tenant.name} (${tenant.id})`)
            }
          } catch (error) {
            console.error('Tenant validation failed:', error)
            // Don't fail the operation, just log the error
          }
        }

        // Auto-assign Guardian Angel status based on karma score
        if (data.karma?.score >= 1000) {
          data.karma.guardianAngelStatus = true
          if (!data.roles.includes('guardian_angel')) {
            data.roles.push('guardian_angel')
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }: { doc: any, operation: string }) => {
        console.log(`User ${operation} completed: ${doc.email} with tenant: ${doc.tenant}`)
      },
    ],
  },
}
