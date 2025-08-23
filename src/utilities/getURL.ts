import canUseDOM from './canUseDOM'
import { headers } from 'next/headers'

/**
 * Get the current request's hostname (tenant-aware)
 */
export const getCurrentHostname = () => {
  if (canUseDOM) {
    return window.location.hostname
  }

  // Server-side: Get from headers
  try {
    const headersList = headers()
    const host = headersList.get('host') || headersList.get('x-forwarded-host')
    if (host) {
      return host.split(':')[0] // Remove port if present
    }
  } catch (error) {
    // Headers not available in some contexts
  }

  return null
}

/**
 * Get the current request's full URL (tenant-aware)
 */
export const getCurrentURL = () => {
  if (canUseDOM) {
    return window.location.origin
  }

  // Server-side: Build from headers
  try {
    const headersList = headers()
    const host = headersList.get('host') || headersList.get('x-forwarded-host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    
    if (host) {
      return `${protocol}://${host}`
    }
  } catch (error) {
    // Headers not available in some contexts
  }

  return getServerSideURL()
}

export const getServerSideURL = () => {
  // First priority: Current request hostname (for multi-tenant)
  const currentHostname = getCurrentHostname()
  if (currentHostname && !currentHostname.includes('localhost')) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    return `${protocol}://${currentHostname}`
  }

  // Second priority: Explicitly set NEXT_PUBLIC_SERVER_URL
  let url = process.env.NEXT_PUBLIC_SERVER_URL

  // Third priority: Vercel custom domain (production)
  if (!url && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // Fourth priority: Vercel deployment URL (preview/development)
  if (!url && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback: localhost for local development
  if (!url) {
    url = 'http://localhost:3000'
  }

  return url
}

export const getClientSideURL = () => {
  // Client-side: Use current window location (always tenant-aware)
  if (canUseDOM) {
    return window.location.origin
  }

  // Server-side: Use same logic as getServerSideURL for consistency
  return getServerSideURL()
}

/**
 * Get tenant-specific URL for a given hostname
 * Useful for generating URLs for specific tenants
 */
export const getTenantURL = (hostname: string, path: string = '') => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = `${protocol}://${hostname}`
  return path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl
}

/**
 * Build URL with current tenant context
 * Preserves the current domain/subdomain for multi-tenant routing
 */
export const buildTenantAwareURL = (path: string = '') => {
  const baseUrl = getCurrentURL()
  return path ? `${baseUrl}${path.startsWith('/') ? path : `/${path}`}` : baseUrl
}
