"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Building2, ChevronDown, Home, Layout } from 'lucide-react'

interface Tenant {
  id: string
  name: string
  slug: string
  status: string
  domain?: string
}

export function AdminTenantChooser() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data.docs || [])
        
        // Set first active tenant as current
        const activeTenant = data.docs?.find((t: Tenant) => t.status === 'active')
        if (activeTenant) {
          setCurrentTenant(activeTenant)
        }
      }
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTenantSwitch = (tenant: Tenant) => {
    setCurrentTenant(tenant)
    // Store in localStorage for persistence
    localStorage.setItem('admin-selected-tenant', JSON.stringify(tenant))
    
    // Reload page to apply tenant context
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="text-sm text-muted-foreground">Loading tenants...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Tenant Chooser */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Current Tenant:</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {currentTenant?.name || 'Select Tenant'}
              <ChevronDown className="w-3 h-3 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleTenantSwitch(tenant)}
                className={currentTenant?.id === tenant.id ? "bg-accent" : ""}
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{tenant.name}</div>
                    <div className="text-xs text-muted-foreground">{tenant.slug}</div>
                  </div>
                  <Badge 
                    variant={tenant.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {tenant.status}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick Navigation */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/">
            <Home className="w-3 h-3 mr-1" />
            Home
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="/dashboard">
            <Layout className="w-3 h-3 mr-1" />
            Dashboard
          </a>
        </Button>
      </div>

      {/* Tenant Info */}
      {currentTenant && (
        <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded">
          <strong>Admin Context:</strong> All collections filtered to {currentTenant.name}
          {currentTenant.domain && (
            <div className="mt-1">
              <strong>Domain:</strong> {currentTenant.domain}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminTenantChooser







