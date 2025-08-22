"use client"

import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown, Copy, Trash2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'

interface ServerLog {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  details?: any
  source?: string
}

export function ServerConsole() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [logs, setLogs] = useState<ServerLog[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Intercept console logs
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    }

    const addLog = (level: 'info' | 'warn' | 'error', args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')

      const log: ServerLog = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        level,
        message,
        details: args.length > 1 ? args.slice(1) : undefined,
        source: 'client'
      }

      setLogs(prev => {
        const newLogs = [log, ...prev].slice(0, 100) // Keep last 100 logs
        return newLogs
      })

      if (level === 'error') {
        setErrorCount(prev => prev + 1)
      }
    }

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args)
      if (args[0]?.includes?.('🔍') || args[0]?.includes?.('✅') || args[0]?.includes?.('⚠️')) {
        // Use setTimeout to avoid setState during render
        setTimeout(() => addLog('info', args), 0)
      }
    }

    console.warn = (...args) => {
      originalConsole.warn(...args)
      // Use setTimeout to avoid setState during render
      setTimeout(() => addLog('warn', args), 0)
    }

    console.error = (...args) => {
      originalConsole.error(...args)
      // Use setTimeout to avoid setState during render
      setTimeout(() => addLog('error', args), 0)
    }

    console.info = (...args) => {
      originalConsole.info(...args)
      // Use setTimeout to avoid setState during render
      setTimeout(() => addLog('info', args), 0)
    }

    // Cleanup
    return () => {
      console.log = originalConsole.log
      console.warn = originalConsole.warn
      console.error = originalConsole.error
      console.info = originalConsole.info
    }
  }, [])

  // Auto-scroll to top when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current && isExpanded) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [logs, isExpanded])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  const clearLogs = () => {
    setLogs([])
    setErrorCount(0)
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
      case 'info': return <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
      default: return <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
      case 'warn': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'info': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800/20'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  return (
    <div className="relative">
      {/* Expanded Console */}
      {isExpanded && (
        <Card className="border-b-0 rounded-b-none">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Server Console - Real-time Logs & Errors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64" ref={scrollAreaRef}>
              <div className="p-3 space-y-1">
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No logs yet. Server activity will appear here.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`border-l-2 p-2 rounded-r text-xs ${getLogColor(log.level)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1 flex-1 min-w-0">
                          {getLogIcon(log.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                                {formatTime(log.timestamp)}
                              </span>
                              <Badge 
                                variant={log.level === 'error' ? 'destructive' : 'secondary'}
                                className="text-xs h-4 px-1"
                              >
                                {log.level.toUpperCase()}
                              </Badge>
                            </div>
                            <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-tight text-gray-900 dark:text-gray-100">
                              {log.message}
                            </pre>
                            {log.details && (
                              <details className="mt-1">
                                <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                                  Details
                                </summary>
                                <pre className="text-xs mt-1 p-1 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-gray-900 dark:text-gray-100">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(log.message)}
                          className="flex-shrink-0 h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Compact Footer Bar */}
      <div className="bg-background border-t border-border px-3 py-1.5">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-foreground hover:bg-accent flex items-center gap-2 text-xs h-7"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            <span>Console</span>
            {errorCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs h-4">
                {errorCount}
              </Badge>
            )}
            {logs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs h-4">
                {logs.length}
              </Badge>
            )}
          </Button>
          
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              className="text-foreground hover:bg-accent h-7 w-7 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServerConsole
