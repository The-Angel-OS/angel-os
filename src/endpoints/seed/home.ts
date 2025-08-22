import type { Page } from '../../payload-types'
import { createLexicalContent, createLexicalHeading, createLexicalParagraph, createLexicalList } from '../../utilities/lexicalHelpers'

export const home: Omit<Page, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Home',
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: createLexicalContent([
      createLexicalHeading('Welcome to Spaces', 'h1'),
      createLexicalParagraph('The ultimate platform for creators, businesses, and communities to build, engage, and monetize their digital presence.')
    ])
  },
  layout: [
    {
      blockType: 'content',
      blockName: 'Introduction',
      columns: [
        {
          size: 'full',
          richText: createLexicalContent([
            createLexicalHeading('Transform Your Business with Spaces', 'h2'),
            createLexicalParagraph('Spaces is more than just a platform—it\'s your digital headquarters for building thriving communities, engaging customers, and creating sustainable revenue streams.'),
            createLexicalList([
              'Discord-style collaboration with enterprise features',
              'Multi-tenant architecture for unlimited scalability',
              'AI-powered business agents and automation',
              'Complete payment processing and subscription management',
              'Advanced content management and SEO optimization'
            ])
          ])
        }
      ]
    },
    {
      blockType: 'content',
      blockName: 'Key Features',
      columns: [
        {
          size: 'oneThird',
          richText: createLexicalContent([
            createLexicalHeading('Community Building', 'h3'),
            createLexicalParagraph('Create vibrant communities with channels, roles, and engagement tools that keep your audience coming back.')
          ])
        },
        {
          size: 'oneThird',
          richText: createLexicalContent([
            createLexicalHeading('Commerce Integration', 'h3'),
            createLexicalParagraph('Seamlessly integrate products, services, and subscriptions directly into your community experience.')
          ])
        },
        {
          size: 'oneThird',
          richText: createLexicalContent([
            createLexicalHeading('AI-Powered Automation', 'h3'),
            createLexicalParagraph('Let AI handle customer service, content moderation, and business workflows while you focus on growth.')
          ])
        }
      ]
    },
    {
      blockType: 'cta',
      blockName: 'Get Started CTA',
      links: [
        {
          link: {
            type: 'custom',
            url: '/spaces',
            label: 'Explore Spaces',
            appearance: 'default'
          }
        },
        {
          link: {
            type: 'custom',
            url: '/products',
            label: 'View Pricing',
            appearance: 'outline'
          }
        }
      ],
      richText: createLexicalContent([
        createLexicalHeading('Ready to Get Started?', 'h2'),
        createLexicalParagraph('Join thousands of creators and businesses already building their future with Spaces.')
      ])
    }
  ]
}
