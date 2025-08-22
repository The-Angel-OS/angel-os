import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const WebChatSessions: CollectionConfig = {
  slug: 'web-chat-sessions',
  labels: {
    singular: 'Web Chat Session',
    plural: 'Web Chat Sessions',
  },
  admin: {
    useAsTitle: 'sessionId',
    group: 'Communication',
    description: 'Web chat session management and analytics',
    defaultColumns: ['sessionId', 'space', 'status', 'customer', 'createdAt'],
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique session identifier',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Space this chat session belongs to',
      },
    },
    {
      name: 'visitorInfo',
      type: 'group',
      label: 'Visitor Information',
      fields: [
        {
          name: 'ipAddress',
          type: 'text',
          admin: {
            description: 'Visitor IP address',
          },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: {
            description: 'Browser user agent string',
          },
        },
        {
          name: 'referrer',
          type: 'text',
          admin: {
            description: 'Referring page URL',
          },
        },
        {
          name: 'pageUrl',
          type: 'text',
          admin: {
            description: 'Page where chat was initiated',
          },
        },
        {
          name: 'country',
          type: 'text',
          admin: {
            description: 'Visitor country (from IP)',
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            description: 'Visitor city (from IP)',
          },
        },
      ],
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'contacts',
      admin: {
        description: 'Linked contact if identified',
      },
    },
    {
      name: 'messages',
      type: 'relationship',
      relationTo: 'messages',
      hasMany: true,
      admin: {
        description: 'Messages in this chat session',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Waiting for Agent', value: 'waiting' },
        { label: 'Agent Connected', value: 'agent_connected' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Abandoned', value: 'abandoned' },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Current session status',
      },
    },
    {
      name: 'assignedAgent',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Agent assigned to this session',
      },
    },
    // Tenant Relationship (IRONCLAD DATA SEGMENTATION)
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Tenant that owns this chat session',
      },
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Session Analytics',
      fields: [
        {
          name: 'startTime',
          type: 'date',
          admin: {
            description: 'When the session started',
          },
        },
        {
          name: 'endTime',
          type: 'date',
          admin: {
            description: 'When the session ended',
          },
        },
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Session duration in seconds',
          },
        },
        {
          name: 'messageCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total messages in session',
          },
        },
        {
          name: 'responseTime',
          type: 'number',
          admin: {
            description: 'Average response time in seconds',
          },
        },
        {
          name: 'satisfactionScore',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Customer satisfaction rating (1-5)',
          },
        },
        {
          name: 'leadQualified',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Was this visitor qualified as a lead?',
          },
        },
        {
          name: 'appointmentBooked',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Was an appointment booked during this session?',
          },
        },
        {
          name: 'saleGenerated',
          type: 'number',
          admin: {
            description: 'Sale amount generated from this session',
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional session metadata',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create') {
          // Auto-set start time
          if (data && !data.analytics?.startTime) {
            data.analytics = {
              ...data.analytics,
              startTime: new Date().toISOString(),
            }
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
