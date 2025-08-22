import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface LocationCoordinates {
  latitude: number
  longitude: number
}

interface VenueWithDistance {
  id: string
  name: string
  organization: any
  venueType: string
  location: {
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    coordinates: LocationCoordinates
    serviceRadius?: number
  }
  distance: number
  contactInfo: {
    phone?: string
    email?: string
  }
  businessHours: any
  services: any[]
  guardianAngel?: any
}

interface SearchParams {
  userLocation: LocationCoordinates
  radius?: number // in miles
  venueType?: string
  organizationType?: string
  serviceType?: string
  limit?: number
}

export class VenueLocationService {
  private static instance: VenueLocationService
  private payload: any = null

  private constructor() {}

  static getInstance(): VenueLocationService {
    if (!VenueLocationService.instance) {
      VenueLocationService.instance = new VenueLocationService()
    }
    return VenueLocationService.instance
  }

  private async getPayloadInstance() {
    if (!this.payload) {
      this.payload = await getPayload({ config: configPromise })
    }
    return this.payload
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in miles
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180)
  }

  /**
   * Geocode an address to get coordinates
   * @param address Address string
   * @returns Coordinates or null if not found
   */
  async geocodeAddress(address: string): Promise<LocationCoordinates | null> {
    try {
      // In production, you'd use a real geocoding service like Google Maps API
      // For now, we'll return a mock response
      console.log(`[VenueLocationService] Geocoding address: ${address}`)

      // TODO: Implement real geocoding service
      // Example using Google Maps Geocoding API:
      // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
      // const data = await response.json()
      // if (data.results && data.results.length > 0) {
      //   const location = data.results[0].geometry.location
      //   return { latitude: location.lat, longitude: location.lng }
      // }

      return null
    } catch (error) {
      console.error('[VenueLocationService] Geocoding error:', error)
      return null
    }
  }

  /**
   * Find venues near a location
   * @param searchParams Search parameters
   * @returns Array of venues with distance, sorted by distance
   */
  async findNearbyVenues(searchParams: SearchParams): Promise<VenueWithDistance[]> {
    try {
      const payload = await this.getPayloadInstance()
      const { userLocation, radius = 50, venueType, organizationType, serviceType, limit = 20 } = searchParams

      // Build query filters
      const whereClause: any = {
        and: [
          { isActive: { equals: true } },
          { status: { equals: 'active' } },
          { 'location.coordinates.latitude': { exists: true } },
          { 'location.coordinates.longitude': { exists: true } },
        ]
      }

      // Add venue type filter
      if (venueType) {
        whereClause.and.push({ venueType: { equals: venueType } })
      }

      // Add organization type filter
      if (organizationType) {
        whereClause.and.push({ 'organization.organizationType': { equals: organizationType } })
      }

      // Add service type filter
      if (serviceType) {
        whereClause.and.push({ 'services.serviceName': { contains: serviceType } })
      }

      // Fetch venues with organization and guardian angel data
      const venuesResult = await payload.find({
        collection: 'venues',
        where: whereClause,
        limit: 100, // Get more initially to filter by distance
        depth: 2,
        sort: 'name',
      })

      // Calculate distances and filter
      const venuesWithDistance: VenueWithDistance[] = []

      for (const venue of venuesResult.docs) {
        if (venue.location?.coordinates?.latitude && venue.location?.coordinates?.longitude) {
          const distance = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            venue.location.coordinates.latitude,
            venue.location.coordinates.longitude
          )

          // Check if venue is within radius
          if (distance <= radius) {
            venuesWithDistance.push({
              id: venue.id,
              name: venue.name,
              organization: venue.organization,
              venueType: venue.venueType,
              location: venue.location,
              distance,
              contactInfo: venue.contactInfo || {},
              businessHours: venue.businessHours || {},
              services: venue.services || [],
              guardianAngel: venue.guardianAngel?.assignedAngel || null,
            })
          }
        }
      }

      // Sort by distance and limit results
      venuesWithDistance.sort((a, b) => a.distance - b.distance)
      return venuesWithDistance.slice(0, limit)

    } catch (error) {
      console.error('[VenueLocationService] Error finding nearby venues:', error)
      throw error
    }
  }

  /**
   * Find venues for a specific organization
   * @param organizationId Organization ID
   * @param userLocation Optional user location for distance calculation
   * @returns Array of venues for the organization
   */
  async findVenuesForOrganization(
    organizationId: string,
    userLocation?: LocationCoordinates
  ): Promise<VenueWithDistance[]> {
    try {
      const payload = await this.getPayloadInstance()

      const venuesResult = await payload.find({
        collection: 'venues',
        where: {
          and: [
            { organization: { equals: organizationId } },
            { isActive: { equals: true } },
            { status: { equals: 'active' } },
          ]
        },
        limit: 100,
        depth: 2,
        sort: 'name',
      })

      const venues: VenueWithDistance[] = []

      for (const venue of venuesResult.docs) {
        let distance = 0

        if (userLocation && venue.location?.coordinates?.latitude && venue.location?.coordinates?.longitude) {
          distance = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            venue.location.coordinates.latitude,
            venue.location.coordinates.longitude
          )
        }

        venues.push({
          id: venue.id,
          name: venue.name,
          organization: venue.organization,
          venueType: venue.venueType,
          location: venue.location,
          distance,
          contactInfo: venue.contactInfo || {},
          businessHours: venue.businessHours || {},
          services: venue.services || [],
          guardianAngel: venue.guardianAngel?.assignedAngel || null,
        })
      }

      // Sort by distance if user location provided, otherwise by name
      if (userLocation) {
        venues.sort((a, b) => a.distance - b.distance)
      } else {
        venues.sort((a, b) => a.name.localeCompare(b.name))
      }

      return venues

    } catch (error) {
      console.error('[VenueLocationService] Error finding venues for organization:', error)
      throw error
    }
  }

  /**
   * Find the closest venue for a specific service
   * @param userLocation User's location
   * @param serviceType Type of service needed
   * @param organizationId Optional organization filter
   * @returns Closest venue or null if none found
   */
  async findClosestVenueForService(
    userLocation: LocationCoordinates,
    serviceType: string,
    organizationId?: string
  ): Promise<VenueWithDistance | null> {
    try {
      const searchParams: SearchParams = {
        userLocation,
        radius: 100, // Large radius to find the closest
        serviceType,
        limit: 1,
      }

      const venues = await this.findNearbyVenues(searchParams)

      // Filter by organization if specified
      if (organizationId) {
        const filtered = venues.filter(venue =>
          typeof venue.organization === 'object' ?
            venue.organization.id === organizationId :
            venue.organization === organizationId
        )
        return filtered.length > 0 ? filtered[0]! : null
      }

      return venues.length > 0 ? venues[0]! : null

    } catch (error) {
      console.error('[VenueLocationService] Error finding closest venue:', error)
      return null
    }
  }

  /**
   * Get venue availability for a specific time
   * @param venueId Venue ID
   * @param requestedDateTime Date and time for the request
   * @returns Availability information
   */
  async getVenueAvailability(venueId: string, requestedDateTime: Date): Promise<{
    isOpen: boolean
    nextOpenTime?: Date
    specialNotes?: string
  }> {
    try {
      const payload = await this.getPayloadInstance()

      const venue = await payload.findByID({
        collection: 'venues',
        id: venueId,
        depth: 1,
      })

      if (!venue) {
        throw new Error('Venue not found')
      }

      const dayOfWeek = requestedDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const requestedTime = requestedDateTime.toTimeString().slice(0, 5) // HH:MM format

      // Check regular business hours
      const schedule = venue.businessHours?.schedule || []
      const daySchedule = schedule.find((s: any) => s.dayOfWeek === dayOfWeek)

      if (!daySchedule || daySchedule.isClosed) {
        return {
          isOpen: false,
          specialNotes: 'Venue is closed on this day',
        }
      }

      // Check if current time is within business hours
      const isOpen = requestedTime >= daySchedule.openTime && requestedTime <= daySchedule.closeTime

      // Check for special hours/holidays
      const specialHours = venue.businessHours?.specialHours || []
      const requestedDate = requestedDateTime.toISOString().split('T')[0]
      const specialDay = specialHours.find((sh: any) =>
        sh.date?.split('T')[0] === requestedDate
      )

      if (specialDay) {
        if (specialDay.isClosed) {
          return {
            isOpen: false,
            specialNotes: specialDay.description || 'Venue is closed for special hours',
          }
        }
        // Override regular hours with special hours
        const specialIsOpen = specialDay.openTime && specialDay.closeTime &&
          requestedTime >= specialDay.openTime && requestedTime <= specialDay.closeTime
        return {
          isOpen: specialIsOpen,
          specialNotes: specialDay.description,
        }
      }

      return {
        isOpen,
        specialNotes: isOpen ? 'Venue is open' : 'Venue is currently closed',
      }

    } catch (error) {
      console.error('[VenueLocationService] Error checking venue availability:', error)
      return {
        isOpen: false,
        specialNotes: 'Unable to check availability',
      }
    }
  }

  /**
   * Auto-assign Guardian Angel to venue based on organization and venue type
   * @param venueId Venue ID
   * @returns Assigned Guardian Angel or null
   */
  async autoAssignGuardianAngel(venueId: string): Promise<any | null> {
    try {
      const payload = await this.getPayloadInstance()

      const venue = await payload.findByID({
        collection: 'venues',
        id: venueId,
        depth: 2,
      })

      if (!venue) {
        throw new Error('Venue not found')
      }

      // Find available Guardian Angels for this organization
      const angelsResult = await payload.find({
        collection: 'business-agents',
        where: {
          and: [
            { tenant: { equals: venue.organization.id } },
            { isActive: { equals: true } },
            { status: { equals: 'active' } },
          ]
        },
        limit: 10,
      })

      if (angelsResult.docs.length === 0) {
        console.log(`[VenueLocationService] No Guardian Angels found for venue ${venueId}`)
        return null
      }

      // Select the best angel based on specialization and availability
      const bestAngel = angelsResult.docs[0] // Simple selection for now

      // Update venue with assigned angel
      await payload.update({
        collection: 'venues',
        id: venueId,
        data: {
          guardianAngel: {
            assignedAngel: bestAngel.id,
            venueSpecificGreeting: `Welcome to ${venue.name}! I'm your dedicated Guardian Angel, here to help you with all your needs.`,
          }
        },
      })

      console.log(`[VenueLocationService] Assigned Guardian Angel ${bestAngel.id} to venue ${venueId}`)
      return bestAngel

    } catch (error) {
      console.error('[VenueLocationService] Error auto-assigning Guardian Angel:', error)
      return null
    }
  }
}
