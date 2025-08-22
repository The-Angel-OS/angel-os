"use client"

import * as React from "react"
import { cn } from "@/utilities/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

interface AIMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant" | "system"
  content: string
  avatar?: string
  name?: string
  timestamp?: Date
  isStreaming?: boolean
}

const AIMessage = React.forwardRef<HTMLDivElement, AIMessageProps>(
  ({ className, role, content, avatar, name, timestamp, isStreaming, ...props }, ref) => {
    const isUser = role === "user"
    const isAssistant = role === "assistant"
    const isSystem = role === "system"

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex gap-3 p-4 rounded-lg",
          isUser && "flex-row-reverse",
          isSystem && "justify-center",
          className
        )}
        // Props removed to avoid motion.div conflicts
      >
        {!isSystem && (
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={avatar} />
            <AvatarFallback className={cn(
              isUser ? "bg-blue-600" : "bg-purple-600",
              "text-white text-sm"
            )}>
              {name ? name.charAt(0).toUpperCase() : (isUser ? "U" : "AI")}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "flex flex-col space-y-1 max-w-[80%]",
          isUser && "items-end",
          isSystem && "items-center max-w-full"
        )}>
          {!isSystem && (
            <div className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground",
              isUser && "flex-row-reverse"
            )}>
              <span className="font-medium">
                {name || (isUser ? "You" : "Leo AI")}
              </span>
              {timestamp && (
                <span>
                  {timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
            </div>
          )}
          
          <div className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isUser && "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md",
            isAssistant && "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md",
            isSystem && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-center px-4 py-1 rounded-full text-xs"
          )}>
            {content}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-1"
              >
                ▋
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }
)
AIMessage.displayName = "AIMessage"

export { AIMessage, type AIMessageProps }













