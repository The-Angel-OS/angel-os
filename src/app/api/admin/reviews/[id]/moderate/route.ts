import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { action, notes } = await request.json()
    const { id } = await params
    const reviewId = id

    // Validate action
    if (!['approve', 'reject', 'flag'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid moderation action' },
        { status: 400 }
      )
    }

    // Map action to status
    const statusMap = {
      approve: 'approved' as const,
      reject: 'rejected' as const,
      flag: 'flagged' as const
    }

    const newStatus = statusMap[action as keyof typeof statusMap]

    // Update the review
    const updatedReview = await payload.update({
      collection: 'feedback',
      id: reviewId,
      data: {
        status: newStatus,
        isPublic: action === 'approve', // Only approved reviews are public
        // Note: moderatedAt, moderatedBy, and moderationNotes would need to be added to Feedback collection schema
      }
    })

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: `Review ${action}d successfully`
    })

  } catch (error) {
    console.error('Error moderating review:', error)
    return NextResponse.json(
      { error: 'Failed to moderate review' },
      { status: 500 }
    )
  }
}
