import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-createdAt'
    const search = searchParams.get('search')
    
    // Build where clause
    let where: any = {}
    
    // Handle search query
    if (search) {
      where.or = [
        { name: { contains: search } },
        { 'address.city': { contains: search } },
        { 'address.state': { contains: search } },
        { 'demographics.district': { contains: search } }
      ]
    }
    
    // Handle specific field filters
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const schoolType = searchParams.get('schoolType')
    const district = searchParams.get('district')
    
    if (city) {
      where['address.city'] = { equals: city }
    }
    
    if (state) {
      where['address.state'] = { equals: state }
    }
    
    if (schoolType) {
      where['demographics.schoolType'] = { equals: schoolType }
    }
    
    if (district) {
      where['demographics.district'] = { contains: district }
    }
    
    // Handle slug-based lookup
    const slug = searchParams.get('where[slug][equals]')
    if (slug) {
      where.slug = { equals: slug }
    }
    
    // Handle safety score filters
    const minCommunityScore = searchParams.get('minCommunityScore')
    if (minCommunityScore) {
      where['safetyScores.communityScore.overall'] = { 
        greater_than_equal: parseInt(minCommunityScore) 
      }
    }
    
    const verifiedOnly = searchParams.get('verifiedOnly')
    if (verifiedOnly === 'true') {
      where['safetyScores.verifiedScore.isVerified'] = { equals: true }
    }
    
    // Only show active schools by default
    if (!searchParams.get('includeInactive')) {
      where.status = { equals: 'active' }
    }

    const result = await payload.find({
      collection: 'schools',
      where,
      page,
      limit,
      sort,
      depth: 2, // Include related data
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Schools API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const data = await request.json()
    
    // TODO: Add authentication check
    // For now, allow anyone to create schools (for testing)
    
    const result = await payload.create({
      collection: 'schools',
      data,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('School creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    )
  }
}


