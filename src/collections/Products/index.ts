import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateProduct, revalidateDeleteProduct } from './hooks/revalidateProduct'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Products: CollectionConfig<'products'> = {
  slug: 'products',
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a product is referenced
  defaultPopulate: {
    title: true,
    sku: true,
    status: true,
    pricing: {
      basePrice: true,
      currency: true,
    },
    inventory: {
      quantity: true,
    },
    tenant: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'pricing.basePrice', 'status', 'tenant', 'updatedAt'],
    group: 'Commerce',
    description: 'Products with flexible layouts, variants, and e-commerce features',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'products',
          req,
        })
        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
    listSearchableFields: ['title', 'description', 'sku'],
    pagination: {
      defaultLimit: 10,
      limits: [10, 20, 50],
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero & Gallery',
          fields: [
            hero,
            {
              name: 'gallery',
              type: 'array',
              label: 'Product Images',
              minRows: 1,
              maxRows: 10,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'alt',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                },
              ],
              admin: {
                description: 'Upload product images. First image will be used as the main product image.',
              },
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Short product description for listings and previews',
              },
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              admin: {
                initCollapsed: true,
                description: 'Flexible content blocks for detailed product information',
              },
            },
          ],
        },
        {
          label: 'Pricing & Inventory',
          fields: [
            // Product Type (determines commission rates)
            {
              name: 'productType',
              type: 'select',
              required: true,
              defaultValue: 'business_service',
              options: [
                { label: 'AI-Generated Print on Demand', value: 'ai_print_demand' },
                { label: 'One-on-One Consultation', value: 'consultation_solo' },
                { label: 'Group Session/Event', value: 'group_event' },
                { label: 'LiveKit Streaming Event', value: 'livekit_stream' },
                { label: 'Digital Download', value: 'digital_download' },
                { label: 'Physical Product', value: 'physical' },
                { label: 'Subscription Service', value: 'subscription' },
                { label: 'Course/Training Program', value: 'course_training' },
                { label: 'Business Service', value: 'business_service' },
                { label: 'Automation/Integration', value: 'automation' },
              ],
              admin: {
                description: 'Product type determines default commission rates and revenue sharing',
              },
            },
            // Pricing
            {
              name: 'pricing',
              type: 'group',
              fields: [
                {
                  name: 'basePrice',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    step: 0.01,
                    description: 'Base price in dollars',
                  },
                },
                {
                  name: 'salePrice',
                  type: 'number',
                  min: 0,
                  admin: {
                    step: 0.01,
                    description: 'Sale price (if on sale)',
                  },
                },
                {
                  name: 'compareAtPrice',
                  type: 'number',
                  min: 0,
                  admin: {
                    step: 0.01,
                    description: 'Compare at price (MSRP)',
                  },
                },
                {
                  name: 'currency',
                  type: 'select',
                  defaultValue: 'USD',
                  options: [
                    { label: 'USD', value: 'USD' },
                    { label: 'EUR', value: 'EUR' },
                    { label: 'GBP', value: 'GBP' },
                    { label: 'CAD', value: 'CAD' },
                  ],
                },
              ],
            },
            // Inventory
            {
              name: 'inventory',
              type: 'group',
              fields: [
                {
                  name: 'trackQuantity',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Track inventory for this product',
                  },
                },
                {
                  name: 'quantity',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  admin: {
                    condition: (data) => data.inventory?.trackQuantity,
                    description: 'Current stock quantity',
                  },
                },
                {
                  name: 'lowStockThreshold',
                  type: 'number',
                  defaultValue: 5,
                  min: 0,
                  admin: {
                    condition: (data) => data.inventory?.trackQuantity,
                    description: 'Alert when stock falls below this number',
                  },
                },
                {
                  name: 'allowBackorder',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    condition: (data) => data.inventory?.trackQuantity,
                    description: 'Allow purchases when out of stock',
                  },
                },
              ],
            },
            // SKU
            {
              name: 'sku',
              type: 'text',
              label: 'SKU',
              unique: true,
              admin: {
                description: 'Stock Keeping Unit - unique product identifier',
              },
            },
          ],
        },
        {
          label: 'Commission & Revenue',
          fields: [
            // Commission Rate Templates by Product Type
            {
              name: 'commissionTemplate',
              type: 'group',
              label: 'Commission Rate Template',
              admin: {
                description: 'Default commission rates based on product type - can be overridden below',
              },
              fields: [
                {
                  name: 'defaultRate',
                  type: 'number',
                  admin: {
                    readOnly: true,
                    description: 'Calculated based on product type',
                  },
                },
                {
                  name: 'rationale',
                  type: 'textarea',
                  admin: {
                    readOnly: true,
                    description: 'Why this rate makes sense for this product type',
                  },
                },
              ],
              hooks: {
                beforeChange: [
                  ({ data }) => {
                    if (!data) return data

                    const productType = data.productType
                    let defaultRate = 3.0 // fallback
                    let rationale = 'Standard platform rate'

                    switch (productType) {
                      case 'ai_print_demand':
                        defaultRate = 15.0
                        rationale = 'High margin digital product with AI generation costs, platform handles all fulfillment'
                        break
                      case 'consultation_solo':
                        defaultRate = 8.0
                        rationale = 'Personal expertise service, platform provides booking and payment processing'
                        break
                      case 'group_event':
                        defaultRate = 12.0
                        rationale = 'Scalable group delivery, platform provides infrastructure and participant management'
                        break
                      case 'livekit_stream':
                        defaultRate = 20.0
                        rationale = 'High-value streaming infrastructure with YouTube-scale capabilities via LiveKit'
                        break
                      case 'digital_download':
                        defaultRate = 10.0
                        rationale = 'Digital delivery with storage, bandwidth, and security infrastructure'
                        break
                      case 'physical':
                        defaultRate = 5.0
                        rationale = 'Lower margin physical goods, platform handles payment and order management'
                        break
                      case 'subscription':
                        defaultRate = 6.0
                        rationale = 'Recurring revenue model, platform provides subscription management'
                        break
                      case 'course_training':
                        defaultRate = 15.0
                        rationale = 'High-value educational content with platform-provided learning management system'
                        break
                      case 'business_service':
                        defaultRate = 4.0
                        rationale = 'Professional B2B services, platform provides business tools and client management'
                        break
                      case 'automation':
                        defaultRate = 7.0
                        rationale = 'Technical integration services with ongoing platform support'
                        break
                    }

                    return {
                      ...data,
                      commissionTemplate: {
                        defaultRate,
                        rationale
                      }
                    }
                  }
                ]
              }
            },
            // Commission & Revenue Sharing
            {
              name: 'commission',
              type: 'group',
              label: 'Commission Settings',
              fields: [
                {
                  name: 'useCustomRate',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Override tenant default commission rate for this product',
                  },
                },
                {
                  name: 'customCommissionRate',
                  type: 'number',
                  min: 0,
                  max: 100,
                  admin: {
                    step: 0.1,
                    description: 'Custom commission rate (%) for this product',
                    condition: (data) => data.commission?.useCustomRate,
                  },
                },
                {
                  name: 'sourceMultipliers',
                  type: 'group',
                  label: 'Source-Based Rate Multipliers',
                  fields: [
                    {
                      name: 'systemGenerated',
                      type: 'number',
                      defaultValue: 1.0,
                      min: 0,
                      max: 5,
                      admin: {
                        step: 0.1,
                        description: 'Multiplier for system-generated appointments (1.0 = base rate)',
                      },
                    },
                    {
                      name: 'pickupJob',
                      type: 'number',
                      defaultValue: 0.5,
                      min: 0,
                      max: 5,
                      admin: {
                        step: 0.1,
                        description: 'Multiplier for pickup/self-acquired jobs (0.5 = half rate)',
                      },
                    },
                    {
                      name: 'referralSource',
                      type: 'number',
                      defaultValue: 1.5,
                      min: 0,
                      max: 5,
                      admin: {
                        step: 0.1,
                        description: 'Multiplier for referral-sourced business (1.5 = 150% rate)',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Details & Attributes',
          fields: [
            // Product Details
            {
              name: 'details',
              type: 'group',
              fields: [
                {
                  name: 'weight',
                  type: 'number',
                  admin: {
                    step: 0.01,
                    description: 'Weight in pounds',
                  },
                },
                {
                  name: 'dimensions',
                  type: 'group',
                  fields: [
                    {
                      name: 'length',
                      type: 'number',
                      admin: { step: 0.01 },
                    },
                    {
                      name: 'width',
                      type: 'number',
                      admin: { step: 0.01 },
                    },
                    {
                      name: 'height',
                      type: 'number',
                      admin: { step: 0.01 },
                    },
                    {
                      name: 'unit',
                      type: 'select',
                      defaultValue: 'in',
                      options: [
                        { label: 'Inches', value: 'in' },
                        { label: 'Centimeters', value: 'cm' },
                        { label: 'Feet', value: 'ft' },
                        { label: 'Meters', value: 'm' },
                      ],
                    },
                  ],
                },
              ],
            },
            // Service/Experience Fields
            {
              name: 'serviceDetails',
              type: 'group',
              fields: [
                {
                  name: 'duration',
                  type: 'number',
                  admin: {
                    description: 'Duration in minutes',
                  },
                },
                {
                  name: 'location',
                  type: 'select',
                  options: [
                    { label: 'On-site', value: 'onsite' },
                    { label: 'Remote/Virtual', value: 'remote' },
                    { label: 'Customer Location', value: 'customer' },
                    { label: 'Flexible', value: 'flexible' },
                  ],
                },
                {
                  name: 'maxParticipants',
                  type: 'number',
                  min: 1,
                  admin: {
                    description: 'Maximum number of participants',
                  },
                },
                {
                  name: 'bookingRequired',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
              admin: {
                condition: (data) => ['business_service', 'group_event', 'consultation_solo', 'course_training'].includes(data.productType),
              },
            },
            // Digital Product Fields
            {
              name: 'digitalAssets',
              type: 'array',
              fields: [
                {
                  name: 'file',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
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
              ],
              admin: {
                condition: (data) => ['digital_download', 'course_training'].includes(data.productType),
                description: 'Digital files delivered after purchase',
              },
            },
            // Shipping (for physical products)
            {
              name: 'shipping',
              type: 'group',
              fields: [
                {
                  name: 'requiresShipping',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'freeShipping',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    condition: (data) => data.shipping?.requiresShipping,
                  },
                },
                {
                  name: 'shippingClass',
                  type: 'select',
                  options: [
                    { label: 'Standard', value: 'standard' },
                    { label: 'Heavy/Oversized', value: 'heavy' },
                    { label: 'Fragile', value: 'fragile' },
                    { label: 'Hazardous', value: 'hazardous' },
                    { label: 'Cold Chain', value: 'cold' },
                  ],
                  admin: {
                    condition: (data) => data.shipping?.requiresShipping,
                  },
                },
              ],
              admin: {
                condition: (data) => data.productType === 'physical',
              },
            },
          ],
        },
        {
          label: 'Organization',
          fields: [
            // Categories and Organization
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              admin: {
                description: 'Product categories for organization and filtering',
              },
            },
            {
              name: 'tags',
              type: 'array',
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  required: true,
                },
              ],
              admin: {
                description: 'Tags for search and filtering',
              },
            },
            // Related Products
            {
              name: 'relatedProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              maxDepth: 1,
              admin: {
                description: 'Related or recommended products',
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,
              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
            {
              name: 'keywords',
              type: 'text',
              localized: true,
              admin: {
                description: 'Comma-separated keywords for SEO',
              },
            },
          ],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Product goes live at this date',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Out of Stock', value: 'out_of_stock' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this product on homepage',
      },
    },
    // Multi-tenant Support
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Which tenant this product belongs to',
      },
    },
    // Variants
    {
      name: 'hasVariants',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Enable for products with size, color, or other variations',
      },
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [revalidateProduct],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDeleteProduct],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  timestamps: true,
}
















