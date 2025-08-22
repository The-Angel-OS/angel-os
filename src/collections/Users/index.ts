import type { CollectionConfig, Where } from 'payload'
import type { UserPreferences } from '../../types/user-preferences'
import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: ({ req }) => {
      // Super admins can create any user
      if ((req.user as any)?.globalRole === 'super_admin') return true

      // Platform admins can create users
      if ((req.user as any)?.globalRole === 'platform_admin') return true

      return false
    },
    delete: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true

      // Platform admins can delete users
      if ((req.user as any)?.globalRole === 'platform_admin') {
        return true
      }

      return false
    },
    read: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true

      // Platform admins can read all users
      if ((req.user as any)?.globalRole === 'platform_admin') {
        return true
      }

      // Other users can only read their own data
      if (req.user?.id) {
        return {
          id: {
            equals: req.user.id,
          },
        } as Where
      }

      // If no user or user ID, return false
      return false
    },
    update: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true

      // Users can update their own data
      if (req.user?.id) {
        return {
          id: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
  },
  admin: {
    defaultColumns: ['firstName', 'lastName', 'email', 'globalRole', 'isVerified'],
    useAsTitle: 'email',
    group: 'User Management',
    description: 'Platform users with professional profiles and verification',
  },
  auth: true,
  fields: [
    // Core Identity
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'User\'s first name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        description: 'User\'s last name',
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.firstName && data?.lastName) {
              return `${data.firstName} ${data.lastName}`
            }
            return data?.name
          },
        ],
      },
    },
    {
      name: 'username',
      type: 'text',
      unique: true,
      admin: {
        description: 'Unique username (optional)',
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Full name (computed from firstName + lastName)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data?.firstName && data?.lastName) {
              return `${data.firstName} ${data.lastName}`
            }
            return data?.name
          },
        ],
      },
    },

    // Role System
    {
      name: 'globalRole',
      type: 'select',
      required: true,
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Platform Admin', value: 'platform_admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      admin: {
        description: 'Global platform role - determines system-wide access',
      },
    },

    // Multi-Tenant Support
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this user belongs to - determines data access scope',
        condition: (data) => data.globalRole !== 'super_admin', // Super admins don't need tenants
      },
      access: {
        update: ({ req }) => {
          // Only admins can change tenant assignments
          return (req.user as any)?.globalRole === 'super_admin' || (req.user as any)?.globalRole === 'platform_admin'
        },
      },
      hooks: {
        beforeValidate: [
          ({ req, data, operation }) => {
            // Auto-assign tenant for regular users during creation
            if (operation === 'create' && data?.globalRole === 'user') {
              // In a real implementation, you'd determine tenant from context
              // For now, we'll let admins assign it manually
              return data?.tenant
            }
            return data?.tenant
          },
        ],
      },
    },

    // Professional Profile
    {
      name: 'professionalProfile',
      type: 'group',
      label: 'Professional Profile',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Professional title or position',
          },
        },
        {
          name: 'company',
          type: 'text',
          admin: {
            description: 'Company or organization',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
          admin: {
            description: 'Professional bio or description',
          },
        },
        {
          name: 'website',
          type: 'text',
          admin: {
            description: 'Personal or professional website',
          },
        },
        {
          name: 'socialLinks',
          type: 'group',
          fields: [
            {
              name: 'linkedin',
              type: 'text',
              admin: {
                description: 'LinkedIn profile URL',
              },
            },
            {
              name: 'twitter',
              type: 'text',
              admin: {
                description: 'Twitter/X profile URL',
              },
            },
            {
              name: 'github',
              type: 'text',
              admin: {
                description: 'GitHub profile URL',
              },
            },
          ],
        },
        {
          name: 'skills',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Professional skills and expertise',
          },
        },
        {
          name: 'certifications',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Professional certifications',
          },
        },
      ],
    },

    // System Fields
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this user account is active',
      },
      access: {
        update: ({ req }) => (req.user as any)?.globalRole === 'super_admin' || (req.user as any)?.globalRole === 'platform_admin',
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last login timestamp',
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile picture',
      },
    },

    // Privacy & Preferences
    {
      name: 'privacySettings',
      type: 'group',
      label: 'Privacy Settings',
      fields: [
        {
          name: 'profileVisibility',
          type: 'select',
          options: [
            { label: 'Public', value: 'public' },
            { label: 'Members Only', value: 'members_only' },
            { label: 'Private', value: 'private' },
          ],
          defaultValue: 'members_only',
          admin: {
            description: 'Who can view your profile',
          },
        },
        {
          name: 'allowDirectMessages',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow other users to send direct messages',
          },
        },
        {
          name: 'showOnlineStatus',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show when you are online',
          },
        },
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive email notifications',
          },
        },
      ],
    },

    // Verification & Trust
    {
      name: 'isVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this user is verified',
      },
      access: {
        update: ({ req }) => (req.user as any)?.globalRole === 'super_admin' || (req.user as any)?.globalRole === 'platform_admin',
      },
    },
    {
      name: 'verificationLevel',
      type: 'select',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'Identity', value: 'identity' },
        { label: 'Business', value: 'business' },
      ],
      defaultValue: 'email',
      admin: {
        description: 'Level of verification completed',
        condition: (data) => data.isVerified === true,
      },
    },
    {
      name: 'trustScore',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Algorithmic trust score (0-100)',
        readOnly: true,
      },
    },

    // Stripe Connect Integration (for creator payments)
    {
      name: 'stripeConnect',
      type: 'group',
      label: 'Payment Account',
      admin: {
        description: 'Stripe Connect account for receiving payments as a creator',
      },
      fields: [
        {
          name: 'stripeConnectAccountId',
          type: 'text',
          admin: {
            description: 'Stripe Connect account ID',
            readOnly: true,
          },
        },
        {
          name: 'stripeAccountStatus',
          type: 'select',
          options: [
            { label: 'Not Created', value: 'none' },
            { label: 'Created', value: 'created' },
            { label: 'Pending Verification', value: 'pending_verification' },
            { label: 'Active', value: 'active' },
            { label: 'Deauthorized', value: 'deauthorized' },
            { label: 'Rejected', value: 'rejected' },
          ],
          defaultValue: 'none',
          admin: {
            description: 'Status of Stripe Connect account',
            readOnly: true,
          },
        },
        {
          name: 'stripeAccountData',
          type: 'json',
          admin: {
            description: 'Stripe account details and capabilities',
            readOnly: true,
          },
        },
        {
          name: 'payoutsEnabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether account can receive payouts',
            readOnly: true,
          },
        },
        {
          name: 'chargesEnabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether account can accept payments',
            readOnly: true,
          },
        },
        {
          name: 'onboardingCompletedAt',
          type: 'date',
          admin: {
            description: 'When Stripe Connect onboarding was completed',
            readOnly: true,
          },
        },
      ],
    },

    // User Preferences
    {
      name: 'timezone',
      type: 'select',
      options: [
        { label: 'Eastern (EST/EDT)', value: 'America/New_York' },
        { label: 'Central (CST/CDT)', value: 'America/Chicago' },
        { label: 'Mountain (MST/MDT)', value: 'America/Denver' },
        { label: 'Pacific (PST/PDT)', value: 'America/Los_Angeles' },
      ],
      defaultValue: 'America/New_York',
    },
    {
      name: 'theme',
      type: 'select',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Auto', value: 'auto' },
      ],
      defaultValue: 'auto',
    },
    // New JSON field for user preferences
    {
      name: 'preferences',
      label: 'User Preferences (JSON)',
      type: 'json',
      admin: {
        description: 'Consolidated user preferences, including activity log, theme, timezone, and privacy settings. Managed programmatically.',
        readOnly: false, // Allow programmatic updates. Could be true if only scripts should edit.
        // components: {
        //  Field: CustomJsonViewComponent, // For better visualization
        // },
      },
      //型: 'UserPreferences', // Comment for type definition
      // TODO MIGRATE_TO_JSON: Queries for user activity, theme, timezone, or privacy settings
      // that previously targeted distinct fields (like `theme`, `timezone`, `privacySettings` group)
      // must now query this 'preferences' field.
      // Example: To get user theme, query `Users.preferences.theme`.
      // Activity log data, if populated, will be in `Users.preferences.activityLog`.
      // Use/develop helpers in `src/utilities/json-query-helpers.ts`.
      validate: (value: unknown) => {
        if (value && typeof value !== 'object') {
          return 'Preferences must be a valid JSON object or null.';
        }
        // Further validation for UserPreferences structure could be added here.
        return true;
      },
    },
    {
      name: '_migrationStatus',
      type: 'group',
      admin: {
        condition: () => false, // Hidden from Admin UI
        description: 'Tracks the status of JSON data migration for this user.',
      },
      fields: [
        { name: 'jsonMigrated', type: 'checkbox', defaultValue: false },
        { name: 'migratedAt', type: 'date' },
        { name: 'migrationVersion', type: 'text' },
      ],
    },
  ],
  hooks: {
    beforeLogin: [
      async ({ user, req }) => {
        // Update last login timestamp
        if (user.id) {
          try {
            await req.payload.update({
              collection: 'users',
              id: user.id,
              data: {
                lastLoginAt: new Date().toISOString(),
              },
            })
          } catch (error) {
            console.error('Failed to update login timestamp:', error)
          }
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Log user changes for auditing
        console.log(
          `User ${operation}: ${doc.email} (${doc.globalRole})`,
        )

        // Sync name field
        if (operation === 'create' || operation === 'update') {
          if (doc.firstName && doc.lastName && doc.name !== `${doc.firstName} ${doc.lastName}`) {
            try {
              await req.payload.update({
                collection: 'users',
                id: doc.id,
                data: {
                  // name field removed - not available on User type
                },
              })
            } catch (error) {
              console.error('Failed to sync name field:', error)
            }
          }
        }

        // Send welcome emails for new users
        if (operation === 'create') {
          console.log(`New user registered: ${doc.email}`)
        }
      },
    ],
  },
  timestamps: true,
}
