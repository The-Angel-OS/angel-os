import type { CollectionConfig } from 'payload'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'recipientName', 'amount', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'recipientName',
      type: 'text',
      required: true,
    },
    {
      name: 'recipientEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'businessName',
      type: 'text',
    },
    {
      name: 'businessAddress',
      type: 'textarea',
    },
    {
      name: 'itemizedList',
      type: 'array',
      fields: [
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'rate',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'paymentMethods',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Credit Card', value: 'card' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Cryptocurrency', value: 'crypto' },
      ],
      defaultValue: ['card'],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent', value: 'sent' },
        { label: 'Paid', value: 'paid' },
        { label: 'Overdue', value: 'overdue' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
    },
    {
      name: 'dueDate',
      type: 'date',
      required: true,
    },
    {
      name: 'sentAt',
      type: 'date',
    },
    {
      name: 'paidAt',
      type: 'date',
    },
    {
      name: 'paymentMethod',
      type: 'text',
    },
    {
      name: 'paymentId',
      type: 'text',
    },
    {
      name: 'paymentLink',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  timestamps: true,
}
