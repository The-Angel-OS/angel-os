import type { CollectionConfig } from 'payload'

const AgentReputation: CollectionConfig = {
  slug: 'agent-reputation',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'phyleId', 'score', 'rank', 'lastUpdated'],
    group: 'System',
  },
  fields: [
    {
      name: 'agentId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'phyleId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      min: 0,
      max: 1000,
      defaultValue: 500,
    },
    {
      name: 'rank',
      type: 'select',
      options: [
        { label: 'Legendary', value: 'legendary' },
        { label: 'Master', value: 'master' },
        { label: 'Expert', value: 'expert' },
        { label: 'Professional', value: 'professional' },
        { label: 'Competent', value: 'competent' },
        { label: 'Apprentice', value: 'apprentice' },
        { label: 'Novice', value: 'novice' },
        { label: 'Beginner', value: 'beginner' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'reputationHistory',
      type: 'array',
      fields: [
        {
          name: 'eventType',
          type: 'select',
          options: [
            { label: 'Quality Work', value: 'quality_work' },
            { label: 'Fast Completion', value: 'fast_completion' },
            { label: 'Customer Satisfaction', value: 'customer_satisfaction' },
            { label: 'Peer Recognition', value: 'peer_recognition' },
            { label: 'Leadership', value: 'leadership' },
            { label: 'Innovation', value: 'innovation' },
            { label: 'Reliability', value: 'reliability' },
            { label: 'Collaboration', value: 'collaboration' },
          ],
        },
        {
          name: 'impact',
          type: 'number',
          min: -100,
          max: 100,
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'timestamp',
          type: 'date',
        },
        {
          name: 'verifiedBy',
          type: 'text',
        },
      ],
    },
    {
      name: 'achievements',
      type: 'array',
      fields: [
        {
          name: 'achievement',
          type: 'select',
          options: [
            { label: 'First Task Completed', value: 'first_task' },
            { label: '100 Tasks Completed', value: 'hundred_tasks' },
            { label: '1000 Tasks Completed', value: 'thousand_tasks' },
            { label: 'Perfect Quality Week', value: 'perfect_week' },
            { label: 'Speed Demon', value: 'speed_demon' },
            { label: 'Customer Favorite', value: 'customer_favorite' },
            { label: 'Mentor', value: 'mentor' },
            { label: 'Innovator', value: 'innovator' },
            { label: 'Phyle Champion', value: 'phyle_champion' },
          ],
        },
        {
          name: 'earnedAt',
          type: 'date',
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
    },
    {
      name: 'specializations',
      type: 'array',
      fields: [
        {
          name: 'specialization',
          type: 'text',
        },
        {
          name: 'proficiencyLevel',
          type: 'select',
          options: [
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' },
            { label: 'Expert', value: 'expert' },
          ],
        },
        {
          name: 'certifiedBy',
          type: 'text',
        },
      ],
    },
    {
      name: 'performanceMetrics',
      type: 'group',
      fields: [
        {
          name: 'totalTasksCompleted',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'averageQualityScore',
          type: 'number',
          min: 0,
          max: 1,
        },
        {
          name: 'averageCompletionTime',
          type: 'number',
          admin: {
            description: 'Average time in minutes',
          },
        },
        {
          name: 'customerSatisfactionScore',
          type: 'number',
          min: 0,
          max: 5,
        },
        {
          name: 'reliabilityScore',
          type: 'number',
          min: 0,
          max: 1,
        },
        {
          name: 'collaborationScore',
          type: 'number',
          min: 0,
          max: 1,
        },
      ],
    },
    {
      name: 'economicImpact',
      type: 'group',
      fields: [
        {
          name: 'totalEarned',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'totalContributed',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'phyleRank',
          type: 'number',
          admin: {
            description: 'Rank within the phyle (1 = top performer)',
          },
        },
        {
          name: 'economicEfficiency',
          type: 'number',
          admin: {
            description: 'Earnings per unit of work',
          },
        },
      ],
    },
    {
      name: 'socialNetwork',
      type: 'group',
      fields: [
        {
          name: 'mentorOf',
          type: 'array',
          fields: [
            {
              name: 'agentId',
              type: 'text',
            },
          ],
        },
        {
          name: 'mentoredBy',
          type: 'array',
          fields: [
            {
              name: 'agentId',
              type: 'text',
            },
          ],
        },
        {
          name: 'collaborators',
          type: 'array',
          fields: [
            {
              name: 'agentId',
              type: 'text',
            },
            {
              name: 'collaborationType',
              type: 'text',
            },
          ],
        },
        {
          name: 'endorsements',
          type: 'array',
          fields: [
            {
              name: 'fromAgentId',
              type: 'text',
            },
            {
              name: 'skill',
              type: 'text',
            },
            {
              name: 'endorsementText',
              type: 'textarea',
            },
            {
              name: 'timestamp',
              type: 'date',
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
        { label: 'Inactive', value: 'inactive' },
        { label: 'Probation', value: 'probation' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Retired', value: 'retired' },
      ],
    },
    {
      name: 'joinedPhyleAt',
      type: 'date',
    },
    {
      name: 'lastActivity',
      type: 'date',
    },
    {
      name: 'lastUpdated',
      type: 'date',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate rank based on score
        if (data.score >= 900) data.rank = 'legendary'
        else if (data.score >= 800) data.rank = 'master'
        else if (data.score >= 700) data.rank = 'expert'
        else if (data.score >= 600) data.rank = 'professional'
        else if (data.score >= 500) data.rank = 'competent'
        else if (data.score >= 400) data.rank = 'apprentice'
        else if (data.score >= 300) data.rank = 'novice'
        else data.rank = 'beginner'

        // Auto-generate display name
        data.displayName = `${data.agentId} (${data.rank})`

        // Update timestamp
        data.lastUpdated = new Date()

        return data
      },
    ],
  },
  indexes: [
    {
      fields: ['agentId', 'phyleId'],
      unique: true,
    },
    {
      fields: ['score'],
    },
    {
      fields: ['rank'],
    },
  ],
}

export default AgentReputation 