import type { CollectionConfig } from 'payload'

const InventoryMessages: CollectionConfig = {
  slug: 'inventory-messages',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'messageType', 'location', 'createdAt'],
    group: 'System',
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'guardianAngelId',
      type: 'text',
      index: true,
    },
    {
      name: 'userId',
      type: 'text',
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'messageType',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Mileage Log', value: 'mileage_log' },
        { label: 'Collection Inventory', value: 'collection_inventory' },
        { label: 'Business Inventory', value: 'business_inventory' },
        { label: 'Equipment Status', value: 'equipment_status' },
        { label: 'Asset Tracking', value: 'asset_tracking' },
        { label: 'Quality Control', value: 'quality_control' },
        { label: 'Maintenance Log', value: 'maintenance_log' },
        { label: 'Customer Interaction', value: 'customer_interaction' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'category',
      type: 'text',
      index: true,
    },
    {
      name: 'location',
      type: 'text',
      index: true,
    },
    {
      name: 'geoCoordinates',
      type: 'group',
      fields: [
        {
          name: 'latitude',
          type: 'number',
        },
        {
          name: 'longitude',
          type: 'number',
        },
      ],
    },
    {
      name: 'photos',
      type: 'array',
      fields: [
        {
          name: 'filename',
          type: 'text',
        },
        {
          name: 'url',
          type: 'text',
        },
        {
          name: 'googlePhotosId',
          type: 'text',
        },
        {
          name: 'timestamp',
          type: 'date',
        },
      ],
    },
    {
      name: 'meta',
      type: 'json',
      required: true,
      admin: {
        description: 'Extensible metadata specific to the message type. Examples: {startMileage: 50000, endMileage: 50150, distance: 150} or {speciesName: "Monarch Butterfly", wingspan: "4 inches", condition: "excellent"}',
      },
    },
    {
      name: 'analysis',
      type: 'json',
      admin: {
        description: 'AI-generated analysis results',
      },
    },
    {
      name: 'confidence',
      type: 'number',
      min: 0,
      max: 1,
      admin: {
        description: 'AI confidence score (0-1)',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processed', value: 'processed' },
        { label: 'Verified', value: 'verified' },
        { label: 'Archived', value: 'archived' },
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
        { label: 'Critical', value: 'critical' },
      ],
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'updatedAt',
      type: 'date',
      index: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.updatedAt) {
          data.updatedAt = new Date()
        }
        return data
      },
    ],
  },
}

export default InventoryMessages 