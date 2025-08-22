"use client"

import { useState, type KeyboardEvent } from "react"
import { Send, PlusCircle, Gift, Smile, Paperclip } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { cn } from "@/utilities/ui"

interface ChatInputProps {
  placeholder?: string
  onSubmit?: (message: string) => void
  onFileUpload?: (files: FileList) => void
  className?: string
  disabled?: boolean
  channelId?: string
  spaceId?: string
}

export function ChatInput({
  placeholder = "Message this channel...",
  onSubmit,
  onFileUpload,
  className,
  disabled = false,
  channelId,
  spaceId
}: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = () => {
    if (message.trim() && onSubmit && !disabled) {
      onSubmit(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && onFileUpload) {
      onFileUpload(files)
      e.target.value = '' // Reset input
    }
  }

  return (
    <div className={cn("flex items-center space-x-3 bg-[#40444b] rounded-lg px-4 py-3", className)}>
      {/* File Upload Button */}
      <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-[#393c43]" disabled={disabled}>
        <label htmlFor={`file-upload-${channelId}`} className="cursor-pointer">
          <PlusCircle className="w-5 h-5 text-gray-400 hover:text-white" />
        </label>
        <input
          id={`file-upload-${channelId}`}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          aria-label="Upload files to chat"
        />
      </Button>

      {/* Message Input */}
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      <div className="flex items-center space-x-2">
        {/* Attachment Button */}
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-[#393c43]" disabled={disabled}>
          <Paperclip className="w-5 h-5 text-gray-400 hover:text-white" />
        </Button>

        {/* Gift Button */}
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-[#393c43]" disabled={disabled}>
          <Gift className="w-5 h-5 text-gray-400 hover:text-white" />
        </Button>

        {/* Emoji Button */}
        <Button variant="ghost" size="sm" className="w-6 h-6 p-0 hover:bg-[#393c43]" disabled={disabled}>
          <Smile className="w-5 h-5 text-gray-400 hover:text-white" />
        </Button>

        {/* Send Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0 hover:bg-[#393c43]"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
        >
          <Send className="w-5 h-5 text-gray-400 hover:text-white" />
        </Button>
      </div>
    </div>
  )
}
