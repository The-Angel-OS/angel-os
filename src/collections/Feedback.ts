import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['entityType', 'entityId', 'ratings.overall', 'status', 'customer', 'createdAt'],
    group: 'Business',
    description: 'Universal feedback system for all products, services, events, and experiences',
  },
  access: {
    create: () => true, // Anyone can leave feedback
    read: ({ req }) => {
      // Simplified access - public feedback or admin access
      if ((req.user as any)?.globalRole === 'super_admin') return true
      return { isPublic: { equals: true } }
    },
    update: ({ req }) => {
      // Only admins and feedback authors can update
      if ((req.user as any)?.globalRole === 'super_admin') return true
      return { customer: { equals: req.user?.id } }
    },
    delete: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
  },
  fields: [
    // Core identification
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Auto-generated title for admin display',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data }) => {
            if (data) {
              const entityType = data.entityType || 'unknown'
              const rating = data.ratings?.overall || 'unrated'
              const customer = data.customerName || 'Anonymous'
              return `${entityType} feedback - ${rating}★ by ${customer}`
            }
            return 'Feedback'
          },
        ],
      },
    },
    
    // Context - What is being reviewed
    {
      name: 'entityType',
      type: 'select',
      required: true,
      options: [
        { label: 'Product', value: 'product' },
        { label: 'Service Appointment', value: 'appointment' },
        { label: 'Class/Workshop', value: 'class' },
        { label: 'Event/Performance', value: 'event' },
        { label: 'Subscription/Membership', value: 'subscription' },
        { label: 'Post/Article', value: 'post' },
        { label: 'Page/Website', value: 'page' },
        { label: 'Customer Support', value: 'support' },
        { label: 'LEO AI Interaction', value: 'leo_interaction' },
        { label: 'Platform/System', value: 'platform' },
      ],
      admin: {
        description: 'What type of entity is being reviewed',
      },
    },
    {
      name: 'entityId',
      type: 'text',
      required: true,
      admin: {
        description: 'ID of the product, post, event, etc. being reviewed',
      },
    },
    {
      name: 'entityTitle',
      type: 'text',
      admin: {
        description: 'Display name of the entity (auto-populated)',
      },
    },
    
    // Customer information
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Customer leaving feedback (optional for anonymous)',
      },
    },
    {
      name: 'customerName',
      type: 'text',
      admin: {
        description: 'Display name for feedback (can be different from user name)',
      },
    },
    {
      name: 'customerEmail',
      type: 'email',
      admin: {
        description: 'Contact email for follow-up (optional)',
      },
    },
    {
      name: 'isAnonymous',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hide customer identity in public display',
      },
    },
    
    // Ratings
    {
      name: 'ratings',
      type: 'group',
      fields: [
        {
          name: 'overall',
          type: 'number',
          min: 1,
          max: 5,
          required: true,
          admin: {
            description: 'Overall rating (1-5 stars)',
          },
        },
        {
          name: 'quality',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Quality rating (1-5 stars)',
          },
        },
        {
          name: 'value',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Value for money (1-5 stars)',
          },
        },
        {
          name: 'service',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Service quality (1-5 stars)',
          },
        },
        {
          name: 'recommendationScore',
          type: 'number',
          min: 0,
          max: 10,
          admin: {
            description: 'Likelihood to recommend (0-10, NPS score)',
          },
        },
      ],
    },
    
    // Content
    {
      name: 'content',
      type: 'group',
      fields: [
        {
          name: 'review',
          type: 'richText',
          admin: {
            description: 'Main feedback content',
          },
        },
        {
          name: 'positives',
          type: 'textarea',
          admin: {
            description: 'What went well',
          },
        },
        {
          name: 'improvements',
          type: 'textarea',
          admin: {
            description: 'What could be better',
          },
        },
        {
          name: 'suggestions',
          type: 'textarea',
          admin: {
            description: 'Feature requests or suggestions',
          },
        },
        {
          name: 'testimonial',
          type: 'textarea',
          admin: {
            description: 'Public testimonial (if customer opts in)',
          },
        },
      ],
    },
    
    // Media attachments
    {
      name: 'mediaAttachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Photos, videos, or documents related to feedback',
      },
    },
    
    // Context-specific questions
    {
      name: 'contextResponses',
      type: 'array',
      label: 'Context-Specific Responses',
      admin: {
        description: 'Responses to entity-specific questions',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'text',
        },
        {
          name: 'answerType',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Rating', value: 'rating' },
            { label: 'Yes/No', value: 'boolean' },
            { label: 'Multiple Choice', value: 'choice' },
          ],
        },
        {
          name: 'numericValue',
          type: 'number',
          admin: {
            description: 'Numeric value for ratings or scores',
          },
        },
      ],
    },
    
    // Status and moderation
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Flagged', value: 'flagged' },
        { label: 'Requires Follow-up', value: 'follow_up' },
      ],
      admin: {
        description: 'Moderation status',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Display publicly on entity page',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature as testimonial',
      },
    },
    
    // AI Analysis
    {
      name: 'aiAnalysis',
      type: 'group',
      label: 'AI Analysis',
      admin: {
        description: 'Automated analysis by LEO',
      },
      fields: [
        {
          name: 'sentiment',
          type: 'select',
          options: [
            { label: 'Positive', value: 'positive' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Negative', value: 'negative' },
          ],
          admin: {
            readOnly: true,
            description: 'AI-detected sentiment',
          },
        },
        {
          name: 'confidence',
          type: 'number',
          min: 0,
          max: 1,
          admin: {
            readOnly: true,
            description: 'AI confidence in analysis (0-1)',
          },
        },
        {
          name: 'keyTopics',
          type: 'text',
          hasMany: true,
          admin: {
            readOnly: true,
            description: 'Key topics identified by AI',
          },
        },
        {
          name: 'urgency',
          type: 'select',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' },
          ],
          admin: {
            readOnly: true,
            description: 'AI-assessed urgency level',
          },
        },
        {
          name: 'suggestedActions',
          type: 'textarea',
          admin: {
            readOnly: true,
            description: 'AI-suggested response actions',
          },
        },
      ],
    },
    
    // Follow-up tracking
    {
      name: 'followUp',
      type: 'group',
      label: 'Follow-up Management',
      fields: [
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Requires human follow-up',
          },
        },
        {
          name: 'assignedTo',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Staff member assigned to follow up',
          },
        },
        {
          name: 'responseDeadline',
          type: 'date',
          admin: {
            description: 'When response is due',
          },
        },
        {
          name: 'responseStatus',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Escalated', value: 'escalated' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'responseNotes',
          type: 'textarea',
          admin: {
            description: 'Internal notes about follow-up actions',
          },
        },
        {
          name: 'customerResponse',
          type: 'textarea',
          admin: {
            description: 'Customer response to follow-up',
          },
        },
      ],
    },
    
    // Tenant isolation
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this feedback belongs to',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'Space context (if applicable)',
      },
    },
    
    // Metadata
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Website', value: 'web' },
            { label: 'Mobile App', value: 'mobile' },
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Phone', value: 'phone' },
            { label: 'In Person', value: 'in_person' },
          ],
          defaultValue: 'web',
        },
        {
          name: 'source',
          type: 'text',
          admin: {
            description: 'Specific source (page URL, app screen, etc.)',
          },
        },
        {
          name: 'responseTime',
          type: 'number',
          admin: {
            description: 'Time taken to complete feedback (seconds)',
          },
        },
        {
          name: 'deviceInfo',
          type: 'text',
          admin: {
            description: 'Device/browser information',
          },
        },
      ],
    },
  ],
  
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create') {
          // Trigger AI analysis
          console.log(`New feedback received for ${doc.entityType}: ${doc.entityId}`)
          // TODO: Trigger LEO analysis workflow
        }
      },
    ],
  },
  
  timestamps: true,
}
