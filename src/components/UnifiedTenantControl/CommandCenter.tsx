'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'
import { 
  Hash, Menu, Plus, Bot, Shield, Target, Activity, Globe,
  TrendingUp, Users, Building, CreditCard, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AutoForm } from '@/components/forms/AutoForm'
import { tenantProvisionSchema, type TenantProvisionData } from '@/utilities/form-schemas'
import { OperationsDashboard } from './OperationsDashboard'
import { TenantsManager } from './TenantsManager'

interface CommandCenterProps {
  variant: 'business' | 'tactical' | 'standard'
  activeSection: 'dashboard' | 'operations' | 'tenants'
  onSectionChange: (section: 'dashboard' | 'operations' | 'tenants') => void
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  isLeoVisible: boolean
  onToggleLeo: () => void
  className?: string
}

export function CommandCenter({
  variant,
  activeSection,
  onSectionChange,
  isSidebarCollapsed,
  onToggleSidebar,
  isLeoVisible,
  onToggleLeo,
  className
}: CommandCenterProps) {
  const [showProvisionModal, setShowProvisionModal] = useState(false)

  async function handleProvision(data: TenantProvisionData) {
    try {
      const res = await fetch('/api/tenant-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provision',
          tenantData: data
        })
      })
      const result = await res.json()
      if (result.success) {
        setShowProvisionModal(false)
        // Refresh tenants list
      }
    } catch (error) {
      console.error('Provisioning error:', error)
    }
  }

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* Header */}
      <header className={cn(
        "h-16 flex items-center justify-between px-4 border-b",
        variant === 'tactical' 
          ? 'bg-neutral-900 border-neutral-700' 
          : 'bg-[#36393f] border-[#202225]'
      )}>
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          {isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="w-8 h-8 p-0 hover:bg-[#393c43]"
            >
              <Menu className="w-4 h-4 text-gray-400" />
            </Button>
          )}

          {/* Section Navigation */}
          <nav className="flex space-x-1">
            {[
              { id: 'dashboard', label: variant === 'tactical' ? 'COMMAND CENTER' : 'Dashboard', icon: Shield },
              { id: 'operations', label: variant === 'tactical' ? 'OPERATIONS' : 'Active Spaces', icon: Target },
              { id: 'tenants', label: variant === 'tactical' ? 'ANGELS' : 'Tenants', icon: Users },
            ].map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onSectionChange(item.id as any)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-wider transition-colors",
                  activeSection === item.id
                    ? variant === 'tactical' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-[#5865f2] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#393c43]'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowProvisionModal(true)}
            className={cn(
              "px-4 py-2 text-sm font-medium tracking-wider",
              variant === 'tactical'
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-[#5865f2] hover:bg-[#4752c4]'
            )}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            {variant === 'tactical' ? 'NEW OPERATION' : 'New Tenant'}
          </Button>
          
          <Button
            onClick={onToggleLeo}
            variant="ghost"
            className={cn(
              "px-4 py-2 text-sm font-medium",
              isLeoVisible 
                ? variant === 'tactical' 
                  ? 'border-orange-500 text-orange-500' 
                  : 'border-[#5865f2] text-[#5865f2]'
                : 'text-gray-400'
            )}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            LEO AI
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 overflow-y-auto p-6",
        variant === 'tactical' ? 'bg-black' : 'bg-[#36393f]'
      )}>
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { 
                  label: variant === 'tactical' ? 'ACTIVE OPERATIONS' : 'Active Tenants', 
                  value: '23', 
                  icon: Building, 
                  color: variant === 'tactical' ? 'text-orange-500' : 'text-blue-500' 
                },
                { 
                  label: 'REVENUE GENERATED', 
                  value: '$1.2M', 
                  icon: TrendingUp, 
                  color: 'text-green-500' 
                },
                { 
                  label: variant === 'tactical' ? 'ACTIVE ANGELS' : 'Active Spaces', 
                  value: '847', 
                  icon: Users, 
                  color: 'text-purple-500' 
                },
                { 
                  label: 'SYSTEM HEALTH', 
                  value: '98%', 
                  icon: Activity, 
                  color: 'text-white' 
                },
              ].map((stat) => (
                <Card key={stat.label} className={cn(
                  "border",
                  variant === 'tactical' 
                    ? 'bg-neutral-900 border-neutral-700' 
                    : 'bg-[#2f3136] border-[#202225]'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-bold font-mono text-white">{stat.value}</p>
                      </div>
                      <stat.icon className={cn("w-8 h-8", stat.color)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Activity Feed & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Feed */}
              <Card className={cn(
                "border",
                variant === 'tactical' 
                  ? 'bg-neutral-900 border-neutral-700' 
                  : 'bg-[#2f3136] border-[#202225]'
              )}>
                <div className="p-4 border-b border-neutral-700">
                  <h3 className="text-sm font-medium tracking-wider text-white">
                    {variant === 'tactical' ? 'OPERATION LOG' : 'Recent Activity'}
                  </h3>
                </div>
                <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {[
                    { time: '2 min ago', agent: 'LEO_AI', action: 'provisioned tenant', target: 'startup-x' },
                    { time: '15 min ago', agent: 'SYSTEM', action: 'deployed space', target: 'iconoclast-shop' },
                    { time: '1 hour ago', agent: 'KENNETH', action: 'updated products', target: 'zem-mattress' },
                  ].map((log, i) => (
                    <div key={i} className={cn(
                      "text-xs border-l-2 pl-3",
                      variant === 'tactical' ? 'border-orange-500' : 'border-[#5865f2]'
                    )}>
                      <div className="text-gray-500 font-mono">{log.time}</div>
                      <div className="text-gray-300">
                        Agent <span className={cn(
                          "font-mono",
                          variant === 'tactical' ? 'text-orange-500' : 'text-[#5865f2]'
                        )}>{log.agent}</span> {log.action}{' '}
                        <span className="text-white font-mono">{log.target}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className={cn(
                "border",
                variant === 'tactical' 
                  ? 'bg-neutral-900 border-neutral-700' 
                  : 'bg-[#2f3136] border-[#202225]'
              )}>
                <div className="p-4 border-b border-neutral-700">
                  <h3 className="text-sm font-medium tracking-wider text-white">SYSTEM STATUS</h3>
                </div>
                <CardContent className="p-4 space-y-4">
                  {[
                    { name: 'PAYLOAD CMS', status: 'online', health: 98, load: 45 },
                    { name: 'POSTGRES DB', status: 'online', health: 95, load: 67 },
                    { name: 'LEO AI ENGINE', status: 'warning', health: 87, load: 89 },
                    { name: 'STRIPE CONNECT', status: 'online', health: 100, load: 23 },
                  ].map((system) => (
                    <div key={system.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            system.status === 'online' ? 'bg-green-500' : 'bg-orange-500'
                          )} />
                          <span className="text-xs font-mono text-gray-300">{system.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{system.health}% health</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1">
                        <div 
                          className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            variant === 'tactical' ? 'bg-orange-500' : 'bg-[#5865f2]'
                          )}
                          style={{ width: `${system.load}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeSection === 'operations' && <OperationsDashboard variant={variant} />}
        {activeSection === 'tenants' && <TenantsManager variant={variant} />}
      </main>

      {/* Provision Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className={cn(
            "w-full max-w-2xl border",
            variant === 'tactical' 
              ? 'bg-neutral-900 border-neutral-700' 
              : 'bg-[#2f3136] border-[#202225]'
          )}>
            <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-wider text-white">
                {variant === 'tactical' ? 'NEW OPERATION: TENANT PROVISION' : 'Provision New Tenant'}
              </h2>
              <Button
                onClick={() => setShowProvisionModal(false)}
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <AutoForm
                schema={tenantProvisionSchema}
                onSubmit={handleProvision}
                fieldConfig={{
                  name: {
                    placeholder: variant === 'tactical' ? 'Operation codename' : 'Business name',
                    className: 'bg-neutral-800 border-neutral-600 text-white',
                  },
                  voicePrompt: {
                    fieldType: 'textarea',
                    placeholder: variant === 'tactical' 
                      ? 'Describe the mission objective...' 
                      : 'Describe your business...',
                    className: 'bg-neutral-800 border-neutral-600 text-white',
                  },
                }}
                submitText={variant === 'tactical' ? 'INITIATE OPERATION' : 'Provision Tenant'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
