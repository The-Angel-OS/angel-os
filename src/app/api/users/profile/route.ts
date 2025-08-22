import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Get the current user from the request
    // This would typically come from authentication middleware
    const user = (request as any).user
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate and sanitize the input
    const {
      firstName,
      lastName,
      email,
      jobTitle,
      bio,
      location,
      website,
      profileImage,
    } = body

    // Update the user profile
    const updatedUser = await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(profileImage !== undefined && { profileImage }),
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Get the current user from the request
    const user = (request as any).user
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the current user data
    const userData = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 2, // Include profile image
    })

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
