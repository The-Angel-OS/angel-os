import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { about } from './about'
import { privacyPolicy } from './privacy-policy'
import { termsOfService } from './terms-of-service'
// import { shopPage } from './shop-page' // Unused
// import { services } from './services' // Removed due to richText structure issues
// import { consultationBooking } from './consultation-booking' // Removed due to richText structure issues
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'
import { post4 } from './post-4'
import { applySpaceTemplate } from './spaces-template'

const _collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
]
const _globals: GlobalSlug[] = ['header', 'footer']

// Lexical content builder utilities
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalContent = (children: any[]): any => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalParagraph = (text: string, format: number = 0): any => ({
  type: 'paragraph',
  children: [
    {
      type: 'text',
      detail: 0,
      format,
      mode: 'normal',
      style: '',
      text,
      version: 1,
    }
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: format,
  version: 1,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalHeading = (text: string, tag: 'h1' | 'h2' | 'h3' | 'h4' = 'h2'): any => ({
  type: 'heading',
  children: [
    {
      type: 'text',
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      text,
      version: 1,
    }
  ],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLexicalList = (items: string[], listType: 'bullet' | 'number' = 'bullet'): any => ({
  type: listType === 'bullet' ? 'unorderedlist' : 'orderedlist',
  children: items.map((item, index) => ({
    type: 'listitem',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: item,
            version: 1,
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    value: index + 1,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType: listType === 'bullet' ? 'unordered' : 'ordered',
  start: 1,
  tag: listType === 'bullet' ? 'ul' : 'ol',
  version: 1
})

// Tenant Template Configuration Interface
interface TenantTemplate {
  name: string
  slug: string
  domain: string
  subdomain: string
  businessType: 'service' | 'dumpster-rental' | 'bedbug-treatment' | 'salon' | 'cactus-farm' | 'retail' | 'other'
  industry: string
  description: string
  configuration: {
    primaryColor: string
    contactEmail: string
    contactPhone: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  services: Array<{
    title: string
    slug: string
    description: string
    price: number
    duration?: number
    category: string
  }>
  content: {
    heroTitle: string
    heroSubtitle: string
    aboutSection: string
    servicesIntro: string
  }
}

// Tenant Templates - Foundation for Multi-Tenant Onboarding
const TENANT_TEMPLATES: Record<string, TenantTemplate> = {
  kendevco: {
    name: "KenDev.Co",
    slug: "kendevco",
    domain: "angel-os.kendev.co",
    subdomain: "spaces",
    businessType: "service",
    industry: "AI Automation & Web Development",
    description: "AI Automation and Implementation Agency specializing in n8n workflows, custom web development, and Spaces platform implementations for Dallas-Fort Worth area businesses",
    configuration: {
      primaryColor: "#3b82f6",
      contactEmail: "kenneth.courtney@gmail.com",
      contactPhone: "7272564413",
      address: {
        street: "2566 Harn Blvd, Apt 13",
        city: "Clearwater",
        state: "FL",
        zipCode: "33764",
        country: "US"
      }
    },
    services: [
      {
        title: "Spaces Platform Implementation",
        slug: "spaces-platform-implementation",
        description: "Complete Discord-style collaboration platform with enterprise multi-tenancy, AI integration, and custom workflow automation",
        price: 5000,
        duration: 960,
        category: "platform-implementation"
      },
      {
        title: "n8n Workflow Automation",
        slug: "n8n-workflow-automation",
        description: "Custom automation workflows using n8n with database integration, API orchestration, and business process optimization",
        price: 1500,
        duration: 240,
        category: "automation-solutions"
      },
      {
        title: "VAPI Voice AI Integration",
        slug: "vapi-voice-ai-integration",
        description: "Advanced voice AI integration with automated scheduling, customer service, and business process automation",
        price: 3000,
        duration: 360,
        category: "ai-integration"
      },
      {
        title: "AI Readiness Assessment",
        slug: "ai-readiness-assessment",
        description: "Comprehensive AI readiness evaluation with implementation roadmap, technology recommendations, and ROI analysis",
        price: 2500,
        duration: 480,
        category: "ai-consulting"
      }
    ],
    content: {
      heroTitle: "AI Automation & Implementation Agency",
      heroSubtitle: "Transform your business with intelligent automation, custom Spaces platform implementations, and cutting-edge AI solutions. Proudly serving Dallas-Fort Worth area businesses and Celersoft partners.",
      aboutSection: "KenDev.Co specializes in AI-powered automation solutions that revolutionize business operations. From n8n workflow automation to comprehensive Spaces platform implementations, we help organizations leverage technology for competitive advantage. Our open-source approach ensures transparency, extensibility, and freedom from vendor lock-in.",
      servicesIntro: "Our comprehensive suite of services covers everything from AI strategy and planning to full-scale platform implementations. We work closely with local Dallas-area businesses, Celersoft affiliates, and forward-thinking companies ready to embrace the future of collaborative work environments."
    }
  }
}

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req: _req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('🚀 Starting Angel OS multi-tenant seeding...')
  payload.logger.info('🏭 Template Factory: Building Instance 0 of the multi-tenant framework')

  // Helper function to seed new MVP collections
  const seedMVPCollections = async (tenantId: string, adminUserId: string) => {
    payload.logger.info('📋 Seeding MVP Dashboard collections...')

    // Seed sample project
    const existingProject = await checkExists('projects', {
      and: [
        { name: { equals: 'Welcome to Angel OS' } },
        { tenant: { equals: tenantId } }
      ]
    })

    if (!existingProject) {
      payload.logger.info('— Creating sample project...')
      const project = await payload.create({
        collection: 'projects',
        data: {
          name: 'Welcome to Angel OS',
          description: createLexicalContent([
            createLexicalParagraph('Welcome to your first Angel OS project! This project demonstrates the powerful project management capabilities built into the platform.'),
            createLexicalParagraph('You can track tasks, manage team members, monitor budgets, and measure progress all in one place.'),
          ]),
          status: 'active',
          priority: 'high',
          dates: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          },
          budget: {
            estimatedBudget: 5000,
            currency: 'usd',
          },
          team: {
            projectManager: adminUserId,
            teamMembers: [adminUserId],
          },
          progress: {
            completionPercentage: 25,
            hoursEstimated: 40,
          },
          tenant: tenantId,
        },
      } as any)

      // Seed sample tasks for the project
      payload.logger.info('— Creating sample tasks...')
      await payload.create({
        collection: 'tasks',
        data: {
          title: 'Set up project workspace',
          description: createLexicalContent([
            createLexicalParagraph('Configure the project workspace and invite team members to collaborate.'),
          ]),
          status: 'done',
          priority: 'high',
          project: project.id,
          assignee: adminUserId,
          reporter: adminUserId,
          dates: {
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            completedDate: new Date().toISOString(),
          },
          timeTracking: {
            estimatedHours: 4,
            actualHours: 3.5,
            timeEntries: [{
              date: new Date().toISOString(),
              hours: 3.5,
              description: 'Initial project setup and configuration',
              user: adminUserId,
            }],
          },
          labels: ['feature', 'backend'],
          tenant: tenantId,
        },
      } as any)

      await payload.create({
        collection: 'tasks',
        data: {
          title: 'Create project documentation',
          description: createLexicalContent([
            createLexicalParagraph('Document project requirements, goals, and deliverables for team reference.'),
          ]),
          status: 'in-progress',
          priority: 'medium',
          project: project.id,
          assignee: adminUserId,
          reporter: adminUserId,
          dates: {
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          timeTracking: {
            estimatedHours: 8,
            actualHours: 2,
          },
          labels: ['documentation', 'frontend'],
          tenant: tenantId,
        },
      } as any)
    }

    // Seed sample campaign
    const existingCampaign = await checkExists('campaigns', {
      and: [
        { name: { equals: 'Angel OS Launch Campaign' } },
        { tenant: { equals: tenantId } }
      ]
    })

    if (!existingCampaign) {
      payload.logger.info('— Creating sample campaign...')
      await payload.create({
        collection: 'campaigns',
        data: {
          name: 'Angel OS Launch Campaign',
          description: createLexicalContent([
            createLexicalParagraph('A comprehensive marketing campaign to introduce Angel OS to potential customers.'),
            createLexicalParagraph('This campaign showcases the platform\'s capabilities and drives user adoption.'),
          ]),
          type: 'content',
          status: 'active',
          dates: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
          budget: {
            totalBudget: 10000,
            spentBudget: 2500,
            currency: 'usd',
          },
          targeting: {
            targetAudience: createLexicalContent([
              createLexicalParagraph('Small to medium businesses looking for integrated business management solutions.'),
            ]),
            demographics: {
              ageRange: '25-55',
              gender: 'all',
              locations: [
                { location: 'United States' },
                { location: 'Canada' },
                { location: 'United Kingdom' },
              ],
              interests: [
                { interest: 'Business Software' },
                { interest: 'Productivity Tools' },
                { interest: 'SaaS' },
              ],
            },
          },
          content: {
            copyVariations: [{
              headline: 'Transform Your Business with Angel OS',
              description: 'The all-in-one platform for modern businesses',
              callToAction: 'Start Free Trial',
              variation: 'A',
            }],
          },
          metrics: {
            impressions: 45000,
            clicks: 1200,
            conversions: 89,
            leads: 156,
            sales: 23,
            revenue: 11500,
          },
          team: {
            campaignManager: adminUserId,
            teamMembers: [adminUserId],
          },
          tenant: tenantId,
        },
      } as any)
    }

    // Seed sample lead
    const existingLead = await checkExists('leads', {
      and: [
        { email: { equals: 'john.prospect@example.com' } },
        { tenant: { equals: tenantId } }
      ]
    })

    if (!existingLead) {
      payload.logger.info('— Creating sample lead...')
      await payload.create({
        collection: 'leads',
        data: {
          firstName: 'John',
          lastName: 'Prospect',
          email: 'john.prospect@example.com',
          phone: '+1-555-0123',
          company: 'Future Tech Solutions',
          jobTitle: 'Operations Manager',
          source: 'website',
          sourceDetails: {
            utmSource: 'google',
            utmMedium: 'organic',
            utmCampaign: 'angel-os-launch',
          },
          status: 'qualified',
          scoring: {
            score: 75,
            behaviorScore: 40,
            demographicScore: 35,
            engagementLevel: 'warm',
            qualificationCriteria: [{
              criterion: 'Has budget authority',
              met: true,
              weight: 8,
            }, {
              criterion: 'Immediate need',
              met: true,
              weight: 7,
            }],
          },
          interests: {
            services: [{
              service: 'Business Process Automation',
              priority: 'high',
            }],
            budget: {
              range: '5k-10k',
              timeframe: '3-months',
            },
          },
          assignedTo: adminUserId,
          activities: [{
            type: 'website-visit',
            subject: 'Initial website visit',
            description: createLexicalContent([
              createLexicalParagraph('Prospect visited pricing page and downloaded product brochure.'),
            ]),
            outcome: 'positive',
            nextAction: 'Schedule discovery call',
            user: adminUserId,
          }],
          notes: createLexicalContent([
            createLexicalParagraph('Highly qualified prospect with immediate need for business automation solutions.'),
          ]),
          tenant: tenantId,
        },
      } as any)
    }

    // Seed sample opportunity
    const existingOpportunity = await checkExists('opportunities', {
      and: [
        { name: { equals: 'Future Tech Solutions - Angel OS Implementation' } },
        { tenant: { equals: tenantId } }
      ]
    })

    if (!existingOpportunity) {
      payload.logger.info('— Creating sample opportunity...')
      await payload.create({
        collection: 'opportunities',
        data: {
          name: 'Future Tech Solutions - Angel OS Implementation',
          description: createLexicalContent([
            createLexicalParagraph('Comprehensive Angel OS implementation for mid-size technology company.'),
            createLexicalParagraph('Includes full platform setup, team training, and ongoing support.'),
          ]),
          account: {
            company: 'Future Tech Solutions',
            industry: 'technology',
            size: '51-200',
          },
          value: {
            amount: 25000,
            currency: 'usd',
            recurringRevenue: true,
            recurringPeriod: 'annually',
          },
          stage: 'proposal',
          probability: 60,
          dates: {
            expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          assignedTo: adminUserId,
          team: {
            members: [adminUserId],
            decisionMakers: [{
              name: 'John Prospect',
              role: 'Operations Manager',
              influence: 'champion',
              sentiment: 'positive',
            }],
          },
          products: {
            proposedSolution: createLexicalContent([
              createLexicalParagraph('Angel OS Enterprise plan with full CRM, project management, and automation features.'),
            ]),
          },
          activities: [{
            type: 'demo',
            subject: 'Product demonstration',
            description: createLexicalContent([
              createLexicalParagraph('Comprehensive product demo showcasing key features and benefits.'),
            ]),
            outcome: 'very-positive',
            nextSteps: 'Prepare formal proposal with pricing',
            user: adminUserId,
          }],
          notes: createLexicalContent([
            createLexicalParagraph('Strong opportunity with engaged decision maker. Company has budget and timeline.'),
          ]),
          tenant: tenantId,
        },
      } as any)
    }

    // Seed roadmap features (these are global, not tenant-specific)
    const existingRoadmapFeature = await checkExists('roadmap-features', {
      title: { equals: 'Universal DataTable Component' }
    })

    if (!existingRoadmapFeature) {
      payload.logger.info('— Creating Angel OS roadmap features...')
      
      // COMPLETED FEATURES
      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Universal DataTable Component',
          description: createLexicalContent([
            createLexicalParagraph('Reusable DataTable component with sorting, filtering, pagination, and custom actions.'),
            createLexicalParagraph('Built with @tanstack/react-table and ShadCN UI for consistency across all dashboards.'),
          ]),
          category: 'ui-ux',
          status: 'completed',
          priority: 'high',
          timeline: {
            estimatedCompletion: new Date('2025-01-15').toISOString(),
            actualCompletion: new Date().toISOString(),
            quarterTarget: '2025-q1',
            estimatedEffort: 'small',
          },
          voting: {
            votes: 34,
            allowVoting: false,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 100,
            milestones: [{
              title: 'Component architecture',
              description: 'Design reusable table component interface',
              completed: true,
              completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            }, {
              title: 'Implementation & testing',
              description: 'Build component with Products and File Manager integration',
              completed: true,
              completedDate: new Date().toISOString(),
            }],
          },
          tags: ['new-feature', 'enhancement', 'quick-win'],
        },
      } as any)

      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Payload Folders Integration',
          description: createLexicalContent([
            createLexicalParagraph('Integration of Payload\'s new Folders feature for organized media management.'),
            createLexicalParagraph('Provides digital asset management (DAM) capabilities with folder organization, permissions, and drag-and-drop functionality.'),
          ]),
          category: 'system',
          status: 'completed',
          priority: 'medium',
          timeline: {
            estimatedCompletion: new Date('2025-01-15').toISOString(),
            actualCompletion: new Date().toISOString(),
            quarterTarget: '2025-q1',
            estimatedEffort: 'small',
          },
          voting: {
            votes: 28,
            allowVoting: false,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 100,
          },
          tags: ['new-feature', 'enhancement'],
        },
      } as any)

      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Multi-Tenant Architecture',
          description: createLexicalContent([
            createLexicalParagraph('Complete data isolation and tenant management system with role-based access controls.'),
            createLexicalParagraph('Includes tenant provisioning, deprovisioning, and hierarchical permission system based on DNN architecture.'),
          ]),
          category: 'system',
          status: 'completed',
          priority: 'critical',
          timeline: {
            estimatedCompletion: new Date('2025-01-10').toISOString(),
            actualCompletion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            quarterTarget: '2025-q1',
            estimatedEffort: 'large',
          },
          voting: {
            votes: 89,
            allowVoting: false,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 100,
          },
          tags: ['new-feature', 'security'],
        },
      } as any)

      // IN PROGRESS FEATURES
      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'LEO Navigation & Data Entry',
          description: createLexicalContent([
            createLexicalParagraph('Enable LEO AI assistant to navigate users to any page and fill form controls conversationally.'),
            createLexicalParagraph('Voice and text interface for complete hands-free operation of the Angel OS platform.'),
          ]),
          category: 'integrations',
          status: 'in-progress',
          priority: 'high',
          timeline: {
            estimatedCompletion: new Date('2025-01-26').toISOString(),
            quarterTarget: '2025-q1',
            estimatedEffort: 'medium',
          },
          voting: {
            votes: 47,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 75,
            milestones: [{
              title: 'Command palette foundation',
              description: 'Build event-driven command system',
              completed: true,
              completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            }, {
              title: 'Voice integration',
              description: 'Integrate VAPI for voice commands',
              completed: false,
            }, {
              title: 'Form auto-fill',
              description: 'AI-powered form completion',
              completed: false,
            }],
          },
          tags: ['community-requested', 'new-feature'],
        },
      } as any)

      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'CRM Dashboard Suite',
          description: createLexicalContent([
            createLexicalParagraph('Complete CRM dashboards for Contacts, Leads, and Opportunities with pipeline views.'),
            createLexicalParagraph('Includes filtering, relationship management, and sales process automation.'),
          ]),
          category: 'crm',
          status: 'in-progress',
          priority: 'high',
          timeline: {
            estimatedCompletion: new Date('2025-02-01').toISOString(),
            quarterTarget: '2025-q1',
            estimatedEffort: 'medium',
          },
          voting: {
            votes: 62,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 25,
            milestones: [{
              title: 'Contacts dashboard',
              description: 'Build contacts management interface',
              completed: false,
            }, {
              title: 'Leads pipeline',
              description: 'Create leads tracking and conversion system',
              completed: false,
            }, {
              title: 'Opportunities management',
              description: 'Sales opportunity tracking and forecasting',
              completed: false,
            }],
          },
          tags: ['community-requested', 'new-feature'],
        },
      } as any)

      // PLANNED FEATURES
      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Fully Conversational Interface',
          description: createLexicalContent([
            createLexicalParagraph('Make entire web interface optional - everything accessible via voice/text commands.'),
            createLexicalParagraph('Complete hands-free operation with natural language processing for all platform functions.'),
          ]),
          category: 'ui-ux',
          status: 'planned',
          priority: 'high',
          timeline: {
            estimatedCompletion: new Date('2025-02-15').toISOString(),
            quarterTarget: '2025-q1',
            estimatedEffort: 'large',
          },
          voting: {
            votes: 134,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 10,
          },
          tags: ['community-requested', 'new-feature', 'accessibility'],
        },
      } as any)

      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Parent-Child Tenant Architecture',
          description: createLexicalContent([
            createLexicalParagraph('Hierarchical tenant system (e.g., BJC.org → BJCHospice.org) with directory controls.'),
            createLexicalParagraph('Enables enterprise organizations to manage multiple sub-organizations with inherited permissions and shared resources.'),
          ]),
          category: 'system',
          status: 'planned',
          priority: 'medium',
          timeline: {
            estimatedCompletion: new Date('2025-03-01').toISOString(),
            quarterTarget: '2025-q1',
            estimatedEffort: 'large',
          },
          voting: {
            votes: 28,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 5,
          },
          tags: ['enhancement', 'security'],
        },
      } as any)

      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Angel OS Network Federation',
          description: createLexicalContent([
            createLexicalParagraph('Distributed network of Angel OS nodes with cross-node communication and tenant migration.'),
            createLexicalParagraph('Conway\'s Game of Life inspired architecture with Angel Token economy for human-worth consensus.'),
          ]),
          category: 'system',
          status: 'planned',
          priority: 'medium',
          timeline: {
            estimatedCompletion: new Date('2025-04-01').toISOString(),
            quarterTarget: '2025-q2',
            estimatedEffort: 'epic',
          },
          voting: {
            votes: 156,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 15,
            milestones: [{
              title: 'Network foundation',
              description: 'Basic node-to-node communication',
              completed: true,
              completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            }, {
              title: 'Token economy',
              description: 'Angel Token blockchain integration',
              completed: false,
            }],
          },
          tags: ['new-feature', 'performance'],
        },
      } as any)

      // FUTURE VISION
      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Dynamic Container Types',
          description: createLexicalContent([
            createLexicalParagraph('User-voted container types for different use cases (Hospice, Medical, Legal, etc.).'),
            createLexicalParagraph('Community-driven specialization of Angel OS for specific industries and workflows.'),
          ]),
          category: 'system',
          status: 'consideration',
          priority: 'medium',
          timeline: {
            quarterTarget: '2025-q2',
            estimatedEffort: 'large',
          },
          voting: {
            votes: 19,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 0,
          },
          tags: ['community-requested', 'new-feature'],
        },
      } as any)

      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'Oqtane Frontend (Phase A2D)',
          description: createLexicalContent([
            createLexicalParagraph('Enterprise .NET frontend for regulated environments and Microsoft shops.'),
            createLexicalParagraph('Blazor-based interface maintaining full Angel OS functionality for enterprise compliance requirements.'),
          ]),
          category: 'integrations',
          status: 'consideration',
          priority: 'low',
          timeline: {
            quarterTarget: '2025-q2',
            estimatedEffort: 'epic',
          },
          voting: {
            votes: 15,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 5,
          },
          tags: ['new-feature'],
        },
      } as any)

      await payload.create({
        collection: 'roadmap-features',
        data: {
          title: 'SoulFleet Mobile Integration',
          description: createLexicalContent([
            createLexicalParagraph('Mobile app for outreach vehicles and field operations.'),
            createLexicalParagraph('GPS tracking, offline capabilities, and real-time communication for mobile service delivery.'),
          ]),
          category: 'mobile',
          status: 'consideration',
          priority: 'medium',
          timeline: {
            quarterTarget: '2025-q3',
            estimatedEffort: 'epic',
          },
          voting: {
            votes: 42,
            allowVoting: true,
            voteWeight: 1,
          },
          progress: {
            completionPercentage: 0,
          },
          tags: ['community-requested', 'new-feature', 'mobile'],
        },
      } as any)
    }

    payload.logger.info('✅ MVP Dashboard collections seeded successfully')
  }

  // Angel OS Network Foundation Seeding
  async function seedNetworkFoundation(payload: any, tenantId: string) {
    payload.logger.info('🌐 Seeding Angel OS Network foundation...')
    
    // Create the genesis node (this instance)
    const existingGenesisNode = await payload.find({
      collection: 'angel-os-nodes',
      where: {
        nodeType: {
          equals: 'genesis',
        },
      },
      limit: 1,
    })

    if (existingGenesisNode.docs.length === 0) {
      payload.logger.info('— Creating Genesis Node...')
      const genesisNode = await payload.create({
        collection: 'angel-os-nodes',
        data: {
          name: 'Angel OS Genesis Node',
          nodeId: 'genesis-node-001',
          atProtocolDID: 'did:plc:angel-os-genesis',
          endpoint: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
          apiEndpoint: `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/federation`,
          region: 'us-east',
          nodeType: 'genesis',
          capabilities: [
            'tenant_hosting',
            'ai_processing', 
            'media_storage',
            'realtime_comm',
          ],
          status: 'online',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
          resources: {
            maxTenants: 1000,
            currentTenants: 1,
            maxUsers: 100000,
            storageCapacity: 1000, // GB
          },
          health: {
            lastSeen: new Date().toISOString(),
            responseTime: 50,
            uptime: 99.9,
            loadScore: 10,
          },
          governanceRules: createLexicalContent([
            createLexicalParagraph('Genesis Node: The foundational Angel OS instance that bootstraps the distributed network.'),
            createLexicalParagraph('This node maintains the master registry and coordinates network evolution.'),
          ]),
          evolutionHistory: [{
            timestamp: new Date().toISOString(),
            event: 'created',
            description: 'Genesis Node created - Angel OS Network initiated',
            data: {
              version: '1.0.0',
              founder: 'Kenneth Courtney',
              purpose: 'Constitutional Technology Foundation',
            },
          }],
        } as any,
      })
      payload.logger.info(`✨ Genesis Node created: ${genesisNode.nodeId}`)

      // Create tenant distribution record for the default tenant
      await payload.create({
        collection: 'tenant-distribution',
        data: {
          tenant: tenantId,
          tenantName: 'KenDev.Co',
          currentNode: genesisNode.id,
          assignedAt: new Date().toISOString(),
          distributionStrategy: 'manual',
          priority: 'critical',
          migrationStatus: 'stable',
          networkAffinity: {
            primaryUserRegions: ['us-east'],
            affinityScore: 100,
          },
          automationRules: {
            autoMigrationEnabled: false, // Genesis tenant stays put
            maxMigrationsPerMonth: 0,
            migrationWindow: 'manual_approval',
          },
          migrationHistory: [{
            timestamp: new Date().toISOString(),
            fromNode: genesisNode.id,
            toNode: genesisNode.id,
            reason: 'Initial genesis assignment',
            duration: 0,
            success: true,
            notes: 'Foundational tenant assignment to Genesis Node',
          }],
        } as any,
      })
      payload.logger.info('🎯 Tenant distribution initialized for Genesis Node')
    } else {
      payload.logger.info('✅ Genesis Node already exists')
    }

    payload.logger.info('🌟 Angel OS Network foundation initialized!')
  }

  // Helper function to check if item exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkExists = async (collection: string, where: any) => {
    try {
      const result = await payload.find({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collection: collection as any,
        where,
        limit: 1,
      })
      return result.docs.length > 0 ? result.docs[0] : null
    } catch (_error) {
      return null
    }
  }

  // ALWAYS create Kenneth Courtney as the super admin first
  payload.logger.info('👑 Creating super admin: Kenneth Courtney...')
  
  let kenAdmin = await checkExists('users', { email: { equals: 'kenneth.courtney@gmail.com' } })
  
  if (!kenAdmin) {
    kenAdmin = await payload.create({
      collection: 'users',
      data: {
        firstName: 'Kenneth',
        lastName: 'Courtney',
        email: 'kenneth.courtney@gmail.com',
        password: 'angelos',
        globalRole: 'super_admin', // Super admin role
        // tenant will be assigned after tenant creation
      } as any,
    })
    payload.logger.info('✅ Kenneth Courtney super admin created')
  } else {
    payload.logger.info('✅ Kenneth Courtney super admin already exists')
    // Ensure the user has the correct role
    await payload.update({
      collection: 'users',
      id: kenAdmin.id,
      data: {
        globalRole: 'super_admin',
      } as any,
    })
    payload.logger.info('✅ Kenneth Courtney super admin role updated')
  }

  // Get tenant configuration (default to kendevco, can be overridden with SEED_TENANT env var)
  const tenantKey = process.env.SEED_TENANT || 'kendevco'
  const tenantTemplate = TENANT_TEMPLATES[tenantKey]

  if (!tenantTemplate) {
    throw new Error(`Tenant template '${tenantKey}' not found. Available templates: ${Object.keys(TENANT_TEMPLATES).join(', ')}`)
  }

  payload.logger.info(`📋 Using tenant template: ${tenantTemplate.name} (${tenantTemplate.industry})`)
  payload.logger.info('🎯 This provisions Instance 0 - the foundation for all future tenants')

  // Helper function to safely delete collection items for re-initialization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeDelete = async (collection: string, where: any) => {
    try {
      const items = await payload.find({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collection: collection as any,
        where,
        limit: 100,
      })

      for (const item of items.docs) {
        await payload.delete({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collection: collection as any,
          id: item.id,
        })
      }

      payload.logger.info(`🗑️  Cleaned up ${items.docs.length} items from ${collection}`)
    } catch (error) {
      payload.logger.warn(`⚠️  Could not clean up ${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Re-initialization: Clean up existing tenant data if in development mode
  if (process.env.NODE_ENV === 'development' && process.env.SEED_CLEAN === 'true') {
    payload.logger.info('🧹 Development mode: Performing database re-initialization...')
    payload.logger.info('   This will clean existing tenant data for fresh seeding')

    // Clean up tenant-specific data in proper order (respecting relationships)
    await safeDelete('posts', { 'authors.email': { equals: 'demo-author@example.com' } })
    await safeDelete('products', { tenant: { exists: true } })
    await safeDelete('categories', { tenant: { exists: true } })
    await safeDelete('tenants', { slug: { equals: tenantTemplate.slug } })
    await safeDelete('users', { email: { equals: 'demo-author@example.com' } })

    payload.logger.info('✅ Database re-initialization completed')
  }

  payload.logger.info(`— Demo author will be created after tenant setup...`)

  payload.logger.info(`— Checking for media...`)

  // Check if media already exists
  let image1Doc = await checkExists('media', { alt: { equals: 'Post 1' } })
  let image2Doc = await checkExists('media', { alt: { equals: 'Post 2' } })
  let image3Doc = await checkExists('media', { alt: { equals: 'Post 3' } })
  let imageHomeDoc = await checkExists('media', { alt: { equals: 'Hero 1' } })

  if (!image1Doc || !image2Doc || !image3Doc || !imageHomeDoc) {
    payload.logger.info(`— Creating missing media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

    const mediaCreations = []

    if (!image1Doc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
        })
      )
    }
    if (!image2Doc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
        })
      )
    }
    if (!image3Doc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
        })
      )
    }
    if (!imageHomeDoc) {
      mediaCreations.push(
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
        })
      )
    }

    const createdMedia = await Promise.all(mediaCreations)

    // Assign created media to variables
    let mediaIndex = 0
    if (!image1Doc) image1Doc = createdMedia[mediaIndex++]
    if (!image2Doc) image2Doc = createdMedia[mediaIndex++]
    if (!image3Doc) image3Doc = createdMedia[mediaIndex++]
    if (!imageHomeDoc) imageHomeDoc = createdMedia[mediaIndex++]
  } else {
    payload.logger.info(`— All media already exists, skipping...`)
  }

  payload.logger.info(`🏢 Setting up ${tenantTemplate.name} tenant...`)

  // Create or update tenant using template
  let tenant = await checkExists('tenants', {
    slug: { equals: tenantTemplate.slug }
  })

  if (!tenant) {
    payload.logger.info(`— Creating ${tenantTemplate.name} tenant...`)
    tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: tenantTemplate.name,
        slug: tenantTemplate.slug,
        domain: tenantTemplate.domain,
        subdomain: tenantTemplate.subdomain,
        businessType: tenantTemplate.businessType,
        status: "active",
        configuration: {
          primaryColor: tenantTemplate.configuration.primaryColor,
          logo: imageHomeDoc.id,
          favicon: null,
          contactEmail: tenantTemplate.configuration.contactEmail,
          contactPhone: tenantTemplate.configuration.contactPhone,
          address: tenantTemplate.configuration.address
        },
        features: {
          ecommerce: true,
          spaces: true,
          crm: true,
          vapi: true,
          n8n: true,
          memberPortal: true
        },
        limits: {
          maxUsers: 1000,
          maxProducts: 100,
          maxStorage: 1000
        }
      }
    })
  } else {
    payload.logger.info(`— ${tenantTemplate.name} tenant already exists, updating configuration...`)
    tenant = await payload.update({
      collection: 'tenants',
      id: tenant.id,
      data: {
        status: "active",
        configuration: {
          ...tenant.configuration,
          primaryColor: tenantTemplate.configuration.primaryColor,
          logo: imageHomeDoc.id,
          contactEmail: tenantTemplate.configuration.contactEmail,
          contactPhone: tenantTemplate.configuration.contactPhone,
          address: tenantTemplate.configuration.address
        },
        features: {
          ecommerce: true,
          spaces: true,
          crm: true,
          vapi: true,
          n8n: true,
          memberPortal: true
        }
      }
    })
  }

  // Assign Kenneth Courtney to the tenant now that it exists
  payload.logger.info('👑 Assigning Kenneth Courtney to tenant...')
  await payload.update({
    collection: 'users',
    id: kenAdmin.id,
    data: {
      tenant: tenant.id,
    },
  })

  // Create tenant membership for Kenneth Courtney
  payload.logger.info('🔗 Creating tenant membership for Kenneth Courtney...')
  try {
    let tenantMembership = await checkExists('tenant-memberships', {
      and: [
        { user: { equals: kenAdmin.id } },
        { tenant: { equals: tenant.id } }
      ]
    })

    if (!tenantMembership) {
      tenantMembership = await payload.create({
        collection: 'tenant-memberships',
        data: {
          user: kenAdmin.id,
          tenant: tenant.id,
          role: 'tenant_admin',
          status: 'active',
          joinedAt: new Date().toISOString(),
          permissions: [
            'manage_users',
            'manage_spaces',
            'manage_content',
            'manage_products',
            'manage_orders',
            'view_analytics',
            'manage_settings',
            'manage_billing',
            'export_data'
          ]
        }
      })
      payload.logger.info('✅ Tenant membership created for Kenneth Courtney')
    } else {
      payload.logger.info('✅ Tenant membership already exists for Kenneth Courtney')
    }
  } catch (error) {
    payload.logger.info('ℹ️ tenant-memberships collection may not exist yet, skipping membership creation')
    payload.logger.info('ℹ️ TenantChooser will fall back to loading all tenants')
  }

  // Create LEO AI System for this tenant (Site Angel)
  payload.logger.info('🤖 Creating LEO AI System (Site Angel)...')
  let leoAgent = await checkExists('business-agents', {
    and: [
      { name: { equals: 'LEO' } },
      { tenant: { equals: tenant.id } }
    ]
  })

  if (!leoAgent) {
    leoAgent = await payload.create({
      collection: 'business-agents',
      data: {
        name: 'LEO',
        spiritType: 'support',
        tenant: tenant.id, // Fixed: BusinessAgents collection DOES have tenant field
        humanPartner: kenAdmin.id,
        isActive: true,
        personalityProfile: {
          coreTrait: 'helpful-professional',
          communicationStyle: 'professional',
          expertise: ['tenant-management', 'user-support', 'business-automation'],
          quirks: ['Always available to help', 'Loves solving complex problems']
        }
      } as any
    })
    payload.logger.info('✅ LEO Site Angel created and configured')
  } else {
    payload.logger.info('✅ LEO Site Angel already exists')
  }
  // Ensure a default Space exists for the tenant
  payload.logger.info(`— Ensuring default Space exists for ${tenantTemplate.name}...`)
  const existingMainSpace = await checkExists('spaces', {
    and: [
      { tenant: { equals: tenant.id } },
      { slug: { equals: 'main' } },
    ],
  })

  if (!existingMainSpace) {
    payload.logger.info(`— Creating basic default Space for ${tenantTemplate.name}...`)
    await payload.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'spaces' as any,
      data: {
        name: 'Main',
        slug: 'main',
        tenant: tenant.id, // Fixed: Spaces collection DOES have tenant field
        businessIdentity: {
          type: 'business',
          industry: 'general',
        },
        commerceSettings: {
          enableEcommerce: true,
          enableServices: tenantTemplate.businessType === 'service',
          enableMerchandise: false,
        },
      },
    })
    payload.logger.info('✅ Basic default Space created successfully')
  } else {
    payload.logger.info('— Default Space already exists, skipping...')
  }


  payload.logger.info(`— Checking for demo author (after tenant creation)...`)

  // Check if demo author exists - NOW that tenant exists
  let demoAuthor = await checkExists('users', {
    email: { equals: 'demo-author@example.com' }
  })

  if (!demoAuthor) {
    payload.logger.info(`— Creating demo author with tenant assignment...`)
    demoAuthor = await payload.create({
    collection: 'users',
      data: {
        firstName: 'Demo',
        lastName: 'Author',
        email: 'demo-author@example.com',
        password: 'password',
        globalRole: 'user',
        // tenant: tenant.id, // Category collection doesn't have tenant field // NOW we have the tenant ID!
      } as any,
    })
  } else {
    payload.logger.info(`— Demo author already exists, skipping...`)
  }

  payload.logger.info(`— Managing categories...`)
  
  // Check category count and clean up if needed
  const categoryCount = await payload.count({
    collection: 'categories',
  })
  
  if (categoryCount.totalDocs > 50) {
    payload.logger.info(`🧹 Found ${categoryCount.totalDocs} categories (>50). Cleaning up...`)
    
    // Get all categories
    const allCategories = await payload.find({
      collection: 'categories',
      limit: 1000, // Get all categories
    })
    
    // Delete all categories
    for (const category of allCategories.docs) {
      try {
        await payload.delete({
          collection: 'categories',
          id: category.id,
        })
      } catch (error) {
        console.error(`Failed to delete category ${category.name}:`, error)
      }
    }
    
    payload.logger.info(`✅ Cleaned up ${allCategories.docs.length} categories`)
  } else {
    payload.logger.info(`📊 Found ${categoryCount.totalDocs} categories (acceptable count)`)
  }
  
  // Helper function to create or update category
  const createOrUpdateCategory = async (categoryData: any) => {
    const existing = await checkExists('categories', { slug: { equals: categoryData.slug } })
    
    if (existing) {
      payload.logger.info(`— Updating category: ${categoryData.name}`)
      return await payload.update({
        collection: 'categories',
        id: existing.id,
        data: categoryData,
      })
    } else {
      payload.logger.info(`— Creating category: ${categoryData.name}`)
      return await payload.create({
        collection: 'categories',
        data: categoryData,
      })
    }
  }

  const spacesCategory = await createOrUpdateCategory({
    name: 'Spaces Platform',
    slug: 'spaces-platform',
    description: 'Latest updates and features of the Spaces collaboration platform',
  })

  const aiIntegrationCategory = await createOrUpdateCategory({
    name: 'AI Integration',
    slug: 'ai-integration',
    description: 'AI-powered features and intelligent automation in business platforms',
  })

  const aiConsultingCategory = await createOrUpdateCategory({
    name: 'AI Consulting',
    slug: 'ai-consulting',
    description: 'Professional AI consulting services and strategic guidance',
  })

  const automationCategory = await createOrUpdateCategory({
    name: 'Automation Solutions',
    slug: 'automation-solutions',
    description: 'Custom automation solutions to streamline your business processes',
    parent: aiConsultingCategory.id,
  })

  const strategyCategory = await createOrUpdateCategory({
    name: 'AI Strategy & Planning',
    slug: 'ai-strategy-planning',
    description: 'Strategic AI planning and implementation roadmaps',
    parent: aiConsultingCategory.id,
  })

  payload.logger.info(`🛍️ Creating products/services for ${tenantTemplate.name}...`)

  // Available images for products (cycling through them)
  const productImages = [image1Doc, image2Doc, image3Doc, imageHomeDoc].filter(Boolean)
  
  // Create products based on tenant template services
  for (const [index, service] of tenantTemplate.services.entries()) {
    let product = await checkExists('products', {
    and: [
        { slug: { equals: service.slug } },
        { tenant: { equals: tenant.id } }
      ]
    })

    if (!product) {
      payload.logger.info(`— Creating ${service.title} product...`)

      // Build proper Lexical content for products
      let productContent

      if (service.slug === 'spaces-platform-implementation') {
        productContent = createLexicalContent([
          createLexicalParagraph('Transform your team collaboration with a fully customized Spaces platform implementation. Get Discord-style communication with enterprise-grade security, multi-tenancy, and AI-powered business intelligence.'),
          createLexicalHeading('What\'s Included', 'h2'),
          createLexicalList([
            'Complete Spaces platform setup and configuration',
            'Multi-tenant architecture implementation',
            'Custom branding and theme development',
            'AI agent integration and configuration',
            'n8n workflow automation setup',
            'Database optimization and security hardening',
            'User training and documentation',
            'Post-launch support and optimization'
          ]),
          createLexicalHeading('Platform Features', 'h2'),
          createLexicalList([
            'Real-time messaging with rich content blocks',
            'Voice and video communication channels',
            'Advanced permission management',
            'AT Protocol federation capabilities',
            'Business intelligence dashboard',
            'Mobile-responsive progressive web app',
            'API integration and webhooks',
            'Scalable multi-tenant architecture'
          ]),
          createLexicalHeading('Timeline & Process', 'h2'),
          createLexicalParagraph('Implementation typically takes 2-4 weeks depending on complexity and customization requirements. We follow an agile approach with regular check-ins and iterative development to ensure the platform meets your exact needs.'),
          createLexicalHeading('Ongoing Support', 'h2'),
          createLexicalParagraph('Post-launch support includes platform monitoring, security updates, feature enhancements, and user training. We provide comprehensive documentation and can train your team to manage and extend the platform independently.')
        ])
      } else if (service.slug === 'n8n-workflow-automation') {
        productContent = createLexicalContent([
          createLexicalParagraph('Automate your business processes with custom n8n workflows that connect your tools, databases, and APIs. Reduce manual work, eliminate errors, and scale your operations efficiently.'),
          createLexicalHeading('Automation Services', 'h2'),
          createLexicalList([
            'Custom workflow design and implementation',
            'Database integration and synchronization',
            'API orchestration and data transformation',
            'Real-time notifications and alerts',
            'Scheduled tasks and batch processing',
            'Error handling and monitoring setup',
            'Documentation and training materials',
            'Ongoing maintenance and optimization'
          ]),
          createLexicalHeading('Popular Automation Scenarios', 'h2'),
          createLexicalList([
            'Lead management and CRM synchronization',
            'Invoice processing and payment notifications',
            'Calendar scheduling and appointment booking',
            'Data backup and synchronization',
            'Social media posting and content management',
            'Email marketing automation',
            'Inventory management and reordering',
            'Customer support ticket routing'
          ]),
          createLexicalHeading('Why Choose n8n?', 'h2'),
          createLexicalParagraph('n8n provides the perfect balance of power and flexibility for business automation. Unlike cloud-only solutions, n8n can be self-hosted for complete control over your data and workflows. With 400+ integrations and a visual workflow editor, it\'s the ideal platform for growing businesses.'),
          createLexicalParagraph('Our team has extensive experience with n8n implementations, including complex multi-tenant setups, database integrations, and custom node development. We ensure your workflows are robust, scalable, and maintainable.')
        ])
      } else if (service.slug === 'vapi-voice-ai-integration') {
        productContent = createLexicalContent([
          createLexicalParagraph('Enhance your business communications with advanced VAPI voice AI integration. Automate phone calls, create intelligent virtual assistants, and streamline customer interactions with natural language processing.'),
          createLexicalHeading('VAPI Integration Services', 'h2'),
          createLexicalList([
            'Custom voice AI assistant development',
            'Phone system integration and automation',
            'Natural language processing optimization',
            'Call routing and intelligent scheduling',
            'Voice-to-text transcription and analysis',
            'Multi-language support configuration',
            'Business system integration (CRM, calendar, etc.)',
            'Performance monitoring and analytics'
          ]),
          createLexicalHeading('Business Applications', 'h2'),
          createLexicalList([
            'Automated appointment scheduling and confirmations',
            'Customer service and support automation',
            'Lead qualification and initial screening',
            'Order taking and inventory inquiries',
            'Survey collection and feedback gathering',
            'Payment reminders and collection calls',
            'Emergency notifications and alerts',
            'Multi-language customer support'
          ]),
          createLexicalHeading('Technical Implementation', 'h2'),
          createLexicalParagraph('Our VAPI implementation includes comprehensive testing, optimization for your specific use cases, and integration with your existing business systems. We provide detailed analytics and monitoring to ensure optimal performance and continuous improvement.'),
          createLexicalParagraph('The system includes fallback mechanisms, error handling, and human handoff capabilities to ensure a professional experience for your customers at all times.')
        ])
  } else {
        // Default product content
        productContent = createLexicalContent([
          createLexicalParagraph(service.description),
          createLexicalHeading('Service Details', 'h2'),
          createLexicalParagraph('Comprehensive service designed to meet your specific business needs with expert implementation and ongoing support.'),
          createLexicalHeading('What You Get', 'h2'),
          createLexicalList([
            'Detailed analysis and planning',
            'Expert implementation and setup',
            'Comprehensive documentation',
            'Training and knowledge transfer',
            'Ongoing support and optimization'
          ])
        ])
      }

      // Find appropriate category for the service
      const categoryMapping = {
        'ai-consulting': aiConsultingCategory?.id || 1,
        'automation-solutions': automationCategory?.id || 1,
        'platform-implementation': spacesCategory?.id || 1,
        'ai-integration': aiIntegrationCategory?.id || 1
      }

      const categoryId = categoryMapping[service.category as keyof typeof categoryMapping] || aiConsultingCategory?.id
      
      // Assign image (cycling through available images)
      const assignedImage = productImages.length > 0 ? productImages[index % productImages.length] : null

      product = await payload.create({
      collection: 'products',
      data: {
          title: service.title,
          slug: service.slug,
          description: service.description,
          ...(assignedImage && { 
            gallery: [{
              image: assignedImage.id,
              alt: `${service.title} - Professional Service Image`,
              caption: `Illustration for ${service.title} service offering`
            }]
          }),
          sku: `${service.slug.toUpperCase().replace(/-/g, '_')}_001`,
        productType: 'business_service',
        status: 'draft',
        tenant: tenant.id,
          categories: [categoryId],
        hero: {
          type: 'lowImpact',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: service.description,
                      version: 1
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1
            }
          }
        },
        pricing: {
            basePrice: service.price,
            salePrice: null,
          currency: 'USD'
        },
        inventory: {
          trackQuantity: false,
          allowBackorder: true
        },
        serviceDetails: {
            duration: service.duration || 240,
            location: 'flexible',
          maxParticipants: 1,
          bookingRequired: true
        },
        meta: {
            title: `${service.title} - ${tenantTemplate.name}`,
            description: service.description,
            keywords: `${service.title.toLowerCase()}, ${tenantTemplate.industry.toLowerCase()}, consulting`
        }
      }
    })
  } else {
      payload.logger.info(`— ${service.title} product already exists, skipping...`)
    }
  }

  payload.logger.info(`— Checking for posts...`)

  // Check if posts exist before creating
  let post1Doc = await checkExists('posts', { slug: { equals: 'announcing-spaces-platform' } })
  let post2Doc = await checkExists('posts', { slug: { equals: 'spaces-at-protocol-integration' } })
  let post3Doc = await checkExists('posts', { slug: { equals: 'spaces-commerce-integration' } })
  let post4Doc = await checkExists('posts', { slug: { equals: 'vapi-scheduling-automation' } })

  if (!post1Doc) {
    payload.logger.info(`— Creating post 1...`)
    post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 1 already exists, skipping...`)
  }

  if (!post2Doc) {
    payload.logger.info(`— Creating post 2...`)
    post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 2 already exists, skipping...`)
  }

  if (!post3Doc) {
    payload.logger.info(`— Creating post 3...`)
    post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 3 already exists, skipping...`)
  }

  if (!post4Doc) {
    payload.logger.info(`— Creating post 4...`)
    post4Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post4({ heroImage: image1Doc, blockImage: image2Doc, author: demoAuthor }),
  })
  } else {
    payload.logger.info(`— Post 4 already exists, skipping...`)
  }

  // Update posts with related posts if they don't already have them
  if (post1Doc && (!post1Doc.relatedPosts || post1Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id, post4Doc.id],
    },
  })
  }

  if (post2Doc && (!post2Doc.relatedPosts || post2Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id, post4Doc.id],
    },
  })
  }

  if (post3Doc && (!post3Doc.relatedPosts || post3Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id, post4Doc.id],
    },
  })
  }

  if (post4Doc && (!post4Doc.relatedPosts || post4Doc.relatedPosts.length === 0)) {
  await payload.update({
    id: post4Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id, post3Doc.id],
    },
  })
  }

  payload.logger.info(`— Checking for contact form...`)

  let contactForm = await checkExists('forms', { name: { equals: 'Contact Form' } })

  if (!contactForm) {
    payload.logger.info(`— Creating contact form...`)
    contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })
  } else {
    payload.logger.info(`— Contact form already exists, skipping...`)
  }

  payload.logger.info(`— Checking for pages...`)

  // Check if pages exist
  let homePageDoc = await checkExists('pages', { slug: { equals: 'home' } })
  let aboutPageDoc = await checkExists('pages', { slug: { equals: 'about' } })
  let privacyPageDoc = await checkExists('pages', { slug: { equals: 'privacy-policy' } })
  let termsPageDoc = await checkExists('pages', { slug: { equals: 'terms-of-service' } })
  const servicesPageDoc = await checkExists('pages', { slug: { equals: 'services' } })
  const consultationPageDoc = await checkExists('pages', { slug: { equals: 'consultation-booking' } })
  let contactPageDoc = await checkExists('pages', { slug: { equals: 'contact' } })

  if (!homePageDoc) {
    payload.logger.info(`— Creating home page...`)
    homePageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: home,
      })
  } else {
    payload.logger.info(`— Home page already exists, skipping...`)
  }

  if (!aboutPageDoc) {
    payload.logger.info(`— Creating about page...`)
    aboutPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: about({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }) as any,
    })
  } else {
    payload.logger.info(`— About page already exists, skipping...`)
  }

  if (!privacyPageDoc) {
    payload.logger.info(`— Creating privacy policy page...`)
    privacyPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: privacyPolicy({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }) as any,
    })
  } else {
    payload.logger.info(`— Privacy policy page already exists, skipping...`)
  }

  if (!termsPageDoc) {
    payload.logger.info(`— Creating terms of service page...`)
    termsPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: termsOfService({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }) as any,
    })
  } else {
    payload.logger.info(`— Terms of service page already exists, skipping...`)
  }

  // Services and consultation pages temporarily disabled due to richText structure issues
  // if (!servicesPageDoc) {
  //   payload.logger.info(`— Creating services page...`)
  //   servicesPageDoc = await payload.create({
  //     collection: 'pages',
  //     depth: 0,
  //     data: services({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }),
  //   })
  // } else {
  //   payload.logger.info(`— Services page already exists, skipping...`)
  // }

  // if (!consultationPageDoc) {
  //   payload.logger.info(`— Creating consultation booking page...`)
  //   consultationPageDoc = await payload.create({
  //     collection: 'pages',
  //     depth: 0,
  //     data: consultationBooking({ heroImage: imageHomeDoc, metaImage: imageHomeDoc }),
  //   })
  // } else {
  //   payload.logger.info(`— Consultation booking page already exists, skipping...`)
  // }

  if (!contactPageDoc) {
    payload.logger.info(`— Creating contact page...`)
    contactPageDoc = await payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm }),
    })
  } else {
    payload.logger.info(`— Contact page already exists, skipping...`)
  }

  payload.logger.info(`— Checking for globals...`)

  // Check if globals need updating
  const headerGlobal = await payload.findGlobal({ slug: 'header' })
  const footerGlobal = await payload.findGlobal({ slug: 'footer' })

  if (!headerGlobal.navItems || headerGlobal.navItems.length === 0) {
    payload.logger.info(`— Updating header global...`)
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Spaces',
              url: '/spaces',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Docs',
              url: '/docs',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'About',
              reference: {
                relationTo: 'pages',
                value: aboutPageDoc?.id || null,
              },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Products',
              url: '/products',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPageDoc?.id || null,
              },
            },
          },
        ],
      },
    })
  } else {
    payload.logger.info(`— Header global already configured, skipping...`)
  }

  if (!footerGlobal.navItems || footerGlobal.navItems.length === 0) {
    payload.logger.info(`— Updating footer global...`)
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              label: 'Privacy Policy',
              reference: {
                relationTo: 'pages',
                value: privacyPageDoc?.id || null,
              },
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Terms of Service',
              reference: {
                relationTo: 'pages',
                value: termsPageDoc?.id || null,
              },
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
        ],
      },
    })
  } else {
    payload.logger.info(`— Footer global already configured, skipping...`)
  }

  // Seed the new MVP collections
  await seedMVPCollections(tenant.id, kenAdmin.id)

  // Initialize Angel OS Network foundation
  await seedNetworkFoundation(payload, tenant.id)

  payload.logger.info('🎉 Angel OS Instance 0 seeded successfully!')
  payload.logger.info('🏭 Template Factory initialized and ready for tenant provisioning')
  payload.logger.info(`👑 Super Admin: Kenneth Courtney (${kenAdmin.email})`)
  payload.logger.info(`🏢 Default Tenant: ${tenantTemplate.name} (${tenant.id})`)
  payload.logger.info(`🤖 Site Angel: LEO configured for conversational management`)
  payload.logger.info('🚀 Ready for multi-tenant operations!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
