import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get total schools count
    const totalSchools = await payload.count({
      collection: 'schools'
    })

    // Get verified schools count
    const verifiedSchools = await payload.count({
      collection: 'schools',
      where: {
        'safetyScores.verifiedScore.isVerified': {
          equals: true
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

    // Calculate average safety score
    const schools = await payload.find({
      collection: 'schools',
      limit: 1000, // Adjust as needed
      select: {
        safetyScores: true
      }
    })

    let totalScore = 0
    let scoreCount = 0

    schools.docs.forEach((school: any) => {
      if (school.safetyScores?.communityScore?.overall) {
        totalScore += school.safetyScores.communityScore.overall
        scoreCount++
      }
    })

    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

    const stats = {
      totalSchools: totalSchools.totalDocs,
      verifiedSchools: verifiedSchools.totalDocs,
      pendingReviews: pendingReviews.totalDocs,
      averageScore
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching school stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school statistics' },
      { status: 500 }
    )
  }
}


