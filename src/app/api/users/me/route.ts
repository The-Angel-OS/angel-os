import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Verify the token and get user from headers (Payload handles cookie parsing)
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Return user data without sensitive fields
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      // globalRole: user.globalRole, // Property doesn't exist on User type
      tenant: user.tenant,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    
    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

