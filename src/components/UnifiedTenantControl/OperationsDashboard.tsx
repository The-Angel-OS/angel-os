'use client'

import React from 'react'
import { cn } from '@/utilities/ui'
import { Target, Clock, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Operation {
  id: string
  name: string
  status: 'active' | 'pending' | 'completed' | 'compromised'
  type: 'tenant' | 'space' | 'product' | 'migration'
  priority: 'critical' | 'high' | 'medium' | 'low'
  progress: number
  agents: number
  revenue: number
  startDate: string
  description: string
}

interface OperationsDashboardProps {
  variant: 'business' | 'tactical' | 'standard'
}

export function OperationsDashboard({ variant }: OperationsDashboardProps) {
  const operations: Operation[] = [
    {
      id: variant === 'tactical' ? 'OP-ANGEL-001' : 'TENANT-001',
      name: variant === 'tactical' ? 'KENDEV PROVISION' : 'KenDev.Co',
      status: 'active',
      type: 'tenant',
      priority: 'high',
      progress: 75,
      agents: 3,
      revenue: 15000,
      startDate: '2025-01-15',
      description: 'Multi-space tenant with e-commerce capabilities',
    },
    {
      id: variant === 'tactical' ? 'OP-ANGEL-002' : 'SPACE-002',
      name: variant === 'tactical' ? 'ICONOCLAST LAUNCH' : 'Iconoclast Shop',
      status: 'pending',
      type: 'product',
      priority: 'critical',
      progress: 25,
      agents: 5,
      revenue: 50000,
      startDate: '2025-01-20',
      description: 'Launch T-shirt line with PoD integration',
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Target className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'compromised': return <AlertTriangle className="w-4 h-4" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500'
      case 'pending': return 'bg-orange-500/20 text-orange-500'
      case 'completed': return 'bg-blue-500/20 text-blue-500'
      case 'compromised': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 text-red-500'
      case 'high': return 'border-orange-500 text-orange-500'
      case 'medium': return 'border-yellow-500 text-yellow-500'
      case 'low': return 'border-gray-500 text-gray-500'
      default: return 'border-gray-500 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {variant === 'tactical' ? 'Active Operations' : 'Active Spaces & Projects'}
        </h2>
        <Badge className={cn(
          "text-xs",
          variant === 'tactical' ? 'bg-orange-500' : 'bg-[#5865f2]'
        )}>
          {operations.length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {operations.map((op) => (
          <Card
            key={op.id}
            className={cn(
              "border cursor-pointer hover:border-opacity-80 transition-all",
              variant === 'tactical'
                ? 'bg-neutral-900 border-neutral-700 hover:border-orange-500/50'
                : 'bg-[#2f3136] border-[#202225] hover:border-[#5865f2]/50'
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {op.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-mono">{op.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(op.status)}
                  <Badge className={getStatusColor(op.status)}>
                    {op.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4">{op.description}</p>

              <div className="space-y-3">
                {/* Priority Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Priority</span>
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(op.priority))}>
                    {op.priority.toUpperCase()}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-mono text-white">{op.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        variant === 'tactical' ? 'bg-orange-500' : 'bg-[#5865f2]'
                      )}
                      style={{ width: `${op.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between pt-2">
                  <div className="text-sm">
                    <span className="text-gray-400">Agents: </span>
                    <span className="text-white font-medium">{op.agents}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Revenue: </span>
                    <span className="text-white font-medium">${op.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end mt-4 text-gray-400">
                <span className="text-xs">View Details</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
