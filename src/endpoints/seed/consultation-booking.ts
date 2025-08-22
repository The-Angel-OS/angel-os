import type { Page } from '../../payload-types'

export const consultationBooking = ({ heroImage, metaImage }: { heroImage: any; metaImage: any }): Partial<Page> => ({
  slug: 'consultation-booking',
  _status: 'published',
  title: 'Book Your Free Consultation',
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
                text: 'Book Your Free Spaces Platform Consultation',
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
                text: '30-minute discovery call to explore how the Spaces platform can transform your business collaboration.',
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
      blockName: 'Consultation Benefits',
      columns: [
        {
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
                      text: "What You'll Get in Your Consultation:",
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  tag: 'h2',
                  version: 1,
                },
                {
                  type: 'list',
                  children: [
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'Personalized assessment of your collaboration needs',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 1,
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'Demo of the Spaces platform features and capabilities',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 2,
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'Custom implementation roadmap for your business',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 3,
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'Pricing and timeline for your specific requirements',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 4,
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'No-obligation proposal with next steps',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 5,
                    },
                  ],
                  listType: 'bullet',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          size: 'twoThirds',
        },
        {
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      text: 'Perfect For:',
                      version: 1,
                    },
                  ],
                  tag: 'h3',
                  version: 1,
                },
                {
                  type: 'list',
                  children: [
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'Business owners exploring collaboration platforms',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 1,
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'Content creators building communities',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 2,
                    },
                    {
                      type: 'listitem',
                      children: [
                        {
                          type: 'text',
                          text: 'Organizations needing better team communication',
                          version: 1,
                        },
                      ],
                      version: 1,
                      value: 3,
                    },
                  ],
                  listType: 'bullet',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          size: 'oneThird',
        },
      ],
    },
    {
      blockType: 'content',
      blockName: 'Booking Form',
      columns: [
        {
          richText: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'heading',
                  children: [
                    {
                      type: 'text',
                      text: 'Schedule Your Consultation',
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
                      text: 'Choose a time that works for you. All consultations are conducted via video call.',
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
    title: 'Book Free Spaces Platform Consultation | KenDev.Co',
    description: 'Schedule a free 30-minute consultation to explore Spaces platform implementation for your business. No obligation, just expert advice.',
    image: metaImage.id,
  },
})