'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Temporary inline badge until TS server recognizes the component
const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default'|'secondary'|'destructive'|'outline', className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
    variant === 'secondary' ? 'bg-gray-200 text-gray-800' :
    variant === 'destructive' ? 'bg-red-600 text-white' :
    variant === 'outline' ? 'border border-gray-300 text-gray-700' :
    'bg-blue-600 text-white'
  } ${className}`}>{children}</span>
)
import { Phone, Plus, Settings, BarChart3, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface BusinessAgent {
  id: string
  name: string
  tenant: { name: string }
  vapiIntegration?: {
    phoneNumber?: string
    assistantId?: string
    voiceId?: string
    status?: 'active' | 'inactive' | 'acquiring' | 'error'
    callStats?: {
      totalCalls?: number
      totalMinutes?: number
      lastCallDate?: string
      successRate?: number
    }
  }
}

interface VAPIPhoneManagementProps {
  tenantId?: string
}

export function VAPIPhoneManagement({ tenantId }: VAPIPhoneManagementProps) {
  const [agents, setAgents] = useState<BusinessAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [acquiringNumber, setAcquiringNumber] = useState<string | null>(null)
  const [selectedAreaCode, setSelectedAreaCode] = useState('727')

  useEffect(() => {
    fetchBusinessAgents()
  }, [tenantId])

  const fetchBusinessAgents = async () => {
    try {
      const response = await fetch(`/api/business-agents?tenantId=${tenantId}`)
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Failed to fetch business agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const acquirePhoneNumber = async (agentId: string, agentName: string) => {
    setAcquiringNumber(agentId)

    try {
      const response = await fetch('/api/vapi-phone-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acquire_number',
          agentId: agentId,
          agentName: agentName,
          areaCode: selectedAreaCode,
          angelPersonality: 'individual'
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchBusinessAgents()
        alert(`Phone number acquired: ${data.phoneNumber}`)
      } else {
        alert(`Failed to acquire phone number: ${data.error}`)
      }
    } catch (error) {
      console.error('Error acquiring phone number:', error)
      alert('Failed to acquire phone number')
    } finally {
      setAcquiringNumber(null)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'acquiring':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Acquiring</Badge>
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="secondary">Not Set Up</Badge>
    }
  }

  const formatPhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) return 'No number assigned'

    const cleaned = phoneNumber.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }

    return phoneNumber
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading business agents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">VAPI Phone Management</h2>
          <p className="text-gray-600">Manage voice AI phone numbers for your business agents</p>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="areaCode">Area Code:</label>
          <Select value={selectedAreaCode} onValueChange={setSelectedAreaCode}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="727">727</SelectItem>
              <SelectItem value="813">813</SelectItem>
              <SelectItem value="214">214</SelectItem>
              <SelectItem value="469">469</SelectItem>
              <SelectItem value="972">972</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Numbers</p>
                <p className="text-2xl font-bold">{agents.filter(a => a.vapiIntegration?.phoneNumber).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold">{agents.filter(a => a.vapiIntegration?.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold">
                  {agents.reduce((sum, a) => sum + (a.vapiIntegration?.callStats?.totalCalls || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                <p className="text-2xl font-bold">
                  {agents.reduce((sum, a) => sum + (a.vapiIntegration?.callStats?.totalMinutes || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <p className="text-sm text-gray-600">{agent.tenant.name}</p>
                </div>
                {getStatusBadge(agent.vapiIntegration?.status)}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone Number</p>
                    <p className="text-lg font-mono">{formatPhoneNumber(agent.vapiIntegration?.phoneNumber)}</p>
                  </div>

                  {!agent.vapiIntegration?.phoneNumber && (
                    <Button
                      size="sm"
                      onClick={() => acquirePhoneNumber(agent.id, agent.name)}
                      disabled={acquiringNumber === agent.id}
                      className="ml-4"
                    >
                      {acquiringNumber === agent.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Acquiring...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Get Number
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {agent.vapiIntegration?.callStats && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Total Calls</p>
                      <p className="text-xl font-bold">{agent.vapiIntegration.callStats.totalCalls || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-xl font-bold">{agent.vapiIntegration.callStats.successRate || 0}%</p>
                    </div>
                  </div>
                )}

                {agent.vapiIntegration?.phoneNumber && (
                  <div className="flex space-x-2 pt-3 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Stats
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Business Agents Found</h3>
            <p className="text-gray-600">Create business agents first to manage their phone numbers.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
