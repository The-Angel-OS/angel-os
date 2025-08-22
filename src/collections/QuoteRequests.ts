import type { CollectionConfig } from 'payload'

const QuoteRequests: CollectionConfig = {
  slug: 'quote-requests',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'serviceType', 'status', 'createdAt'],
    group: 'Business',
  },
  fields: [
    {
      name: 'submissionId',
      type: 'text',
      required: true,
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'customerPhone',
      type: 'text',
      required: true,
    },
    {
      name: 'serviceAddress',
      type: 'textarea',
      required: true,
    },
    {
      name: 'serviceDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'serviceType',
      type: 'select',
      options: [
        { label: 'Junk Removal', value: 'junk_removal' },
        { label: 'Handyman', value: 'handyman' },
        { label: 'Cleaning', value: 'cleaning' },
        { label: 'Moving', value: 'moving' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'estimatedValue',
      type: 'number',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      name: 'priority',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
    },
    {
      name: 'assignedTo',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
    },
    {
      name: 'quotedAt',
      type: 'date',
    },
    {
      name: 'expiresAt',
      type: 'date',
    },
  ],
}

export default QuoteRequests 