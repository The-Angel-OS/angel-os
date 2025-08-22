/**
 * Simplified useStreamingAI hook for Angel OS
 * 
 * Connects to existing message pump architecture without complex useChat dependencies
 */

import { useState, useCallback } from 'react'

interface StreamingState {
  isStreaming: boolean
  currentResponse: string
  error: string | null
  status: 'idle' | 'loading' | 'streaming' | 'success' | 'error'
}

interface UseStreamingAIProps {
  channelId: string
  onResponse?: (response: string) => void
  onError?: (error: string) => void
}

export function useStreamingAI({ channelId, onResponse, onError }: UseStreamingAIProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentResponse: '',
    error: null,
    status: 'idle'
  })

  const sendMessage = useCallback(async (content: string) => {
    setStreamingState({
      isStreaming: true,
      currentResponse: '',
      error: null,
      status: 'loading'
    })

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
    }

    setMessages(prev => [...prev, userMessage])

    try {
      // Use existing leo-chat API instead of streaming endpoint
      const response = await fetch('/api/leo-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: { variant: 'business' },
          spaceId: 1,
          tenantId: 1
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        const aiMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
        }

        setMessages(prev => [...prev, aiMessage])
        
        setStreamingState({
          isStreaming: false,
          currentResponse: data.response,
          error: null,
          status: 'success'
        })

        onResponse?.(data.response)
      } else {
        throw new Error(data.error || 'Failed to get response')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      setStreamingState({
        isStreaming: false,
        currentResponse: '',
        error: errorMessage,
        status: 'error'
      })

      onError?.(errorMessage)
    }
  }, [channelId, onResponse, onError])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStreamingState({
      isStreaming: false,
      currentResponse: '',
      error: null,
      status: 'idle'
    })
  }, [])

  return {
    messages,
    sendMessage,
    clearMessages,
    streamingState,
    isLoading: streamingState.isStreaming,
    error: streamingState.error,
  }
}
