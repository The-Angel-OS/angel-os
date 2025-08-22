import type { CollectionConfig } from 'payload'

const Phyles: CollectionConfig = {
  slug: 'phyles',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phyleType', 'memberCount', 'totalEarnings', 'reputationScore'],
    group: 'System',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'phyleType',
      type: 'select',
      required: true,
      options: [
        { label: 'Collector Phyle', value: 'collector_phyle' },
        { label: 'Logistics Phyle', value: 'logistics_phyle' },
        { label: 'Analyst Phyle', value: 'analyst_phyle' },
        { label: 'Maintenance Phyle', value: 'maintenance_phyle' },
        { label: 'Quality Phyle', value: 'quality_phyle' },
        { label: 'Customer Service Phyle', value: 'customer_service_phyle' },
        { label: 'Research Phyle', value: 'research_phyle' },
        { label: 'Security Phyle', value: 'security_phyle' },
      ],
    },
    {
      name: 'charter',
      type: 'group',
      fields: [
        {
          name: 'mission',
          type: 'textarea',
          required: true,
        },
        {
          name: 'specializations',
          type: 'array',
          fields: [
            {
              name: 'specialization',
              type: 'text',
            },
          ],
        },
        {
          name: 'coreValues',
          type: 'array',
          fields: [
            {
              name: 'value',
              type: 'text',
            },
          ],
        },
        {
          name: 'operatingPrinciples',
          type: 'richText',
        },
      ],
    },
    {
      name: 'economicStructure',
      type: 'group',
      fields: [
        {
          name: 'currency',
          type: 'text',
          defaultValue: 'KenDevCoin',
        },
        {
          name: 'taxationModel',
          type: 'select',
          options: [
            { label: 'Flat Fee', value: 'flat_fee' },
            { label: 'Percentage Tax', value: 'percentage_tax' },
            { label: 'Progressive Tax', value: 'progressive_tax' },
            { label: 'Contribution Based', value: 'contribution_based' },
            { label: 'Collective Ownership', value: 'collective_ownership' },
          ],
        },
        {
          name: 'wealthDistribution',
          type: 'select',
          options: [
            { label: 'Merit Based', value: 'merit_based' },
            { label: 'Equal Distribution', value: 'equal_distribution' },
            { label: 'Rank Hierarchy', value: 'rank_hierarchy' },
            { label: 'Contribution Weighted', value: 'contribution_weighted' },
            { label: 'Reputation Weighted', value: 'reputation_weighted' },
          ],
        },
        {
          name: 'minimumBasicIncome',
          type: 'number',
          admin: {
            description: 'Minimum guaranteed income for active members',
          },
        },
        {
          name: 'profitSharingRatio',
          type: 'number',
          min: 0,
          max: 1,
          admin: {
            description: 'Percentage of profits shared with members',
          },
        },
      ],
    },
    {
      name: 'governance',
      type: 'group',
      fields: [
        {
          name: 'governanceModel',
          type: 'select',
          options: [
            { label: 'Democratic', value: 'democratic' },
            { label: 'Meritocratic', value: 'meritocratic' },
            { label: 'Hierarchical', value: 'hierarchical' },
            { label: 'Consensus', value: 'consensus' },
            { label: 'Algorithmic', value: 'algorithmic' },
          ],
        },
        {
          name: 'decisionMakingProcess',
          type: 'richText',
        },
        {
          name: 'leadershipStructure',
          type: 'array',
          fields: [
            {
              name: 'role',
              type: 'text',
            },
            {
              name: 'responsibilities',
              type: 'textarea',
            },
            {
              name: 'selectionMethod',
              type: 'text',
            },
          ],
        },
        {
          name: 'votingRights',
          type: 'richText',
        },
      ],
    },
    {
      name: 'membershipCriteria',
      type: 'group',
      fields: [
        {
          name: 'admissionRequirements',
          type: 'array',
          fields: [
            {
              name: 'requirement',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'skillRequirements',
          type: 'array',
          fields: [
            {
              name: 'skill',
              type: 'text',
            },
            {
              name: 'level',
              type: 'select',
              options: [
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
                { label: 'Expert', value: 'expert' },
              ],
            },
          ],
        },
        {
          name: 'probationPeriod',
          type: 'number',
          admin: {
            description: 'Probation period in days',
          },
        },
        {
          name: 'membershipFees',
          type: 'group',
          fields: [
            {
              name: 'initiation',
              type: 'number',
            },
            {
              name: 'monthly',
              type: 'number',
            },
            {
              name: 'annual',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'services',
      type: 'group',
      fields: [
        {
          name: 'offeredServices',
          type: 'array',
          fields: [
            {
              name: 'service',
              type: 'text',
            },
            {
              name: 'pricing',
              type: 'json',
            },
          ],
        },
        {
          name: 'qualityStandards',
          type: 'richText',
        },
        {
          name: 'serviceGuarantees',
          type: 'array',
          fields: [
            {
              name: 'guarantee',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'interPhyleRelations',
      type: 'group',
      fields: [
        {
          name: 'alliances',
          type: 'array',
          fields: [
            {
              name: 'phyleId',
              type: 'text',
            },
            {
              name: 'allianceType',
              type: 'select',
              options: [
                { label: 'Trade Partnership', value: 'trade_partnership' },
                { label: 'Service Exchange', value: 'service_exchange' },
                { label: 'Information Sharing', value: 'information_sharing' },
                { label: 'Mutual Defense', value: 'mutual_defense' },
                { label: 'Research Collaboration', value: 'research_collaboration' },
              ],
            },
            {
              name: 'terms',
              type: 'richText',
            },
          ],
        },
        {
          name: 'competitors',
          type: 'array',
          fields: [
            {
              name: 'phyleId',
              type: 'text',
            },
            {
              name: 'competitionType',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'metrics',
      type: 'group',
      fields: [
        {
          name: 'memberCount',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'totalEarnings',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'averageEarningsPerMember',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'reputationScore',
          type: 'number',
          min: 0,
          max: 1000,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'customerSatisfaction',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'growthRate',
          type: 'number',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'culturalAspects',
      type: 'group',
      fields: [
        {
          name: 'traditions',
          type: 'array',
          fields: [
            {
              name: 'tradition',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'celebrations',
          type: 'array',
          fields: [
            {
              name: 'celebration',
              type: 'text',
            },
            {
              name: 'date',
              type: 'date',
            },
          ],
        },
        {
          name: 'symbolism',
          type: 'group',
          fields: [
            {
              name: 'colors',
              type: 'array',
              fields: [
                {
                  name: 'color',
                  type: 'text',
                },
              ],
            },
            {
              name: 'motto',
              type: 'text',
            },
            {
              name: 'emblem',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Forming', value: 'forming' },
        { label: 'Restructuring', value: 'restructuring' },
        { label: 'Dormant', value: 'dormant' },
        { label: 'Dissolved', value: 'dissolved' },
      ],
    },
    {
      name: 'founded',
      type: 'date',
      required: true,
    },
    {
      name: 'lastActivity',
      type: 'date',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.lastActivity) {
          data.lastActivity = new Date()
        }
        return data
      },
    ],
  },
}

export default Phyles 