import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const LinkedAccounts: CollectionConfig = {
  slug: 'linked-accounts',
  labels: {
    singular: 'Linked Account',
    plural: 'Linked Accounts',
  },
  admin: {
    useAsTitle: 'provider',
    group: 'Communication',
    description: 'Secure OAuth token storage for third-party integrations',
    defaultColumns: ['provider', 'user', 'expiresAt', 'createdAt'],
  },
  access: {
    create: authenticated,
    read: ({ req }) => {
      // Users can only read their own linked accounts
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
    update: ({ req }) => {
      // Users can only update their own linked accounts
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
    delete: ({ req }) => {
      // Users can only delete their own linked accounts
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return {
        user: {
          equals: req.user?.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'provider',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Discord', value: 'discord' },
        { label: 'WhatsApp Business', value: 'whatsapp' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'GitHub', value: 'github' },
      ],
      admin: {
        description: 'Social media platform provider',
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      required: true,
      admin: {
        description: 'Encrypted OAuth access token',
        components: {
          Field: {
            path: '/components/EncryptedField',
          },
        },
      },
    },
    {
      name: 'refreshToken',
      type: 'text',
      admin: {
        description: 'Encrypted OAuth refresh token',
        components: {
          Field: {
            path: '/components/EncryptedField',
          },
        },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'When the access token expires',
      },
    },
    {
      name: 'scope',
      type: 'text',
      admin: {
        description: 'OAuth scopes granted',
      },
    },
    {
      name: 'providerAccountId',
      type: 'text',
      admin: {
        description: 'Provider-specific account ID',
      },
    },
    {
      name: 'providerAccountData',
      type: 'json',
      admin: {
        description: 'Additional provider account metadata',
      },
    },
    // Link to the user who owns this account
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'User who owns this linked account',
      },
    },
    // Tenant relationship for multi-tenancy
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Tenant that owns this linked account',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Revoked', value: 'revoked' },
        { label: 'Error', value: 'error' },
      ],
      admin: {
        description: 'Current account status',
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      admin: {
        description: 'When this account was last used',
        readOnly: true,
      },
    },
    {
      name: 'errorMessage',
      type: 'text',
      admin: {
        description: 'Last error message if status is error',
        condition: (data) => data.status === 'error',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Import encryption utilities
        const { encrypt } = await import('../utilities/encryption')
        
        if (operation === 'create' || operation === 'update') {
          // Encrypt tokens before saving to database
          if (data.accessToken && typeof data.accessToken === 'string') {
            data.accessToken = encrypt(data.accessToken)
          }
          if (data.refreshToken && typeof data.refreshToken === 'string') {
            data.refreshToken = encrypt(data.refreshToken)
          }
        }
        
        return data
      },
    ],
    afterRead: [
      async ({ doc }) => {
        // Note: We don't decrypt on read for security reasons
        // Decryption should only happen in secure server contexts when needed
        return doc
      },
    ],
  },
  timestamps: true,
} 