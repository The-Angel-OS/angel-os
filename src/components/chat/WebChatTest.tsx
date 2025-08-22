"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Simple test component to verify web chat API is working
 * Can be used for testing the consolidated chat system
 */
export function WebChatTest() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const testWebChat = async () => {
    if (!message.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/web-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          sessionId,
          context: { variant: 'business' },
          userAgent: navigator.userAgent,
          pageUrl: window.location.pathname
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setResponse(data.response)
        setSessionId(data.sessionId)
      } else {
        setResponse(`Error: ${data.error}`)
      }
    } catch (error) {
      setResponse(`Network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Web Chat API Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the consolidated web chat system using existing WebChatSessions and BusinessAgent
        </p>
        {sessionId && (
          <p className="text-xs text-blue-600">
            Session ID: {sessionId}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message to test the web chat API..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && testWebChat()}
          />
          <Button onClick={testWebChat} disabled={loading || !message.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
        
        {response && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">LEO Response:</h4>
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Flow:</strong> Message → /api/web-chat → WebChatSessions → BusinessAgent → Claude-4-Sonnet → Response</p>
          <p><strong>Collections:</strong> WebChatSessions (session tracking), Messages (storage)</p>
        </div>
      </CardContent>
    </Card>
  )
}
