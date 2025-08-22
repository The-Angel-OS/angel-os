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
 * Rich Text component following the working POC pattern from spaces.kendev.co
 * Uses defaultConverters to ensure all built-in node types work properly
 */
const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // All default converters are included, so lists work automatically
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
