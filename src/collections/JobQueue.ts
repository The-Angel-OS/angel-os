import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const JobQueue: CollectionConfig = {
  slug: 'job-queue',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['jobType', 'status', 'priority', 'createdAt'],
    group: 'System',
    description: 'Job queue for background processing',
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'jobType',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'maxAttempts',
      type: 'number',
      defaultValue: 3,
    },
    {
      name: 'scheduledFor',
      type: 'date',
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'processedAt',
      type: 'date',
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'result',
      type: 'json',
    },
    {
      name: 'error',
      type: 'text',
    },
  ],
  timestamps: true,
} 