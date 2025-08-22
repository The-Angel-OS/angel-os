"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

import { Paperclip } from "lucide-react"
import type { Message } from "./ChatArea"

interface MessagesListProps {
  messages: Message[]
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

export function MessagesList({ 
  messages, 
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = "" 
}: MessagesListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      {/* Loading indicator for older messages */}
      {isLoading && (
        <div className="flex justify-center items-center py-4 border-b">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading older messages...</span>
        </div>
      )}
      
      {/* Scrollable messages area */}
      <div 
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
        onScroll={(e) => {
          const element = e.currentTarget
          // Load more when scrolled near the top
          if (hasMore && !isLoading && onLoadMore && element.scrollTop <= 100) {
            onLoadMore()
          }
        }}
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`
                max-w-[70%] p-3 rounded-lg
                ${message.sender === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : message.sender === "leo"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 text-white shadow-lg"
                  : "bg-muted"
                }
              `}>
                {message.type === "file" ? (
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">{message.fileName}</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
                <p className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-primary-foreground/70" : 
                  message.sender === "leo" ? "text-white/70" :
                  "text-muted-foreground"
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

