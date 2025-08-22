'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Activity, Zap, Database, Server, Copy, Trash2, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSystemMonitor } from '@/hooks/useSystemMonitor'
import { SystemLog } from '@/services/SystemMonitorService'

export default function SystemContainer({ channelId }: { channelId: string }) {
  const systemMonitor = useSystemMonitor()
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [systemMonitor.logs])

  const filteredLogs = systemMonitor.logs.filter((log: SystemLog) => {
    const typeMatch = selectedType === 'all' || log.type === selectedType
    const sourceMatch = selectedSource === 'all' || log.source === selectedSource
    return typeMatch && sourceMatch
  })

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle
      case 'warning': return AlertTriangle
      case 'heartbeat': return Activity
      case 'api': return Zap
      case 'business': return Database
      default: return Server
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      case 'success': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'heartbeat': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'api': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'business': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const copyLogToClipboard = (log: SystemLog) => {
    const logText = `[${log.timestamp.toISOString()}] ${log.type.toUpperCase()} - ${log.source}: ${log.message}${
      log.details ? '\nDetails: ' + JSON.stringify(log.details, null, 2) : ''
    }`
    
    navigator.clipboard.writeText(logText).then(() => {
      // Could show a toast notification here
      console.log('Log copied to clipboard')
    })
  }

  const copyAllLogs = () => {
    const allLogsText = filteredLogs.map((log: SystemLog) => 
      `[${log.timestamp.toISOString()}] ${log.type.toUpperCase()} - ${log.source}: ${log.message}${
        log.details ? '\nDetails: ' + JSON.stringify(log.details, null, 2) : ''
      }`
    ).join('\n\n')
    
    navigator.clipboard.writeText(allLogsText).then(() => {
      console.log('All logs copied to clipboard')
    })
  }

  const uniqueSources = Array.from(new Set(systemMonitor.logs.map((log: SystemLog) => log.source)))

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* Channel Header */}
      <div className="flex-shrink-0 border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h1 className="text-xl font-bold text-white">#system</h1>
            <span className="text-sm text-gray-400">System monitoring, errors, and operations</span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <label htmlFor="system-type-filter" className="sr-only">Filter by log type</label>
            <select 
              id="system-type-filter"
              aria-label="Filter by log type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="heartbeat">Heartbeats</option>
              <option value="api">API Calls</option>
              <option value="business">Business</option>
            </select>
            
            <label htmlFor="system-source-filter" className="sr-only">Filter by source</label>
            <select 
              id="system-source-filter"
              aria-label="Filter by source"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm rounded px-2 py-1"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            
            <Button
              onClick={copyAllLogs}
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy All
            </Button>
            
            <Button
              onClick={systemMonitor.clearLogs}
              variant="outline"
              size="sm"
              className="text-red-400 border-red-600 hover:text-red-300 hover:border-red-500"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </div>
      
      {/* System Stats */}
      <div className="flex-shrink-0 bg-gray-900/30 px-6 py-3 border-b border-gray-700">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-400">System Status:</span>
            <span className="text-green-400 font-medium">Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400">Total Logs:</span>
            <span className="text-white font-medium">{systemMonitor.logs.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-gray-400">Errors:</span>
            <span className="text-red-400 font-medium">
              {systemMonitor.logs.filter((log: SystemLog) => log.type === 'error').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400">Warnings:</span>
            <span className="text-yellow-400 font-medium">
              {systemMonitor.logs.filter((log: SystemLog) => log.type === 'warning').length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Server className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No system logs match the current filters</p>
              </div>
            </div>
          ) : (
            filteredLogs.map((log: SystemLog) => {
              const LogIcon = getLogIcon(log.type)
              return (
                <div 
                  key={log.id} 
                  className={cn(
                    "border rounded-lg p-3 font-mono text-sm transition-colors hover:bg-gray-800/50",
                    getLogColor(log.type)
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <LogIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {log.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {log.source}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm leading-relaxed break-words">
                          {log.message}
                        </p>
                        
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                              Show Details
                            </summary>
                            <pre className="mt-1 text-xs text-gray-400 bg-gray-900/50 rounded p-2 overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => copyLogToClipboard(log)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-300 p-1 h-auto"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>System monitoring active - Leo AI provides technical analysis</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            Monitoring {filteredLogs.length} events
          </span>
        </div>
      </div>
    </div>
  )
}






