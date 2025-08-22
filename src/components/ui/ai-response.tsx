"use client"

import * as React from "react"
import { cn } from "@/utilities/ui"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

interface AIResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: "loading" | "success" | "error" | "warning"
  content?: string
  isStreaming?: boolean
  streamingContent?: string
  onRetry?: () => void
}

const AIResponse = React.forwardRef<HTMLDivElement, AIResponseProps>(
  ({ 
    className, 
    status = "loading",
    content,
    isStreaming = false,
    streamingContent,
    onRetry,
    children,
    ...props 
  }, ref) => {
    const displayContent = isStreaming ? streamingContent : content

    const getStatusIcon = () => {
      switch (status) {
        case "success":
          return <CheckCircle className="h-4 w-4 text-green-500" />
        case "error":
          return <XCircle className="h-4 w-4 text-red-500" />
        case "warning":
          return <AlertCircle className="h-4 w-4 text-yellow-500" />
        case "loading":
        default:
          return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      }
    }

    const getStatusColor = () => {
      switch (status) {
        case "success":
          return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
        case "error":
          return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
        case "warning":
          return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
        case "loading":
        default:
          return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
      }
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "rounded-lg border p-4",
          getStatusColor(),
          className
        )}
        // Props removed to avoid motion.div conflicts
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            {displayContent && (
              <div className="text-sm">
                {displayContent}
                {isStreaming && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="ml-1 text-blue-500"
                  >
                    ▋
                  </motion.span>
                )}
              </div>
            )}
            
            {children && (
              <div className="mt-2">
                {children}
              </div>
            )}
            
            {status === "error" && onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
)
AIResponse.displayName = "AIResponse"

export { AIResponse, type AIResponseProps }













