import type { CollectionConfig } from 'payload'
import { tenantField } from './shared/tenantField'
import { createTenantAccess } from './shared/tenantAccess'

export const Opportunities: CollectionConfig = {
  slug: 'opportunities',
  labels: {
    singular: 'Opportunity',
    plural: 'Opportunities',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'contact', 'value', 'stage', 'probability', 'expectedCloseDate', 'assignedTo'],
    group: 'CRM',
    description: 'Sales opportunity pipeline management',
  },
  access: createTenantAccess(),
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Opportunity name or title',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed opportunity description',
      },
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
      admin: {
        description: 'Primary contact for this opportunity',
      },
    },
    {
      name: 'account',
      type: 'group',
      fields: [
        {
          name: 'company',
          type: 'text',
          admin: {
            description: 'Company or organization name',
          },
        },
        {
          name: 'industry',
          type: 'select',
          options: [
            { label: 'Technology', value: 'technology' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Finance', value: 'finance' },
            { label: 'Manufacturing', value: 'manufacturing' },
            { label: 'Retail', value: 'retail' },
            { label: 'Education', value: 'education' },
            { label: 'Government', value: 'government' },
            { label: 'Non-profit', value: 'non-profit' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'size',
          type: 'select',
          options: [
            { label: '1-10 employees', value: '1-10' },
            { label: '11-50 employees', value: '11-50' },
            { label: '51-200 employees', value: '51-200' },
            { label: '201-500 employees', value: '201-500' },
            { label: '501-1000 employees', value: '501-1000' },
            { label: '1000+ employees', value: '1000+' },
          ],
        },
      ],
    },
    {
      name: 'value',
      type: 'group',
      fields: [
        {
          name: 'amount',
          type: 'number',
          required: true,
          admin: {
            description: 'Opportunity value',
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
          name: 'recurringRevenue',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Is this recurring revenue?',
          },
        },
        {
          name: 'recurringPeriod',
          type: 'select',
          options: [
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Annually', value: 'annually' },
          ],
          admin: {
            condition: (data) => data.recurringRevenue,
          },
        },
      ],
    },
    {
      name: 'stage',
      type: 'select',
      required: true,
      options: [
        { label: 'Prospecting', value: 'prospecting' },
        { label: 'Qualification', value: 'qualification' },
        { label: 'Needs Analysis', value: 'needs-analysis' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Negotiation', value: 'negotiation' },
        { label: 'Decision', value: 'decision' },
        { label: 'Closed Won', value: 'closed-won' },
        { label: 'Closed Lost', value: 'closed-lost' },
      ],
      defaultValue: 'prospecting',
      admin: {
        description: 'Current stage in sales pipeline',
      },
    },
    {
      name: 'probability',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      defaultValue: 10,
      admin: {
        description: 'Probability of closing (%)',
        step: 5,
      },
    },
    {
      name: 'dates',
      type: 'group',
      fields: [
        {
          name: 'expectedCloseDate',
          type: 'date',
          admin: {
            description: 'Expected close date',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'actualCloseDate',
          type: 'date',
          admin: {
            description: 'Actual close date',
            date: {
              pickerAppearance: 'dayOnly',
            },
            readOnly: true,
          },
        },
        {
          name: 'lastContactDate',
          type: 'date',
          admin: {
            description: 'Last contact with prospect',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'nextFollowUp',
          type: 'date',
          admin: {
            description: 'Next scheduled follow-up',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Sales representative assigned to this opportunity',
      },
    },
    {
      name: 'team',
      type: 'group',
      fields: [
        {
          name: 'members',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Team members involved in this opportunity',
          },
        },
        {
          name: 'decisionMakers',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'role',
              type: 'text',
            },
            {
              name: 'influence',
              type: 'select',
              options: [
                { label: 'Champion', value: 'champion' },
                { label: 'Decision Maker', value: 'decision-maker' },
                { label: 'Influencer', value: 'influencer' },
                { label: 'Gatekeeper', value: 'gatekeeper' },
                { label: 'User', value: 'user' },
              ],
            },
            {
              name: 'sentiment',
              type: 'select',
              options: [
                { label: 'Strongly Positive', value: 'strongly-positive' },
                { label: 'Positive', value: 'positive' },
                { label: 'Neutral', value: 'neutral' },
                { label: 'Negative', value: 'negative' },
                { label: 'Strongly Negative', value: 'strongly-negative' },
              ],
              defaultValue: 'neutral',
            },
          ],
        },
      ],
    },
    {
      name: 'products',
      type: 'group',
      fields: [
        {
          name: 'interestedProducts',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          admin: {
            description: 'Products the prospect is interested in',
          },
        },
        {
          name: 'proposedSolution',
          type: 'richText',
          admin: {
            description: 'Proposed solution details',
          },
        },
        {
          name: 'competitorAnalysis',
          type: 'array',
          fields: [
            {
              name: 'competitor',
              type: 'text',
              required: true,
            },
            {
              name: 'strengths',
              type: 'textarea',
            },
            {
              name: 'weaknesses',
              type: 'textarea',
            },
            {
              name: 'pricing',
              type: 'number',
              admin: {
                step: 0.01,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'activities',
      type: 'array',
      admin: {
        description: 'Opportunity activity history',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone Call', value: 'call' },
            { label: 'Meeting', value: 'meeting' },
            { label: 'Presentation', value: 'presentation' },
            { label: 'Proposal Sent', value: 'proposal-sent' },
            { label: 'Contract Sent', value: 'contract-sent' },
            { label: 'Demo', value: 'demo' },
            { label: 'Site Visit', value: 'site-visit' },
            { label: 'Note', value: 'note' },
          ],
        },
        {
          name: 'subject',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
        },
        {
          name: 'outcome',
          type: 'select',
          options: [
            { label: 'Very Positive', value: 'very-positive' },
            { label: 'Positive', value: 'positive' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Negative', value: 'negative' },
            { label: 'Very Negative', value: 'very-negative' },
          ],
        },
        {
          name: 'nextSteps',
          type: 'textarea',
          admin: {
            description: 'Next steps and action items',
          },
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
      ],
    },
    {
      name: 'lossReason',
      type: 'group',
      admin: {
        condition: (data) => data.stage === 'closed-lost',
      },
      fields: [
        {
          name: 'reason',
          type: 'select',
          options: [
            { label: 'Price', value: 'price' },
            { label: 'Competitor', value: 'competitor' },
            { label: 'No Budget', value: 'no-budget' },
            { label: 'No Decision', value: 'no-decision' },
            { label: 'Timing', value: 'timing' },
            { label: 'Not a Fit', value: 'not-fit' },
            { label: 'Lost Contact', value: 'lost-contact' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'details',
          type: 'textarea',
          admin: {
            description: 'Additional details about why opportunity was lost',
          },
        },
        {
          name: 'lessonsLearned',
          type: 'textarea',
          admin: {
            description: 'What can be learned for future opportunities',
          },
        },
      ],
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Proposals, contracts, and other documents',
      },
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'General notes about this opportunity',
      },
    },
    tenantField,
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-set close date when stage changes to closed-won or closed-lost
        if ((data.stage === 'closed-won' || data.stage === 'closed-lost') && !data.dates?.actualCloseDate) {
          data.dates = {
            ...data.dates,
            actualCloseDate: new Date().toISOString(),
          }
        }
        
        // Auto-set probability based on stage
        const stageProbabilities: Record<string, number> = {
          'prospecting': 10,
          'qualification': 25,
          'needs-analysis': 40,
          'proposal': 60,
          'negotiation': 80,
          'decision': 90,
          'closed-won': 100,
          'closed-lost': 0,
        }
        
        if (data.stage && stageProbabilities[data.stage] !== undefined) {
          data.probability = stageProbabilities[data.stage]
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Create order when opportunity is closed-won
        if (operation === 'update' && doc.stage === 'closed-won') {
          try {
            await req.payload.create({
              collection: 'orders',
              data: {
                // Map opportunity to order fields - using proper order schema
                total: (doc.value as any)?.amount || 0,
                status: 'pending',
                items: [], // To be populated manually
                tenant: doc.tenant,
              },
            } as any)
          } catch (error) {
            console.error('Error creating order from opportunity:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}
