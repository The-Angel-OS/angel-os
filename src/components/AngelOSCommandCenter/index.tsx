'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Bot, Home, Layout, Zap, Users, Shield, Settings, Folder, MessageSquare, LogOut, Terminal, Copy, Activity, AlertCircle, CheckCircle, X, ChevronUp, Hash, Package, TrendingUp } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { LeoAssistant } from '@/components/UnifiedTenantControl/LeoAssistant'
import UnifiedTenantControl from '@/components/UnifiedTenantControl'
// BusinessSidebar component import issue - using placeholder
// import { BusinessSidebar } from '@/components/UnifiedTenantControl/BusinessSidebar'
import { useSystemMonitor } from '@/hooks/useSystemMonitor'

// Placeholder for PayloadAdminEmbed - replace with actual import when available
const PayloadAdminEmbed = () => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
      <h2 className="text-xl font-semibold mb-2">Payload Admin Dashboard</h2>
      <p>Admin interface will be embedded here</p>
    </div>
  </div>
)
import { logInfo, logBusiness } from '@/services/SystemMonitorService'
import type { SystemLog } from '@/services/SystemMonitorService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AngelOSCommandCenterProps {
  variant?: 'business' | 'tactical' | 'standard'
  children?: React.ReactNode
  showChannelSidebar?: boolean // New prop to show channel navigation instead of file explorer
}

export default function AngelOSCommandCenter({ 
  variant = 'tactical',
  children,
  showChannelSidebar = false
}: AngelOSCommandCenterProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatCollapsed, setChatCollapsed] = useState(true)
  const [consoleCollapsed, setConsoleCollapsed] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'browser' | 'queue' | 'assistant' | 'panel'>('browser')
  const { logs: systemLogs } = useSystemMonitor()

  // Log navigation changes
  useEffect(() => {
    logInfo(`Switched to ${activeTab.toUpperCase()} tab`, 'Navigation')
  }, [activeTab])

  // Log panel state changes
  useEffect(() => {
    if (!sidebarCollapsed) {
      logInfo('File Explorer opened', 'UI')
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!chatCollapsed) {
      logInfo('Leo Assistant opened', 'UI')
      logBusiness('AI Assistant activated for user support')
    }
  }, [chatCollapsed])

  useEffect(() => {
    if (!consoleCollapsed) {
      logInfo('System Console opened', 'UI')
    }
  }, [consoleCollapsed])

  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD', icon: Home },
    { id: 'browser', label: 'BROWSER', icon: Layout },
    { id: 'queue', label: 'QUEUE', icon: Zap },
    { id: 'assistant', label: 'ASSISTANT', icon: Bot },
    { id: 'panel', label: 'PANEL', icon: Settings }
  ]

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* LCARS Command Header */}
      <header className="bg-gray-900/50 border-b border-orange-500/30 relative z-20 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-[100vw] px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-2xl"
              >
                🚀
              </motion.div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Angel OS Intelligence
                </h1>
                <div className="text-sm text-gray-400">
                  {variant === 'tactical' ? 'Tactical Command Center' : 'Universal Edition'}
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              {tabs.map(tab => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                    activeTab === tab.id
                      ? 'bg-orange-500 text-black border-b-2 border-orange-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </nav>
            
            {/* System Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400">SECURE</span>
              </div>
              <ServerStatus />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/api/auth/logout'}
                className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="bg-gray-800/50 border-t border-gray-700/50 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Tenant Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  SC
                </div>
                <div className="text-sm">
                  <span className="text-white font-semibold">Spaces Commerce</span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-gray-400">Premium Tenant</span>
                </div>
              </div>
              
              {/* Guardian Status */}
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <Bot className="w-3 h-3" />
                <span className="text-xs">Guardian Active</span>
              </Badge>
              
              {/* Channels Navigation */}
              <div className="flex items-center gap-1 ml-4">
                <span className="text-xs text-gray-500 uppercase">Channels:</span>
                <Link href="/spaces/channel/general">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                    <Hash className="w-3 h-3 mr-1" />
                    general
                  </Button>
                </Link>
                <Link href="/spaces/channel/customers">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                    <span className="w-3 h-3 mr-1 text-xs">👥</span>
                    customers
                    <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">12</Badge>
                  </Button>
                </Link>
                <Link href="/spaces/channel/orders">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                    <Package className="w-3 h-3 mr-1" />
                    orders
                    <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">3</Badge>
                  </Button>
                </Link>
                <Link href="/spaces/channel/system">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                    <span className="w-3 h-3 mr-1 text-xs">⚠️</span>
                    system
                  </Button>
                </Link>
                <Link href="/spaces/channel/analytics">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-400 hover:text-white">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    analytics
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* System Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Users: 234</span>
              <span>Revenue: $12.4k</span>
              <span>Health: 98%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interface Container */}
      <div className="flex flex-1 relative z-10 min-h-0">
        
        {/* LEFT PANEL - File Explorer (Bouncing Animation) */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="border-r border-orange-500/30 bg-gray-900/50 backdrop-blur-sm flex-shrink-0"
            >
              {showChannelSidebar ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p>Channel management integrated into dashboard chat</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Folder className="w-8 h-8 mb-2 mx-auto" />
                    <p>Business Sidebar</p>
                    <p className="text-xs">Component not available</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* CENTER PANEL - Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'browser' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {children || <UnifiedTenantControl variant={variant} hideLeo={true} />}
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full p-6"
              >
                <PayloadAdminEmbed />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* RIGHT PANEL - Leo AI Chat (Bouncing Animation) */}
        <AnimatePresence>
          {!chatCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="border-l border-cyan-500/30 bg-gray-900/50 backdrop-blur-sm flex-shrink-0"
            >
              <LeoAssistant variant={variant} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* System Console */}
      <AnimatePresence>
        {!consoleCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 250, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-40 border-t border-cyan-500/50 bg-gray-950/95 backdrop-blur-sm"
          >
            <SystemConsole logs={systemLogs} onClose={() => setConsoleCollapsed(true)} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
            !sidebarCollapsed 
              ? "bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-500/50 hover:shadow-orange-500/70" 
              : "bg-gray-700 shadow-gray-700/30 hover:shadow-gray-700/50"
          )}
          title={sidebarCollapsed ? "Open File Explorer" : "Close File Explorer"}
        >
          <span className="text-2xl">📁</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatCollapsed(!chatCollapsed)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
            !chatCollapsed 
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/50 hover:shadow-cyan-500/70"
              : "bg-gray-700 shadow-gray-700/30 hover:shadow-gray-700/50"
          )}
          title={chatCollapsed ? "Open Leo Assistant" : "Close Leo Assistant"}
        >
          <span className="text-2xl">💬</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setConsoleCollapsed(!consoleCollapsed)}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all",
            !consoleCollapsed 
              ? "bg-gradient-to-r from-purple-500 to-pink-600 shadow-purple-500/50 hover:shadow-purple-500/70"
              : "bg-gray-700 shadow-gray-700/30 hover:shadow-gray-700/50"
          )}
          title={consoleCollapsed ? "Open System Console" : "Close System Console"}
        >
          <Terminal className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  )
}

