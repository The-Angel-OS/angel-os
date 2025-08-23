import type { CollectionConfig } from 'payload'
import { publicReadAccess } from './shared/tenantAccess'

export const RoadmapFeatures: CollectionConfig = {
  slug: 'roadmap-features',
  labels: {
    singular: 'Roadmap Feature',
    plural: 'Roadmap Features',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'priority', 'votes', 'estimatedCompletion'],
    group: 'Platform Management',
    description: 'Public roadmap with feature voting and progress tracking',
  },
  access: publicReadAccess, // Public readable, super admin editable
  defaultPopulate: {
    title: true,
    description: true,
    category: true,
    status: true,
    priority: true,
    timeline: {
      estimatedCompletion: true,
      quarterTarget: true,
      estimatedEffort: true,
    },
    voting: {
      votes: true,
      allowVoting: true,
    },
    progress: {
      completionPercentage: true,
    },
    tags: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Feature title or name',
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      admin: {
        description: 'Detailed feature description and benefits',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Dashboard', value: 'dashboard' },
        { label: 'CRM', value: 'crm' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Communication', value: 'communication' },
        { label: 'Productivity', value: 'productivity' },
        { label: 'System', value: 'system' },
        { label: 'Integrations', value: 'integrations' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'API', value: 'api' },
        { label: 'Security', value: 'security' },
        { label: 'Performance', value: 'performance' },
        { label: 'UI/UX', value: 'ui-ux' },
      ],
      admin: {
        description: 'Feature category for organization',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Under Consideration', value: 'consideration' },
        { label: 'Planned', value: 'planned' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'In Review', value: 'in-review' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'consideration',
      admin: {
        description: 'Current development status',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Development priority level',
      },
    },
    {
      name: 'timeline',
      type: 'group',
      fields: [
        {
          name: 'estimatedCompletion',
          type: 'date',
          admin: {
            description: 'Estimated completion date',
            date: {
              pickerAppearance: 'monthOnly',
            },
          },
        },
        {
          name: 'actualCompletion',
          type: 'date',
          admin: {
            description: 'Actual completion date',
            date: {
              pickerAppearance: 'dayOnly',
            },
            readOnly: true,
          },
        },
        {
          name: 'quarterTarget',
          type: 'select',
          options: [
            { label: 'Q1 2025', value: '2025-q1' },
            { label: 'Q2 2025', value: '2025-q2' },
            { label: 'Q3 2025', value: '2025-q3' },
            { label: 'Q4 2025', value: '2025-q4' },
            { label: 'Q1 2026', value: '2026-q1' },
            { label: 'Q2 2026', value: '2026-q2' },
            { label: 'Q3 2026', value: '2026-q3' },
            { label: 'Q4 2026', value: '2026-q4' },
            { label: 'Future', value: 'future' },
          ],
          admin: {
            description: 'Target quarter for delivery',
          },
        },
        {
          name: 'estimatedEffort',
          type: 'select',
          options: [
            { label: 'Small (1-2 weeks)', value: 'small' },
            { label: 'Medium (3-6 weeks)', value: 'medium' },
            { label: 'Large (2-3 months)', value: 'large' },
            { label: 'Epic (3+ months)', value: 'epic' },
          ],
          admin: {
            description: 'Estimated development effort',
          },
        },
      ],
    },
    {
      name: 'voting',
      type: 'group',
      admin: {
        description: 'Community voting and feedback',
      },
      fields: [
        {
          name: 'votes',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of votes',
            readOnly: true,
          },
        },
        {
          name: 'voters',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Users who voted for this feature',
            readOnly: true,
          },
        },
        {
          name: 'allowVoting',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow community voting on this feature',
          },
        },
        {
          name: 'voteWeight',
          type: 'number',
          defaultValue: 1,
          admin: {
            description: 'Weight multiplier for votes (for premium users, etc.)',
          },
        },
      ],
    },
    {
      name: 'feedback',
      type: 'array',
      admin: {
        description: 'Community feedback and comments',
      },
      fields: [
        {
          name: 'comment',
          type: 'richText',
          required: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'General Feedback', value: 'feedback' },
            { label: 'Use Case', value: 'use-case' },
            { label: 'Technical Suggestion', value: 'technical' },
            { label: 'Design Suggestion', value: 'design' },
            { label: 'Question', value: 'question' },
          ],
          defaultValue: 'feedback',
        },
        {
          name: 'isPublic',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show this feedback publicly',
          },
        },
        {
          name: 'adminResponse',
          type: 'richText',
          admin: {
            description: 'Admin response to this feedback',
          },
        },
      ],
    },
    {
      name: 'technical',
      type: 'group',
      admin: {
        description: 'Technical implementation details (admin only)',
      },
      fields: [
        {
          name: 'implementationNotes',
          type: 'richText',
          admin: {
            description: 'Technical implementation notes and considerations',
          },
        },
        {
          name: 'dependencies',
          type: 'array',
          fields: [
            {
              name: 'feature',
              type: 'relationship',
              relationTo: 'roadmap-features',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Blocks', value: 'blocks' },
                { label: 'Blocked By', value: 'blocked-by' },
                { label: 'Related', value: 'related' },
              ],
              required: true,
            },
          ],
        },
        {
          name: 'githubIssues',
          type: 'array',
          fields: [
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: {
                description: 'GitHub issue URL',
              },
            },
            {
              name: 'status',
              type: 'select',
              options: [
                { label: 'Open', value: 'open' },
                { label: 'In Progress', value: 'in-progress' },
                { label: 'Closed', value: 'closed' },
              ],
              defaultValue: 'open',
            },
          ],
        },
        {
          name: 'assignedDeveloper',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Developer assigned to implement this feature',
          },
        },
      ],
    },
    {
      name: 'progress',
      type: 'group',
      admin: {
        description: 'Development progress tracking',
      },
      fields: [
        {
          name: 'completionPercentage',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Completion percentage (0-100)',
            step: 5,
          },
        },
        {
          name: 'milestones',
          type: 'array',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'completed',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'completedDate',
              type: 'date',
              admin: {
                condition: (data, siblingData) => siblingData.completed,
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
            },
          ],
        },
        {
          name: 'updates',
          type: 'array',
          admin: {
            description: 'Progress updates for the community',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
            },
            {
              name: 'isPublic',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show this update publicly',
              },
            },
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'users',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Community Requested', value: 'community-requested' },
        { label: 'Quick Win', value: 'quick-win' },
        { label: 'Breaking Change', value: 'breaking-change' },
        { label: 'New Feature', value: 'new-feature' },
        { label: 'Enhancement', value: 'enhancement' },
        { label: 'Bug Fix', value: 'bug-fix' },
        { label: 'Performance', value: 'performance' },
        { label: 'Security', value: 'security' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Mobile', value: 'mobile' },
      ],
      admin: {
        description: 'Feature tags for filtering and organization',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-set completion date when status changes to completed
        if (data.status === 'completed' && !data.timeline?.actualCompletion) {
          data.timeline = {
            ...data.timeline,
            actualCompletion: new Date().toISOString(),
          }
        }
        
        // Auto-set completion percentage based on milestones
        if (data.progress?.milestones?.length > 0) {
          const completedMilestones = data.progress.milestones.filter((m: any) => m.completed).length
          const totalMilestones = data.progress.milestones.length
          data.progress.completionPercentage = Math.round((completedMilestones / totalMilestones) * 100)
        }
        
        return data
      },
    ],
  },
  timestamps: true,
}
