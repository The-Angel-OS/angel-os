import type { CollectionConfig } from 'payload'

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'documentId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Rental Agreement', value: 'rental_agreement' },
        { label: 'Service Contract', value: 'service_contract' },
        { label: 'Non-Disclosure Agreement', value: 'nda' },
        { label: 'Custom Document', value: 'custom' },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'signers',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          options: [
            { label: 'Tenant', value: 'tenant' },
            { label: 'Landlord', value: 'landlord' },
            { label: 'Client', value: 'client' },
            { label: 'Contractor', value: 'contractor' },
            { label: 'Other', value: 'custom' },
          ],
        },
        {
          name: 'signatureRequired',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Signed', value: 'signed' },
            { label: 'Declined', value: 'declined' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'signedAt',
          type: 'date',
        },
        {
          name: 'signature',
          type: 'textarea',
        },
        {
          name: 'signatureType',
          type: 'select',
          options: [
            { label: 'Drawn', value: 'drawn' },
            { label: 'Typed', value: 'typed' },
            { label: 'Uploaded', value: 'uploaded' },
          ],
        },
        {
          name: 'ipAddress',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Sent for Signing', value: 'sent' },
        { label: 'Partially Signed', value: 'partially_signed' },
        { label: 'Completed', value: 'completed' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'draft',
    },
    {
      name: 'expirationDate',
      type: 'date',
      required: true,
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'securityHash',
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
