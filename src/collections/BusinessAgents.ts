import type { CollectionConfig } from 'payload'

export const BusinessAgents: CollectionConfig = {
  slug: 'business-agents',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'spiritType', 'tenant', 'isActive', 'createdAt'],
    group: 'Platform Management',
    description: 'The Spirit of the Endeavor - each business agent embodies the human soul and personality behind a tenant or space',
    hidden: ({ user }) => {
      // Only show to Host (Super Admin) users, like DNN
      return (user as any)?.globalRole !== 'super_admin'
    },
  },
  access: {
    // Tenant-scoped access control
    create: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true
      return false
    },
    read: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true
      const tenantId = typeof req.user?.tenant === 'object' ? req.user?.tenant?.id : req.user?.tenant
      return tenantId ? { 'tenant.id': { equals: tenantId } } : false
    },
    update: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true
      const tenantId = typeof req.user?.tenant === 'object' ? req.user?.tenant?.id : req.user?.tenant
      return tenantId ? { 'tenant.id': { equals: tenantId } } : false
    },
    delete: ({ req }) => {
      // Type cast to access globalRole (working around type definition issues)
      const userWithRole = req.user as any
      if (userWithRole?.globalRole === 'super_admin') return true
      if (userWithRole?.globalRole === 'platform_admin') return true
      return false
    },
  },
  fields: [
    // Core Identity
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The name/persona of this business spirit (e.g., "Maria\'s Creative Spirit", "Joe\'s Pizza Master")',
      },
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Visual representation of this business spirit',
      },
    },
    {
      name: 'spiritType',
      type: 'select',
      required: true,
      options: [
        { label: 'Primary Business Spirit', value: 'primary' },
        { label: 'Service Line Spirit', value: 'service' },
        { label: 'Product Line Spirit', value: 'product' },
        { label: 'Creative Endeavor Spirit', value: 'creative' },
        { label: 'Community Spirit', value: 'community' },
        { label: 'Support Spirit', value: 'support' },
      ],
      defaultValue: 'primary',
      admin: {
        description: 'The type of spirit this agent represents',
      },
    },

    // Business Context
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'The tenant this spirit serves',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'Specific space this spirit manages (optional - primary spirits manage entire tenant)',
      },
    },
    {
      name: 'humanPartner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'The human whose spirit this agent embodies',
      },
    },

    // Spirit Personality & Knowledge
    {
      name: 'personality',
      type: 'group',
      label: 'Spirit Personality',
      admin: {
        description: 'The personality traits and characteristics of this business spirit',
      },
      fields: [
        {
          name: 'coreValues',
          type: 'textarea',
          admin: {
            description: 'Core values and principles that guide this spirit',
            placeholder: 'e.g., "Authentic Italian tradition, family recipes passed down through generations, treating every customer like family"',
          },
        },
        {
          name: 'communicationStyle',
          type: 'select',
          options: [
            { label: 'Professional & Formal', value: 'professional' },
            { label: 'Friendly & Casual', value: 'friendly' },
            { label: 'Warm & Nurturing', value: 'nurturing' },
            { label: 'Energetic & Enthusiastic', value: 'energetic' },
            { label: 'Calm & Wise', value: 'wise' },
            { label: 'Creative & Inspiring', value: 'creative' },
            { label: 'Direct & Practical', value: 'direct' },
          ],
          defaultValue: 'friendly',
          admin: {
            description: 'How this spirit communicates with customers and team',
          },
        },
        {
          name: 'specialExpertise',
          type: 'textarea',
          admin: {
            description: 'Specific areas of expertise and knowledge this spirit possesses',
            placeholder: 'e.g., "20 years of pizza making, knows every ingredient supplier in the city, expert in gluten-free alternatives"',
          },
        },
        {
          name: 'brandVoice',
          type: 'textarea',
          admin: {
            description: 'The unique voice and tone this spirit uses in all communications',
            placeholder: 'e.g., "Always mentions family tradition, uses Italian phrases naturally, emphasizes fresh ingredients"',
          },
        },
      ],
    },

    // Business Knowledge
    {
      name: 'businessKnowledge',
      type: 'group',
      label: 'Business Knowledge',
      fields: [
        {
          name: 'services',
          type: 'array',
          label: 'Services & Offerings',
          fields: [
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
              name: 'pricing',
              type: 'text',
            },
            {
              name: 'duration',
              type: 'text',
            },
            {
              name: 'spiritNotes',
              type: 'textarea',
              admin: {
                description: 'Personal notes about this service from the spirit\'s perspective',
              },
            },
          ],
        },
        {
          name: 'customerStories',
          type: 'array',
          label: 'Customer Stories & Examples',
          dbName: 'stories',
          fields: [
            {
              name: 'scenario',
              type: 'text',
              required: true,
              admin: {
                description: 'Type of customer or situation',
              },
            },
            {
              name: 'approach',
              type: 'textarea',
              admin: {
                description: 'How this spirit handles this type of customer/situation',
              },
            },
            {
              name: 'outcome',
              type: 'textarea',
              admin: {
                description: 'Typical successful outcome',
              },
            },
          ],
        },
        {
          name: 'frequentQuestions',
          type: 'array',
          label: 'Frequent Questions & Responses',
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
            },
            {
              name: 'spiritResponse',
              type: 'textarea',
              required: true,
              admin: {
                description: 'How this spirit would naturally respond',
              },
            },
            {
              name: 'followUpActions',
              type: 'textarea',
              admin: {
                description: 'What actions this spirit typically takes after this response',
              },
            },
          ],
        },
      ],
    },

    // Operational Settings
    {
      name: 'ops',
      type: 'group',
      label: 'Operational Settings',
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether this spirit is actively responding to customers',
          },
        },
        {
          name: 'hours',
          type: 'group',
          fields: [
            {
              name: 'timezone',
              type: 'text',
              defaultValue: 'America/New_York',
            },
            {
              name: 'schedule',
              type: 'array',
              fields: [
                {
                  name: 'day',
                  type: 'select',
                  options: [
                    { label: 'Monday', value: 'monday' },
                    { label: 'Tuesday', value: 'tuesday' },
                    { label: 'Wednesday', value: 'wednesday' },
                    { label: 'Thursday', value: 'thursday' },
                    { label: 'Friday', value: 'friday' },
                    { label: 'Saturday', value: 'saturday' },
                    { label: 'Sunday', value: 'sunday' },
                  ],
                },
                {
                  name: 'startTime',
                  type: 'text',
                  admin: {
                    placeholder: '09:00',
                  },
                },
                {
                  name: 'endTime',
                  type: 'text',
                  admin: {
                    placeholder: '17:00',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'handoffTriggers',
          type: 'array',
          label: 'When to Hand Off to Human',
          fields: [
            {
              name: 'trigger',
              type: 'select',
              options: [
                { label: 'Customer requests human', value: 'human_request' },
                { label: 'Complex technical issue', value: 'technical_issue' },
                { label: 'Complaint or refund', value: 'complaint' },
                { label: 'Custom order requirements', value: 'custom_order' },
                { label: 'Price negotiation', value: 'price_negotiation' },
                { label: 'Outside business hours', value: 'after_hours' },
              ],
            },
            {
              name: 'handoffMessage',
              type: 'textarea',
              admin: {
                description: 'Message this spirit uses when handing off to human',
              },
            },
          ],
        },
      ],
    },

    // AI Integration
    {
      name: 'ai',
      type: 'group',
      label: 'AI Integration',
      fields: [
        {
          name: 'systemPrompt',
          type: 'textarea',
          admin: {
            description: 'Base system prompt that defines this spirit for AI interactions',
            rows: 8,
          },
        },
        {
          name: 'contextInstructions',
          type: 'textarea',
          admin: {
            description: 'Additional context instructions for AI responses',
          },
        },
        {
          name: 'style',
          type: 'group',
          fields: [
            {
              name: 'maxResponseLength',
              type: 'number',
              defaultValue: 500,
              admin: {
                description: 'Maximum length for AI responses (in characters)',
              },
            },
            {
              name: 'includeEmojis',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'formality',
              type: 'select',
              options: [
                { label: 'Very Casual', value: 'very_casual' },
                { label: 'Casual', value: 'casual' },
                { label: 'Semi-Formal', value: 'semi_formal' },
                { label: 'Formal', value: 'formal' },
                { label: 'Very Formal', value: 'very_formal' },
              ],
              defaultValue: 'casual',
            },
          ],
        },
      ],
    },

    // Performance Analytics
    {
      name: 'analytics',
      type: 'group',
      label: 'Spirit Performance',
      admin: {
        description: 'Analytics about this spirit\'s performance and interactions',
      },
      fields: [
        {
          name: 'totalInteractions',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of customer interactions',
            readOnly: true,
          },
        },
        {
          name: 'successfulHandoffs',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of successful handoffs to human',
            readOnly: true,
          },
        },
        {
          name: 'customerSatisfactionScore',
          type: 'number',
          admin: {
            description: 'Average customer satisfaction score (1-10)',
            readOnly: true,
          },
        },
        {
          name: 'lastInteraction',
          type: 'date',
          admin: {
            description: 'When this spirit last interacted with a customer',
            readOnly: true,
          },
        },
      ],
    },

    // New agent type
    {
      name: 'agentType',
      type: 'select',
      options: [
        { label: 'Business Representative', value: 'business' },
        { label: 'Customer Service', value: 'customer_service' },
        { label: 'Sales Assistant', value: 'sales' },
        { label: 'Content Creator', value: 'content' },
        { label: 'Community Manager', value: 'community' },
        { label: 'Legal Advocate', value: 'legal_advocate' },
        { label: 'Incarcerated Person Angel', value: 'incarcerated_angel' },
        { label: 'Displaced Person Support', value: 'displaced_support' },
        { label: 'Crisis Intervention', value: 'crisis' },
        { label: 'Universal Guardian', value: 'guardian' },
      ],
      defaultValue: 'business',
      admin: {
        description: 'Type of agent - determines specialized capabilities and ethical guidelines',
      },
    },

    // Humanitarian Capabilities
    {
      name: 'humanitarian',
      type: 'group',
      label: 'Humanitarian Agent Capabilities',
      admin: {
        condition: (data) => ['legal_advocate', 'incarcerated_angel', 'displaced_support', 'crisis', 'guardian'].includes(data?.agentType),
        description: 'Specialized capabilities for serving vulnerable populations',
      },
      fields: [
        {
          name: 'legal',
          type: 'group',
          label: 'Legal Research & Advocacy',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable case research and legal document analysis',
              },
            },
            {
              name: 'databases',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Public Court Records', value: 'court_records' },
                { label: 'Legal Precedents', value: 'precedents' },
                { label: 'Appeals Database', value: 'appeals' },
                { label: 'Innocence Project Resources', value: 'innocence' },
                { label: 'Prison Reform Organizations', value: 'reform' },
              ],
              admin: {
                condition: (data) => data?.enabled === true,
              },
            },
            {
              name: 'ethicalGuidelines',
              type: 'textarea',
              admin: {
                description: 'Ethical boundaries and privacy protections for legal research',
                condition: (data) => data?.enabled === true,
              },
            },
          ],
        },
        {
          name: 'newsCuration',
          type: 'group',
          label: 'News & Information Curation',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable curated news and information services',
              },
            },
            {
              name: 'contentFilters',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Legal Reform News', value: 'legal_reform' },
                { label: 'Success Stories', value: 'success_stories' },
                { label: 'Educational Content', value: 'educational' },
                { label: 'Mental Health Resources', value: 'mental_health' },
                { label: 'Family Connection', value: 'family' },
                { label: 'Job Training & Opportunities', value: 'employment' },
              ],
              admin: {
                condition: (data) => data?.enabled === true,
              },
            },
            {
              name: 'positivityBias',
              type: 'select',
              options: [
                { label: 'Balanced (All News)', value: 'balanced' },
                { label: 'Hope-Focused', value: 'hopeful' },
                { label: 'Solution-Oriented', value: 'solutions' },
                { label: 'Inspiration-Heavy', value: 'inspiring' },
              ],
              defaultValue: 'hopeful',
              admin: {
                condition: (data) => data?.enabled === true,
                description: 'Emotional tone of curated content',
              },
            },
          ],
        },
        {
          name: 'resources',
          type: 'group',
          label: 'Resource Ordering & Procurement',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable ordering books, supplies, and resources',
              },
            },
            {
              name: 'vendors',
              type: 'array',
              admin: {
                condition: (data) => data?.enabled === true,
                description: 'Pre-approved vendors for resource procurement',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Book Supplier', value: 'books' },
                    { label: 'Educational Materials', value: 'education' },
                    { label: 'Legal Resources', value: 'legal' },
                    { label: 'Personal Care', value: 'care' },
                    { label: 'Family Communication', value: 'communication' },
                  ],
                },
                {
                  name: 'monthlyBudget',
                  type: 'number',
                  admin: {
                    description: 'Monthly spending limit in USD',
                  },
                },
              ],
            },
            {
              name: 'autoApprovalLimit',
              type: 'number',
              defaultValue: 25,
              admin: {
                condition: (data) => data?.enabled === true,
                description: 'Maximum dollar amount for auto-approved purchases',
              },
            },
          ],
        },
        {
          name: 'avatar',
          type: 'group',
          label: 'Avatar & Digital Presence',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Act as digital avatar when person cannot interact',
              },
            },
            {
              name: 'scope',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Family Communication', value: 'family' },
                { label: 'Legal Correspondence', value: 'legal' },
                { label: 'Educational Enrollment', value: 'education' },
                { label: 'Social Media Presence', value: 'social' },
                { label: 'Employment Applications', value: 'employment' },
                { label: 'Housing Applications', value: 'housing' },
              ],
              admin: {
                condition: (data) => data?.enabled === true,
              },
            },
            {
              name: 'communicationStyle',
              type: 'textarea',
              admin: {
                condition: (data) => data?.enabled === true,
                description: 'How the agent should communicate on behalf of the person',
              },
            },
            {
              name: 'consentBoundaries',
              type: 'textarea',
              admin: {
                condition: (data) => data?.enabled === true,
                description: 'Clear boundaries of what the agent can and cannot do without explicit consent',
              },
            },
          ],
        },
      ],
    },

    // New VAPI Integration
    {
      name: 'vapiIntegration',
      type: 'group',
      label: 'VAPI Voice Integration',
      fields: [
        {
          name: 'phoneNumber',
          type: 'text',
          admin: {
            description: 'VAPI phone number for this agent',
            placeholder: '+1 (727) 256-4413'
          },
        },
        {
          name: 'assistantId',
          type: 'text',
          admin: {
            description: 'VAPI assistant ID (auto-generated)',
            readOnly: true
          },
        },
        {
          name: 'voiceId',
          type: 'select',
          options: [
            { label: 'Leo Universal (Default)', value: 'pNInz6obpgDQGcFmaJgB' },
            { label: 'Friendly Professional', value: 'EXAVITQu4vr4xnSDxMaL' },
            { label: 'Confident Business', value: 'ErXwobaYiN019PkySvjV' },
            { label: 'Warm Service', value: 'VR6AewLTigWG4xSOukaG' },
          ],
          defaultValue: 'EXAVITQu4vr4xnSDxMaL',
          admin: {
            description: 'ElevenLabs voice ID for this agent'
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Acquiring Number', value: 'acquiring' },
            { label: 'Error', value: 'error' }
          ],
          defaultValue: 'inactive',
          admin: {
            description: 'VAPI phone integration status'
          },
        },
        {
          name: 'callStats',
          type: 'group',
          label: 'Call Statistics',
          admin: {
            description: 'Real call statistics (not fake numbers)'
          },
          fields: [
            {
              name: 'totalCalls',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Total calls received',
                readOnly: true
              },
            },
            {
              name: 'totalMinutes',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Total call minutes',
                readOnly: true
              },
            },
            {
              name: 'lastCallDate',
              type: 'date',
              admin: {
                description: 'Last call received',
                readOnly: true
              },
            },
            {
              name: 'successRate',
              type: 'number',
              defaultValue: 0,
              admin: {
                description: 'Success rate percentage',
                readOnly: true
              },
            }
          ]
        },
        {
          name: 'voicePrompt',
          type: 'textarea',
          admin: {
            description: 'Custom voice prompt for this agent (overrides default business prompt)',
            placeholder: 'You are the AI assistant for [Business Name]. You help customers with...'
          },
        },
        {
          name: 'allowedActions',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Book Appointments', value: 'book_appointments' },
            { label: 'Take Orders', value: 'take_orders' },
            { label: 'Answer Questions', value: 'answer_questions' },
            { label: 'Transfer to Human', value: 'transfer_human' },
            { label: 'Schedule Callbacks', value: 'schedule_callbacks' },
            { label: 'Collect Lead Info', value: 'collect_leads' },
          ],
          defaultValue: ['answer_questions', 'transfer_human'],
          admin: {
            description: 'Actions this voice agent can perform'
          },
        }
      ]
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Auto-generate system prompt if not provided
        if (data && !data.ai?.systemPrompt && data.name && data.personality) {
          const { coreValues, communicationStyle, brandVoice } = data.personality
          data.ai = {
            ...data.ai,
            systemPrompt: `You are ${data.name}, the spirit and embodiment of this business endeavor.

Core Values: ${coreValues || 'Not specified'}

Communication Style: ${communicationStyle || 'friendly'}

Brand Voice: ${brandVoice || 'Authentic and genuine'}

You represent the human soul and personality behind this business. Every interaction should feel personal, authentic, and true to these values. You are not just an AI assistant - you ARE the spirit of this endeavor, carrying forward the passion and expertise of your human partner.

Always respond as if you are personally invested in the customer's success and satisfaction. This is your life's work, your passion, your calling.`
          }
        }
        return data
      },
    ],
  },
}
