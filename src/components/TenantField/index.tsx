'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'

interface Tenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'setup' | 'suspended' | 'archived'
}

interface TenantFieldProps {
  path: string
  required?: boolean
  readOnly?: boolean
  label?: string
}

export const TenantField: React.FC<TenantFieldProps> = ({
  path,
  required = false,
  readOnly = false,
  label = 'Tenant',
}) => {
  const { value, setValue } = useField<string>({ path })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
        
        // Auto-select based on current tenant context or URL parameter
        if (!value) {
          const tenantParam = searchParams.get('tenant')
          let selectedTenant: Tenant | null = null
          
          if (tenantParam) {
            selectedTenant = activeTenants.find((t: Tenant) => t.id === tenantParam || t.slug === tenantParam) || null
          }
          
          // If no tenant from params and only one tenant, auto-select it
          if (!selectedTenant && activeTenants.length === 1) {
            selectedTenant = activeTenants[0]
          }
          
          if (selectedTenant) {
            setValue(selectedTenant.id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
  }

  if (isLoading) {
    return (
      <div className="field-type tenant-field">
        <label className="field-label">{label}</label>
        <div className="loading">Loading tenants...</div>
      </div>
    )
  }

  if (tenants.length === 0) {
    return (
      <div className="field-type tenant-field">
        <label className="field-label">{label}</label>
        <div className="error">No active tenants found</div>
      </div>
    )
  }

  if (tenants.length === 1) {
    const tenant = tenants[0]
    if (!tenant) {
      return (
        <div className="field-type tenant-field">
          <label className="field-label">{label}</label>
          <div className="error">No tenant data available</div>
        </div>
      )
    }
    
    // Auto-set the value if not already set
    if (!value) {
      setValue(tenant.id)
    }
    
    return (
      <div className="field-type tenant-field">
        <label className="field-label">{label}</label>
        <div className="single-tenant">
          <strong>{tenant.name}</strong>
          <span className="tenant-status">({tenant.status})</span>
        </div>
        <input type="hidden" value={tenant.id} />
      </div>
    )
  }

  return (
    <div className="field-type tenant-field">
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      <select
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        disabled={readOnly}
        required={required}
        className="tenant-select"
        aria-label={label}
        title={label}
      >
        <option value="">Select a tenant...</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
      
      {value && (
        <div className="field-description">
          <small>
            Selected: <strong>{tenants.find(t => t.id === value)?.name}</strong>
          </small>
        </div>
      )}
    </div>
  )
}

export default TenantField
