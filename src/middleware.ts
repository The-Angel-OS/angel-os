import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for static files and API routes that don't need tenant context
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/debug') ||
    pathname.startsWith('/api/seed') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  try {
    const response = NextResponse.next()
    
    // Add hostname to headers for tenant-aware URL resolution
    response.headers.set('x-forwarded-host', hostname)
    response.headers.set('x-original-host', hostname)
    
    // Multi-tenant domain resolution
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      // Local development - default tenant
      response.headers.set('x-tenant-id', '1')
      response.headers.set('x-tenant-slug', 'kendevco')
      response.headers.set('x-domain-match-type', 'development')
    } else if (hostname === 'angel-os.kendev.co') {
      // Main platform domain - default tenant
      response.headers.set('x-tenant-id', '1')
      response.headers.set('x-tenant-slug', 'kendevco')
      response.headers.set('x-domain-match-type', 'primary')
    } else {
      // Custom domain or subdomain - extract tenant info
      const parts = hostname.split('.')
      
      if (parts.length >= 3 && parts[1] === 'kendev' && parts[2] === 'co') {
        // Subdomain pattern: {tenant}.kendev.co
        const subdomain = parts[0]
        if (subdomain) {
          response.headers.set('x-tenant-slug', subdomain)
          response.headers.set('x-domain-match-type', 'subdomain')
        }
      } else if (parts.length >= 2) {
        // Custom domain - will need database lookup
        response.headers.set('x-custom-domain', hostname)
        response.headers.set('x-domain-match-type', 'custom')
      }
    }
    
    // Add protocol information
    const protocol = request.nextUrl.protocol
    response.headers.set('x-forwarded-proto', protocol.slice(0, -1)) // Remove trailing ':'
    
    return response
    
  } catch (error) {
    console.error('Multi-tenant middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Enable middleware for all routes except static files and specific API routes
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.).*)',
  ],
}