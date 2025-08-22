"use client"

import * as React from "react"
import { cn } from "@/utilities/ui"

const AIConversation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-4 p-0 h-full max-h-full overflow-y-auto",
      className
    )}
    {...props}
  />
))
AIConversation.displayName = "AIConversation"

export { AIConversation }
