import type { CollectionConfig } from 'payload'

export const Appointments: CollectionConfig = {
  slug: 'appointments',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'appointmentType', 'startTime', 'bayAssignment.assignedBay', 'status', 'venue'],
    group: 'CRM',
    description: 'Appointment booking and scheduling system with bay management',
    listSearchableFields: ['title', 'description', 'bayAssignment.assignedBay'],
  },
  access: {
    create: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true

      // Users can create appointments
      if (req.user?.id) return true

      return false
    },
    read: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true

      // Users can read appointments they're involved in
      if (req.user?.id) {
        return {
          organizer: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    update: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true

      // Organizers can update their appointments
      if (req.user?.id) {
        return {
          organizer: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    delete: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true

      // Organizers can delete their appointments
      if (req.user?.id) {
        return {
          organizer: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
  },
  fields: [
    // Basic Information
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Appointment title or subject',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of the appointment',
      },
    },

    // Participants & Relationships
    {
      name: 'organizer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Person organizing/hosting the appointment',
      },
    },
    {
      name: 'attendees',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'People attending the appointment',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'Associated space (optional)',
      },
    },
    {
      name: 'venue',
      type: 'relationship',
      relationTo: 'venues',
      admin: {
        description: 'Venue where appointment takes place',
      },
    },
    {
      name: 'bayAssignment',
      type: 'group',
      label: 'Bay/Station Assignment',
      fields: [
        {
          name: 'assignedBay',
          type: 'text',
          admin: {
            description: 'Specific bay/station for this appointment',
            placeholder: 'Bay 1, Chair A',
          },
        },
        {
          name: 'bayRequired',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Appointment requires a specific bay/station',
          },
        },
        {
          name: 'canFloatBays',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Can use any available bay if assigned bay is unavailable',
          },
        },
      ],
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this appointment belongs to',
        position: 'sidebar',
      },
    },

    // Scheduling
    {
      name: 'startTime',
      type: 'date',
      required: true,
      admin: {
        description: 'Appointment start date and time',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endTime',
      type: 'date',
      required: true,
      admin: {
        description: 'Appointment end date and time',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'timezone',
      type: 'select',
      required: true,
      options: [
        { label: 'Eastern (EST/EDT)', value: 'America/New_York' },
        { label: 'Central (CST/CDT)', value: 'America/Chicago' },
        { label: 'Mountain (MST/MDT)', value: 'America/Denver' },
        { label: 'Pacific (PST/PDT)', value: 'America/Los_Angeles' },
        { label: 'UTC', value: 'UTC' },
        { label: 'London (GMT/BST)', value: 'Europe/London' },
        { label: 'Paris (CET/CEST)', value: 'Europe/Paris' },
        { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
      ],
      defaultValue: 'America/New_York',
      admin: {
        description: 'Timezone for the appointment',
      },
    },
    {
      name: 'recurrence',
      type: 'group',
      label: 'Recurring Appointment',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Make this a recurring appointment',
          },
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
          admin: {
            description: 'Recurrence pattern',
            condition: (data: Record<string, unknown>) => data.enabled === true,
          },
        },
        {
          name: 'interval',
          type: 'number',
          min: 1,
          defaultValue: 1,
          admin: {
            description: 'Repeat every X days/weeks/months',
            condition: (data: Record<string, unknown>) => data.enabled === true,
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            description: 'Stop recurring after this date (optional)',
            condition: (data: Record<string, unknown>) => data.enabled === true,
          },
        },
      ],
    },

    // Meeting Details
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Physical location or address',
      },
    },
    {
      name: 'meetingLink',
      type: 'text',
      admin: {
        description: 'Video call link (Zoom, Meet, etc.)',
      },
    },
    {
      name: 'meetingType',
      type: 'select',
      required: true,
      options: [
        { label: 'In Person', value: 'in_person' },
        { label: 'Video Call', value: 'video_call' },
        { label: 'Phone Call', value: 'phone_call' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
      defaultValue: 'video_call',
      admin: {
        description: 'Type of meeting',
      },
    },
    {
      name: 'appointmentType',
      type: 'select',
      required: true,
      options: [
        { label: 'Standard Install', value: 'standard_install' },
        { label: 'Custom Install', value: 'custom_install' },
        { label: 'Quote/Consultation', value: 'quote_consultation' },
        { label: 'Mobile Service', value: 'mobile_service' },
        { label: 'Beauty Service', value: 'beauty_service' },
        { label: 'Barber Service', value: 'barber_service' },
        { label: 'Auto Repair', value: 'auto_repair' },
        { label: 'Diagnostic', value: 'diagnostic' },
        { label: 'General Meeting', value: 'general_meeting' },
        { label: 'Consultation', value: 'consultation' },
      ],
      defaultValue: 'general_meeting',
      admin: {
        description: 'Type of appointment/service',
      },
    },

    // Booking System
    {
      name: 'bookingSettings',
      type: 'group',
      label: 'Booking Settings',
      fields: [
        {
          name: 'allowRescheduling',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow attendees to reschedule',
          },
        },
        {
          name: 'allowCancellation',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow attendees to cancel',
          },
        },
        {
          name: 'requireConfirmation',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Require organizer confirmation',
          },
        },
        {
          name: 'bufferTime',
          type: 'number',
          min: 0,
          defaultValue: 15,
          admin: {
            description: 'Buffer time in minutes before/after appointment',
          },
        },
        {
          name: 'maxAttendees',
          type: 'number',
          min: 1,
          admin: {
            description: 'Maximum number of attendees (optional)',
          },
        },
      ],
    },

    // Status & Workflow
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
        { label: 'No Show', value: 'no_show' },
      ],
      defaultValue: 'scheduled',
      admin: {
        description: 'Current status of the appointment',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the appointment',
      },
    },

    // Integration Fields
    {
      name: 'calendarEventId',
      type: 'text',
      admin: {
        description: 'External calendar event ID (Google, Outlook, etc.)',
        readOnly: true,
      },
    },
    {
      name: 'remindersSent',
      type: 'array',
      fields: [
        {
          name: 'sentAt',
          type: 'date',
        },
      ],
      admin: {
        description: 'Timestamps of sent reminders',
        readOnly: true,
      },
    },

    // Revenue & Commission Tracking
    {
      name: 'revenueTracking',
      type: 'group',
      label: 'Revenue & Commission',
      fields: [
        {
          name: 'source',
          type: 'select',
          required: true,
          defaultValue: 'system_generated',
          options: [
            { label: 'System Generated', value: 'system_generated' },
            { label: 'Pickup Job (Self-Acquired)', value: 'pickup_job' },
            { label: 'Referral Source', value: 'referral_source' },
            { label: 'Repeat Customer', value: 'repeat_customer' },
          ],
          admin: {
            description: 'How this appointment was acquired - affects commission rates',
          },
        },
        {
          name: 'commissionRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            step: 0.1,
            description: 'Calculated commission rate (%) for this appointment',
            readOnly: true,
          },
        },
        {
          name: 'commissionAmount',
          type: 'number',
          min: 0,
          admin: {
            step: 0.01,
            description: 'Calculated commission amount in dollars',
            readOnly: true,
          },
        },
      ],
    },

    // Payment Integration (for paid consultations)
    {
      name: 'payment',
      type: 'group',
      label: 'Payment Details',
      fields: [
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Payment required for this appointment',
          },
        },
        {
          name: 'amount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Payment amount in cents',
            condition: (data: Record<string, unknown>) => data.required === true,
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
            { label: 'GBP', value: 'gbp' },
            { label: 'CAD', value: 'cad' },
          ],
          defaultValue: 'usd',
          admin: {
            condition: (data: Record<string, unknown>) => data.required === true,
          },
        },
        {
          name: 'stripePaymentIntentId',
          type: 'text',
          admin: {
            description: 'Stripe payment intent ID',
            readOnly: true,
            condition: (data: Record<string, unknown>) => data.required === true,
          },
        },
        {
          name: 'paymentStatus',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Paid', value: 'paid' },
            { label: 'Failed', value: 'failed' },
            { label: 'Refunded', value: 'refunded' },
          ],
          admin: {
            condition: (data: Record<string, unknown>) => data.required === true,
          },
        },
      ],
    },

    // Feedback & Follow-up
    {
      name: 'feedback',
      type: 'group',
      label: 'Post-Appointment Feedback',
      admin: {
        condition: (data: Record<string, unknown>) => data.status === 'completed',
      },
      fields: [
        {
          name: 'organizerRating',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Rating from organizer (1-5 stars)',
          },
        },
        {
          name: 'attendeeRating',
          type: 'number',
          min: 1,
          max: 5,
          admin: {
            description: 'Average rating from attendees (1-5 stars)',
          },

        },
        {
          name: 'organizerNotes',
          type: 'textarea',
          admin: {
            description: 'Organizer notes after appointment',
          },
        },
        {
          name: 'followUpRequired',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark for follow-up action',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        // Validate end time is after start time
        if (data?.startTime && data?.endTime) {
          const start = new Date(data.startTime)
          const end = new Date(data.endTime)

          if (end <= start) {
            throw new Error('End time must be after start time')
          }
        }

        // Auto-confirm if confirmation not required
        if (data?.bookingSettings?.requireConfirmation === false && data?.status === 'scheduled') {
          data.status = 'confirmed'
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Log appointment changes
        console.log(`Appointment ${operation}: ${doc.title} - ${doc.status}`)

        // Handle status changes
        if (operation === 'update' && previousDoc?.status !== doc.status) {
          switch (doc.status) {
            case 'confirmed':
              console.log(`Appointment confirmed: ${doc.title}`)
              // TODO: Send confirmation emails
              break
            case 'cancelled':
              console.log(`Appointment cancelled: ${doc.title}`)
              // TODO: Send cancellation notifications, handle refunds
              break
            case 'completed':
              console.log(`Appointment completed: ${doc.title}`)
              // TODO: Send feedback requests
              break
          }
        }

        // TODO: Integration with calendar services
        // - Create/update calendar events
        // - Send meeting invitations
        // - Set up automated reminders
      },
    ],
  },
  indexes: [
    {
      fields: ['tenant', 'organizer'],
    },
    {
      fields: ['tenant', 'startTime'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['startTime'],
    },
    {
      fields: ['space'],
    },
  ],
  timestamps: true,
}


