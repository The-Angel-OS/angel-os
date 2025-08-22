// @ts-nocheck
// @ts-nocheck
import type { CollectionConfig } from 'payload'
import type { SpaceData } from '../types/space-data'
// import { authenticated } from '../access/authenticated' // Unused

export const Spaces: CollectionConfig = {
  slug: 'spaces',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tenant', 'businessIdentity.type', 'visibility', 'memberCount'],
    group: 'Collaboration',
    description: 'Business spaces for collaboration, content, and customer engagement',
  },
  access: {
    // Tenant-scoped access control
    create: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true

      // Regular users can create spaces within their tenant
      if (req.user?.tenant) {
        return true
      }

      return false
    },
    read: ({ req }): any => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true

      // Tenant-scoped read access
      if (req.user?.tenant) {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      // Fallback to public spaces only for unauthenticated users
      return {
        visibility: {
          equals: 'public',
        },
      }
    },
    update: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true

      // Regular users can update spaces within their tenant
      if (req.user?.tenant) {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      return false
    },
    delete: ({ req }) => {
      if (req.user?.globalRole === 'super_admin') return true
      if (req.user?.globalRole === 'platform_admin') return true

      // Regular users can delete spaces within their tenant
      if (req.user?.tenant) {
        const tenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }

      return false
    },
  },
  fields: [
    // AT Protocol Support (Core Federation Feature)
    {
      name: 'atProtocol',
      type: 'group',
      label: 'Federated Identity',
      admin: {
        condition: () => false, // System-level fields - auto-generated
        description: 'Federated identity for cross-platform business operations',
      },
      fields: [
        {
          name: 'did',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Decentralized Identifier for federation',
          },
        },
        {
          name: 'handle',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Federated handle for cross-platform discovery',
          },
        },
      ],
    },

    // Core Space Fields
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this space belongs to',
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
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this space',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        description: 'URL-friendly identifier for this space',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string') {
              return value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            }
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this space is for',
      },
    },

    // Business Identity (Core Business Context)
    {
      name: 'businessIdentity',
      type: 'group',
      label: 'Business Identity',
      required: true,
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Business Operations', value: 'business' },
            { label: 'Content Creator', value: 'creator' },
            { label: 'Service Provider', value: 'service' },
            { label: 'Retail Store', value: 'retail' },
            { label: 'Manufacturing', value: 'manufacturing' },
          ],
          defaultValue: 'business',
          admin: {
            description: 'Primary business model - determines available features',
          },
        },
        {
          name: 'industry',
          type: 'select',
          required: true,
          options: [
            { label: 'General Business', value: 'general' },
            { label: 'Content Creation', value: 'content-creation' },
            { label: 'Automotive Services', value: 'automotive' },
            { label: 'Agriculture & Plants', value: 'agriculture' },
            { label: 'Food & Beverage', value: 'food-beverage' },
            { label: 'Professional Services', value: 'professional-services' },
            { label: 'Retail & E-commerce', value: 'retail' },
            { label: 'Technology', value: 'technology' },
            { label: 'Healthcare', value: 'healthcare' },
            { label: 'Education', value: 'education' },
          ],
          defaultValue: 'general',
          admin: {
            description: 'Industry category for tailored features and integrations',
          },
        },
        {
          name: 'companySize',
          type: 'select',
          options: [
            { label: 'Solo Entrepreneur', value: 'solo' },
            { label: 'Small Business (2-10)', value: 'small' },
            { label: 'Medium Business (11-50)', value: 'medium' },
            { label: 'Large Business (50+)', value: 'large' },
          ],
          defaultValue: 'small',
          admin: {
            description: 'Business size affects available features and limits',
          },
        },
        {
          name: 'targetMarket',
          type: 'select',
          options: [
            { label: 'Local/Regional', value: 'local' },
            { label: 'National', value: 'national' },
            { label: 'International', value: 'international' },
            { label: 'Online Only', value: 'online' },
          ],
          defaultValue: 'local',
          admin: {
            description: 'Market scope for localization and payment options',
          },
        },
      ],
    },

    // Commerce Settings (Enable Business Features)
    {
      name: 'commerceSettings',
      type: 'group',
      label: 'Commerce & Business Features',
      fields: [
        {
          name: 'enableEcommerce',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable product catalog and online ordering',
          },
        },
        {
          name: 'enableServices',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable service booking and appointment scheduling',
          },
        },
        {
          name: 'enableMerchandise',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable AI-generated merchandise (for content creators)',
          },
        },
        {
          name: 'enableSubscriptions',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable subscription and recurring services',
          },
        },
        {
          name: 'paymentMethods',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Credit Cards', value: 'credit_cards' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
            { label: 'Cash on Delivery', value: 'cod' },
            { label: 'Cryptocurrency', value: 'crypto' },
          ],
          admin: {
            description: 'Accepted payment methods',
          },
        },
        {
          name: 'shippingZones',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Local Delivery', value: 'local' },
            { label: 'Domestic Shipping', value: 'domestic' },
            { label: 'International', value: 'international' },
            { label: 'Pickup Only', value: 'pickup' },
          ],
          admin: {
            description: 'Available shipping and delivery options',
          },
        },
      ],
    },

    // Creator Monetization (OnlyFans-like Features)
    {
      name: 'monetization',
      type: 'group',
      label: 'Creator Monetization',
      dbName: 'mon',
      admin: {
        description: 'OnlyFans-style creator monetization features',
        condition: (data) => data?.businessIdentity?.type === 'creator' || data?.commerceSettings?.enableSubscriptions,
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable creator monetization features',
          },
        },
        {
          name: 'subscriptionTiers',
          type: 'array',
          label: 'Subscription Tiers',
          dbName: 'sub_tiers',
          admin: {
            description: 'Create subscription tiers for premium content access',
            condition: (data) => data?.monetization?.enabled === true,
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Tier name (e.g., "VIP", "Premium", "Basic")',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'What subscribers get with this tier',
              },
            },
            {
              name: 'price',
              type: 'number',
              required: true,
              admin: {
                description: 'Monthly subscription price',
              },
            },
            {
              name: 'currency',
              type: 'select',
              options: [
                { label: 'USD', value: 'usd' },
                { label: 'EUR', value: 'eur' },
                { label: 'GBP', value: 'gbp' },
              ],
              defaultValue: 'usd',
            },
            {
              name: 'features',
              type: 'text',
              hasMany: true,
              admin: {
                description: 'List of features included in this tier',
              },
            },
            {
              name: 'contentAccess',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Premium Posts', value: 'premium_posts' },
                { label: 'Exclusive Videos', value: 'exclusive_videos' },
                { label: 'Private Messages', value: 'private_messages' },
                { label: 'Live Streams', value: 'live_streams' },
                { label: 'Custom Content', value: 'custom_content' },
                { label: 'Early Access', value: 'early_access' },
              ],
              admin: {
                description: 'Types of content this tier unlocks',
              },
            },
            {
              name: 'stripePriceId',
              type: 'text',
              dbName: 'stripe_price',
              admin: {
                description: 'Stripe Price ID for payment processing',
                readOnly: true,
              },
            },
          ],
        },
        {
          name: 'donationsEnabled',
          type: 'checkbox',
          defaultValue: false,
          dbName: 'donations',
          admin: {
            description: 'Enable tips/donations from fans',
            condition: (data) => data?.monetization?.enabled === true,
          },
        },
        {
          name: 'customPricing',
          type: 'group',
          label: 'Custom Content Pricing',
          dbName: 'custom',
          admin: {
            description: 'Pay-per-view content and custom requests',
            condition: (data) => data?.monetization?.enabled === true,
          },
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable pay-per-view content',
              },
            },
            {
              name: 'defaultPrice',
              type: 'number',
              dbName: 'default_price',
              admin: {
                description: 'Default price for custom content requests',
              },
            },
            {
              name: 'minimumTip',
              type: 'number',
              dbName: 'min_tip',
              admin: {
                description: 'Minimum tip amount',
              },
            },
          ],
        },
        {
          name: 'merchantAccount',
          type: 'text',
          dbName: 'merchant',
          admin: {
            description: 'Stripe Connect Account ID for direct payments',
            condition: (data) => data?.monetization?.enabled === true,
          },
        },
        // Flattened revenue share settings to prevent long field names
        {
          name: 'revenueAgreementType',
          type: 'select',
          dbName: 'rev_type',
          options: [
            { label: 'Standard Rate (15%) - Full Service', value: 'standard' },
            { label: 'Negotiated Rate', value: 'negotiated' },
            { label: 'Performance Based', value: 'performance' },
            { label: 'Volume Tiered', value: 'volume' },
            { label: 'AI Optimized', value: 'ai-optimized' },
          ],
          defaultValue: 'standard',
          admin: {
            description: 'Revenue sharing agreement type',
            condition: (data) => data?.monetization?.enabled === true,
          },
        },
        {
          name: 'revenuePlatformFee',
          type: 'number',
          defaultValue: 20,
          min: 8,
          max: 30,
          dbName: 'rev_fee',
          admin: {
            description: 'Platform fee percentage (8-30%) - Includes marketing, infrastructure, and business automation',
            condition: (data) => data?.monetization?.enabled === true,
          },
        },
        {
          name: 'revenueContractId',
          type: 'text',
          dbName: 'rev_contract',
          admin: {
            description: 'Legal contract reference ID',
            condition: (data) => data?.monetization?.enabled === true && ['negotiated', 'performance', 'volume', 'ai-optimized'].includes(data?.revenueAgreementType),
          },
        },
        {
          name: 'revenueEffectiveDate',
          type: 'date',
          dbName: 'rev_effective',
          admin: {
            description: 'When negotiated rates take effect',
            condition: (data) => data?.monetization?.enabled === true && ['negotiated', 'performance', 'volume', 'ai-optimized'].includes(data?.revenueAgreementType),
          },
        },
        {
          name: 'revenueReviewDate',
          type: 'date',
          dbName: 'rev_review',
          admin: {
            description: 'Next rate review date',
            condition: (data) => data?.monetization?.enabled === true && ['negotiated', 'performance', 'volume', 'ai-optimized'].includes(data?.revenueAgreementType),
          },
        },
        // AI Optimization fields - flattened to prevent long names
        {
          name: 'aiOptEnabled',
          type: 'checkbox',
          defaultValue: false,
          dbName: 'ai_enabled',
          admin: {
            description: 'Enable AI rate optimization',
            condition: (data) => data?.monetization?.enabled === true && data?.revenueAgreementType === 'ai-optimized',
          },
        },
        {
          name: 'aiOptVersion',
          type: 'text',
          dbName: 'ai_version',
          admin: {
            description: 'AI algorithm version identifier',
            condition: (data) => data?.monetization?.enabled === true && data?.aiOptEnabled === true,
          },
        },
        {
          name: 'aiOptFactors',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Revenue Velocity', value: 'velocity' },
            { label: 'User Engagement', value: 'engagement' },
            { label: 'Content Quality', value: 'quality' },
            { label: 'Platform Value', value: 'platform-value' },
            { label: 'Market Conditions', value: 'market' },
            { label: 'Competitive Position', value: 'competitive' },
          ],
          admin: {
            description: 'Factors for AI optimization',
            condition: (data) => data?.monetization?.enabled === true && data?.aiOptEnabled === true,
          },
        },
        {
          name: 'aiOptFeeMin',
          type: 'number',
          defaultValue: 8,
          dbName: 'ai_fee_min',
          admin: {
            description: 'Minimum fee percentage (AI floor)',
            condition: (data) => data?.monetization?.enabled === true && data?.aiOptEnabled === true,
          },
        },
        {
          name: 'aiOptFeeMax',
          type: 'number',
          defaultValue: 25,
          dbName: 'ai_fee_max',
          admin: {
            description: 'Maximum fee percentage (AI ceiling)',
            condition: (data) => data?.monetization?.enabled === true && data?.aiOptEnabled === true,
          },
        },
        {
          name: 'aiOptParams',
          type: 'text',
          dbName: 'ai_params',
          admin: {
            description: 'AI-encoded optimization parameters (system use only)',
            readOnly: true,
            condition: (data) => data?.monetization?.enabled === true && data?.aiOptEnabled === true,
          },
        },
        {
          name: 'revenueProcessingFee',
          type: 'number',
          defaultValue: 2.9,
          dbName: 'rev_proc_fee',
          admin: {
            description: 'Payment processing fee percentage (Stripe)',
            condition: (data) => data?.monetization?.enabled === true,
          },
        },
        {
          name: 'revenueCalculatedFee',
          type: 'number',
          dbName: 'rev_calc_fee',
          admin: {
            description: 'Current effective platform fee (auto-calculated)',
            readOnly: true,
            condition: (data) => data?.monetization?.enabled === true,
          },
        },
      ],
    },

    // Integration Settings (Third-party Connections)
    {
      name: 'integrations',
      type: 'group',
      label: 'Platform Integrations',
      fields: [
        {
          name: 'youtube',
          type: 'group',
          label: 'YouTube Integration',
          fields: [
            {
              name: 'channelId',
              type: 'text',
              admin: {
                description: 'YouTube Channel ID for content analysis',
              },
            },
            {
              name: 'apiKey',
              type: 'text',
              admin: {
                description: 'YouTube API key for automated content sync',
              },
            },
            {
              name: 'autoSync',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Automatically sync channel content for merchandise generation',
              },
            },
          ],
        },
        {
          name: 'printPartners',
          type: 'array',
          label: 'Print Partners',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description: 'Print partner name (e.g., "Largo T-Shirt Company")',
              },
            },
            {
              name: 'apiEndpoint',
              type: 'text',
              admin: {
                description: 'API endpoint for automated ordering',
              },
            },
            {
              name: 'productCatalog',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'T-Shirts', value: 'tshirts' },
                { label: 'Coffee Mugs', value: 'mugs' },
                { label: 'Stickers', value: 'stickers' },
                { label: 'Posters', value: 'posters' },
                { label: 'Hoodies', value: 'hoodies' },
              ],
              admin: {
                description: 'Available product types from this partner',
              },
            },
          ],
        },
        {
          name: 'scheduling',
          type: 'group',
          label: 'Scheduling System',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable appointment booking and resource scheduling',
              },
            },
            {
              name: 'resourceCount',
              type: 'number',
              min: 1,
              max: 10,
              defaultValue: 1,
              admin: {
                description: 'Number of service bays/resources (e.g., 2 for car stereo shop)',
                condition: (data) => data.enabled === true,
              },
            },
            {
              name: 'timeSlots',
              type: 'select',
              options: [
                { label: '30 minutes', value: '30' },
                { label: '1 hour', value: '60' },
                { label: '2 hours', value: '120' },
                { label: '4 hours', value: '240' },
              ],
              defaultValue: '60',
              admin: {
                description: 'Default appointment duration',
                condition: (data) => data.enabled === true,
              },
            },
          ],
        },
        {
          name: 'socialBots',
          type: 'group',
          label: 'Social Media Automation',
          fields: [
            {
              name: 'platforms',
              type: 'select',
              hasMany: true,
              options: [
                // Core Social Media (Engagement & Reach)
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Twitter/X', value: 'twitter' },
                { label: 'BlueSky', value: 'bluesky' },
                { label: 'Threads', value: 'threads' },

                // Professional Networks (B2B Revenue)
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'AngelList', value: 'angellist' },
                { label: 'Crunchbase', value: 'crunchbase' },

                // Creator Economy (Direct Monetization)
                { label: 'YouTube', value: 'youtube' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'Snapchat', value: 'snapchat' },
                { label: 'Pinterest', value: 'pinterest' },
                { label: 'Patreon', value: 'patreon' },
                { label: 'OnlyFans', value: 'onlyfans' },
                { label: 'Substack', value: 'substack' },

                // Messaging & Customer Service
                { label: 'WhatsApp Business', value: 'whatsapp' },
                { label: 'Telegram', value: 'telegram' },
                { label: 'Discord', value: 'discord' },
                { label: 'Slack', value: 'slack' },

                // Emerging Platforms (Early Advantage)
                { label: 'Mastodon', value: 'mastodon' },
                { label: 'BeReal', value: 'bereal' },
                { label: 'Clubhouse', value: 'clubhouse' },
                { label: 'Twitch', value: 'twitch' },

                // Local & Niche (Geographic Revenue)
                { label: 'WeChat', value: 'wechat' },
                { label: 'Line', value: 'line' },
                { label: 'Weibo', value: 'weibo' },
                { label: 'VKontakte', value: 'vkontakte' },

                // Business & E-commerce Integration
                { label: 'Shopify Social', value: 'shopify_social' },
                { label: 'Etsy', value: 'etsy' },
                { label: 'Amazon Seller', value: 'amazon_seller' },
                { label: 'eBay', value: 'ebay' },

                // Content & Knowledge Platforms
                { label: 'Medium', value: 'medium' },
                { label: 'Dev.to', value: 'dev_to' },
                { label: 'Hashnode', value: 'hashnode' },
                { label: 'Reddit', value: 'reddit' },
                { label: 'Quora', value: 'quora' },

                // Video & Streaming Revenue
                { label: 'Vimeo', value: 'vimeo' },
                { label: 'Rumble', value: 'rumble' },
                { label: 'Odysee', value: 'odysee' },

                // AI & Tech Integration (Future-Proofing)
                { label: 'Perplexity Spaces', value: 'perplexity' },
                { label: 'Character.AI', value: 'character_ai' },
                { label: 'Poe by Quora', value: 'poe' },
              ],
              admin: {
                description: 'All revenue-generating platforms for automated content distribution. Posts create instant multi-platform presence.',
              },
            },
            {
              name: 'autoPost',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Automatically post business updates and content',
              },
            },
          ],
        },
      ],
    },

    // Theme & Styling
    {
      name: 'theme',
      type: 'group',
      label: 'Theme & Branding',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Space logo',
          },
        },
        {
          name: 'banner',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Space banner image',
          },
        },
        {
          name: 'primaryColor',
          type: 'text',
          admin: {
            description: 'Primary brand color (hex)',
          },
          defaultValue: '#3b82f6',
        },
        {
          name: 'secondaryColor',
          type: 'text',
          admin: {
            description: 'Secondary brand color (hex)',
          },
        },
        {
          name: 'customCSS',
          type: 'textarea',
          admin: {
            description: 'Custom CSS for advanced styling',
          },
        },
      ],
    },

    // Access Control
    {
      name: 'visibility',
      type: 'select',
      required: true,
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Invite Only', value: 'invite_only' },
        { label: 'Private', value: 'private' },
      ],
      defaultValue: 'invite_only',
      admin: {
        description: 'Who can discover and join this space',
      },
    },
    {
      name: 'memberApproval',
      type: 'select',
      required: true,
      options: [
        { label: 'Automatic', value: 'automatic' },
        { label: 'Manual', value: 'manual' },
        { label: 'Disabled', value: 'disabled' },
      ],
      defaultValue: 'manual',
      admin: {
        description: 'How new members are approved',
      },
    },
    {
      name: 'inviteSettings',
      type: 'group',
      label: 'Invite Settings',
      fields: [
        {
          name: 'membersCanInvite',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow members to invite others',
          },
        },
        {
          name: 'requireInviteCode',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Require invite code to join',
          },
        },
        {
          name: 'inviteCode',
          type: 'text',
          admin: {
            description: 'Invite code for joining (auto-generated if empty)',
            condition: (data) => data.requireInviteCode === true,
          },
        },
      ],
    },

    // Statistics (read-only)
    {
      name: 'stats',
      type: 'group',
      label: 'Statistics',
      admin: {
        description: 'Automatically calculated statistics',
      },
      fields: [
        {
          name: 'memberCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of members in this space',
          },
        },
        {
          name: 'messageCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Total messages in this space',
          },
        },
        {
          name: 'lastActivity',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Last message or activity timestamp',
          },
        },
        {
          name: 'engagementScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            readOnly: true,
            description: 'Overall engagement score (0-100)',
          },
        },
      ],
    },
    // JSON field for consolidated data
    {
      name: 'data',
      type: 'json',
      label: 'Space Data',
      admin: {
        description: 'Consolidated business data for this space (messages, products, orders, etc.).',
        // Consider adding a custom component for better visualization or editing if needed.
        // components: {
        //   Field: CustomJsonViewComponent, // Example
        // },
        readOnly: false, // Should be false to allow programmatic updates by migration scripts
      },
      // No specific validation here as the structure is defined by SpaceData interface.
  // Validation can beবলের by migration scripts or hooks if necessary.
      //型: 'SpaceData', // This is a comment, not an actual Payload field type option
      // TODO MIGRATE_TO_JSON: All queries for messages, products, orders, etc., previously targeting separate
      // collections related to this space must now query this 'data' field.
      // Example: To get messages for a space, query `Spaces.data.messages`.
      // Use/develop helpers in `src/utilities/json-query-helpers.ts`.
      validate: (value: unknown) => {
        if (value && typeof value !== 'object') {
          return 'Data must be a valid JSON object or null.';
        }
        // More specific validations for SpaceData structure can be added here if needed,
        // though type safety is primarily handled by TypeScript and migration script logic.
        return true;
      },
    },
    {
      name: '_migrationStatus',
      type: 'group',
      admin: {
        condition: () => false, // Hidden from Admin UI
        description: 'Tracks the status of JSON data migration for this space.',
      },
      fields: [
        { name: 'jsonMigrated', type: 'checkbox', defaultValue: false },
        { name: 'migratedAt', type: 'date' },
        { name: 'migrationVersion', type: 'text' },
      ],
    },
  ],

  hooks: {
    beforeValidate: [
      // Auto-generate invite code if required but not set
      async ({ data }) => {
        if (data?.inviteSettings?.requireInviteCode && !data?.inviteSettings?.inviteCode) {
          if (!data.inviteSettings) {
            data.inviteSettings = {}
          }
          data.inviteSettings.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()
        }

        // Auto-generate AT Protocol fields (legacy)
        if (data && !data.atProtocol?.did) {
            const spaceSlug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          const tenantId = typeof data.tenant === 'object' ? data.tenant?.id : data.tenant

            data.atProtocol = {
              ...data.atProtocol,
              did: `did:plc:${tenantId}-space-${spaceSlug}`,
              handle: `${spaceSlug}.${tenantId}.kendev.co`,
            }
          }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req: _req }) => {
        if (operation === 'create') {
          console.log(`Created space: ${doc.name} (${doc.businessIdentity?.type || 'business'}) for tenant ${doc.tenant}`)

          // TODO: Initialize default space setup
          // - Create initial space membership for creator
          // - Set up default channels if real-time chat is enabled
          // - Initialize CRM pipeline if business type
        }

        // Update engagement metrics
        if (operation === 'update') {
          // TODO: Recalculate engagement score based on recent activity
          console.log(`Updated space: ${doc.name}`)
        }
      },
    ],
  },

  timestamps: true,
}
