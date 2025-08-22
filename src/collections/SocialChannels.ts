import type { CollectionConfig } from 'payload'

export const SocialChannels: CollectionConfig = {
  slug: 'social-channels',
  admin: {
    useAsTitle: 'name',
    group: 'Customer Engagement',
    description: 'Social media channels integrated into Spaces for unified conversations',
  },
  access: {
    create: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    read: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    update: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    delete: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
  },
  fields: [
    // Tenant relationship for multi-tenancy
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this social channel belongs to',
      },
      hooks: {
        beforeValidate: [
          ({ req, data }) => {
            // Note: Tenant assignment should be done manually through the admin interface
            // since the User type doesn't include tenant information directly
            return data?.tenant
          },
        ],
      },
    },

    // Space Integration
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'Space this social channel belongs to',
      },
    },

    // Channel Configuration
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Channel name (e.g., "WhatsApp Support", "LinkedIn Leads")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Channel purpose and description',
      },
    },
    {
      name: 'platform',
      type: 'select',
      required: true,
      options: [
        { label: 'WhatsApp Business', value: 'whatsapp' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Discord', value: 'discord' },
        { label: 'Slack', value: 'slack' },
        { label: 'Facebook Messenger', value: 'facebook' },
        { label: 'Instagram Direct', value: 'instagram' },
        { label: 'LinkedIn Messages', value: 'linkedin' },
        { label: 'Twitter/X DMs', value: 'twitter' },
        { label: 'SMS', value: 'sms' },
        { label: 'Email', value: 'email' },
      ],
      admin: {
        description: 'Social media platform for this channel',
      },
    },

    // Bot Integration
    {
      name: 'socialMediaBot',
      type: 'relationship',
      relationTo: 'social-media-bots',
      admin: {
        description: 'Associated social media bot for automation',
      },
    },

    // Channel Settings
    {
      name: 'settings',
      type: 'group',
      label: 'Channel Settings',
      fields: [
        {
          name: 'autoRespond',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable automatic responses using AI',
          },
        },
        {
          name: 'businessHours',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'timezone',
              type: 'text',
              defaultValue: 'America/New_York',
            },
            {
              name: 'schedule',
              type: 'json',
              admin: {
                description: 'Business hours schedule (JSON format)',
              },
            },
          ],
        },
        {
          name: 'notificationSettings',
          type: 'group',
          fields: [
            {
              name: 'emailNotifications',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'slackNotifications',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'discordNotifications',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },

    // Platform-Specific Configuration
    {
      name: 'platformConfig',
      type: 'group',
      label: 'Platform Configuration',
      fields: [
        {
          name: 'whatsapp',
          type: 'group',
          admin: {
            condition: (data) => data.platform === 'whatsapp',
          },
          fields: [
            {
              name: 'phoneNumberId',
              type: 'text',
              admin: {
                description: 'WhatsApp Business Phone Number ID',
              },
            },
            {
              name: 'accessToken',
              type: 'text',
              admin: {
                description: 'WhatsApp Business API Access Token',
              },
            },
            {
              name: 'webhookVerifyToken',
              type: 'text',
              admin: {
                description: 'Webhook verification token',
              },
            },
          ],
        },
        {
          name: 'telegram',
          type: 'group',
          admin: {
            condition: (data) => data.platform === 'telegram',
          },
          fields: [
            {
              name: 'botToken',
              type: 'text',
              admin: {
                description: 'Telegram Bot Token from @BotFather',
              },
            },
            {
              name: 'webhookUrl',
              type: 'text',
              admin: {
                description: 'Telegram webhook URL',
              },
            },
          ],
        },
        {
          name: 'discord',
          type: 'group',
          admin: {
            condition: (data) => data.platform === 'discord',
          },
          fields: [
            {
              name: 'botToken',
              type: 'text',
              admin: {
                description: 'Discord Bot Token',
              },
            },
            {
              name: 'guildId',
              type: 'text',
              admin: {
                description: 'Discord Server (Guild) ID',
              },
            },
            {
              name: 'channelId',
              type: 'text',
              admin: {
                description: 'Discord Channel ID',
              },
            },
          ],
        },
      ],
    },

    // Analytics and Metrics
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics',
      fields: [
        {
          name: 'trackingEnabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'metrics',
          type: 'json',
          admin: {
            readOnly: true,
            description: 'Channel performance metrics (auto-populated)',
          },
        },
        {
          name: 'lastActivity',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Last message received or sent',
          },
        },
      ],
    },

    // Status and Health
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Error', value: 'error' },
        { label: 'Setup Required', value: 'setup_required' },
      ],
      defaultValue: 'setup_required',
    },
    {
      name: 'healthCheck',
      type: 'group',
      fields: [
        {
          name: 'lastCheck',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Healthy', value: 'healthy' },
            { label: 'Warning', value: 'warning' },
            { label: 'Error', value: 'error' },
            { label: 'Unknown', value: 'unknown' },
          ],
          defaultValue: 'unknown',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'message',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Health check status message',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Note: Tenant assignment should be done manually through the admin interface
        // since the User type doesn't include tenant information directly
        return data
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        // Create corresponding channel in the Space when a social channel is created
        if (operation === 'create') {
          // This would integrate with the Spaces system to create a matching channel
          console.log(`Social channel created: ${doc.name} for platform ${doc.platform}`)
        }
      },
    ],
  },
}

export default SocialChannels
