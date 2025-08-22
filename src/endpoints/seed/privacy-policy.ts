import type { Page } from '../../payload-types'

export const privacyPolicy = ({ heroImage, metaImage }: { heroImage: any; metaImage: any }): Partial<Page> => ({
  slug: 'privacy-policy',
  _status: 'published',
  title: 'Privacy Policy',
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
                text: 'Privacy Policy',
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
      blockName: 'Privacy Overview',
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
                      text: 'KenDev.Co ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.',
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
                      text: 'Information We Collect',
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
                      text: 'We may collect information about you in a variety of ways, including personal data such as name, email address, phone number, and other contact information. We also collect usage data about how you use our website and services, as well as technical data including IP address, browser type, and device information.',
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
                      text: 'How We Use Your Information',
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
                      text: 'We use your information to provide and maintain our services, communicate with you about our services, improve our website and services, and comply with legal obligations. We may also use your information for marketing purposes with your consent.',
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
                      text: 'Data Security',
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
                      text: 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction.',
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
                      text: 'If you have any questions about this Privacy Policy, please contact us at privacy@kendev.co or visit our contact page.',
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
    title: 'Privacy Policy | KenDev.Co',
    description: 'Learn about how KenDev.Co protects your privacy and handles your personal information.',
    image: metaImage.id,
  },
  publishedAt: new Date().toISOString(),
})