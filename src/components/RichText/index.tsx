import React from 'react'
import { cn } from '@/utilities/ui'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { 
  RichText as RichTextWithoutBlocks,
  JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

export interface RichTextProps {
  className?: string
  data?: SerializedEditorState
  enableGutter?: boolean
  enableProse?: boolean
}

/**
 * Rich Text component with basic converters
 * Simplified to avoid block converter issues during build
 */
const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Use only default converters for now
  // TODO: Add proper block converters when Lexical integration is stable
})

const RichText: React.FC<RichTextProps> = ({
  className,
  data,
  enableGutter = true,
  enableProse = true,
}) => {
  if (!data) {
    return null
  }

  return (
    <RichTextWithoutBlocks
      converters={jsxConverters}
      data={data}
      className={cn(
        {
          'container': enableGutter,
          'max-w-none': !enableGutter,
          'prose prose-slate dark:prose-invert': enableProse,
        },
        className,
      )}
    />
  )
}

export default RichText
