import type { CollectionConfig } from 'payload'

export const Donations: CollectionConfig = {
  slug: 'donations',
  admin: {
    useAsTitle: 'donationId',
    defaultColumns: ['donationId', 'donorName', 'amount', 'campaign', 'donatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'donationId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0.01,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
    },
    {
      name: 'donorName',
      type: 'text',
      defaultValue: 'Anonymous',
    },
    {
      name: 'donorEmail',
      type: 'email',
    },
    {
      name: 'isAnonymous',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'campaign',
      type: 'text',
    },
    {
      name: 'cause',
      type: 'select',
      options: [
        { label: 'Disaster Relief', value: 'disaster_relief' },
        { label: 'Education', value: 'education' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Environment', value: 'environment' },
        { label: 'Community Support', value: 'community' },
        { label: 'Creator Support', value: 'creator' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Credit Card', value: 'card' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Cryptocurrency', value: 'crypto' },
      ],
    },
    {
      name: 'paymentId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'transactionId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'isRecurring',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'recurringFrequency',
      type: 'select',
      options: [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Annually', value: 'annually' },
      ],
      admin: {
        condition: (data) => data?.isRecurring,
      },
    },
    {
      name: 'donatedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  timestamps: true,
}
