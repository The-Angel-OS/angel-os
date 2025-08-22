import type { CollectionConfig } from 'payload'

export const SpaceMemberships: CollectionConfig = {
  slug: 'space-memberships',
  admin: {
    useAsTitle: 'role',
    defaultColumns: ['user', 'space', 'role', 'status', 'engagementScore'],
    group: 'User Management',
    description: 'User participation and engagement within specific spaces',
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

      // Users can read their own memberships
      if (req.user?.id) {
        return {
          user: {
            equals: req.user.id,
          },
        }
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
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'The space this membership provides access to',
      },
    },
    {
      name: 'tenantMembership',
      type: 'relationship',
      relationTo: 'tenant-memberships',
      admin: {
        description: 'Related tenant membership (user must be a tenant member)',
      },
    },

    // Role & Permissions
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Space Admin', value: 'space_admin' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Member', value: 'member' },
        { label: 'Guest', value: 'guest' },
      ],
      defaultValue: 'member',
      admin: {
        description: 'Role within this specific space',
      },
    },
    {
      name: 'customPermissions',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Post Messages', value: 'post_messages' },
        { label: 'Upload Files', value: 'upload_files' },
        { label: 'Create Events', value: 'create_events' },
        { label: 'Moderate Content', value: 'moderate_content' },
        { label: 'Manage Members', value: 'manage_members' },
        { label: 'View Analytics', value: 'view_analytics' },
        { label: 'Manage Bookings', value: 'manage_bookings' },
        { label: 'Access Private Content', value: 'access_private' },
      ],
      admin: {
        description: 'Custom permissions for this space membership',
      },
    },

    // Membership Status
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Left', value: 'left' },
        { label: 'Banned', value: 'banned' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Current status of this space membership',
      },
    },
    {
      name: 'joinedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'When the user joined this space',
      },
    },

    // CRM Integration
    {
      name: 'crmData',
      type: 'group',
      label: 'CRM Data',
      fields: [
        {
          name: 'leadScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Lead scoring for sales qualification (0-100)',
          },
        },
        {
          name: 'customerTier',
          type: 'select',
          options: [
            { label: 'Prospect', value: 'prospect' },
            { label: 'Lead', value: 'lead' },
            { label: 'Customer', value: 'customer' },
            { label: 'VIP', value: 'vip' },
          ],
          admin: {
            description: 'Customer classification level',
          },
        },
        {
          name: 'tags',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'CRM tags for categorization',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'CRM notes about this member',
          },
        },
        {
          name: 'lastInteraction',
          type: 'date',
          admin: {
            description: 'Last meaningful interaction date',
            readOnly: true,
          },
        },
        {
          name: 'conversionEvents',
          type: 'array',
          fields: [
            {
              name: 'event',
              type: 'text',
              required: true,
              admin: {
                description: 'Type of conversion event',
              },
            },
            {
              name: 'timestamp',
              type: 'date',
              required: true,
              admin: {
                description: 'When the event occurred',
              },
            },
            {
              name: 'value',
              type: 'number',
              admin: {
                description: 'Monetary value of the event (optional)',
              },
            },
          ],
          admin: {
            description: 'Track conversion events and their values',
          },
        },
      ],
    },

    // Engagement Metrics
    {
      name: 'engagementMetrics',
      type: 'group',
      label: 'Engagement Metrics',
      admin: {
        description: 'Automatically tracked engagement data',
      },
      fields: [
        {
          name: 'messagesCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total messages posted in this space',
            readOnly: true,
          },
        },
        {
          name: 'lastActive',
          type: 'date',
          admin: {
            description: 'Last activity in this space',
            readOnly: true,
          },
        },
        {
          name: 'totalTimeSpent',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total time spent in space (minutes)',
            readOnly: true,
          },
        },
        {
          name: 'contentCreated',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Amount of content created',
            readOnly: true,
          },
        },
        {
          name: 'eventsAttended',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of events attended',
            readOnly: true,
          },
        },
        {
          name: 'engagementScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Calculated engagement score (0-100)',
            readOnly: true,
          },
        },
      ],
    },

    // Preferences
    {
      name: 'notificationSettings',
      type: 'group',
      label: 'Notification Settings',
      fields: [
        {
          name: 'mentions',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Notify when mentioned in this space',
          },
        },
        {
          name: 'directMessages',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow direct messages from space members',
          },
        },
        {
          name: 'announcements',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive space announcements',
          },
        },
        {
          name: 'events',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Notify about space events',
          },
        },
      ],
    },

    // Space-specific Profile
    {
      name: 'spaceProfile',
      type: 'group',
      label: 'Space Profile',
      fields: [
        {
          name: 'displayName',
          type: 'text',
          admin: {
            description: 'Display name within this space (optional override)',
          },
        },
        {
          name: 'spaceBio',
          type: 'textarea',
          admin: {
            description: 'Bio specific to this space context',
          },
        },
        {
          name: 'interests',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Interests relevant to this space',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data }) => {
        // Calculate engagement score before saving
        if (data?.engagementMetrics) {
          const metrics = data.engagementMetrics
          let score = 0

          // Weight different engagement factors
          if (metrics.messagesCount) score += Math.min(metrics.messagesCount * 2, 30)
          if (metrics.contentCreated) score += Math.min(metrics.contentCreated * 5, 25)
          if (metrics.eventsAttended) score += Math.min(metrics.eventsAttended * 10, 20)
          if (metrics.totalTimeSpent) score += Math.min(metrics.totalTimeSpent / 60, 15) // Convert minutes to hours

          // Recent activity bonus
          if (metrics.lastActive) {
            const daysSinceActive = (Date.now() - new Date(metrics.lastActive).getTime()) / (1000 * 60 * 60 * 24)
            if (daysSinceActive < 1) score += 10
            else if (daysSinceActive < 7) score += 5
          }

          data.engagementMetrics.engagementScore = Math.min(Math.round(score), 100)
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Log membership changes for auditing
        console.log(`SpaceMembership ${operation}: User ${doc.user} - Space ${doc.space} - Role: ${doc.role} - Status: ${doc.status}`)

        // Handle status changes
        if (operation === 'update' && previousDoc?.status !== doc.status) {
          if (doc.status === 'active' && previousDoc?.status === 'pending') {
            console.log(`User joined space: ${doc.space}`)
            // TODO: Send welcome message to space
          } else if (doc.status === 'left') {
            console.log(`User left space: ${doc.user} left ${doc.space}`)
            // TODO: Handle cleanup tasks
          }
        }

        // Update last interaction for CRM
        if (operation === 'update') {
          try {
            await req.payload.update({
              collection: 'space-memberships',
              id: doc.id,
              data: {
                crmData: {
                  ...doc.crmData,
                  lastInteraction: new Date(),
                },
                engagementMetrics: {
                  ...doc.engagementMetrics,
                  lastActive: new Date(),
                },
              },
            })
          } catch (error) {
            console.error('Failed to update interaction timestamp:', error)
          }
        }
      },
    ],
  },
  indexes: [
    {
      fields: ['user', 'space'],
      unique: true,
    },
    {
      fields: ['space', 'role'],
    },
    {
      fields: ['status'],
    },
  ],
  timestamps: true,
}
 
