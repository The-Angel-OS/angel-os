"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, ExternalLink } from "lucide-react"

import { School } from '@/payload-types'

interface Coordinates {
  lat: number
  lng: number
}

interface SchoolMapCardProps {
  school: School
  coordinates: Coordinates
}

export function SchoolMapCard({ school, coordinates }: SchoolMapCardProps) {
  const fullAddress = [
    school.address.street,
    school.address.city,
    school.address.state,
    school.address.zipCode
  ].filter(Boolean).join(', ')

  const encodedAddress = encodeURIComponent(fullAddress)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`

  // Static map URL (you might want to use a proper map service like Google Maps Static API)
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=400x200&markers=color:red%7C${coordinates.lat},${coordinates.lng}&key=YOUR_API_KEY`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-1">{school.name}</div>
          <div className="text-gray-600 leading-relaxed">
            {school.address.street && (
              <div>{school.address.street}</div>
            )}
            <div>
              {school.address.city}, {school.address.state}
              {school.address.zipCode && ` ${school.address.zipCode}`}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="relative">
          <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm font-medium">Interactive Map</div>
              <div className="text-xs">Click below to view in Maps</div>
            </div>
          </div>
          
          {/* Overlay with coordinates info */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </div>
        </div>

        {/* Map Actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open(googleMapsUrl, '_blank')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            View on Google Maps
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open(directionsUrl, '_blank')}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
        </div>

        {/* Nearby Information */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Nearby</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Public transportation available</div>
            <div>• Parking available on-site</div>
            <div>• Accessible entrance</div>
          </div>
        </div>

        {/* Safety Zone Info */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">School Safety Zone</div>
              <div className="text-blue-800 text-xs leading-relaxed">
                This location is within a designated school safety zone with enhanced 
                security measures and traffic controls during school hours.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
