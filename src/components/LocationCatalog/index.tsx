import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Clock, Users, ArrowRight } from 'lucide-react'

interface LocationCatalogProps {
  organizationId: string
  userLocation?: {
    latitude: number
    longitude: number
  }
  onLocationSelect?: (venue: any) => void
  showDistance?: boolean
  filterByService?: string
  className?: string
}

interface Venue {
  id: string
  name: string
  displayName?: string
  venueType: string
  location: {
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  contactInfo: {
    phone?: string
    email?: string
  }
  services: Array<{
    serviceName: string
    category?: string
    isActive: boolean
  }>
  staff: Array<{
    user: any
    role: string
    title?: string
    specialties?: Array<{ specialty: string }>
  }>
  businessHours: {
    schedule: Array<{
      dayOfWeek: string
      openTime: string
      closeTime: string
      isClosed: boolean
    }>
  }
  guardianAngel?: {
    assignedAngel: any
    venueSpecificGreeting?: string
  }
  distance?: number
  isAvailable?: boolean
}

export default function LocationCatalog({
  organizationId,
  userLocation,
  onLocationSelect,
  showDistance = true,
  filterByService,
  className = ""
}: LocationCatalogProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  useEffect(() => {
    fetchVenues()
  }, [organizationId, userLocation, filterByService])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        action: 'find_by_organization',
        organizationId,
      })

      if (userLocation) {
        params.append('latitude', userLocation.latitude.toString())
        params.append('longitude', userLocation.longitude.toString())
      }

      if (filterByService) {
        params.append('serviceType', filterByService)
      }

      const response = await fetch(`/api/venue-location?${params}`)
      const data = await response.json()

      if (data.success) {
        setVenues(data.data.venues)
      } else {
        setError('Failed to load locations')
      }
    } catch (err) {
      setError('Error loading locations')
      console.error('[LocationCatalog] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationClick = (venue: Venue) => {
    setSelectedVenue(venue)

    // Trigger Guardian Angel flip
    if (onLocationSelect) {
      onLocationSelect(venue)
    }

    // Store in session for Guardian Angel context
    sessionStorage.setItem('currentVenue', JSON.stringify(venue))

    // Dispatch event for Guardian Angel to pick up
    window.dispatchEvent(new CustomEvent('venueChanged', {
      detail: { venue, guardianAngel: venue.guardianAngel }
    }))
  }

  const getVenueDistance = (venue: Venue) => {
    if (venue.distance !== undefined) {
      return venue.distance < 1
        ? `${(venue.distance * 5280).toFixed(0)} ft`
        : `${venue.distance.toFixed(1)} mi`
    }
    return null
  }

  const getBusinessHoursToday = (venue: Venue) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todaySchedule = venue.businessHours?.schedule?.find(s => s.dayOfWeek === today)

    if (!todaySchedule || todaySchedule.isClosed) {
      return 'Closed Today'
    }

    return `${todaySchedule.openTime} - ${todaySchedule.closeTime}`
  }

  const getProviderCount = (venue: Venue) => {
    return venue.staff?.filter(s => s.role === 'medical_provider').length || 0
  }

  const getVenueServices = (venue: Venue) => {
    return venue.services?.filter(s => s.isActive)?.slice(0, 3) || []
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchVenues} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Our Locations</h2>
        <div className="text-sm text-gray-600">
          {venues.length} location{venues.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <Card
            key={venue.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              selectedVenue?.id === venue.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleLocationClick(venue)}
          >
            <div className="p-6">
              {/* Venue Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {venue.displayName || venue.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {venue.location.address.city}, {venue.location.address.state}
                  </div>
                  {showDistance && venue.distance !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {getVenueDistance(venue)}
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="ml-2">
                  {venue.venueType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-4">
                {/* Business Hours */}
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{getBusinessHoursToday(venue)}</span>
                </div>

                {/* Phone */}
                {venue.contactInfo.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{venue.contactInfo.phone}</span>
                  </div>
                )}

                {/* Provider Count */}
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{getProviderCount(venue)} provider{getProviderCount(venue) !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {getVenueServices(venue).map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {service.serviceName}
                    </Badge>
                  ))}
                  {venue.services && venue.services.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{venue.services.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Guardian Angel Badge */}
              {venue.guardianAngel && (
                <div className="mb-4">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    👼 Guardian Angel Available
                  </Badge>
                </div>
              )}

              {/* Action Button */}
              <Button className="w-full" onClick={() => handleLocationClick(venue)}>
                <span>Visit Location</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Venue Details */}
      {selectedVenue && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Now Connected to: {selectedVenue.displayName || selectedVenue.name}
              </h3>
              <p className="text-gray-600">
                {selectedVenue.guardianAngel?.venueSpecificGreeting ||
                 `Welcome to ${selectedVenue.name}! Your Guardian Angel is ready to help.`}
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Active Connection
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold mb-2">Available Services:</h4>
              <div className="space-y-1">
                {selectedVenue.services?.filter(s => s.isActive)?.map((service, idx) => (
                  <div key={idx} className="text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {service.serviceName}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Our Team:</h4>
              <div className="space-y-1">
                {selectedVenue.staff?.filter(s => s.role === 'medical_provider')?.map((provider, idx) => (
                  <div key={idx} className="text-sm flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {provider.title || provider.user.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
