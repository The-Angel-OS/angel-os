import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// GET /api/invitations/[token] - Get invitation by token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const payload = await getPayload({ config })

    const invitations = await payload.find({
      collection: 'invitations',
      where: {
        token: { equals: token }
      },
      depth: 2,
      limit: 1
    })

    if (invitations.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const invitation = invitations.docs[0]

    // Check if invitation is expired
    if (invitation && new Date(invitation.expiresAt) < new Date()) {
      await payload.update({
        collection: 'invitations',
        id: invitation?.id || '',
        data: { status: 'expired' }
      })
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    )
  }
}

