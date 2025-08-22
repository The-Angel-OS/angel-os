import type { Page } from '@/payload-types'

export const shopPage = (): Omit<Page, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: 'Shop',
  slug: 'shop',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                text: 'Discover Our Products & Services',
              },
            ],
            tag: 'h1',
            version: 1
          },
          {
            type: 'paragraph',
            children: [
              {
                text: 'Browse our comprehensive collection of AI consulting services, automation solutions, and digital products designed to transform your business.',
              },
            ],
            version: 1
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1
      }
    },
    media: null,
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  children: [
                    {
                      text: 'Welcome to Our Shop',
                    },
                  ],
                  tag: 'h2',
                  version: 1
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Explore our curated selection of AI consulting services and automation solutions. Whether you\'re looking for strategic guidance, hands-on implementation, or custom automation workflows, we have the expertise to transform your business.',
                    },
                  ],
                  version: 1
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: '',
                    },
                  ],
                  version: 1
                },
                {
                  type: 'heading',
                  children: [
                    {
                      text: 'Featured Categories:',
                    },
                  ],
                  tag: 'h3',
                  version: 1
                },
                {
                  type: 'list',
                  children: [
                    {
                      type: 'listitem',
                      children: [
                        {
                          text: '🤖 AI Consulting - Strategic guidance and implementation',
                        },
                      ],
                      version: 1
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          text: '⚡ Automation Solutions - Streamline your workflows',
                        },
                      ],
                      version: 1
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          text: '📋 Strategy & Planning - Roadmaps for success',
                        },
                      ],
                      version: 1
                    },
                  ],
                  listType: 'bullet',
                  version: 1
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: '',
                    },
                  ],
                  version: 1
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Browse All Products',
                      type: 'link',
                      url: '/products',
                    },
                    {
                      text: ' | ',
                    },
                    {
                      text: 'View Featured Products',
                      type: 'link',
                      url: '/products?featured=true',
                    },
                    {
                      text: ' | ',
                    },
                    {
                      text: 'AI Consulting Category',
                      type: 'link',
                      url: '/products/category/ai-consulting',
                    },
                  ],
                  version: 1
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1
            }
          },
        },
      ],
    },
    {
      blockType: 'cta',
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  text: 'Ready to Transform Your Business?',
                },
              ],
              tag: 'h2',
              version: 1
            },
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Schedule a free consultation to discuss your AI and automation needs. Our experts are ready to help you implement cutting-edge solutions that drive real results.',
                },
              ],
              version: 1
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1
        }
      },
      links: [
        {
          link: {
            type: 'custom',
            url: '/contact',
            label: 'Schedule Consultation',
          },
        },
        {
          link: {
            type: 'custom',
            url: '/products?featured=true',
            label: 'View Featured Products',
          },
        },
      ],
    },
  ],
  meta: {
    title: 'Shop - AI Consulting & Automation Services',
    description: 'Browse our comprehensive collection of AI consulting services, automation solutions, and digital products. Transform your business with cutting-edge technology.',
  },
})
