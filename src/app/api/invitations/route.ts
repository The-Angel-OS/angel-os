import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// POST /api/invitations - Send invitation to join a space
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, spaceId, role = 'member', invitedBy } = body
    
    const payload = await getPayload({ config })

    // Check if user already exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email }
      },
      limit: 1
    })

    let invitationData: any = {
      email,
      spaceId,
      role,
      invitedBy,
      status: 'pending',
      token: generateInvitationToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    if (existingUsers.docs.length > 0) {
      // User exists, send space invitation
      invitationData.userId = existingUsers.docs[0]?.id
      invitationData.type = 'space_invitation'
    } else {
      // User doesn't exist, send account creation invitation
      invitationData.type = 'account_creation'
    }

    // Create invitation record
    const invitation = await payload.create({
      collection: 'invitations',
      data: invitationData
    })

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/invite/${invitation.token}`
    
    // TODO: Implement email sending service
    console.log('Invitation URL:', invitationUrl)
    console.log('Invitation data:', invitation)

    return NextResponse.json({
      success: true,
      invitation,
      invitationUrl
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

// GET /api/invitations - Get invitations (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spaceId = searchParams.get('spaceId')
    const status = searchParams.get('status')
    
    const payload = await getPayload({ config })

    const where: any = {}
    if (spaceId) where.spaceId = { equals: spaceId }
    if (status) where.status = { equals: status }

    const invitations = await payload.find({
      collection: 'invitations',
      where,
      sort: '-createdAt',
      depth: 2
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2) + 
         Math.random().toString(36).substring(2) +
         Date.now().toString(36)
}

