import type { CollectionConfig } from 'payload'

export const AIGenerationQueue: CollectionConfig = {
  slug: 'ai-generation-queue',
  admin: {
    useAsTitle: 'generationType',
    defaultColumns: ['space', 'generationType', 'status', 'createdAt'],
    description: 'Queue for AI-powered content and merchandise generation',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // Core References
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Space requesting the generation',
      },
    },

    // Generation Configuration
    {
      name: 'generationType',
      type: 'select',
      required: true,
      options: [
        { label: 'Merchandise Design', value: 'merchandise_design' },
        { label: 'Social Media Content', value: 'social_content' },
        { label: 'Product Description', value: 'product_description' },
        { label: 'Blog Post', value: 'blog_post' },
        { label: 'Marketing Copy', value: 'marketing_copy' },
      ],
      admin: {
        description: 'Type of content to generate',
      },
    },

    // Source Data for Generation
    {
      name: 'sourceData',
      type: 'group',
      label: 'Source Data',
      fields: [
        {
          name: 'youtubeChannelId',
          type: 'text',
          admin: {
            description: 'YouTube Channel ID for content analysis',
            condition: (data: Record<string, unknown>) => data.generationType === 'merchandise_design',
          },
        },
        {
          name: 'brandingGuidelines',
          type: 'textarea',
          admin: {
            description: 'Brand voice, colors, style preferences',
          },
        },
        {
          name: 'targetAudience',
          type: 'text',
          admin: {
            description: 'Target demographic for the content',
          },
        },
        {
          name: 'contentThemes',
          type: 'array',
          label: 'Content Themes',
          fields: [
            {
              name: 'theme',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'Key themes to incorporate',
          },
        },
        {
          name: 'existingContent',
          type: 'relationship',
          relationTo: ['posts', 'pages'],
          hasMany: true,
          admin: {
            description: 'Existing content to analyze for style',
          },
        },
      ],
    },

    // Generation Parameters
    {
      name: 'parameters',
      type: 'group',
      label: 'Generation Parameters',
      fields: [
        {
          name: 'productType',
          type: 'select',
          options: [
            { label: 'Coffee Mug', value: 'coffee_mug' },
            { label: 'T-Shirt', value: 't_shirt' },
            { label: 'Sticker Pack', value: 'sticker_pack' },
            { label: 'Poster', value: 'poster' },
            { label: 'Hoodie', value: 'hoodie' },
            { label: 'Phone Case', value: 'phone_case' },
          ],
          admin: {
            description: 'Product type for merchandise generation',
            condition: (data: Record<string, unknown>) => data.generationType === 'merchandise_design',
          },
        },
        {
          name: 'styleGuide',
          type: 'select',
          options: [
            { label: 'Modern & Clean', value: 'modern' },
            { label: 'Vintage & Retro', value: 'vintage' },
            { label: 'Bold & Colorful', value: 'bold' },
            { label: 'Minimalist', value: 'minimalist' },
            { label: 'Hand-drawn', value: 'handdrawn' },
          ],
          defaultValue: 'modern',
          admin: {
            description: 'Visual style for the generation',
          },
        },
        {
          name: 'colorScheme',
          type: 'array',
          label: 'Color Scheme',
          fields: [
            {
              name: 'color',
              type: 'text',
              required: true,
              admin: {
                description: 'Hex color code (e.g., #3B82F6)',
              },
            },
          ],
          admin: {
            description: 'Preferred colors for the design',
          },
        },
        {
          name: 'textElements',
          type: 'array',
          label: 'Text Elements',
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
            {
              name: 'emphasis',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Accent', value: 'accent' },
              ],
              defaultValue: 'primary',
            },
          ],
          admin: {
            description: 'Text to include in the design',
          },
        },
        {
          name: 'customPrompt',
          type: 'textarea',
          admin: {
            description: 'Custom AI prompt for specific requirements',
          },
        },
      ],
    },

    // Generation Status & Results
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'queued',
      admin: {
        description: 'Current generation status',
      },
    },

    {
      name: 'progress',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Generation progress percentage',
      },
    },

    {
      name: 'generatedAssets',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Generated images, videos, or other assets',
      },
    },

    {
      name: 'printReadyFiles',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Print-ready files for merchandise production',
        condition: (data: Record<string, unknown>) => data.generationType === 'merchandise_design',
      },
    },

    {
      name: 'generatedText',
      type: 'textarea',
      admin: {
        description: 'Generated text content (descriptions, copy, etc.)',
      },
    },

    // Approval & Quality Control
    {
      name: 'approvalStatus',
      type: 'select',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Needs Revision', value: 'revision' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      admin: {
        description: 'Approval status for generated content',
      },
    },

    {
      name: 'reviewNotes',
      type: 'textarea',
      admin: {
        description: 'Notes from reviewer or feedback for revisions',
      },
    },

    {
      name: 'qualityScore',
      type: 'number',
      min: 0,
      max: 10,
      admin: {
        description: 'AI-generated quality score (0-10)',
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
        description: 'Tenant that owns this AI generation task',
      },
    },

    // Processing Metadata
    {
      name: 'processingMetadata',
      type: 'group',
      label: 'Processing Details',
      admin: {
        condition: () => false, // Hidden from admin - system use only
      },
      fields: [
        {
          name: 'modelUsed',
          type: 'text',
          admin: {
            description: 'AI model used for generation',
          },
        },
        {
          name: 'processingTime',
          type: 'number',
          admin: {
            description: 'Processing time in seconds',
          },
        },
        {
          name: 'tokensUsed',
          type: 'number',
          admin: {
            description: 'AI tokens consumed',
          },
        },
        {
          name: 'errorMessage',
          type: 'textarea',
          admin: {
            description: 'Error details if generation failed',
          },
        },
      ],
    },
  ],

  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        // Auto-set initial timestamps
        if (data && !data.queuedAt) {
          data.queuedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`AI Generation queued: ${doc.generationType} for space ${doc.space}`)
          // TODO: Trigger AI generation process
        }

        if (operation === 'update' && doc.status === 'completed') {
          console.log(`AI Generation completed: ${doc.generationType} - ${doc.generatedAssets?.length || 0} assets`)
          // TODO: Trigger post-generation workflows (e.g., auto-create products)
        }
      },
    ],
  },

  timestamps: true,
}
