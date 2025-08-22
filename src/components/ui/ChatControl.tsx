'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Bot, User, Mic, MicOff, Volume2, VolumeX, 
  Paperclip, Image, FileText, X, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  metadata?: {
    provider?: string
    processingTime?: number
    confidence?: number
    attachments?: ChatAttachment[]
  }
}

export interface ChatAttachment {
  id: string
  type: 'image' | 'file' | 'voice'
  name: string
  url: string
  size?: number
  mimeType?: string
}

export interface ChatControlProps {
  messages: ChatMessage[]
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>
  onVoiceInput?: (audioBlob: Blob) => Promise<void>
  isLoading?: boolean
  placeholder?: string
  assistantName?: string
  assistantAvatar?: string
  userAvatar?: string
  showVoiceInput?: boolean
  showFileUpload?: boolean
  maxHeight?: string
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  theme?: 'light' | 'dark' | 'auto'
}

export function ChatControl({
  messages,
  onSendMessage,
  onVoiceInput,
  isLoading = false,
  placeholder = "Type your message...",
  assistantName = "AI Assistant",
  assistantAvatar,
  userAvatar,
  showVoiceInput = true,
  showFileUpload = true,
  maxHeight = "600px",
  className,
  variant = 'default',
  theme = 'auto'
}: ChatControlProps) {
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle sending messages
  const handleSend = async () => {
    if ((!inputValue.trim() && selectedFiles.length === 0) || isLoading) return

    const messageContent = inputValue.trim()
    const attachments = selectedFiles.length > 0 ? [...selectedFiles] : undefined

    // Clear input immediately for better UX
    setInputValue('')
    setSelectedFiles([])

    try {
      await onSendMessage(messageContent, attachments)
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore input on error
      setInputValue(messageContent)
      setSelectedFiles(attachments || [])
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)])
    }
    // Reset input
    e.target.value = ''
  }

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Voice recording
  const startRecording = async () => {
    if (!onVoiceInput) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        onVoiceInput(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Text-to-speech
  const speakMessage = (content: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <Card className={cn("flex flex-col", className)} style={{ maxHeight }}>
      <CardContent className="flex flex-col h-full p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {message.role === 'user' ? (
                    <>
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={assistantAvatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div className={cn(
                  "flex flex-col max-w-[80%]",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                  {/* Message Header */}
                  <div className={cn(
                    "flex items-center gap-2 mb-1",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <span className="text-sm font-medium">
                      {message.role === 'user' ? 'You' : assistantName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {message.metadata?.provider && (
                      <Badge variant="outline" className="text-xs">
                        {message.metadata.provider}
                      </Badge>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={cn(
                    "rounded-lg px-3 py-2 text-sm relative group",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted",
                    message.role === 'system' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                  )}>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>

                    {/* Message Actions */}
                    {message.role === 'assistant' && (
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => isSpeaking ? stopSpeaking() : speakMessage(message.content)}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3 h-3" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  {message.metadata?.attachments && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.metadata.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 px-2 py-1 bg-muted rounded text-xs"
                        >
                          {attachment.type === 'image' ? (
                            <Image className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          <span>{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Processing Info */}
                  {message.metadata?.processingTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Processed in {message.metadata.processingTime}ms
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-muted rounded px-2 py-1 text-sm"
                >
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                className="min-h-[40px] max-h-[120px] resize-none pr-12"
                disabled={isLoading}
              />
              
              {/* Input Actions */}
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                {showFileUpload && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      aria-label="Upload files"
                      title="Upload files"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Paperclip className="w-3 h-3" />
                    </Button>
                  </>
                )}
                
                {showVoiceInput && onVoiceInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-6 w-6 p-0",
                      isRecording && "bg-red-100 text-red-600"
                    )}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                  >
                    {isRecording ? (
                      <MicOff className="w-3 h-3" />
                    ) : (
                      <Mic className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
              className="h-10 px-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
