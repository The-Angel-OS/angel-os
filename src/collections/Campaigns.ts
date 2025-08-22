import type { CollectionConfig } from 'payload'
import { tenantField } from './shared/tenantField'
import { createTenantAccess } from './shared/tenantAccess'

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  labels: {
    singular: 'Campaign',
    plural: 'Campaigns',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'startDate', 'endDate', 'budget'],
    group: 'Marketing',
    description: 'Marketing campaign management with performance tracking',
  },
  access: createTenantAccess(),
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Campaign name or title',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Campaign description and objectives',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Email Marketing', value: 'email' },
        { label: 'Social Media', value: 'social' },
        { label: 'Paid Advertising', value: 'ads' },
        { label: 'Content Marketing', value: 'content' },
        { label: 'SEO Campaign', value: 'seo' },
        { label: 'Influencer Marketing', value: 'influencer' },
        { label: 'Event Marketing', value: 'event' },
        { label: 'Direct Mail', value: 'direct-mail' },
        { label: 'Referral Program', value: 'referral' },
      ],
      admin: {
        description: 'Type of marketing campaign',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
      admin: {
        description: 'Current campaign status',
      },
    },
    {
      name: 'dates',
      type: 'group',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          admin: {
            description: 'Campaign start date',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            description: 'Campaign end date',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'launchDate',
          type: 'date',
          admin: {
            description: 'Actual launch date',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'budget',
      type: 'group',
      fields: [
        {
          name: 'totalBudget',
          type: 'number',
          admin: {
            description: 'Total campaign budget',
            step: 0.01,
          },
        },
        {
          name: 'spentBudget',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Amount spent so far',
            step: 0.01,
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
            { label: 'GBP', value: 'gbp' },
          ],
          defaultValue: 'usd',
        },
        {
          name: 'costPerClick',
          type: 'number',
          admin: {
            description: 'Target cost per click',
            step: 0.01,
          },
        },
        {
          name: 'costPerAcquisition',
          type: 'number',
          admin: {
            description: 'Target cost per acquisition',
            step: 0.01,
          },
        },
      ],
    },
    {
      name: 'targeting',
      type: 'group',
      fields: [
        {
          name: 'targetAudience',
          type: 'richText',
          admin: {
            description: 'Target audience description',
          },
        },
        {
          name: 'demographics',
          type: 'group',
          fields: [
            {
              name: 'ageRange',
              type: 'text',
              admin: {
                description: 'Target age range (e.g., "25-45")',
              },
            },
            {
              name: 'gender',
              type: 'select',
              options: [
                { label: 'All', value: 'all' },
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Non-binary', value: 'non-binary' },
              ],
              defaultValue: 'all',
            },
            {
              name: 'locations',
              type: 'array',
              fields: [
                {
                  name: 'location',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'interests',
              type: 'array',
              fields: [
                {
                  name: 'interest',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'content',
      type: 'group',
      fields: [
        {
          name: 'creativeAssets',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Campaign images, videos, and other assets',
          },
        },
        {
          name: 'copyVariations',
          type: 'array',
          admin: {
            description: 'Different copy variations for A/B testing',
          },
          fields: [
            {
              name: 'headline',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            {
              name: 'callToAction',
              type: 'text',
            },
            {
              name: 'variation',
              type: 'text',
              admin: {
                description: 'Variation name (e.g., "A", "B", "Control")',
              },
            },
          ],
        },
        {
          name: 'landingPages',
          type: 'relationship',
          relationTo: 'pages',
          hasMany: true,
          admin: {
            description: 'Campaign landing pages',
          },
        },
      ],
    },
    {
      name: 'metrics',
      type: 'group',
      admin: {
        description: 'Campaign performance metrics',
      },
      fields: [
        {
          name: 'impressions',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total impressions',
            readOnly: true,
          },
        },
        {
          name: 'clicks',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total clicks',
            readOnly: true,
          },
        },
        {
          name: 'conversions',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total conversions',
            readOnly: true,
          },
        },
        {
          name: 'leads',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total leads generated',
            readOnly: true,
          },
        },
        {
          name: 'sales',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total sales generated',
            readOnly: true,
          },
        },
        {
          name: 'revenue',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total revenue generated',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'clickThroughRate',
          type: 'number',
          admin: {
            description: 'Click-through rate (%)',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'conversionRate',
          type: 'number',
          admin: {
            description: 'Conversion rate (%)',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'returnOnAdSpend',
          type: 'number',
          admin: {
            description: 'Return on ad spend (ROAS)',
            step: 0.01,
            readOnly: true,
          },
        },
        {
          name: 'costPerLead',
          type: 'number',
          admin: {
            description: 'Cost per lead',
            step: 0.01,
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'team',
      type: 'group',
      fields: [
        {
          name: 'campaignManager',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Campaign manager',
          },
        },
        {
          name: 'teamMembers',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Campaign team members',
          },
        },
        {
          name: 'approvers',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'People who need to approve campaign',
          },
        },
      ],
    },
    {
      name: 'integrations',
      type: 'group',
      fields: [
        {
          name: 'googleAdsId',
          type: 'text',
          admin: {
            description: 'Google Ads campaign ID',
          },
        },
        {
          name: 'facebookAdId',
          type: 'text',
          admin: {
            description: 'Facebook/Meta Ad campaign ID',
          },
        },
        {
          name: 'mailchimpId',
          type: 'text',
          admin: {
            description: 'Mailchimp campaign ID',
          },
        },
        {
          name: 'trackingPixels',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'text',
              required: true,
            },
            {
              name: 'pixelId',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'Campaign notes and observations',
      },
    },
    tenantField,
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate derived metrics
        if (data.metrics) {
          const { impressions, clicks, conversions, revenue, spentBudget } = data.metrics
          
          if (impressions && clicks) {
            data.metrics.clickThroughRate = (clicks / impressions) * 100
          }
          
          if (clicks && conversions) {
            data.metrics.conversionRate = (conversions / clicks) * 100
          }
          
          if (revenue && data.budget?.spentBudget) {
            data.metrics.returnOnAdSpend = revenue / data.budget.spentBudget
          }
          
          if (data.budget?.spentBudget && data.metrics.leads) {
            data.metrics.costPerLead = data.budget.spentBudget / data.metrics.leads
          }
        }
        
        return data
      },
    ],
  },
  timestamps: true,
}
