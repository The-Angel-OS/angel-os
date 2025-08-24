"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Analytics } from '@vercel/analytics/react'
import { Sidebar } from "./_components/sidebar"
import { Header } from "./_components/header"
import { ChatPanel } from "./_components/ChatPanel"
import ServerConsole from '@/components/ServerConsole'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

// Import the main globals.css which now includes dashboard styles
import '../(frontend)/globals.css'
// Import dashboard theme base to ensure CSS variables are available
import './theme-base.css'
// Import ShadCN UI component fixes
import './shadcn-fixes.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [layoutKey, setLayoutKey] = useState(0)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Listen for theme changes and force layout re-render
  useEffect(() => {
    const handleThemeChange = () => {
      console.log('Dashboard layout received theme change event')
      setLayoutKey(prev => prev + 1)
    }
    
    window.addEventListener('themeChanged', handleThemeChange)
    return () => window.removeEventListener('themeChanged', handleThemeChange)
  }, [])

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="dark:bg-[hsl(222.2_84%_4.9%)] bg-[hsl(0_0%_100%)]">
        <Providers>
          <ErrorBoundary>
            <div key={layoutKey} className="flex h-screen bg-background">
              <ErrorBoundary fallback={<div className="w-64 bg-muted border-r" />}>
                <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
              </ErrorBoundary>

              <motion.div
                className="flex-1 flex flex-col overflow-hidden"
                animate={{
                  marginLeft: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                <ErrorBoundary fallback={<div className="h-16 bg-muted border-b" />}>
                  <Header />
                </ErrorBoundary>

                <div className="flex-1 flex flex-col overflow-hidden">
                  <ErrorBoundary>
                    <motion.main
                      className="flex-1 overflow-y-auto p-6 pb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      {children}
                    </motion.main>
                  </ErrorBoundary>
                  
                  {/* Server Console - at bottom but not overlapping */}
                  <div className="flex-shrink-0">
                    <ErrorBoundary fallback={<div className="h-8 bg-muted" />}>
                      <ServerConsole />
                    </ErrorBoundary>
                  </div>
                </div>
              </motion.div>

              {/* Right-side Chat Panel */}
              <ErrorBoundary fallback={<div />}>
                <ChatPanel />
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}