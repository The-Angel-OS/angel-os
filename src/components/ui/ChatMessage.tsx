"use client"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/utilities/ui"
import type { Message, User as PayloadUser } from "@/payload-types"
import { WidgetMessage } from "./WidgetMessage"

interface ChatMessageProps {
  message: Message
  showAvatar?: boolean
  className?: string
}

export function ChatMessage({ message, showAvatar = true, className }: ChatMessageProps) {
  const sender = typeof message.sender === 'object' ? message.sender : null
  const isWidget = (message as any).messageType === 'widget' || (message as any).widgetData

  return (
    <div className={cn("px-4 py-2 hover:bg-[#32353b]", className)}>
      <div className="flex items-start space-x-3">
        {showAvatar && (
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={
              sender?.profileImage && typeof sender.profileImage === 'object'
                ? sender.profileImage.url || undefined
                : undefined
            } />
            <AvatarFallback className="bg-blue-600 text-white">
              {sender?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          {showAvatar && (
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="font-medium text-white">
                {sender?.firstName && sender?.lastName ? `${sender.firstName} ${sender.lastName}` : sender?.email || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}

          {isWidget ? (
            <WidgetMessage message={message} />
          ) : (
            <div className="text-gray-300 break-words">
              {typeof message.content === 'object' && message.content ? 
                (message.content as any).text || JSON.stringify(message.content) :
                message.content || 'No content'
              }
            </div>
          )}

          {/* Message reactions */}
          {message.reactions && typeof message.reactions === 'object' && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(message.reactions as Record<string, any>).map(([emoji, data], index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-[#4c51584d] rounded-full px-2 py-1 text-xs"
                >
                  <span>{emoji}</span>
                  <span className="text-gray-400">{Array.isArray(data) ? data.length : data.count || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
