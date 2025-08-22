import type { CollectionConfig } from 'payload'

const PhotoAnalysis: CollectionConfig = {
  slug: 'photo-analysis',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'sequenceType',
    defaultColumns: ['sequenceType', 'category', 'confidence', 'createdAt'],
    group: 'System',
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      required: true,
    },
    {
      name: 'guardianAngelId',
      type: 'text',
    },
    {
      name: 'sequenceType',
      type: 'select',
      required: true,
      options: [
        { label: 'Mileage Log', value: 'mileage_log' },
        { label: 'Collection Inventory', value: 'collection_inventory' },
        { label: 'Business Inventory', value: 'business_inventory' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'location',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'photoCount',
      type: 'number',
      required: true,
    },
    {
      name: 'analysis',
      type: 'json',
      required: true,
    },
    {
      name: 'confidence',
      type: 'number',
      min: 0,
      max: 1,
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
    },
  ],
}

export default PhotoAnalysis 