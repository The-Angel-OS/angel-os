import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// POST /api/invitations/[token]/accept - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { type, userData } = body
    
    const payload = await getPayload({ config })

    // Get invitation
    const invitations = await payload.find({
      collection: 'invitations',
      where: {
        token: { equals: token }
      },
      limit: 1
    })

    if (invitations.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const invitation = invitations.docs[0]
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 409 }
      )
    }

    let userId = invitation.userId

    if (type === 'account_creation' && userData) {
      // Create new user account
      try {
        const newUser = await payload.create({
          collection: 'users',
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            globalRole: 'user',
            // Add user to the space they were invited to
            tenant: invitation.spaceId
          }
        })

        userId = newUser.id
      } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }
    } else if (type === 'space_invitation' && userId) {
      // Add existing user to space
      try {
        const user = await payload.findByID({
          collection: 'users',
          id: typeof userId === 'object' ? userId.id : userId,
          depth: 1
        })

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        // Update user's tenant if different
        const currentTenant = user.tenant
        const currentTenantId = currentTenant && typeof currentTenant === 'object' ? currentTenant.id : currentTenant

        if (!currentTenantId || currentTenantId !== invitation.spaceId) {
          await payload.update({
            collection: 'users',
            id: typeof userId === 'object' ? userId.id : userId,
            data: {
              tenant: invitation.spaceId
            }
          })
        }
      } catch (error) {
        console.error('Error adding user to space:', error)
        return NextResponse.json(
          { error: 'Failed to add user to space' },
          { status: 500 }
        )
      }
    }

    // Mark invitation as accepted
    await payload.update({
      collection: 'invitations',
      id: invitation?.id || '',
      data: {
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
        userId
      }
    })

    // Get the space information
    const space = await payload.findByID({
      collection: 'tenants',
      id: typeof invitation.spaceId === 'object' ? invitation.spaceId.id : invitation.spaceId,
      depth: 1
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      user: { id: userId },
      space: space,
      redirectTo: type === 'account_creation' ? '/onboarding?source=invitation' : '/dashboard/spaces'
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}

