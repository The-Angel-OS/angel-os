import type { CollectionConfig } from 'payload'

export const TenantMemberships: CollectionConfig = {
  slug: 'tenant-memberships',
  admin: {
    useAsTitle: 'role',
    defaultColumns: ['user', 'tenant', 'role', 'status', 'joinedAt'],
    group: 'User Management',
    description: 'User memberships and roles within specific tenants',
  },
  access: {
    create: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      // Note: Tenant-specific access should be implemented using proper tenant membership queries
      return false
    },
    read: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      // TODO: Implement proper tenant-based access using TenantMemberships
      if ((req.user as any)?.globalRole === 'platform_admin') return true
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
    // Core Relationships
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The user this membership belongs to',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'The tenant this membership provides access to',
      },
    },

    // Role & Permissions
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Administrator', value: 'tenant_admin' },
        { label: 'Editor', value: 'tenant_manager' },
        { label: 'Registered User', value: 'tenant_member' },
        { label: 'Subscriber', value: 'subscriber' },
      ],
      defaultValue: 'subscriber',
      admin: {
        description: 'Role within this specific tenant',
      },
    },
    {
      name: 'permissions',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Manage Users', value: 'manage_users' },
        { label: 'Manage Spaces', value: 'manage_spaces' },
        { label: 'Manage Content', value: 'manage_content' },
        { label: 'Manage Products', value: 'manage_products' },
        { label: 'Manage Orders', value: 'manage_orders' },
        { label: 'View Analytics', value: 'view_analytics' },
        { label: 'Manage Settings', value: 'manage_settings' },
        { label: 'Manage Billing', value: 'manage_billing' },
        { label: 'Export Data', value: 'export_data' },
      ],
      admin: {
        description: 'Custom permissions for this membership',
      },
    },

    // Membership Details
    {
      name: 'joinedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'When the user joined this tenant',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Who invited this user to the tenant',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Revoked', value: 'revoked' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Current status of this membership',
      },
    },

    // Tenant-specific Profile
    {
      name: 'tenantProfile',
      type: 'group',
      label: 'Tenant-Specific Profile',
      fields: [
        {
          name: 'displayName',
          type: 'text',
          admin: {
            description: 'Display name within this tenant (optional override)',
          },
        },
        {
          name: 'tenantBio',
          type: 'textarea',
          admin: {
            description: 'Bio specific to this tenant context',
          },
        },
        {
          name: 'department',
          type: 'text',
          admin: {
            description: 'Department or team within the tenant',
          },
        },
        {
          name: 'position',
          type: 'text',
          admin: {
            description: 'Position or role title within the tenant',
          },
        },
      ],
    },

    // Invitation Details
    {
      name: 'invitationDetails',
      type: 'group',
      label: 'Invitation Details',
      admin: {
        condition: (data) => data.status === 'pending',
      },
      fields: [
        {
          name: 'invitationToken',
          type: 'text',
          admin: {
            description: 'Unique token for invitation acceptance',
            readOnly: true,
          },
        },
        {
          name: 'invitationExpiresAt',
          type: 'date',
          admin: {
            description: 'When the invitation expires',
          },
        },
        {
          name: 'invitationMessage',
          type: 'textarea',
          admin: {
            description: 'Custom message included with the invitation',
          },
        },
      ],
    },

    // Activity Tracking
    {
      name: 'lastActiveAt',
      type: 'date',
      admin: {
        description: 'Last activity within this tenant',
        readOnly: true,
      },
    },
    {
      name: 'activityMetrics',
      type: 'group',
      label: 'Activity Metrics',
      admin: {
        description: 'Automatically tracked activity within this tenant',
      },
      fields: [
        {
          name: 'loginCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of logins to this tenant',
            readOnly: true,
          },
        },
        {
          name: 'spacesJoined',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of spaces joined within this tenant',
            readOnly: true,
          },
        },
        {
          name: 'contentCreated',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Amount of content created within this tenant',
            readOnly: true,
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        // Generate invitation token for new pending memberships
        if (operation === 'create' && data?.status === 'pending' && !data?.invitationDetails?.invitationToken) {
          const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

          if (!data.invitationDetails) {
            data.invitationDetails = {}
          }

          data.invitationDetails.invitationToken = token

          // Set expiration to 7 days from now if not specified
          if (!data.invitationDetails.invitationExpiresAt) {
            const expirationDate = new Date()
            expirationDate.setDate(expirationDate.getDate() + 7)
            data.invitationDetails.invitationExpiresAt = expirationDate.toISOString()
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Log membership changes for auditing
        console.log(`TenantMembership ${operation}: User ${doc.user} - Tenant ${doc.tenant} - Role: ${doc.role} - Status: ${doc.status}`)

        // Handle status changes
        if (operation === 'update' && previousDoc?.status !== doc.status) {
          if (doc.status === 'active' && previousDoc?.status === 'pending') {
            console.log(`User accepted invitation to tenant: ${doc.tenant}`)
            // TODO: Send welcome notification
          } else if (doc.status === 'suspended') {
            console.log(`User membership suspended: ${doc.user} in tenant ${doc.tenant}`)
            // TODO: Notify user and admin
          }
        }

        // Update activity tracking - skip during creation to avoid conflicts
        if (operation === 'update') {
          try {
            await req.payload.update({
              collection: 'tenant-memberships',
              id: doc.id,
              data: {
                lastActiveAt: new Date().toISOString(),
              },
            })
          } catch (error) {
            console.error('Failed to update last active timestamp:', error)
          }
        }
      },
    ],
  },
  indexes: [
    {
      fields: ['user', 'tenant'],
      unique: true,
    },
    {
      fields: ['tenant', 'role'],
    },
    {
      fields: ['status'],
    },
  ],
  timestamps: true,
}