// Server Status Component
function ServerStatus() {
  const [status, setStatus] = useState<'online' | 'checking'>('online')
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'online' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
      )} />
      <span className="text-gray-400">Payload CMS</span>
    </div>
  )
}

// File Explorer Component (simplified)
function LocalFileExplorer({ variant }: { variant: string }) {
  return (
    <div className="h-full flex flex-col bg-black/50">
      <div className="p-4 border-b border-orange-500/30">
                  <h2 className="text-lg font-black uppercase tracking-wider text-orange-400">
            📁 {variant === 'tactical' ? 'Mission Files' : 'Quick Access'}
          </h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          <FileItem name="Tenants" icon={Users} />
          <FileItem name="Spaces" icon={Layout} />
          <FileItem name="Operations" icon={Shield} />
          <FileItem name="Analytics" icon={Zap} />
        </div>
      </div>
    </div>
  )
}

function FileItem({ name, icon: Icon }: { name: string; icon: any }) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex items-center gap-3 p-3 rounded border border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/10 cursor-pointer transition-all"
    >
      <Icon className="w-4 h-4 text-orange-400" />
      <span className="text-gray-300">{name}</span>
    </motion.div>
  )
}







// System Console Component
function SystemConsole({ logs, onClose }: { logs: SystemLog[]; onClose: () => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const consoleRef = useRef<HTMLDivElement>(null)

  const copyToClipboard = async (log: SystemLog) => {
    const formattedLog = `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] ${log.source ? `[${log.source}]` : ''} ${log.message}${log.details ? `\n\nDetails:\n${JSON.stringify(log.details, null, 2)}` : ''}`
    
    try {
      await navigator.clipboard.writeText(formattedLog)
      setCopiedId(log.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getLogIcon = (type: SystemLog['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
                    case 'heartbeat': return <Activity className="w-4 h-4 text-cyan-500" />
      case 'business': return <Zap className="w-4 h-4 text-purple-500" />
      default: return <Terminal className="w-4 h-4 text-blue-500" />
    }
  }

  const getLogColor = (type: SystemLog['type']) => {
    switch (type) {
      case 'error': return 'text-red-400 border-red-500/30'
      case 'warning': return 'text-yellow-400 border-yellow-500/30'
      case 'success': return 'text-green-400 border-green-500/30'
      case 'heartbeat': return 'text-cyan-400 border-cyan-500/30'
      case 'business': return 'text-purple-400 border-purple-500/30'
      default: return 'text-blue-400 border-blue-500/30'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/30 bg-gray-900/50">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="font-black uppercase tracking-wider text-cyan-400">System Console</h3>
          <span className="text-xs text-gray-500">({logs.length} messages)</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
            title="Close Console"
          >
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Console Content */}
      <div ref={consoleRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        <div className="space-y-1">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "group flex items-start gap-2 p-2 rounded border",
                getLogColor(log.type),
                "hover:bg-gray-900/50 transition-colors"
              )}
            >
              {getLogIcon(log.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-500">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  {log.source && (
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                      {log.source}
                    </span>
                  )}
                </div>
                <div className="mt-1 break-all">{log.message}</div>
                {log.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-300">
                      View details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => copyToClipboard(log)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-800 transition-all"
                title="Copy formatted log"
              >
                {copiedId === log.id ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </motion.button>
            </motion.div>
          ))}
          <div ref={consoleRef} />
        </div>
      </div>
    </div>
  )
}
