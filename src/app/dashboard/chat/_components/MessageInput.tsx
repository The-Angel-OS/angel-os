"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, Mic } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  className?: string
}

export function MessageInput({ onSendMessage, className = "" }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`p-4 border-t bg-background ${className}`}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <Input
            placeholder="Enter message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
  )
}

