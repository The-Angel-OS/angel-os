import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Paperclip, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function ChatInput({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  className
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      resizeTextarea()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    resizeTextarea()
  }, [message])

  return (
    <div className={cn("flex items-end gap-2 p-4 bg-[#40444b] border-t border-[#202225]", className)}>
      {/* Attachment Button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 hover:bg-[#393c43] mb-1"
        disabled={disabled}
      >
        <Paperclip className="w-4 h-4 text-gray-400" />
      </Button>

      {/* Message Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-[#484c56] text-white placeholder-gray-400 border-none rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#5865f2] max-h-32 overflow-y-auto"
          style={{ minHeight: '40px' }}
        />

        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0 hover:bg-[#393c43]"
          disabled={disabled}
        >
          <Smile className="w-4 h-4 text-gray-400" />
        </Button>
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="sm"
        className="w-8 h-8 p-0 bg-[#5865f2] hover:bg-[#4752c4] mb-1"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}
