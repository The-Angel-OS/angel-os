import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  HeadingFeature,
  UnorderedListFeature,
  OrderedListFeature,
  lexicalEditor,
  UnderlineFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  HorizontalRuleFeature,
  type LinkFields,

} from '@payloadcms/richtext-lexical'

// Add migration feature import
import { SlateToLexicalFeature } from '@payloadcms/richtext-lexical/migrate'

// Standardized feature set for ALL lexical editors
export const standardLexicalFeatures = ({ rootFeatures }: { rootFeatures: any[] }) => [
  ...rootFeatures,
  HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }), // Consistent heading support
  UnorderedListFeature(),
  OrderedListFeature(),
  UnderlineFeature(),
  BoldFeature(),
  ItalicFeature(),
  LinkFeature({
    enabledCollections: ['pages', 'posts', 'products'],
    fields: ({ defaultFields }) => {
      const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
        if ('name' in field && field.name === 'url') return false
        return true
      })

      return [
        ...defaultFieldsWithoutUrl,
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
          },
          label: ({ t }) => t('fields:enterURL'),
          required: true,
          validate: ((value, options) => {
            if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
              return true // no validation needed, as no url should exist for internal links
            }
            return value ? true : 'URL is required'
          }) as TextFieldSingleValidation,
        },
      ]
    },
  }),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
  HorizontalRuleFeature(),
  // Add SlateToLexicalFeature to handle migration on-the-fly
  SlateToLexicalFeature({}),
]

export const defaultLexical = lexicalEditor({
  features: standardLexicalFeatures,
})
