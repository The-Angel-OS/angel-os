import type { CollectionConfig } from 'payload'

export const TokenBalances: CollectionConfig = {
  slug: 'token-balances',
  admin: {
    useAsTitle: 'displayName',
    description: 'Current Angel Token balances for all users across the network',
    defaultColumns: ['user', 'angelTokens', 'karmaCoins', 'legacyTokens', 'lastUpdated'],
    group: 'Platform Management',
    hidden: ({ user }) => {
      // Only show to Host (Super Admin) users, like DNN
      return (user as any)?.globalRole !== 'super_admin'
    },
  },
  access: {
    // Users can read their own balances, admins can see all
    create: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    read: ({ req, data }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      return req.user?.id === data?.user
    },
    update: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    delete: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
  },
  fields: [
    // User Reference
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: {
        description: 'User whose balances are tracked',
      },
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        description: 'Cached display name for quick reference',
        readOnly: true,
      },
    },

    // Current Balances
    {
      name: 'angelTokens',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Current Angel Tokens (AT) balance',
      },
    },
    {
      name: 'karmaCoins',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Current Karma Coins (KC) balance',
      },
    },
    {
      name: 'legacyTokens',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Current Legacy Tokens (LT) balance',
      },
    },

    // Tenant-Specific Balances
    {
      name: 'tenantBalances',
      type: 'array',
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
        },
        {
          name: 'tenantTokens',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'localCurrency',
          type: 'text',
          admin: {
            description: 'Tenant-specific currency name',
          },
        },
      ],
      admin: {
        description: 'Balances in tenant-specific currencies',
      },
    },

    // Network Distribution
    {
      name: 'networkDistribution',
      type: 'array',
      fields: [
        {
          name: 'node',
          type: 'relationship',
          relationTo: 'angel-os-nodes',
          required: true,
        },
        {
          name: 'angelTokens',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'karmaCoins',
          type: 'number',
          defaultValue: 0,
        },
      ],
      admin: {
        description: 'Token distribution across Angel OS nodes',
      },
    },

    // Lifetime Statistics
    {
      name: 'lifetime',
      type: 'group',
      fields: [
        {
          name: 'totalEarned',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total tokens earned (all types)',
            readOnly: true,
          },
        },
        {
          name: 'totalSpent',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total tokens spent (all types)',
            readOnly: true,
          },
        },
        {
          name: 'transactionCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of token transactions',
            readOnly: true,
          },
        },
        {
          name: 'firstEarned',
          type: 'date',
          admin: {
            description: 'Date of first token transaction',
            readOnly: true,
          },
        },
      ],
    },

    // Human Worth Profile
    {
      name: 'worthProfile',
      type: 'group',
      fields: [
        {
          name: 'averageHumanWorth',
          type: 'number',
          admin: {
            description: 'Average human worth index across all transactions',
            readOnly: true,
          },
        },
        {
          name: 'peakHumanWorth',
          type: 'number',
          admin: {
            description: 'Highest single human worth index achieved',
            readOnly: true,
          },
        },
        {
          name: 'contributionCategories',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Guardian Angel Service', value: 'guardian_service' },
            { label: 'Community Contribution', value: 'community_contribution' },
            { label: 'Creative Output', value: 'creative_output' },
            { label: 'Cross-Cultural Bridge', value: 'cultural_bridge' },
            { label: 'Knowledge Sharing', value: 'knowledge_sharing' },
            { label: 'Network Federation', value: 'network_federation' },
          ],
          admin: {
            description: 'Primary contribution categories',
            readOnly: true,
          },
        },
      ],
    },

    // Validation Status
    {
      name: 'validationLevel',
      type: 'select',
      required: true,
      options: [
        { label: 'Unverified', value: 'unverified' },
        { label: 'Community Validated', value: 'community_validated' },
        { label: 'Guardian Angel Verified', value: 'guardian_verified' },
        { label: 'Network Consensus', value: 'network_consensus' },
      ],
      defaultValue: 'unverified',
    },

    // Exchange Capabilities
    {
      name: 'exchangeRights',
      type: 'group',
      fields: [
        {
          name: 'canExchangeToFiat',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Authorized to exchange tokens for fiat currency',
          },
        },
        {
          name: 'canCrossTenantExchange',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Can exchange tokens across tenants',
          },
        },
        {
          name: 'canNetworkExchange',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Can participate in cross-network exchanges',
          },
        },
      ],
    },

    // Metadata
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        description: 'Last balance update timestamp',
        readOnly: true,
      },
    },
    {
      name: 'lastTransactionId',
      type: 'text',
      admin: {
        description: 'ID of most recent token transaction',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          // Cache user display name
          if (data.user) {
            try {
              const user = await req.payload.findByID({
                collection: 'users',
                id: data.user,
              })
              data.displayName = `${user.firstName} ${user.lastName}`.trim() || user.email
            } catch (error) {
              console.error('Failed to fetch user for display name:', error)
            }
          }

          // Update timestamp
          data.lastUpdated = new Date().toISOString()
        }

        return data
      },
    ],
  },
}
