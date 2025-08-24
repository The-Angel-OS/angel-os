'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

interface GlobalViewRedirectProps {
  collection?: string
  global?: string
  tenantSlug?: string
}

export const GlobalViewRedirect: React.FC<GlobalViewRedirectProps> = ({
  collection,
  global,
  tenantSlug,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If we have a tenant slug, redirect to tenant-specific view
    if (tenantSlug) {
      const currentPath = window.location.pathname
      const params = searchParams.toString()
      
      let newPath = ''
      
      if (collection) {
        newPath = `/admin/collections/${collection}`
      } else if (global) {
        newPath = `/admin/globals/${global}`
      } else {
        newPath = '/admin'
      }
      
      // Add tenant parameter
      const separator = params ? '&' : ''
      const tenantParam = `tenant=${encodeURIComponent(tenantSlug)}`
      const fullParams = params ? `${params}${separator}${tenantParam}` : tenantParam
      
      const redirectUrl = `${newPath}?${fullParams}`
      
      // Only redirect if we're not already on the correct path
      if (currentPath !== newPath || !searchParams.get('tenant')) {
        router.replace(redirectUrl)
      }
    }
  }, [collection, global, tenantSlug, router, searchParams])

  // This component doesn't render anything visible
  return null
}

export default GlobalViewRedirect
