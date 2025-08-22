import type { CollectionConfig } from 'payload'

export const SocialMediaBots: CollectionConfig = {
  slug: 'social-media-bots',
  admin: {
    useAsTitle: 'name',
    group: 'Communication',
    description: 'Manage social media bots across platforms',
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
        description: 'Tenant this bot belongs to',
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

    // Basic Bot Configuration
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Bot name for identification',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Bot purpose and functionality description',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'active',
      required: true,
    },

    // Platform Integrations
    {
      name: 'platforms',
      type: 'group',
      label: 'Platform Integrations',
      fields: [
        {
          name: 'facebook',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'pageId',
              type: 'text',
              admin: {
                description: 'Facebook Page ID',
              },
            },
            {
              name: 'accessToken',
              type: 'text',
              admin: {
                description: 'Facebook Page Access Token (encrypted)',
              },
            },
          ],
        },
        {
          name: 'instagram',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'accountId',
              type: 'text',
              admin: {
                description: 'Instagram Business Account ID',
              },
            },
            {
              name: 'accessToken',
              type: 'text',
              admin: {
                description: 'Instagram API Access Token (encrypted)',
              },
            },
          ],
        },
      ],
    },

    // Analytics and Performance
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
            description: 'Performance metrics (auto-populated)',
          },
        },
      ],
    },


    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'Associated space for bot activities',
      },
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
  },
}
