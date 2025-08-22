"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { InfiniteScroll } from "@/components/ui/infinite-scroll" // Component not available
import { Send, Paperclip, Mic, MoreHorizontal, Phone, Video } from "lucide-react"
import type { Contact } from "./ContactsList"

export interface Message {
  id: string
  content: string
  sender: "user" | "contact" | "leo" | "system"
  timestamp: string
  type?: "text" | "image" | "file"
  fileUrl?: string
  fileName?: string
}

interface ChatAreaProps {
  selectedContact: Contact | null
  messages: Message[]
  onSendMessage: (content: string) => void
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

export function ChatArea({ 
  selectedContact, 
  messages, 
  onSendMessage, 
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = "" 
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedContact) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-muted/20 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Send className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a contact to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                <AvatarFallback>{selectedContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {selectedContact.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{selectedContact.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedContact.online ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages with Infinite Scroll */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4 space-y-4 min-h-full flex flex-col justify-end">
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

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              placeholder="Enter message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRecording(!isRecording)}
            className={isRecording ? "text-red-500" : ""}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button onClick={handleSendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export type { Message as ChatAreaMessage }

