"use client"

import * as React from "react"
import { cn } from "@/utilities/ui"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Mic, Square } from "lucide-react"
import { motion } from "framer-motion"

interface AIInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSubmit'> {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onFileUpload?: (files: FileList) => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  maxLength?: number
  allowFileUpload?: boolean
  allowVoiceInput?: boolean
}

const AIInput = React.forwardRef<HTMLDivElement, AIInputProps>(
  ({ 
    className, 
    value, 
    onChange, 
    onSubmit, 
    onFileUpload,
    placeholder = "Type your message...",
    disabled = false,
    isLoading = false,
    maxLength = 2000,
    allowFileUpload = true,
    allowVoiceInput = true,
    ...props 
  }, ref) => {
    const [inputValue, setInputValue] = React.useState(value || "")
    const [isRecording, setIsRecording] = React.useState(false)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (value !== undefined) {
        setInputValue(value)
      }
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (newValue.length <= maxLength) {
        setInputValue(newValue)
        onChange?.(newValue)
      }
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (inputValue.trim() && !disabled && !isLoading) {
        onSubmit?.(inputValue.trim())
        setInputValue("")
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e)
      }
    }

    const handleFileClick = () => {
      fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        onFileUpload?.(files)
      }
      // Reset the input
      e.target.value = ""
    }

    const toggleRecording = () => {
      setIsRecording(!isRecording)
      // TODO: Implement voice recording logic
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-2 p-4 border-t bg-background",
          className
        )}
        {...props}
      >
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <label htmlFor="ai-input-textarea" className="sr-only">AI message input</label>
            <Textarea
              ref={textareaRef}
              id="ai-input-textarea"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={cn(
                "min-h-[44px] max-h-32 resize-none pr-12",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              )}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              {allowFileUpload && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFileClick}
                  disabled={disabled || isLoading}
                  className="h-8 w-8 p-0 hover:bg-muted"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              )}
              
              {allowVoiceInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleRecording}
                  disabled={disabled || isLoading}
                  className={cn(
                    "h-8 w-8 p-0 hover:bg-muted",
                    isRecording && "bg-red-100 hover:bg-red-200 text-red-600"
                  )}
                  aria-pressed={isRecording}
                  aria-label={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!inputValue.trim() || disabled || isLoading}
            className="h-11 px-4"
            aria-label="Send message"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Character count */}
        {inputValue.length > maxLength * 0.8 && (
          <div className="text-xs text-muted-foreground text-right">
            {inputValue.length}/{maxLength}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          aria-label="Upload files"
        />
      </div>
    )
  }
)
AIInput.displayName = "AIInput"

export { AIInput, type AIInputProps }




