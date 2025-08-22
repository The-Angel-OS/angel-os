'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MapPinIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'

interface AddressVerificationProps {
  tenantId: string
  spaceId: string
  onVerificationComplete?: (result: VerificationResult) => void
  showAddressRestrictionCheck?: boolean
  showDaycareProximity?: boolean
  apiKeys?: {
    google?: string
    addressRestrictionRegistry?: string
    daycareDatabase?: string
  }
}

interface VerificationResult {
  address: {
    formatted: string
    components: {
      street: string
      city: string
      state: string
      zipCode: string
      county: string
    }
    coordinates: {
      lat: number
      lng: number
    }
    verified: boolean
    confidence: number
  }
  addressRestrictionCheck?: {
    withinRadius: AddressRestriction[]
    radius: number // in miles
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    lastUpdated: string
  }
  daycareProximity?: {
    nearbyDaycares: Daycare[]
    closestDistance: number // in miles
    withinRestrictedZone: boolean
    restrictionRadius: number
  }
  housingEligibility: {
    eligible: boolean
    restrictions: string[]
    notes: string[]
  }
}

interface AddressRestriction {
  id: string
  name: string
  address: string
  distance: number
  restrictionType: string
  riskLevel: 'low' | 'medium' | 'high'
  lastUpdated: string
}

interface Daycare {
  id: string
  name: string
  address: string
  distance: number
  licensed: boolean
  capacity: number
  ageRange: string
}

