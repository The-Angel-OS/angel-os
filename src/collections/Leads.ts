import type { CollectionConfig } from 'payload'
import { tenantField } from './shared/tenantField'
import { createTenantAccess } from './shared/tenantAccess'

export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: {
    singular: 'Lead',
    plural: 'Leads',
  },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'company', 'source', 'status', 'score', 'assignedTo'],
    group: 'CRM',
    description: 'Lead management and qualification pipeline',
  },
  access: createTenantAccess(),
  fields: [
    {
      name: 'fullName',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            // Auto-generate full name from first and last name
            if (data?.firstName || data?.lastName) {
              return `${data.firstName || ''} ${data.lastName || ''}`.trim()
            }
            return data?.fullName
          },
        ],
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'Lead first name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        description: 'Lead last name',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Primary email address',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Primary phone number',
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
      name: 'jobTitle',
      type: 'text',
      admin: {
        description: 'Job title or position',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'Website Form', value: 'website' },
        { label: 'Referral', value: 'referral' },
        { label: 'Social Media', value: 'social' },
        { label: 'Email Campaign', value: 'email' },
        { label: 'Trade Show', value: 'trade-show' },
        { label: 'Cold Outreach', value: 'cold-outreach' },
        { label: 'Webinar', value: 'webinar' },
        { label: 'Content Download', value: 'content' },
        { label: 'Search Engine', value: 'search' },
        { label: 'Partner', value: 'partner' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'How this lead was acquired',
      },
    },
    {
      name: 'sourceDetails',
      type: 'group',
      fields: [
        {
          name: 'campaign',
          type: 'relationship',
          relationTo: 'campaigns',
          admin: {
            description: 'Associated marketing campaign',
          },
        },
        {
          name: 'referrerName',
          type: 'text',
          admin: {
            description: 'Name of person who referred this lead',
          },
        },
        {
          name: 'landingPage',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            description: 'Landing page where lead converted',
          },
        },
        {
          name: 'utmSource',
          type: 'text',
          admin: {
            description: 'UTM source parameter',
          },
        },
        {
          name: 'utmMedium',
          type: 'text',
          admin: {
            description: 'UTM medium parameter',
          },
        },
        {
          name: 'utmCampaign',
          type: 'text',
          admin: {
            description: 'UTM campaign parameter',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Unqualified', value: 'unqualified' },
        { label: 'Nurturing', value: 'nurturing' },
        { label: 'Opportunity', value: 'opportunity' },
        { label: 'Customer', value: 'customer' },
        { label: 'Lost', value: 'lost' },
      ],
      defaultValue: 'new',
      admin: {
        description: 'Current lead status in pipeline',
      },
    },
    {
      name: 'scoring',
      type: 'group',
      admin: {
        description: 'Lead scoring and qualification metrics',
      },
      fields: [
        {
          name: 'score',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Overall lead score (0-100)',
          },
        },
        {
          name: 'behaviorScore',
          type: 'number',
          min: 0,
          max: 50,
          defaultValue: 0,
          admin: {
            description: 'Score based on behavior and engagement',
          },
        },
        {
          name: 'demographicScore',
          type: 'number',
          min: 0,
          max: 50,
          defaultValue: 0,
          admin: {
            description: 'Score based on demographic fit',
          },
        },
        {
          name: 'engagementLevel',
          type: 'select',
          options: [
            { label: 'Cold', value: 'cold' },
            { label: 'Warm', value: 'warm' },
            { label: 'Hot', value: 'hot' },
          ],
          defaultValue: 'cold',
        },
        {
          name: 'qualificationCriteria',
          type: 'array',
          fields: [
            {
              name: 'criterion',
              type: 'text',
              required: true,
            },
            {
              name: 'met',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'weight',
              type: 'number',
              min: 1,
              max: 10,
              defaultValue: 5,
            },
          ],
        },
      ],
    },
    {
      name: 'interests',
      type: 'group',
      fields: [
        {
          name: 'products',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          admin: {
            description: 'Products the lead is interested in',
          },
        },
        {
          name: 'services',
          type: 'array',
          fields: [
            {
              name: 'service',
              type: 'text',
              required: true,
            },
            {
              name: 'priority',
              type: 'select',
              options: [
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
              ],
              defaultValue: 'medium',
            },
          ],
        },
        {
          name: 'budget',
          type: 'group',
          fields: [
            {
              name: 'range',
              type: 'select',
              options: [
                { label: 'Under $1,000', value: 'under-1k' },
                { label: '$1,000 - $5,000', value: '1k-5k' },
                { label: '$5,000 - $10,000', value: '5k-10k' },
                { label: '$10,000 - $25,000', value: '10k-25k' },
                { label: '$25,000 - $50,000', value: '25k-50k' },
                { label: 'Over $50,000', value: 'over-50k' },
              ],
            },
            {
              name: 'timeframe',
              type: 'select',
              options: [
                { label: 'Immediate', value: 'immediate' },
                { label: 'Within 1 month', value: '1-month' },
                { label: 'Within 3 months', value: '3-months' },
                { label: 'Within 6 months', value: '6-months' },
                { label: 'Within 1 year', value: '1-year' },
                { label: 'No timeline', value: 'no-timeline' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Sales representative assigned to this lead',
      },
    },
    {
      name: 'activities',
      type: 'array',
      admin: {
        description: 'Lead interaction history',
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
            { label: 'Website Visit', value: 'website-visit' },
            { label: 'Content Download', value: 'content-download' },
            { label: 'Form Submission', value: 'form-submission' },
            { label: 'Social Engagement', value: 'social' },
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
            { label: 'Positive', value: 'positive' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Negative', value: 'negative' },
            { label: 'No Response', value: 'no-response' },
          ],
        },
        {
          name: 'nextAction',
          type: 'text',
          admin: {
            description: 'Next action to take',
          },
        },
        {
          name: 'scheduledDate',
          type: 'date',
          admin: {
            description: 'When next action is scheduled',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
          admin: {
            description: 'User who performed this activity',
          },
        },
      ],
    },
    {
      name: 'notes',
      type: 'richText',
      admin: {
        description: 'General notes about this lead',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Lead tags and categories',
      },
    },
    tenantField,
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate overall score from behavior and demographic scores
        if (data.scoring) {
          const behaviorScore = data.scoring.behaviorScore || 0
          const demographicScore = data.scoring.demographicScore || 0
          data.scoring.score = Math.min(100, behaviorScore + demographicScore)
          
          // Auto-set engagement level based on score
          if (data.scoring.score >= 80) {
            data.scoring.engagementLevel = 'hot'
          } else if (data.scoring.score >= 50) {
            data.scoring.engagementLevel = 'warm'
          } else {
            data.scoring.engagementLevel = 'cold'
          }
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Create opportunity when lead status changes to 'opportunity'
        if (operation === 'update' && doc.status === 'opportunity') {
          try {
            await req.payload.create({
              collection: 'opportunities',
              data: {
                name: `Opportunity for ${doc.fullName}`,
                contact: doc.id, // Assuming we'll link to contacts
                value: {
                  amount: 0, // To be updated manually
                  currency: 'usd',
                  recurringRevenue: false,
                },
                stage: 'prospecting',
                probability: 25,
                assignedTo: doc.assignedTo,
                description: {
                  root: {
                    type: 'root',
                    children: [{
                      type: 'paragraph',
                      children: [{
                        type: 'text',
                        text: `Opportunity created from lead: ${doc.fullName} (${doc.company})`,
                        version: 1,
                      }],
                      version: 1,
                    }],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1,
                  }
                },
                tenant: doc.tenant,
              },
            })
          } catch (error) {
            console.error('Error creating opportunity from lead:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}
