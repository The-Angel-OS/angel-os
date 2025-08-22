import { NextRequest, NextResponse } from 'next/server'
// Import tenant resolution only on server-side
// import { resolveTenantFromDomain } from '@/utilities/tenant-resolution'

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files and API routes that don't need tenant context
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/debug') ||
    pathname.startsWith('/api/seed') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  try {
    // Simplified tenant resolution for now to avoid payload imports in middleware
    const response = NextResponse.next()
    
    // For localhost development, default to tenant ID 1
    if (hostname === 'localhost') {
      response.headers.set('x-tenant-id', '1')
      response.headers.set('x-tenant-slug', 'kendevco')
      response.headers.set('x-domain-match-type', 'development')
    } else {
      // For custom domains, extract subdomain and use as tenant slug
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        const subdomain = parts[0]
        response.headers.set('x-tenant-slug', subdomain || 'default')
        response.headers.set('x-domain-match-type', 'subdomain')
        // TODO: Implement proper tenant lookup via API endpoint
      }
    }
    
    return response
    
  } catch (error) {
    console.error('Tenant resolution middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Temporarily disabled to fix webpack node:child_process error
    // '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}