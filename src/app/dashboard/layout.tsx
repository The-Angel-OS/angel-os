"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...')
        // Check Payload CMS authentication
        const response = await fetch('/api/users/me', {
          credentials: 'include' // Include cookies for Payload auth
        })
        
        console.log('🔍 Auth response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Auth response data:', data)
          
          // The API returns { user: {...} } format
          if (data && data.user && data.user.id) {
            console.log('✅ User authenticated:', data.user.email)
            setIsAuthenticated(true)
            return
          }
        }
        
        console.log('❌ Not authenticated, redirecting to admin login')
        // If not authenticated, redirect to Payload admin login
        router.replace('/admin/login')
      } catch (error) {
        console.error('❌ Auth check failed:', error)
        router.replace('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  // Listen for theme changes and force layout re-render
  useEffect(() => {
    const handleThemeChange = () => {
      console.log('Dashboard layout received theme change event')
      setLayoutKey(prev => prev + 1)
    }
    
    window.addEventListener('themeChanged', handleThemeChange)
    return () => window.removeEventListener('themeChanged', handleThemeChange)
  }, [])

  // Show loading or nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
        <head>
          <InitTheme />
          <link href="/favicon.ico" rel="icon" sizes="32x32" />
          <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        </head>
        <body className="dark:bg-[hsl(222.2_84%_4.9%)] bg-[hsl(0_0%_100%)]">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </body>
      </html>
    )
  }

  // Don't render dashboard if not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return null
  }

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

              {/* LEO Chat Panel - Right Side */}
              <ErrorBoundary fallback={<div className="w-80 bg-muted border-l" />}>
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