"use client"

import { useState, useEffect } from "react"
import { AIConversation } from "@/components/ui/ai-conversation"
import { AIMessage } from "@/components/ui/ai-message"
import { AIInput } from "@/components/ui/ai-input"
import { Actions, Action } from "@/components/ui/ai-actions"
import { Hash, ChevronDown, Copy, RefreshCcw, ThumbsUp, ThumbsDown, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai" | "system"
  senderName?: string
  timestamp: string
  type?: "text" | "image" | "file"
}

export interface ChatMember {
  id: string
  name: string
  avatar: string
  status: "online" | "away" | "busy" | "offline"
  role?: "admin" | "member" | "guest"
}

export interface ChatChannel {
  id: string
  name: string
  type: "chat" | "files" | "notes" | "project"
  members: string[]
  unreadCount?: number
}

interface ChatEngineProps {
  channels: ChatChannel[]
  activeChannel: ChatChannel | null
  messages: ChatMessage[]
  currentUser?: ChatMember
  onSendMessage: (content: string, channelId: string) => Promise<void>
  onChannelChange?: (channel: ChatChannel) => void
  onRegenerateMessage?: (messageId: string) => Promise<void>
  isLoading?: boolean
  className?: string
}

export function ChatEngine({
  channels,
  activeChannel,
  messages,
  currentUser,
  onSendMessage,
  onChannelChange,
  onRegenerateMessage,
  isLoading = false,
  className = ""
}: ChatEngineProps) {
  const [inputValue, setInputValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())

  const handleSubmit = async (content: string) => {
    if (!content.trim() || isSubmitting || !activeChannel) return

    setIsSubmitting(true)
    try {
      await onSendMessage(content, activeChannel.id)
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const handleLikeMessage = (messageId: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        // Remove from disliked if it was disliked
        setDislikedMessages(prevDisliked => {
          const newDisliked = new Set(prevDisliked)
          newDisliked.delete(messageId)
          return newDisliked
        })
      }
      return newSet
    })
  }

  const handleDislikeMessage = (messageId: string) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
        // Remove from liked if it was liked
        setLikedMessages(prevLiked => {
          const newLiked = new Set(prevLiked)
          newLiked.delete(messageId)
          return newLiked
        })
      }
      return newSet
    })
  }

  const handleShareMessage = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Angel OS Chat Message',
          text: content,
          url: window.location.href
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      // Fallback to copying link
      await handleCopyMessage(`${window.location.href}\n\n"${content}"`)
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Channel Selector */}
      {channels.length > 1 && (
        <div className="p-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Angel OS Chat</h2>
              
              {/* Channel Chooser */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Hash className="w-3 h-3 mr-1" />
                    {activeChannel?.name?.replace('# ', '') || 'Select Channel'}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {channels.map((channel) => (
                    <DropdownMenuItem
                      key={channel.id}
                      onClick={() => onChannelChange?.(channel)}
                      className={activeChannel?.id === channel.id ? "bg-accent" : ""}
                    >
                      <Hash className="w-3 h-3 mr-2" />
                      {channel.name?.replace('# ', '') || channel.id}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">LEO AI Assistant</p>
          </div>
        </div>
      )}

      {/* Messages - Fixed Scroll Container */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <p>Start a conversation with LEO!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-2">
                  <AIMessage
                    role={message.sender === "user" ? "user" : message.sender === "ai" ? "assistant" : "system"}
                    content={message.content}
                    name={message.senderName}
                    timestamp={new Date(message.timestamp)}
                    avatar={
                      message.sender === "user" 
                        ? currentUser?.avatar || "/placeholder.svg"
                        : "/leo-avatar.svg"
                    }
                  />
                  
                  {/* AI Actions for assistant messages */}
                  {message.sender === "ai" && (
                    <Actions className="ml-11 mt-1 opacity-70 hover:opacity-100 transition-opacity">
                      <Action
                        label="Copy"
                        onClick={() => handleCopyMessage(message.content)}
                      >
                        <Copy className="size-4" />
                      </Action>
                      
                      {onRegenerateMessage && (
                        <Action
                          label="Retry"
                          onClick={() => onRegenerateMessage(message.id)}
                        >
                          <RefreshCcw className="size-4" />
                        </Action>
                      )}
                      
                      <Action
                        label="Like"
                        onClick={() => {
                          handleLikeMessage(message.id)
                          // Send to feedback endpoint
                          fetch('/api/message-feedback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              messageId: message.id,
                              feedback: 'like',
                              userId: currentUser?.id || 'anonymous'
                            })
                          }).catch(console.error)
                        }}
                        className={likedMessages.has(message.id) ? "text-green-600" : ""}
                      >
                        <ThumbsUp className="size-4" />
                      </Action>
                      
                      <Action
                        label="Dislike"
                        onClick={() => {
                          handleDislikeMessage(message.id)
                          // Send to feedback endpoint
                          fetch('/api/message-feedback', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              messageId: message.id,
                              feedback: 'dislike',
                              userId: currentUser?.id || 'anonymous'
                            })
                          }).catch(console.error)
                        }}
                        className={dislikedMessages.has(message.id) ? "text-red-600" : ""}
                      >
                        <ThumbsDown className="size-4" />
                      </Action>
                      
                      <Action
                        label="Share"
                        onClick={() => handleShareMessage(message.content)}
                      >
                        <Share className="size-4" />
                      </Action>
                    </Actions>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Input - Pinned to Bottom */}
      <div className="flex-shrink-0">
        <AIInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          placeholder={`Message ${activeChannel?.name?.replace('# ', '') || 'LEO'}...`}
          disabled={isSubmitting || isLoading}
          isLoading={isSubmitting}
          className="border-t"
        />
      </div>
    </div>
  )
}