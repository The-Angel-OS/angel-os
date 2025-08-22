"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, ChevronDown, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "@/providers/Theme"

interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  subdomain?: string
  businessType: string
  status: 'active' | 'setup' | 'suspended' | 'archived'
}

interface TenantChooserProps {
  className?: string
  userId?: string | number
}

export function TenantChooser({ className = "", userId }: TenantChooserProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme() // Subscribe to theme changes

  useEffect(() => {
    if (userId) {
      loadUserTenants()
    } else {
      console.warn('⚠️ TenantChooser: No userId provided, loading all tenants')
      // Try to load all tenants if no specific user ID
      loadAllTenants()
    }
  }, [userId])

  const loadAllTenants = async () => {
    try {
      setLoading(true)
      console.log('🔍 TenantChooser: Loading all tenants...')
      
      const response = await fetch('/api/tenants?limit=50')
      console.log('🔍 TenantChooser: Tenants API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('🚨 TenantChooser: API error:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('📦 TenantChooser: All tenants response:', data)
      
      if (data.docs && Array.isArray(data.docs)) {
        console.log('✅ TenantChooser: Found tenants:', data.docs.length)
        setTenants(data.docs)
        if (data.docs.length > 0) {
          const kendevTenant = data.docs.find((t: Tenant) => t.slug === 'kendevco') || data.docs[0]
          console.log('🎯 TenantChooser: Setting current tenant to:', kendevTenant.name)
          setCurrentTenant(kendevTenant)
        }
      } else {
        console.warn('⚠️ TenantChooser: No docs array in response')
      }
    } catch (error) {
      console.error('🚨 TenantChooser: Failed to load all tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserTenants = async () => {
    console.log('🔍 TenantChooser: Starting loadUserTenants...')
    console.log('🔍 TenantChooser: User ID:', userId)
    
    try {
      setLoading(true)
      console.log('🔍 TenantChooser: Loading tenant memberships for user:', userId)
      
      // Get user's tenant memberships
      const membershipsUrl = `/api/tenant-memberships?user=${userId}`
      console.log('🔍 TenantChooser: Fetching memberships from:', membershipsUrl)
      
      const membershipsResponse = await fetch(membershipsUrl)
      console.log('🔍 TenantChooser: Memberships response status:', membershipsResponse.status)
      
      if (membershipsResponse.ok) {
        const membershipData = await membershipsResponse.json()
        console.log('✅ TenantChooser: Memberships data:', membershipData)
        const memberships = membershipData.docs || []
        
        // Extract tenant IDs and fetch tenant details
        const tenantIds = memberships.map((m: any) => m.tenant?.id || m.tenant).filter(Boolean)
        console.log('🔍 TenantChooser: Extracted tenant IDs:', tenantIds)
        
        if (tenantIds.length > 0) {
          const tenantsUrl = `/api/tenants?ids=${tenantIds.join(',')}`
          console.log('🔍 TenantChooser: Fetching tenants from:', tenantsUrl)
          
          const tenantsResponse = await fetch(tenantsUrl)
          console.log('🔍 TenantChooser: Tenants response status:', tenantsResponse.status)
          
          if (tenantsResponse.ok) {
            const tenantData = await tenantsResponse.json()
            console.log('✅ TenantChooser: Tenants data:', tenantData)
            const tenants = tenantData.docs || []
            setTenants(tenants)
            
            // Set current tenant (first active one or first one)
            const activeTenant = tenants.find((t: Tenant) => t.status === 'active') || tenants[0]
            console.log('🔍 TenantChooser: Selected current tenant:', activeTenant)
            setCurrentTenant(activeTenant)
          } else {
            const errorText = await tenantsResponse.text()
            console.error('🚨 TenantChooser: Tenants fetch failed:', tenantsResponse.status, errorText)
          }
        } else {
          console.warn('⚠️ TenantChooser: No tenant IDs found in memberships, falling back to all tenants')
          await loadAllTenants()
        }
      } else {
        const errorText = await membershipsResponse.text()
        console.error('🚨 TenantChooser: Memberships fetch failed:', membershipsResponse.status, errorText)
        console.log('🔄 TenantChooser: Falling back to all tenants due to memberships API failure')
        await loadAllTenants()
      }
    } catch (error) {
      console.error('🚨 TenantChooser: Failed to load tenants:', error)
      console.error('🚨 TenantChooser: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      console.log('🔄 TenantChooser: Final fallback to all tenants due to error')
      await loadAllTenants()
    } finally {
      setLoading(false)
      console.log('🔍 TenantChooser: Loading complete')
    }
  }

  const switchTenant = async (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    if (tenant) {
      setCurrentTenant(tenant)
      setIsOpen(false)
      
      // TODO: Update user session with selected tenant
      // This might involve calling an API to update the user's current tenant context
      try {
        await fetch('/api/user/switch-tenant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId })
        })
        
        // Refresh the page to apply tenant context
        window.location.reload()
      } catch (error) {
        console.error('Failed to switch tenant:', error)
      }
    }
  }

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.businessType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'setup': return 'bg-blue-100 text-blue-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Loading tenants...</span>
      </div>
    )
  }

  if (tenants.length === 0) {
    console.warn('⚠️ TenantChooser: No tenants found - this usually means user has no tenant memberships')
    console.log('🔍 TenantChooser: User details for debugging:', {
      userId: userId,
      userIdType: typeof userId,
      hasUserId: !!userId
    })
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">No tenants available</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            console.log('🔄 TenantChooser: Retrying tenant load...')
            loadUserTenants()
          }}
          className="text-xs"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (tenants.length === 1) {
    // Single tenant - improved spacing and layout
    return (
      <div className={`flex items-center gap-3 p-2 ${className}`}>
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
          <Building className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-sidebar-foreground truncate">
            {currentTenant?.name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(currentTenant?.status || 'active')} variant="secondary">
              {currentTenant?.status}
            </Badge>
            <span className="text-xs text-sidebar-foreground/60">
              {currentTenant?.businessType}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 h-auto p-3 hover:bg-sidebar-accent/50 rounded-lg w-full"
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
          <Building className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-sm text-sidebar-foreground truncate">
            {currentTenant?.name || 'Select Tenant'}
          </div>
          <div className="text-xs text-sidebar-foreground/60">
            {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} available
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-sidebar-foreground/60 flex-shrink-0" />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-3 w-96 z-50 shadow-xl border-2 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-3">
                {filteredTenants.map((tenant) => (
                  <Button
                    key={tenant.id}
                    variant="ghost"
                    onClick={() => switchTenant(tenant.id)}
                    className={`w-full justify-start p-5 h-auto rounded-lg transition-colors ${
                      currentTenant?.id === tenant.id 
                        ? 'bg-primary/15 border border-primary/30 text-primary shadow-sm' 
                        : 'hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-sm font-bold">
                          {tenant.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-semibold text-sm truncate text-foreground">{tenant.name}</div>
                        <div className="text-xs text-muted-foreground/90 mt-1 font-medium">{tenant.businessType}</div>
                        {tenant.domain && (
                          <div className="text-xs text-muted-foreground/70 mt-0.5 truncate font-mono">
                            {tenant.domain}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStatusColor(tenant.status)} variant="secondary">
                          {tenant.status}
                        </Badge>
                        {currentTenant?.id === tenant.id && (
                          <div className="text-xs text-primary font-medium">Current</div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {filteredTenants.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm bg-muted/30 rounded-lg">
                  <div className="font-medium">No tenants found</div>
                  <div className="text-xs mt-1">Try adjusting your search: "{searchQuery}"</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TenantChooser


