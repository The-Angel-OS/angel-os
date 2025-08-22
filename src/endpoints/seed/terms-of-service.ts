import type { Page } from '../../payload-types'

export const termsOfService = ({ heroImage, metaImage }: { heroImage: any; metaImage: any }): Partial<Page> => ({
  slug: 'terms-of-service',
  _status: 'published',
  title: 'Terms of Service',
  hero: {
    type: 'lowImpact',
    media: heroImage.id,
    richText: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Terms of Service',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h1',
            version: 1,
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Last updated: January 2025',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
  },
  layout: [
    {
      blockType: 'content',
      blockName: 'Terms Overview',
      columns: [
        {
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'These Terms of Service ("Terms") govern your use of KenDev.Co services. By using our services, you agree to these terms.',
                      version: 1,
                    },
                  ],
                  version: 1,
                },
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      text: 'Services Provided',
                      version: 1,
                    },
                  ],
                  tag: 'h2',
                  version: 1,
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'We provide Spaces Platform Implementation and Consulting, n8n Workflow Automation Development, VAPI Voice AI Integration Services, and AI Readiness Assessment and Consulting.',
                      version: 1,
                    },
                  ],
                  version: 1,
                },
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      text: 'Client Responsibilities',
                      version: 1,
                    },
                  ],
                  tag: 'h2',
                  version: 1,
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Clients are responsible for providing accurate and timely information for project requirements, maintaining necessary hosting and infrastructure for implemented solutions, and complying with all applicable laws and regulations.',
                      version: 1,
                    },
                  ],
                  version: 1,
                },
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      text: 'Payment Terms',
                      version: 1,
                    },
                  ],
                  tag: 'h2',
                  version: 1,
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Payment is due according to the agreed schedule in your service agreement. All fees are non-refundable unless otherwise specified in writing.',
                      version: 1,
                    },
                  ],
                  version: 1,
                },
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      text: 'Limitation of Liability',
                      version: 1,
                    },
                  ],
                  tag: 'h2',
                  version: 1,
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Our liability is limited to the amount paid for our services. We are not liable for any indirect, incidental, or consequential damages.',
                      version: 1,
                    },
                  ],
                  version: 1,
                },
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      text: 'Contact Information',
                      version: 1,
                    },
                  ],
                  tag: 'h2',
                  version: 1,
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'If you have any questions about these Terms of Service, please contact us at legal@kendev.co or visit our contact page.',
                      version: 1,
                    },
                  ],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          size: 'full',
        },
      ],
    },
  ],
  meta: {
    title: 'Terms of Service | KenDev.Co',
    description: 'Terms of Service for KenDev.Co - Please read our terms and conditions for using our services.',
    image: metaImage.id,
  },
  publishedAt: new Date().toISOString(),
})
