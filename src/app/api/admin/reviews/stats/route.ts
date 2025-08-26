import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get total reviews count
    const totalReviews = await payload.count({
      collection: 'feedback',
      where: {
        entityType: {
          equals: 'school'
        }
      }
    })

    // Get pending reviews count
    const pendingReviews = await payload.count({
      collection: 'feedback',
      where: {
        and: [
          {
            entityType: {
              equals: 'school'
            }
          },
          {
            status: {
              equals: 'pending'
            }
          }
        ]
      }
    })

    // Get approved reviews count
    const approvedReviews = await payload.count({
      collection: 'feedback',
      where: {
        and: [
          {
            entityType: {
              equals: 'school'
            }
          },
          {
            status: {
              equals: 'approved'
            }
          }
        ]
      }
    })

    // Get flagged reviews count
    const flaggedReviews = await payload.count({
      collection: 'feedback',
      where: {
        and: [
          {
            entityType: {
              equals: 'school'
            }
          },
          {
            status: {
              equals: 'flagged'
            }
          }
        ]
      }
    })

    // Calculate average rating
    const reviews = await payload.find({
      collection: 'feedback',
      where: {
        and: [
          {
            entityType: {
              equals: 'school'
            }
          },
          {
            status: {
              equals: 'approved'
            }
          }
        ]
      },
      limit: 1000,
      select: {
        ratings: true
      }
    })

    let totalRating = 0
    let ratingCount = 0

    reviews.docs.forEach((review: any) => {
      if (review.ratings?.overall) {
        totalRating += review.ratings.overall
        ratingCount++
      }
    })

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0

    const stats = {
      totalReviews: totalReviews.totalDocs,
      pendingReviews: pendingReviews.totalDocs,
      approvedReviews: approvedReviews.totalDocs,
      flaggedReviews: flaggedReviews.totalDocs,
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching review stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review statistics' },
      { status: 500 }
    )
  }
}


