import type { Page } from '../../payload-types'
import { createLexicalContent, createLexicalHeading, createLexicalParagraph, createLexicalList } from '../../utilities/lexicalHelpers'

export const about = ({ heroImage, metaImage }: { heroImage: any; metaImage: any }): Partial<Page> => ({
  slug: 'about',
  _status: 'published',
  title: 'About KenDev.Co',
  hero: {
    type: 'lowImpact',
    media: heroImage.id,
    richText: createLexicalContent([
      createLexicalHeading('About KenDev.Co', 'h1'),
      createLexicalParagraph('AI Automation and Implementation Agency specializing in cutting-edge business solutions.')
    ])
  },
  layout: [
    {
      blockType: 'content',
      blockName: 'Our Story',
      columns: [
        {
          richText: createLexicalContent([
            createLexicalHeading('Our Mission', 'h2'),
            createLexicalParagraph('KenDev.Co bridges the gap between cutting-edge AI technology and practical business solutions. We specialize in implementing the Spaces collaboration platform, n8n workflow automation, and VAPI voice AI integration to help businesses transform their operations.'),
            createLexicalParagraph('Founded with the vision of making enterprise-grade collaboration tools accessible to businesses of all sizes, we focus on open-source solutions that provide freedom from vendor lock-in while delivering exceptional performance.')
          ]),
          size: 'full',
        },
      ],
    },
    {
      blockType: 'content',
      blockName: 'Expertise',
      columns: [
        {
          richText: createLexicalContent([
            createLexicalHeading('Our Expertise', 'h2'),
            createLexicalList([
              'Spaces Platform Implementation - Complete Discord-style collaboration platforms',
              'n8n Workflow Automation - Custom business process automation',
              'VAPI Voice AI Integration - Intelligent phone automation systems',
              'Multi-Tenant Architecture - Scalable business platform solutions'
            ])
          ]),
          size: 'full',
        },
      ],
    },
    {
      blockType: 'content',
      blockName: 'Approach',
      columns: [
        {
          richText: createLexicalContent([
            createLexicalHeading('Our Approach', 'h2'),
            createLexicalParagraph('We believe in building long-term partnerships with our clients, providing not just implementation but ongoing support and optimization. Our solutions are designed to grow with your business, ensuring maximum return on investment.'),
            createLexicalHeading('Why Choose KenDev.Co?', 'h3'),
            createLexicalList([
              'Open-source focus for maximum flexibility and control',
              'Comprehensive implementation and training programs',
              'Ongoing support and optimization services',
              'Expertise in cutting-edge AI and automation technologies',
              'Proven track record with Dallas-Fort Worth area businesses'
            ])
          ]),
          size: 'full',
        },
      ],
    },
  ],
  meta: {
    title: 'About KenDev.Co - AI Automation & Implementation Agency',
    description: 'Learn about KenDev.Co, an AI automation and implementation agency specializing in Spaces platform implementation, n8n workflows, and VAPI voice AI integration.',
    image: metaImage.id,
  },
}) 