export default function AddressVerificationWidget({
  tenantId,
  spaceId,
  onVerificationComplete,
  showAddressRestrictionCheck = true,
  showDaycareProximity = true,
  apiKeys = {}
}: AddressVerificationProps) {
  const [address, setAddress] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'input' | 'verifying' | 'results'>('input')

  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of US
        zoom: 4,
        styles: [
          {
            featureType: 'poi.school',
            elementType: 'geometry',
            stylers: [{ color: '#ffeb3b' }]
          },
          {
            featureType: 'poi.government',
            elementType: 'geometry',
            stylers: [{ color: '#f44336' }]
          }
        ]
      })
      setMap(googleMap)
    }
  }, [map])

  const verifyAddress = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setIsVerifying(true)
    setError(null)
    setStep('verifying')

    try {
      // Simulate API calls - in real implementation, these would be actual API calls
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock verification result
      const mockResult: VerificationResult = {
        address: {
          formatted: '123 Main Street, Anytown, ST 12345, USA',
          components: {
            street: '123 Main Street',
            city: 'Anytown',
            state: 'ST',
            zipCode: '12345',
            county: 'Sample County'
          },
          coordinates: {
            lat: 40.7128,
            lng: -74.0060
          },
          verified: true,
          confidence: 0.95
        },
        addressRestrictionCheck: showAddressRestrictionCheck ? {
          withinRadius: [
            {
              id: 'ar-001',
              name: 'John Doe',
              address: '456 Oak St, Anytown, ST 12345',
              distance: 0.3,
              restrictionType: 'Sexual Assault',
              riskLevel: 'medium',
              lastUpdated: '2024-01-15'
            }
          ],
          radius: 1.0,
          riskLevel: 'medium',
          lastUpdated: new Date().toISOString()
        } : undefined,
        daycareProximity: showDaycareProximity ? {
          nearbyDaycares: [
            {
              id: 'dc-001',
              name: 'Little Angels Daycare',
              address: '789 Pine St, Anytown, ST 12345',
              distance: 0.2,
              licensed: true,
              capacity: 50,
              ageRange: '6 weeks - 5 years'
            }
          ],
          closestDistance: 0.2,
          withinRestrictedZone: true,
          restrictionRadius: 0.25
        } : undefined,
        housingEligibility: {
          eligible: false,
          restrictions: [
            'Within 1000 feet of registered daycare facility',
            'Address restriction within 1 mile radius'
          ],
          notes: [
            'Housing application will require special review',
            'Alternative locations may be available'
          ]
        }
      }

      setVerificationResult(mockResult)
      setStep('results')

      // Update map with results
      if (map) {
        const addressMarker = new window.google.maps.Marker({
          position: mockResult.address.coordinates,
          map: map,
          title: 'Proposed Address',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4F46E5"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          }
        })

        // Add address restriction markers
        if (mockResult.addressRestrictionCheck) {
          mockResult.addressRestrictionCheck.withinRadius.forEach(restriction => {
            new window.google.maps.Marker({
              position: { lat: mockResult.address.coordinates.lat + 0.01, lng: mockResult.address.coordinates.lng + 0.01 },
              map: map,
              title: `Address Restriction: ${restriction.name}`,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#EF4444"/>
                    <path d="M12 8v4m0 4h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24)
              }
            })
          })
        }

        // Add daycare markers
        if (mockResult.daycareProximity) {
          mockResult.daycareProximity.nearbyDaycares.forEach(daycare => {
            new window.google.maps.Marker({
              position: { lat: mockResult.address.coordinates.lat - 0.01, lng: mockResult.address.coordinates.lng - 0.01 },
              map: map,
              title: `Daycare: ${daycare.name}`,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#FBBF24"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24)
              }
            })
          })
        }

        map.setCenter(mockResult.address.coordinates)
        map.setZoom(15)
      }

      // Send telemetry to dashboard
      await sendTelemetry({
        action: 'address_verification_completed',
        tenantId,
        spaceId,
        result: {
          eligible: mockResult.housingEligibility.eligible,
          riskLevel: mockResult.addressRestrictionCheck?.riskLevel,
          restrictionCount: mockResult.housingEligibility.restrictions.length
        }
      })

      await saveAsWidgetMessage(mockResult)

      onVerificationComplete?.(mockResult)

    } catch (err) {
      setError('Verification failed. Please try again.')
      setStep('input')
    } finally {
      setIsVerifying(false)
    }
  }

  const sendTelemetry = async (data: any) => {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (err) {
      console.error('Telemetry failed:', err)
    }
  }

  const saveAsWidgetMessage = async (result: VerificationResult) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space: spaceId,
          sender: 1, // System user for widget messages
          messageType: 'widget',
          content: `Address verification completed for ${result.address.formatted}`,
          widgetData: {
            widgetType: 'address_verification',
            widgetTitle: 'Address Verification Results',
            widgetData: {
              verificationResult: result,
              timestamp: new Date().toISOString(),
              eligibilityStatus: result.housingEligibility.eligible ? 'eligible' : 'not_eligible',
              riskLevel: result.addressRestrictionCheck?.riskLevel || 'low',
              restrictionCount: result.addressRestrictionCheck?.withinRadius?.length || 0,
              daycareCount: result.daycareProximity?.nearbyDaycares?.length || 0,
            },
            isInteractive: false, // Results are read-only
            allowedRoles: ['all']
          }
        })
      })

      if (response.ok) {
        console.log('Widget message saved successfully')
      } else {
        console.error('Failed to save widget message')
      }
    } catch (err) {
      console.error('Error saving widget message:', err)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-700 bg-green-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'critical': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center gap-3">
          <ShieldExclamationIcon className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Address Verification System</h2>
            <p className="text-blue-100">Address Restriction Housing Compliance Check</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-center space-x-8">
          <div className={`flex items-center gap-2 ${step === 'input' ? 'text-blue-600' : step === 'verifying' || step === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'input' ? 'bg-blue-600 text-white' : step === 'verifying' || step === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <span className="font-medium">Enter Address</span>
          </div>
          <div className={`flex items-center gap-2 ${step === 'verifying' ? 'text-blue-600' : step === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'verifying' ? 'bg-blue-600 text-white' : step === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <span className="font-medium">Verify & Check</span>
          </div>
          <div className={`flex items-center gap-2 ${step === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              3
            </div>
            <span className="font-medium">Review Results</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {step === 'input' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Address
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address (e.g., 123 Main St, City, State, ZIP)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={verifyAddress}
                  disabled={!address.trim() || isVerifying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Verify
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <XCircleIcon className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What we check:</h3>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• Address validation against Google Maps and USPS databases</li>
                <li>• Address restriction registry within 1-mile radius</li>
                <li>• Licensed daycare facilities within restricted zones</li>
                <li>• Housing eligibility based on local regulations</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verifying Address...</h3>
            <p className="text-gray-600">Checking multiple databases and registries</p>
          </div>
        )}

        {step === 'results' && verificationResult && (
          <div className="space-y-6">
            {/* Address Verification */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <MapPinIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Address Verification</h3>
                {verificationResult.address.verified ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Formatted Address:</span>
                  <p className="text-gray-700">{verificationResult.address.formatted}</p>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <p className="text-gray-700">{(verificationResult.address.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div ref={mapRef} className="h-64 w-full bg-gray-100"></div>
            </div>

            {/* Address Restriction Check */}
            {verificationResult.addressRestrictionCheck && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold">Address Restriction Registry Check</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(verificationResult.addressRestrictionCheck.riskLevel)}`}>
                    {verificationResult.addressRestrictionCheck.riskLevel.toUpperCase()} RISK
                  </span>
                </div>

                {verificationResult.addressRestrictionCheck.withinRadius.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Found {verificationResult.addressRestrictionCheck.withinRadius.length} registered address restriction(s) within {verificationResult.addressRestrictionCheck.radius} mile radius:
                    </p>
                    {verificationResult.addressRestrictionCheck.withinRadius.map(restriction => (
                      <div key={restriction.id} className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-red-900">{restriction.name}</p>
                            <p className="text-red-700 text-sm">{restriction.address}</p>
                            <p className="text-red-600 text-sm">Distance: {restriction.distance} miles</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(restriction.riskLevel)}`}>
                            {restriction.riskLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-700">No registered address restrictions found within {verificationResult.addressRestrictionCheck.radius} mile radius.</p>
                )}
              </div>
            )}

            {/* Daycare Proximity */}
            {verificationResult.daycareProximity && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold">Daycare Proximity Check</h3>
                  {verificationResult.daycareProximity.withinRestrictedZone && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                      RESTRICTED ZONE
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-3">
                  Closest daycare: {verificationResult.daycareProximity.closestDistance} miles
                  {verificationResult.daycareProximity.withinRestrictedZone &&
                    ` (within ${verificationResult.daycareProximity.restrictionRadius} mile restriction zone)`
                  }
                </p>

                {verificationResult.daycareProximity.nearbyDaycares.map(daycare => (
                  <div key={daycare.id} className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-yellow-900">{daycare.name}</p>
                        <p className="text-yellow-700 text-sm">{daycare.address}</p>
                        <p className="text-yellow-600 text-sm">Distance: {daycare.distance} miles</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className={`font-medium ${daycare.licensed ? 'text-green-600' : 'text-red-600'}`}>
                          {daycare.licensed ? 'Licensed' : 'Unlicensed'}
                        </p>
                        <p className="text-gray-600">Capacity: {daycare.capacity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Housing Eligibility */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {verificationResult.housingEligibility.eligible ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold">Housing Eligibility</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  verificationResult.housingEligibility.eligible
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {verificationResult.housingEligibility.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                </span>
              </div>

              {verificationResult.housingEligibility.restrictions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-red-900 mb-2">Restrictions:</h4>
                  <ul className="space-y-1">
                    {verificationResult.housingEligibility.restrictions.map((restriction, index) => (
                      <li key={index} className="text-red-700 text-sm flex items-center gap-2">
                        <XCircleIcon className="w-4 h-4" />
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {verificationResult.housingEligibility.notes.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes:</h4>
                  <ul className="space-y-1">
                    {verificationResult.housingEligibility.notes.map((note, index) => (
                      <li key={index} className="text-gray-700 text-sm flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setStep('input')
                  setVerificationResult(null)
                  setAddress('')
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Check Another Address
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Print Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
