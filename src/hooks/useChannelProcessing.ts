"use client"

import { useEffect, useCallback } from 'react'

interface UseChannelProcessingProps {
  channelId: string
  spaceId: string
  enabled?: boolean
}

export function useChannelProcessing({ 
  channelId, 
  spaceId, 
  enabled = true 
}: UseChannelProcessingProps) {
  const processMessage = useCallback(async (messageId: string) => {
    if (!enabled || !channelId || !spaceId) return

    try {
      // Use API route instead of direct server-side service
      const response = await fetch('/api/channels/process-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          channelId,
          spaceId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to process message: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Message processed:', result)
    } catch (error) {
      console.error('Error processing message:', error)
    }
  }, [channelId, spaceId, enabled])

  // Set up real-time message processing
  useEffect(() => {
    if (!enabled || !channelId) return

    // This would typically connect to a WebSocket or SSE stream
    // For now, we'll simulate the connection
    console.log(`Channel processing enabled for channel: ${channelId}`)

    return () => {
      console.log(`Channel processing disabled for channel: ${channelId}`)
    }
  }, [channelId, enabled])

  return {
    processMessage,
  }
}

















