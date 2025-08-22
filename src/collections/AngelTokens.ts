import type { CollectionConfig } from 'payload'

export const AngelTokens: CollectionConfig = {
  slug: 'angel-tokens',
  admin: {
    useAsTitle: 'tokenId',
    description: 'Angel Token blockchain transactions and balances',
    defaultColumns: ['tokenId', 'holder', 'tokenType', 'amount', 'source'],
    group: 'Platform Management',
    hidden: ({ user }) => {
      // Only show to Host (Super Admin) users, like DNN
      return (user as any)?.globalRole !== 'super_admin'
    },
  },
  access: {
    // Angel Tokens are readable by all authenticated users but only created by system
    create: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    read: ({ req }) => !!req.user, // All authenticated users can read
    update: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
    delete: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
  },
  fields: [
    // Core Token Identity
    {
      name: 'tokenId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique token transaction identifier',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return `AT-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
            }
            return value
          },
        ],
      },
    },
    {
      name: 'blockHash',
      type: 'text',
      admin: {
        description: 'Angel Chain block hash containing this transaction',
      },
    },

    // Token Classification
    {
      name: 'tokenType',
      type: 'select',
      required: true,
      options: [
        { label: 'Angel Tokens (AT)', value: 'angel_tokens' },
        { label: 'Karma Coins (KC)', value: 'karma_coins' },
        { label: 'Legacy Tokens (LT)', value: 'legacy_tokens' },
        { label: 'Tenant Tokens', value: 'tenant_tokens' },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Token amount (positive for earning, negative for spending)',
      },
    },
    {
      name: 'balance',
      type: 'number',
      required: true,
      admin: {
        description: 'Running balance after this transaction',
        readOnly: true,
      },
    },

    // Ownership & Network Context
    {
      name: 'holder',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who holds/receives these tokens',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        description: 'Tenant context (for tenant-specific tokens)',
      },
    },
    {
      name: 'sourceNode',
      type: 'relationship',
      relationTo: 'angel-os-nodes',
      admin: {
        description: 'Angel OS node where tokens were earned/spent',
      },
    },

    // Human Worth Calculation (Proof of Human Worth)
    {
      name: 'humanWorthMetrics',
      type: 'group',
      fields: [
        {
          name: 'karmaScore',
          type: 'number',
          admin: {
            description: 'Karma points contributing to this token award',
          },
        },
        {
          name: 'communityImpact',
          type: 'number',
          admin: {
            description: 'Measured real-world positive outcome score',
          },
        },
        {
          name: 'creativityIndex',
          type: 'number',
          admin: {
            description: 'Originality and innovation score',
          },
        },
        {
          name: 'collaborationRating',
          type: 'number',
          admin: {
            description: 'Cross-cultural cooperation factor',
          },
        },
        {
          name: 'consistencyFactor',
          type: 'number',
          admin: {
            description: 'Long-term positive behavior bonus',
          },
        },
        {
          name: 'humanWorthIndex',
          type: 'number',
          admin: {
            description: 'Final calculated human worth score',
            readOnly: true,
          },
        },
      ],
    },

    // Transaction Source & Verification
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Guardian Angel Service', value: 'guardian_service' },
        { label: 'Community Contribution', value: 'community_contribution' },
        { label: 'Creative Output', value: 'creative_output' },
        { label: 'Cross-Cultural Bridge', value: 'cultural_bridge' },
        { label: 'Knowledge Sharing', value: 'knowledge_sharing' },
        { label: 'Network Federation', value: 'network_federation' },
        { label: 'Platform Service', value: 'platform_service' },
        { label: 'Token Exchange', value: 'token_exchange' },
        { label: 'Governance Participation', value: 'governance' },
      ],
    },
    {
      name: 'sourceDescription',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of how tokens were earned/spent',
      },
    },
    {
      name: 'evidenceLinks',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Evidence supporting this token transaction',
      },
    },

    // Community Validation (Proof of Human Worth)
    {
      name: 'validation',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            { label: 'Pending Validation', value: 'pending' },
            { label: 'Community Validated', value: 'validated' },
            { label: 'Guardian Angel Verified', value: 'guardian_verified' },
            { label: 'Disputed', value: 'disputed' },
            { label: 'Rejected', value: 'rejected' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'validators',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Community members who validated this contribution',
          },
        },
        {
          name: 'validationTimestamp',
          type: 'date',
          admin: {
            description: 'When validation was completed',
          },
        },
        {
          name: 'validationNotes',
          type: 'textarea',
          admin: {
            description: 'Community validation comments',
          },
        },
      ],
    },

    // Network Federation Context
    {
      name: 'federationData',
      type: 'group',
      fields: [
        {
          name: 'crossNodeTransaction',
          type: 'checkbox',
          admin: {
            description: 'Transaction involves multiple Angel OS nodes',
          },
        },
        {
          name: 'participatingNodes',
          type: 'relationship',
          relationTo: 'angel-os-nodes',
          hasMany: true,
          admin: {
            description: 'Angel OS nodes involved in this transaction',
          },
        },
        {
          name: 'networkConsensus',
          type: 'select',
          options: [
            { label: 'Local Node Only', value: 'local_only' },
            { label: 'Network Consensus Required', value: 'network_consensus' },
            { label: 'Guardian Angel Approved', value: 'guardian_approved' },
            { label: 'Community Validated', value: 'community_validated' },
          ],
          defaultValue: 'local_only',
        },
      ],
    },

    // Exchange & Economics
    {
      name: 'exchangeData',
      type: 'group',
      fields: [
        {
          name: 'exchangeRate',
          type: 'number',
          admin: {
            description: 'Exchange rate at time of transaction (if applicable)',
          },
        },
        {
          name: 'fiatValue',
          type: 'number',
          admin: {
            description: 'Equivalent fiat currency value',
          },
        },
        {
          name: 'realWorldImpact',
          type: 'textarea',
          admin: {
            description: 'Measurable real-world value created',
          },
        },
      ],
    },

    // Metadata
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional transaction metadata',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Calculate human worth index
        if (data.humanWorthMetrics && operation === 'create') {
          const metrics = data.humanWorthMetrics
          const humanWorthIndex = (
            (metrics.karmaScore || 0) * 0.1 +
            (metrics.communityImpact || 0) +
            (metrics.creativityIndex || 0)
          ) * (metrics.collaborationRating || 1) * (metrics.consistencyFactor || 1)
          
          data.humanWorthMetrics.humanWorthIndex = humanWorthIndex
          
          // Set token amount based on human worth
          if (!data.amount) {
            data.amount = Math.floor(humanWorthIndex)
          }
        }

        // Calculate running balance
        if (operation === 'create' && data.holder) {
          try {
            // Get user's current balance for this token type
            const existingTokens = await req.payload.find({
              collection: 'angel-tokens',
              where: {
                holder: { equals: data.holder },
                tokenType: { equals: data.tokenType },
              },
              sort: '-createdAt',
              limit: 1,
            })

            const previousBalance = existingTokens.docs.length > 0 
              ? existingTokens.docs[0]?.balance || 0
              : 0
            
            data.balance = previousBalance + data.amount
          } catch (error) {
            console.error('Failed to calculate token balance:', error)
            data.balance = data.amount
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`💰 Angel Token: ${doc.amount} ${doc.tokenType} awarded to ${doc.holder}`)
          console.log(`🌟 Human Worth Index: ${doc.humanWorthMetrics?.humanWorthIndex || 'N/A'}`)
          
          // Update user's karma score
          if (doc.humanWorthMetrics?.karmaScore) {
            try {
              const user = await req.payload.findByID({
                collection: 'users',
                id: doc.holder,
              })

              await req.payload.update({
                collection: 'users',
                id: doc.holder,
                data: {
                  karma: {
                    ...user.karma,
                    score: (user.karma?.score || 0) + doc.humanWorthMetrics.karmaScore,
                  },
                },
              })
            } catch (error) {
              console.error('Failed to update user karma:', error)
            }
          }

          // TODO: Broadcast to network if cross-node transaction
          // TODO: Update network token supply metrics
          // TODO: Trigger Guardian Angel validation if required
        }
      },
    ],
  },
}
