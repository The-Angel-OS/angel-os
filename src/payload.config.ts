// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres' // database-adapter-import

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

// AI plugin disabled - still in beta and causing enum conflicts
// import { payloadAiPlugin } from '@ai-stack/payloadcms'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { Workflows } from './collections/Workflows'
import { Tenants } from './collections/Tenants'
import { Organizations } from './collections/Organizations'
import { Venues } from './collections/Venues'
import { BusinessAgents } from './collections/BusinessAgents'
import { HumanitarianAgents } from './collections/HumanitarianAgents'
import { AIGenerationQueue } from './collections/AIGenerationQueue'
import { JobQueue } from './collections/JobQueue'
import { TenantMemberships } from './collections/TenantMemberships'
import { SpaceMemberships } from './collections/SpaceMemberships'
import { Appointments } from './collections/Appointments'
import { Contacts } from './collections/Contacts'
import { Messages } from './collections/Messages'
import { Spaces } from './collections/Spaces'
import { WebChatSessions } from './collections/WebChatSessions'
import { ChannelManagement } from './collections/ChannelManagement'
import { SocialMediaBots } from './collections/SocialMediaBots'
import { LinkedAccounts } from './collections/LinkedAccounts'
import { Invoices } from './collections/Invoices'
import { Documents } from './collections/Documents'
import { Donations } from './collections/Donations'
import { Feedback } from './collections/Feedback'
import { Events } from './collections/Events'
// New collections for MVP Dashboard Sprint
import { Projects } from './collections/Projects'
import { Tasks } from './collections/Tasks'
import { Campaigns } from './collections/Campaigns'
import { Leads } from './collections/Leads'
import { Opportunities } from './collections/Opportunities'
import { RoadmapFeatures } from './collections/RoadmapFeatures'
import { TenantManagement } from './collections/TenantManagement'
import { AngelOSNodes } from './collections/AngelOSNodes'
import { TenantDistribution } from './collections/TenantDistribution'
import { AngelTokens } from './collections/AngelTokens'
import { TokenBalances } from './collections/TokenBalances'
import Channels from './collections/Channels'
import Phyles from './collections/Phyles'
import AgentReputation from './collections/AgentReputation'
import InventoryMessages from './collections/InventoryMessages'
import PhotoAnalysis from './collections/PhotoAnalysis'
import MileageLogs from './collections/MileageLogs'
import QuoteRequests from './collections/QuoteRequests'
// import FormSubmissions from './collections/FormSubmissions'  // Temporarily disabled due to duplicate slug
// import { SocialChannels } from './collections/SocialChannels'  // Temporarily disabled due to export issue
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      beforeDashboard: ['@/components/BeforeDashboard'],
      // Add tenant selector to admin UI
      beforeNavLinks: [
        {
          path: '@/components/TenantSelector',
          clientProps: {
            enabledSlugs: [
              'pages',
              'posts',
              'media',
              'products',
              'categories',
              'orders',
              'invoices',
              'donations',
              'contacts',
              'leads',
              'opportunities',
              'appointments',
              'campaigns',
              'projects',
              'tasks',
              'messages',
              'spaces',
              'web-chat-sessions',
              'channel-management',
              'social-media-bots',
              'linked-accounts',
              'channels',
              'workflows',
              'inventory-messages',
              'photo-analyses',
              'plytes',
              'agent-negotiations',
              'ai-generation-queues',
              'job-queues',
              'organizations',
              'venues',
              'feedbacks',
              'events',
              'mileage-logs',
              'quote-requests',
              'users',
              'tenant-memberships',
              'space-memberships',
              'tenants',
              'tenant-management',
              'roadmap-features',
              'angel-os-nodes',
              'tenant-distributions',
              'angel-tokens',
              'token-balances',
              'guardian-angels',
              'business-agents',
            ],
            label: 'Tenant',
          },
        },
      ],
      // Add tenant selection provider
      providers: [
        {
          path: '@/components/TenantSelectionProvider',
          clientProps: {
            tenantsArrayFieldName: 'tenants',
            tenantsArrayTenantFieldName: 'tenant',
            tenantsCollectionSlug: 'tenants',
            useAsTitle: 'name',
            userHasAccessToAllTenants: (user: any) => user?.globalRole === 'super_admin',
          },
        },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // database-adapter-config-start
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
      max: 10, // Maximum number of connections in pool
      min: 2,  // Minimum number of connections in pool
      idleTimeoutMillis: 10000, // Close connections after 10 seconds of inactivity
      connectionTimeoutMillis: 30000, // Maximum time to wait for connection (30 seconds)
    },
  }),
  // database-adapter-config-end
  collections: [
    // Content Management (Primary)
    Pages, 
    Posts, 
    Media,
    
    // E-commerce (High Priority)
    Products, 
    Categories,
    Orders, 
    Invoices,
    Donations,
    
    // CRM & Sales
    Contacts, 
    Leads,
    Opportunities,
    Appointments,
    
    // Marketing & Campaigns
    Campaigns,
    
    // Project Management
    Projects,
    Tasks,
    
    // Communication & Messaging
    Messages, 
    Spaces, 
    WebChatSessions, 
    ChannelManagement,
    Channels,
    SocialMediaBots,
    LinkedAccounts,
    
    // Business Operations
    Documents,
    Workflows,
    Organizations, 
    Venues, 
    Feedback,
    Events,
    MileageLogs,
    QuoteRequests,
    
    // User Management
    Users,
    TenantMemberships, 
    SpaceMemberships,
    
    // System & Analytics
    InventoryMessages,
    PhotoAnalysis,
    Phyles,
    AgentReputation,
    
    // Platform Management (Host/Super Admin Only)
    Tenants, 
    TenantManagement,
    RoadmapFeatures,
    AngelOSNodes,
    TenantDistribution,
    AngelTokens,
    TokenBalances,
    AIGenerationQueue,
    JobQueue,
    HumanitarianAgents,
    BusinessAgents,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // Video integration will be added back once build issues are resolved
    // Temporarily disable AI plugin until users_texts table issue is resolved
    // payloadAiPlugin({
    //   collections: {
    //     [Pages.slug]: true,
    //     [Posts.slug]: true,
    //     [Products.slug]: true,
    //     [Messages.slug]: true,
    //     [Orders.slug]: true,
    //   },
    //   globals: {
    //     [Header.slug]: true,
    //     [Footer.slug]: true,
    //   },
    //   debugging: process.env.NODE_ENV === 'development',
    //   disableSponsorMessage: false,
    //   generatePromptOnInit: process.env.NODE_ENV === 'development',
    //   uploadCollectionSlug: "media",
    //   access: {
    //     generate: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'tenant-admin',
    //     settings: ({ req }) => req.user?.role === 'super-admin',
    //   },
    //   mediaUpload: async (result, { request, collection }) => {
    //     return request.payload.create({
    //       collection,
    //       data: result.data,
    //       file: result.file,
    //     })
    //   },
    // }),
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://angel-os.kendev.co',
    getServerSideURL(),
  ],
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
