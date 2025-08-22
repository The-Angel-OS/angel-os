'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/utilities/ui'
import { Building, Users, TrendingUp, Search, Filter, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Tenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'pending' | 'suspended'
  businessType: string
  spaces: number
  revenue: number
  createdAt: string
}

interface TenantsManagerProps {
  variant: 'business' | 'tactical' | 'standard'
}

export function TenantsManager({ variant }: TenantsManagerProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTenants()
  }, [])

  async function loadTenants() {
    try {
      const res = await fetch('/api/tenant-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      })
      const data = await res.json()
      if (data.tenants) {
        setTenants(data.tenants)
      }
    } catch (e) {
      console.error('Failed to load tenants:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">
          {variant === 'tactical' ? 'Angel Network' : 'Tenant Management'}
        </h2>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={variant === 'tactical' ? 'Search angels...' : 'Search tenants...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              "pl-10 border text-white",
              variant === 'tactical' 
                ? 'bg-neutral-800 border-neutral-600' 
                : 'bg-[#40444b] border-[#202225]'
            )}
          />
        </div>
      </div>

      {/* Tenants Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading tenants...</div>
        </div>
      ) : filteredTenants.length === 0 ? (
        <Card className={cn(
          "border p-12 text-center",
          variant === 'tactical' 
            ? 'bg-neutral-900 border-neutral-700' 
            : 'bg-[#2f3136] border-[#202225]'
        )}>
          <p className="text-gray-400">
            {searchTerm ? 'No tenants found matching your search.' : 'No tenants provisioned yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTenants.map((tenant) => (
            <Card
              key={tenant.id}
              className={cn(
                "border hover:border-opacity-80 transition-all cursor-pointer",
                variant === 'tactical'
                  ? 'bg-neutral-900 border-neutral-700 hover:border-orange-500/50'
                  : 'bg-[#2f3136] border-[#202225] hover:border-[#5865f2]/50'
              )}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                      <AvatarFallback className={cn(
                        "text-white font-bold",
                        variant === 'tactical' ? 'bg-orange-500' : 'bg-blue-500'
                      )}>
                        {tenant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-white">{tenant.name}</h3>
                      <p className="text-sm text-gray-400">/{tenant.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Stats */}
                    <div className="hidden sm:flex items-center space-x-6">
                      <div className="text-center">
                        <div className="flex items-center text-gray-400">
                          <Building className="w-4 h-4 mr-1" />
                          <span className="text-sm">{tenant.spaces} spaces</span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center text-gray-400">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="text-sm">${tenant.revenue?.toLocaleString() || '0'}/mo</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2">
                      <Badge className={cn(
                        "text-xs",
                        tenant.status === 'active' 
                          ? 'bg-green-500/20 text-green-500' 
                          : tenant.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      )}>
                        {tenant.status.toUpperCase()}
                      </Badge>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="flex items-center space-x-4 mt-3 sm:hidden text-sm text-gray-400">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    <span>{tenant.spaces} spaces</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>${tenant.revenue?.toLocaleString() || '0'}/mo</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
