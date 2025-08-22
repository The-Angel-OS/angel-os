"use client"

import { useState, useEffect } from 'react'

interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  subdomain?: string
  businessType: string
  status: 'active' | 'setup' | 'suspended' | 'archived'
  configuration: {
    primaryColor?: string
    logo?: any
    favicon?: any
    contactEmail?: string
    contactPhone?: string
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  }
  features: {
    ecommerce?: boolean
    spaces?: boolean
    crm?: boolean
    vapi?: boolean
    n8n?: boolean
    memberPortal?: boolean
  }
  limits: {
    maxUsers?: number
    maxProducts?: number
    maxStorage?: number
  }
  revenueSharing?: {
    setupFee?: number
    revenueShareRate?: number
    partnershipTier?: string
  }
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentTenant = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, try to get tenant from subdomain or domain
        const hostname = window.location.hostname
        let tenantSlug = null

        // Check if it's a subdomain (e.g., hays.kendev.co)
        if (hostname.includes('.kendev.co') && !hostname.startsWith('www.')) {
          tenantSlug = hostname.split('.')[0]
        }

        // If no subdomain, check for custom domain
        if (!tenantSlug && !hostname.includes('localhost') && !hostname.includes('kendev.co')) {
          // This is likely a custom domain
          const response = await fetch(`/api/tenants?where=${JSON.stringify({ domain: { equals: hostname } })}`)
          const data = await response.json()
          if (data.docs && data.docs.length > 0) {
            setTenant(data.docs[0])
            return
          }
        }

        // If we have a tenant slug, fetch by slug
        if (tenantSlug) {
          const response = await fetch(`/api/tenants?where=${JSON.stringify({ slug: { equals: tenantSlug } })}`)
          const data = await response.json()
          if (data.docs && data.docs.length > 0) {
            setTenant(data.docs[0])
            return
          }
        }

        // Fallback: get the first active tenant (for development)
        const fallbackResponse = await fetch('/api/tenants?where={"status":{"equals":"active"}}&limit=1')
        const fallbackData = await fallbackResponse.json()
        if (fallbackData.docs && fallbackData.docs.length > 0) {
          setTenant(fallbackData.docs[0])
        } else {
          setError('No active tenant found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tenant')
        console.error('Error fetching tenant:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentTenant()
  }, [])

  return { tenant, loading, error, refetch: () => window.location.reload() }
}

// Hook to get tenant-specific configuration
export function useTenantConfig() {
  const { tenant, loading, error } = useTenant()
  
  const config = tenant?.configuration || {}
  const features = tenant?.features || {}
  const limits = tenant?.limits || {}

  return {
    tenant,
    config,
    features,
    limits,
    loading,
    error,
    // Helper functions
    hasFeature: (feature: keyof Tenant['features']) => Boolean(features[feature]),
    getLimit: (limit: keyof Tenant['limits']) => limits[limit] || 0,
    getBrandColor: () => config.primaryColor || '#3b82f6',
    getContactInfo: () => ({
      email: config.contactEmail,
      phone: config.contactPhone,
      address: config.address
    })
  }
}

