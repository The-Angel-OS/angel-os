import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventType', 'eventDate', 'status', 'attendeeCount', 'tenant'],
    group: 'Business',
    description: 'Memorialized events for follow-up, feedback, and community building',
  },
  access: {
    create: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      return Boolean(req.user) // Authenticated users can create events
    },
    read: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      // Simplified access - public events only
      return { isPublic: { equals: true } }
    },
    update: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      return { tenant: { equals: req.user?.tenant } }
    },
    delete: ({ req }) => (req.user as any)?.globalRole === 'super_admin',
  },
  fields: [
    // Core event information
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Event name or title',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the event title',
      },
      hooks: {
        beforeValidate: [
          ({ data, operation }) => {
            if (data?.title && !data?.slug) {
              return data.title
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '')
            }
            return data?.slug
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed event description',
      },
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Concert/Performance', value: 'concert' },
        { label: 'Conference/Summit', value: 'conference' },
        { label: 'Workshop/Class', value: 'workshop' },
        { label: 'Book Signing', value: 'book_signing' },
        { label: 'Meet & Greet', value: 'meet_greet' },
        { label: 'Corporate Event', value: 'corporate' },
        { label: 'Social Gathering', value: 'social' },
        { label: 'Educational', value: 'educational' },
        { label: 'Entertainment', value: 'entertainment' },
        { label: 'Networking', value: 'networking' },
      ],
    },
    
    // Event timing
    {
      name: 'eventDate',
      type: 'date',
      required: true,
      admin: {
        description: 'Main event date',
      },
    },
    {
      name: 'startTime',
      type: 'date',
      admin: {
        description: 'Event start time',
      },
    },
    {
      name: 'endTime',
      type: 'date',
      admin: {
        description: 'Event end time',
      },
    },
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'America/New_York',
      admin: {
        description: 'Event timezone',
      },
    },
    
    // Venue information
    {
      name: 'venue',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Venue name',
          },
        },
        {
          name: 'address',
          type: 'textarea',
          admin: {
            description: 'Full venue address',
          },
        },
        {
          name: 'capacity',
          type: 'number',
          admin: {
            description: 'Maximum attendee capacity',
          },
        },
        {
          name: 'venueType',
          type: 'select',
          options: [
            { label: 'Indoor Venue', value: 'indoor' },
            { label: 'Outdoor Venue', value: 'outdoor' },
            { label: 'Virtual/Online', value: 'virtual' },
            { label: 'Hybrid', value: 'hybrid' },
          ],
        },
        {
          name: 'amenities',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Venue amenities and features',
          },
        },
      ],
    },
    
    // Event organizers and performers
    {
      name: 'organizers',
      type: 'array',
      label: 'Event Organizers',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'Role in event (e.g., "Event Coordinator", "Lead Organizer")',
          },
        },
        {
          name: 'contact',
          type: 'email',
        },
      ],
    },
    {
      name: 'performers',
      type: 'array',
      label: 'Performers/Speakers',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'Role (e.g., "Keynote Speaker", "Lead Vocalist", "Author")',
          },
        },
        {
          name: 'bio',
          type: 'textarea',
        },
        {
          name: 'photo',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            { name: 'platform', type: 'text' },
            { name: 'url', type: 'text' },
          ],
        },
      ],
    },
    
    // Event media gallery
    {
      name: 'mediaGallery',
      type: 'group',
      label: 'Event Media Gallery',
      fields: [
        {
          name: 'heroImage',
          type: 'relationship',
          relationTo: 'media',
          admin: {
            description: 'Main event promotional image',
          },
        },
        {
          name: 'eventPhotos',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Photos from the event',
          },
        },
        {
          name: 'promotionalVideos',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Promotional or recap videos',
          },
        },
        {
          name: 'documents',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Programs, schedules, technical riders, etc.',
          },
        },
        {
          name: 'socialContent',
          type: 'relationship',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Social media content, behind-the-scenes',
          },
        },
      ],
    },
    
    // Attendee information
    {
      name: 'attendeeStats',
      type: 'group',
      label: 'Attendee Statistics',
      fields: [
        {
          name: 'expectedAttendees',
          type: 'number',
          admin: {
            description: 'Expected number of attendees',
          },
        },
        {
          name: 'actualAttendees',
          type: 'number',
          admin: {
            description: 'Actual number of attendees',
          },
        },
        {
          name: 'noShows',
          type: 'number',
          admin: {
            description: 'Number of no-shows',
          },
        },
        {
          name: 'waitlistSize',
          type: 'number',
          admin: {
            description: 'Number of people on waitlist',
          },
        },
      ],
    },
    
    // Related entities
    {
      name: 'relatedProduct',
      type: 'relationship',
      relationTo: 'products',
      admin: {
        description: 'Product that generated this event (if applicable)',
      },
    },
    {
      name: 'relatedOrders',
      type: 'relationship',
      relationTo: 'orders',
      hasMany: true,
      admin: {
        description: 'Orders/bookings for this event',
      },
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: {
        description: 'Blog posts or articles about this event',
      },
    },
    
    // Event status
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'Active/Live', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Postponed', value: 'postponed' },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Display publicly for attendee access',
      },
    },
    {
      name: 'allowFeedback',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Allow attendees to leave feedback',
      },
    },
    
    // Business data
    {
      name: 'revenue',
      type: 'group',
      label: 'Revenue & Analytics',
      fields: [
        {
          name: 'totalRevenue',
          type: 'number',
          admin: {
            description: 'Total revenue generated',
            readOnly: true,
          },
        },
        {
          name: 'averageTicketPrice',
          type: 'number',
          admin: {
            description: 'Average ticket price',
            readOnly: true,
          },
        },
        {
          name: 'feedbackSummary',
          type: 'group',
          fields: [
            {
              name: 'averageRating',
              type: 'number',
              admin: {
                description: 'Average feedback rating',
                readOnly: true,
              },
            },
            {
              name: 'totalFeedback',
              type: 'number',
              admin: {
                description: 'Number of feedback responses',
                readOnly: true,
              },
            },
            {
              name: 'npsScore',
              type: 'number',
              admin: {
                description: 'Net Promoter Score',
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
    
    // Tenant isolation
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this event belongs to',
      },
    },
  ],
  
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation === 'create') {
          console.log(`Event created: ${doc.title} for ${doc.eventDate}`)
          // TODO: Set up automatic feedback collection triggers
        }
        
        if (operation === 'update' && doc.status === 'completed') {
          console.log(`Event completed: ${doc.title} - triggering feedback collection`)
          // TODO: Send feedback requests to all attendees
        }
      },
    ],
  },
  
  timestamps: true,
}
