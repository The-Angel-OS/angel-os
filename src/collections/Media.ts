import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content Management',
    description: 'Images, files, and media assets with optimized delivery',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone, // Media needs to be publicly readable for frontend display
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    // TODO: Add tenant fields after proper database migration
    // Tenant Relationship (IRONCLAD DATA SEGMENTATION)
    // {
    //   name: 'tenant',
    //   type: 'relationship',
    //   relationTo: 'tenants',
    //   admin: {
    //     position: 'sidebar',
    //     description: 'Tenant that owns this media (leave empty for shared/global assets)',
    //   },
    // },
    // {
    //   name: 'isShared',
    //   type: 'checkbox',
    //   defaultValue: false,
    //   admin: {
    //     position: 'sidebar',
    //     description: 'Make this media available to all tenants (system-wide)',
    //   },
    // },
  ],
  upload: {
    // Vercel Blob Storage will handle the file storage
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
