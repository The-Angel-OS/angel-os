import { NextRequest, NextResponse } from 'next/server'
import { VenueLocationService } from '@/services/VenueLocationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const venueService = VenueLocationService.getInstance()

    switch (action) {
      case 'find_nearby':
        return await handleFindNearby(searchParams, venueService)

      case 'find_by_organization':
        return await handleFindByOrganization(searchParams, venueService)

      case 'find_closest_for_service':
        return await handleFindClosestForService(searchParams, venueService)

      case 'check_availability':
        return await handleCheckAvailability(searchParams, venueService)

      case 'geocode_address':
        return await handleGeocodeAddress(searchParams, venueService)

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[VenueLocationAPI] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleFindNearby(searchParams: URLSearchParams, venueService: VenueLocationService) {
  const latitude = parseFloat(searchParams.get('latitude') || '0')
  const longitude = parseFloat(searchParams.get('longitude') || '0')
  const radius = parseInt(searchParams.get('radius') || '50')
  const venueType = searchParams.get('venueType') || undefined
  const organizationType = searchParams.get('organizationType') || undefined
  const serviceType = searchParams.get('serviceType') || undefined
  const limit = parseInt(searchParams.get('limit') || '20')

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    )
  }

  const venues = await venueService.findNearbyVenues({
    userLocation: { latitude, longitude },
    radius,
    venueType,
    organizationType,
    serviceType,
    limit,
  })

  return NextResponse.json({
    success: true,
    data: {
      venues,
      searchParams: {
        latitude,
        longitude,
        radius,
        venueType,
        organizationType,
        serviceType,
        limit,
      },
      count: venues.length,
    },
  })
}

async function handleFindByOrganization(searchParams: URLSearchParams, venueService: VenueLocationService) {
  const organizationId = searchParams.get('organizationId')
  const latitude = parseFloat(searchParams.get('latitude') || '0')
  const longitude = parseFloat(searchParams.get('longitude') || '0')

  if (!organizationId) {
    return NextResponse.json(
      { error: 'Organization ID is required' },
      { status: 400 }
    )
  }

  const userLocation = latitude && longitude ? { latitude, longitude } : undefined
  const venues = await venueService.findVenuesForOrganization(organizationId, userLocation)

  return NextResponse.json({
    success: true,
    data: {
      venues,
      organizationId,
      sortedByDistance: !!userLocation,
      count: venues.length,
    },
  })
}

async function handleFindClosestForService(searchParams: URLSearchParams, venueService: VenueLocationService) {
  const latitude = parseFloat(searchParams.get('latitude') || '0')
  const longitude = parseFloat(searchParams.get('longitude') || '0')
  const serviceType = searchParams.get('serviceType')
  const organizationId = searchParams.get('organizationId') || undefined

  if (!latitude || !longitude || !serviceType) {
    return NextResponse.json(
      { error: 'Latitude, longitude, and service type are required' },
      { status: 400 }
    )
  }

  const venue = await venueService.findClosestVenueForService(
    { latitude, longitude },
    serviceType,
    organizationId
  )

  return NextResponse.json({
    success: true,
    data: {
      venue,
      searchParams: {
        latitude,
        longitude,
        serviceType,
        organizationId,
      },
    },
  })
}

async function handleCheckAvailability(searchParams: URLSearchParams, venueService: VenueLocationService) {
  const venueId = searchParams.get('venueId')
  const dateTime = searchParams.get('dateTime')

  if (!venueId || !dateTime) {
    return NextResponse.json(
      { error: 'Venue ID and date/time are required' },
      { status: 400 }
    )
  }

  const requestedDateTime = new Date(dateTime)
  if (isNaN(requestedDateTime.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date/time format' },
      { status: 400 }
    )
  }

  const availability = await venueService.getVenueAvailability(venueId, requestedDateTime)

  return NextResponse.json({
    success: true,
    data: {
      availability,
      venueId,
      requestedDateTime: dateTime,
    },
  })
}

async function handleGeocodeAddress(searchParams: URLSearchParams, venueService: VenueLocationService) {
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    )
  }

  const coordinates = await venueService.geocodeAddress(address)

  return NextResponse.json({
    success: true,
    data: {
      coordinates,
      address,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const venueService = VenueLocationService.getInstance()

    switch (action) {
      case 'auto_assign_guardian':
        return await handleAutoAssignGuardian(body, venueService)

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[VenueLocationAPI] POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleAutoAssignGuardian(body: any, venueService: VenueLocationService) {
  const { venueId } = body

  if (!venueId) {
    return NextResponse.json(
      { error: 'Venue ID is required' },
      { status: 400 }
    )
  }

  const guardian = await venueService.autoAssignGuardianAngel(venueId)

  return NextResponse.json({
    success: true,
    data: {
      guardian,
      venueId,
      assigned: !!guardian,
    },
  })
}
