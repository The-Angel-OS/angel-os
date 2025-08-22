'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/utilities/ui'
// BusinessSidebar component not found - using placeholder
import { CommandCenter } from './CommandCenter'
import { LeoAssistant } from './LeoAssistant'
import { useIsMobile } from '@/hooks/use-mobile'
import { logBusiness, logInfo, logSuccess } from '@/services/SystemMonitorService'

export interface UnifiedTenantControlProps {
  variant?: 'business' | 'tactical' | 'standard'
  className?: string
  hideLeo?: boolean
}

export default function UnifiedTenantControl({ 
  variant = 'business',
  className,
  hideLeo = false
}: UnifiedTenantControlProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLeoVisible, setIsLeoVisible] = useState(true)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'operations' | 'tenants'>('dashboard')
  const isMobile = useIsMobile()

  // Log business activities
  useEffect(() => {
    logSuccess('Unified Tenant Control initialized', 'TenantControl', { variant })
    
    // Simulate some business activities
    const simulateActivities = () => {
      const activities = [
        { message: 'New tenant onboarding request received', details: { tenant: 'Acme Corp', plan: 'Enterprise' } },
        { message: 'Payment processed successfully', details: { amount: '$1,299', tenant: 'TechStart Inc' } },
        { message: 'Space provisioned for new tenant', details: { space: 'techstart-prod', resources: '4 vCPU, 8GB RAM' } },
        { message: 'API key generated for integration', details: { service: 'Stripe', tenant: 'Fashion Hub' } },
        { message: 'Backup completed for all tenant data', details: { size: '2.4GB', duration: '45s' } },
      ]
      
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      if (randomActivity) {
        logBusiness(randomActivity.message, randomActivity.details)
      }
    }
    
    // Simulate business activities every 10-20 seconds
    const interval = setInterval(() => {
      simulateActivities()
    }, Math.random() * 10000 + 10000)
    
    return () => clearInterval(interval)
  }, [])

  // Log section changes
  useEffect(() => {
    logInfo(`Navigated to ${activeSection} section`, 'Navigation', { variant })
  }, [activeSection, variant])

  // Auto-adjust for mobile
  React.useEffect(() => {
    if (isMobile) {
      setIsSidebarCollapsed(true)
      setIsLeoVisible(false)
    }
  }, [isMobile])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
    logInfo(`Sidebar ${isSidebarCollapsed ? 'expanded' : 'collapsed'}`, 'UI')
  }
  
  const toggleLeo = () => {
    setIsLeoVisible(!isLeoVisible)
    logInfo(`Leo Assistant ${isLeoVisible ? 'hidden' : 'shown'}`, 'UI')
    if (!isLeoVisible) {
      logBusiness('AI Assistant engaged for user support')
    }
  }

  return (
    <div className={cn(
      "flex h-full text-white overflow-hidden",
      variant === 'tactical' ? 'bg-black' : 'bg-[#1e2124]',
      className
    )}>
      {/* Business Sidebar - Component not available, using placeholder */}
      <div className={cn(
        "w-64 bg-muted border-r transition-all duration-300 ease-in-out",
        isSidebarCollapsed && "w-16",
        isMobile && isSidebarCollapsed && "hidden"
      )}>
        <div className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Business Sidebar</h3>
          <p className="text-xs text-muted-foreground">Component not available</p>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && !isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Main Command Center */}
      <CommandCenter
        variant={variant}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        isLeoVisible={isLeoVisible}
        onToggleLeo={toggleLeo}
        className="flex-1 min-w-0"
      />

      {/* Leo Assistant Panel - From Discord clone */}
      {!hideLeo && isLeoVisible && !isMobile && (
        <LeoAssistant 
          variant={variant}
          className="transition-all duration-300 ease-in-out" 
        />
      )}
    </div>
  )
}
