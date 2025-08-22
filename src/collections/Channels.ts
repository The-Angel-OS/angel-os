import type { CollectionConfig } from 'payload'

const Channels: CollectionConfig = {
  slug: 'channels',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'channelType', 'reportType', 'feedSource', 'phyleAffiliation'],
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
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'channelType',
      type: 'select',
      required: true,
      options: [
        { label: 'Photo Analysis', value: 'photo_analysis' },
        { label: 'Document Processing', value: 'document_processing' },
        { label: 'Data Collection', value: 'data_collection' },
        { label: 'Monitoring', value: 'monitoring' },
        { label: 'Intelligence Gathering', value: 'intelligence_gathering' },
        { label: 'Economic Analysis', value: 'economic_analysis' },
        { label: 'Chat', value: 'chat' },
        { label: 'Communication', value: 'communication' },
      ],
    },
    {
      name: 'reportType',
      type: 'select',
      required: true,
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
      name: 'feedConfiguration',
      type: 'group',
      fields: [
        {
          name: 'feedSource',
          type: 'select',
          options: [
            { label: 'Google Photos', value: 'google_photos' },
            { label: 'Google Drive', value: 'google_drive' },
            { label: 'OneDrive', value: 'onedrive' },
            { label: 'Dropbox', value: 'dropbox' },
            { label: 'Amazon S3', value: 'amazon_s3' },
            { label: 'Manual Upload', value: 'manual_upload' },
            { label: 'API Webhook', value: 'api_webhook' },
          ],
        },
        {
          name: 'feedSettings',
          type: 'json',
          admin: {
            description: 'Source-specific configuration (OAuth tokens, folder paths, etc.)',
          },
        },
        {
          name: 'pollingInterval',
          type: 'number',
          admin: {
            description: 'How often to check for new content (minutes)',
          },
          defaultValue: 60,
        },
        {
          name: 'filters',
          type: 'group',
          fields: [
            {
              name: 'fileTypes',
              type: 'array',
              fields: [
                {
                  name: 'type',
                  type: 'text',
                },
              ],
            },
            {
              name: 'keywords',
              type: 'array',
              fields: [
                {
                  name: 'keyword',
                  type: 'text',
                },
              ],
            },
            {
              name: 'dateRange',
              type: 'group',
              fields: [
                {
                  name: 'from',
                  type: 'date',
                },
                {
                  name: 'to',
                  type: 'date',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'economics',
      type: 'group',
      label: 'Phyle Economics',
      fields: [
        {
          name: 'phyleAffiliation',
          type: 'select',
          options: [
            { label: 'Collector Phyle', value: 'collector_phyle' },
            { label: 'Logistics Phyle', value: 'logistics_phyle' },
            { label: 'Analyst Phyle', value: 'analyst_phyle' },
            { label: 'Maintenance Phyle', value: 'maintenance_phyle' },
            { label: 'Quality Phyle', value: 'quality_phyle' },
            { label: 'Customer Service Phyle', value: 'customer_service_phyle' },
            { label: 'Independent Agent', value: 'independent_agent' },
          ],
        },
        {
          name: 'model',
          type: 'group',
          fields: [
            {
              name: 'processingFee',
              type: 'number',
              admin: {
                description: 'Fee per item processed (in internal currency)',
              },
            },
            {
              name: 'accuracyBonus',
              type: 'number',
              admin: {
                description: 'Bonus for high accuracy/quality',
              },
            },
            {
              name: 'speedBonus',
              type: 'number',
              admin: {
                description: 'Bonus for fast processing',
              },
            },
            {
              name: 'volumeDiscounts',
              type: 'array',
              fields: [
                {
                  name: 'threshold',
                  type: 'number',
                },
                {
                  name: 'discount',
                  type: 'number',
                },
              ],
            },
            {
              name: 'sharing',
              type: 'select',
              options: [
                { label: 'Fixed Fee', value: 'fixed_fee' },
                { label: 'Percentage Split', value: 'percentage_split' },
                { label: 'Performance Based', value: 'performance_based' },
                { label: 'Subscription', value: 'subscription' },
                { label: 'Phyle Collective', value: 'phyle_collective' },
              ],
            },
          ],
        },
        {
          name: 'stats',
          type: 'group',
          fields: [
            {
              name: 'totalEarned',
              type: 'number',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'itemsProcessed',
              type: 'number',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'accuracyScore',
              type: 'number',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'phyleRank',
              type: 'number',
              admin: {
                readOnly: true,
              },
            },
            {
              name: 'reputation',
              type: 'number',
              admin: {
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'processingRules',
      type: 'group',
      fields: [
        {
          name: 'autoProcessing',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'requiresHumanReview',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'confidenceThreshold',
          type: 'number',
          min: 0,
          max: 1,
          defaultValue: 0.8,
        },
        {
          name: 'customPrompts',
          type: 'array',
          fields: [
            {
              name: 'trigger',
              type: 'text',
            },
            {
              name: 'prompt',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'outputFormat',
          type: 'select',
          options: [
            { label: 'JSON', value: 'json' },
            { label: 'CSV', value: 'csv' },
            { label: 'PDF Report', value: 'pdf' },
            { label: 'Excel', value: 'excel' },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Deprecated', value: 'deprecated' },
      ],
    },
    {
      name: 'lastProcessed',
      type: 'date',
    },
    {
      name: 'createdAt',
      type: 'date',
      required: true,
    },
    {
      name: 'updatedAt',
      type: 'date',
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

export default Channels 