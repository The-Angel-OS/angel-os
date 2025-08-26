import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { Archive } from '../blocks/ArchiveBlock/config'
import { CallToAction } from '../blocks/CallToAction/config'
import { Content } from '../blocks/Content/config'
import { FormBlock } from '../blocks/Form/config'
import { MediaBlock } from '../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from '@/fields/slug'
import { populatePublishedAt } from '../hooks/populatePublishedAt'
import { generatePreviewPath } from '../utilities/generatePreviewPath'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Schools: CollectionConfig = {
  slug: 'schools',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // Default populate for school references
  defaultPopulate: {
    name: true,
    slug: true,
    address: true,
    safetyScores: true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'address.city', 'address.state', 'safetyScores.communityScore.overall', 'schoolStatus', 'updatedAt'],
    group: 'SafeSchool|MAP℠',
    description: 'School profiles with safety ratings and verification status',
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'schools',
          req,
        })
        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'schools',
        req,
      }),
  },
  fields: [
    // Basic School Information
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'School Name',
    },
    {
      type: 'tabs',
      tabs: [
        // Hero Tab (same as Pages)
        {
          fields: [hero],
          label: 'Hero',
        },
        // School Details Tab
        {
          label: 'School Details',
          fields: [
            // Location Information
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  label: 'Street Address',
                },
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                  label: 'City',
                },
                {
                  name: 'state',
                  type: 'text',
                  required: true,
                  label: 'State',
                },
                {
                  name: 'zipCode',
                  type: 'text',
                  label: 'ZIP Code',
                },
                {
                  name: 'coordinates',
                  type: 'group',
                  fields: [
                    {
                      name: 'latitude',
                      type: 'number',
                      label: 'Latitude',
                    },
                    {
                      name: 'longitude',
                      type: 'number',
                      label: 'Longitude',
                    },
                  ],
                },
              ],
            },

            // Demographics
            {
              name: 'demographics',
              type: 'group',
              fields: [
                {
                  name: 'schoolType',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Elementary', value: 'elementary' },
                    { label: 'Middle School', value: 'middle' },
                    { label: 'High School', value: 'high' },
                    { label: 'Charter School', value: 'charter' },
                    { label: 'Private School', value: 'private' },
                    { label: 'Magnet School', value: 'magnet' },
                    { label: 'Alternative School', value: 'alternative' },
                  ],
                },
                {
                  name: 'grades',
                  type: 'text',
                  label: 'Grade Levels (e.g., K-5, 9-12)',
                },
                {
                  name: 'enrollment',
                  type: 'number',
                  label: 'Total Enrollment',
                },
                {
                  name: 'studentTeacherRatio',
                  type: 'number',
                  label: 'Student-Teacher Ratio',
                },
                {
                  name: 'district',
                  type: 'text',
                  label: 'School District',
                },
              ],
            },

            // Contact Information
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  name: 'website',
                  type: 'text',
                  label: 'Website URL',
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Phone Number',
                },
              ],
            },

            // External IDs
            {
              name: 'externalData',
              type: 'group',
              label: 'External Data',
              fields: [
                {
                  name: 'ncesId',
                  type: 'text',
                  label: 'NCES School ID',
                  admin: {
                    description: 'National Center for Education Statistics ID',
                  },
                },
                {
                  name: 'stateId',
                  type: 'text',
                  label: 'State School ID',
                },
                {
                  name: 'website',
                  type: 'text',
                  label: 'Official Website',
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Main Phone Number',
                },
              ],
            },

            // Media
            {
              name: 'media',
              type: 'group',
              fields: [
                {
                  name: 'profileImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Profile Image',
                },
                {
                  name: 'gallery',
                  type: 'array',
                  label: 'Photo Gallery',
                  fields: [
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                    },
                    {
                      name: 'caption',
                      type: 'text',
                    },
                  ],
                },
              ],
            },

            // Status and Features
            {
              name: 'schoolStatus',
              type: 'select',
              required: true,
              defaultValue: 'active',
              options: [
                { label: 'Active', value: 'active' },
                { label: 'Pending Review', value: 'pending' },
                { label: 'Suspended', value: 'suspended' },
                { label: 'Closed', value: 'closed' },
              ],
              admin: {
                description: 'Current operational status of the school',
              },
            },
            {
              name: 'featured',
              type: 'checkbox',
              label: 'Featured School',
              defaultValue: false,
            },
          ],
        },
        // Safety Scores Tab
        {
          label: 'Safety Scores',
          fields: [
            {
              name: 'safetyScores',
              type: 'group',
              fields: [
                // Community Safety Score (always available)
                {
                  name: 'communityScore',
                  type: 'group',
                  label: 'Community Safety Score',
                  fields: [
                    {
                      name: 'overall',
                      type: 'number',
                      required: true,
                      min: 0,
                      max: 100,
                      label: 'Overall Score',
                    },
                    {
                      name: 'crimeData',
                      type: 'number',
                      min: 0,
                      max: 100,
                      label: 'Crime Data Score',
                    },
                    {
                      name: 'demographicSafety',
                      type: 'number',
                      min: 0,
                      max: 100,
                      label: 'Demographic Safety Score',
                    },
                    {
                      name: 'lastUpdated',
                      type: 'date',
                      label: 'Last Updated',
                      defaultValue: () => new Date().toISOString(),
                    },
                    {
                      name: 'dataSource',
                      type: 'text',
                      label: 'Data Sources',
                      defaultValue: 'NCES, Census Bureau, Local Crime Statistics',
                    },
                  ],
                },
                // Verified Safety Score (SITE|SAFETYNET℠)
                {
                  name: 'verifiedScore',
                  type: 'group',
                  label: 'SITE|SAFETYNET℠ Verified Score',
                  fields: [
                    {
                      name: 'isVerified',
                      type: 'checkbox',
                      label: 'Verified by SITE|SAFETYNET℠',
                      defaultValue: false,
                    },
                    {
                      name: 'overall',
                      type: 'number',
                      min: 0,
                      max: 100,
                      label: 'Overall Verified Score',
                      admin: {
                        condition: (data: any) => data.safetyScores?.verifiedScore?.isVerified,
                      },
                    },
                    {
                      name: 'verificationDate',
                      type: 'date',
                      label: 'Verification Date',
                      admin: {
                        condition: (data: any) => data.safetyScores?.verifiedScore?.isVerified,
                      },
                    },
                    {
                      name: 'siteAssessment',
                      type: 'group',
                      label: 'Site Assessment Breakdown',
                      admin: {
                        condition: (data: any) => data.safetyScores?.verifiedScore?.isVerified,
                      },
                      fields: [
                        {
                          name: 'physicalSecurity',
                          type: 'number',
                          min: 0,
                          max: 100,
                          label: 'Physical Security',
                        },
                        {
                          name: 'emergencyPreparedness',
                          type: 'number',
                          min: 0,
                          max: 100,
                          label: 'Emergency Preparedness',
                        },
                        {
                          name: 'staffTraining',
                          type: 'number',
                          min: 0,
                          max: 100,
                          label: 'Staff Training',
                        },
                        {
                          name: 'studentWellbeing',
                          type: 'number',
                          min: 0,
                          max: 100,
                          label: 'Student Wellbeing',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // Content Tab (same as Pages)
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              admin: {
                initCollapsed: true,
                description: 'Add custom content blocks to enhance the school profile page',
              },
            },
          ],
          label: 'Content',
        },
        // SEO Tab (same as Pages)
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
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    // Published At (same as Pages)
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    // Slug field (same as Pages)
    ...slugField(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    // Add revalidation hooks if needed
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}