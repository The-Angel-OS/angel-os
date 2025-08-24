'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Tenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'setup' | 'suspended' | 'archived'
  domain?: string
}

export const TenantNavigation: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      const response = await fetch('/api/tenants', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        const activeTenants = data.docs?.filter((t: Tenant) => t.status === 'active') || []
        setTenants(activeTenants)
        
        // Get current tenant from URL or user preferences
        const tenantParam = searchParams.get('tenant')
        if (tenantParam) {
          const tenant = activeTenants.find((t: Tenant) => t.id === tenantParam || t.slug === tenantParam)
          if (tenant) {
            setSelectedTenant(tenant.id)
          }
        } else if (activeTenants.length > 0) {
          // Default to first tenant if none selected
          setSelectedTenant(activeTenants[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTenantChange = async (tenantId: string) => {
    if (!tenantId) return

    setSelectedTenant(tenantId)
    
    try {
      // Update user preferences
      await fetch('/api/user/switch-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tenantId }),
      })

      // Update URL with tenant parameter
      const currentPath = window.location.pathname
      const currentParams = new URLSearchParams(window.location.search)
      currentParams.set('tenant', tenantId)
      
      const newUrl = `${currentPath}?${currentParams.toString()}`
      router.replace(newUrl)
      
      // Refresh to apply tenant context
      window.location.reload()
    } catch (error) {
      console.error('Failed to switch tenant:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="nav-group">
        <div className="nav-group__label">Tenant</div>
        <div className="nav-group__content">
          <div className="loading-indicator">Loading...</div>
        </div>
      </div>
    )
  }

  if (tenants.length === 0) {
    return (
      <div className="nav-group">
        <div className="nav-group__label">Tenant</div>
        <div className="nav-group__content">
          <div className="no-tenants">No active tenants</div>
        </div>
      </div>
    )
  }

  const selectedTenantData = tenants.find(t => t.id === selectedTenant)

  return (
    <div className="nav-group">
      <div className="nav-group__label">Tenant</div>
      <div className="nav-group__content">
        {tenants.length === 1 ? (
          <div className="single-tenant">
            <strong>{tenants[0]?.name}</strong>
          </div>
        ) : (
          <select
            value={selectedTenant}
            onChange={(e) => handleTenantChange(e.target.value)}
            className="tenant-selector"
            aria-label="Select tenant"
            title="Select tenant"
          >
            <option value="">Select a tenant...</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        )}
        
        {selectedTenantData && (
          <div className="tenant-info">
            <small>Current: {selectedTenantData.name}</small>
          </div>
        )}
      </div>
      
      {/* Quick Navigation Links */}
      <div className="nav-group__content">
        <div className="quick-links">
          <a href="/" className="quick-link">
            <span className="quick-link__icon">🏠</span>
            <span className="quick-link__label">Home</span>
          </a>
          <a href="/dashboard" className="quick-link">
            <span className="quick-link__icon">📊</span>
            <span className="quick-link__label">Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default TenantNavigation
