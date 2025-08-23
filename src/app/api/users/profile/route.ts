import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function PUT(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Get current user from session
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileData = await request.json()
    
    // Update user profile - only update fields that are provided
    const updateData: any = {}
    
    if (profileData.firstName !== undefined) updateData.firstName = profileData.firstName
    if (profileData.lastName !== undefined) updateData.lastName = profileData.lastName
    if (profileData.email !== undefined) updateData.email = profileData.email
    if (profileData.bio !== undefined) updateData.bio = profileData.bio
    if (profileData.website !== undefined) updateData.website = profileData.website
    
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // Handle PATCH requests the same way as PUT for profile updates
  return PUT(request)
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Get current user from session
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return user profile data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        // Add any custom fields from your user schema
        jobTitle: (user as any).jobTitle,
        bio: (user as any).bio,
        location: (user as any).location,
        website: (user as any).website,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}