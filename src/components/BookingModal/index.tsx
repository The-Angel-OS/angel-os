'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, MapPin, Video, Phone, User } from 'lucide-react'
import type { Product } from '@/payload-types'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bookingData: BookingData) => void
  product: Product
  isLoading?: boolean
}

interface BookingData {
  startTime: string
  endTime: string
  timezone: string
  meetingType: 'video_call' | 'phone_call' | 'in_person'
  notes?: string
}

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

const meetingTypes = [
  {
    type: 'video_call' as const,
    label: 'Video Call',
    icon: Video,
    description: 'Meet via Zoom, Teams, or Google Meet'
  },
  {
    type: 'phone_call' as const,
    label: 'Phone Call',
    icon: Phone,
    description: 'Traditional phone conversation'
  },
  {
    type: 'in_person' as const,
    label: 'In Person',
    icon: User,
    description: 'Meet at our location'
  }
]

export function BookingModal({ isOpen, onClose, onSubmit, product, isLoading = false }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedMeetingType, setSelectedMeetingType] = useState<'video_call' | 'phone_call' | 'in_person'>('video_call')
  const [notes, setNotes] = useState('')

  const duration = product.serviceDetails?.duration || 60
  const price = product.pricing.salePrice || product.pricing.basePrice

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time')
      return
    }

    const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`)
    const endDateTime = new Date(startDateTime)
    endDateTime.setMinutes(endDateTime.getMinutes() + duration)

    const bookingData: BookingData = {
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      meetingType: selectedMeetingType,
      notes: notes.trim() || undefined
    }

    onSubmit(bookingData)
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 90) // 3 months ahead
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Book Appointment: {product.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{product.serviceDetails?.location || 'Location TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  {product.serviceDetails?.bookingRequired ? 'Confirmation Required' : 'Instant Booking'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-date" className="block text-sm font-medium mb-2">
                    Preferred Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getTomorrowDate()}
                    max={getMaxDate()}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="booking-time" className="block text-sm font-medium mb-2">
                    Preferred Time
                  </label>
                  <select
                    id="booking-time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meeting Type */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {meetingTypes.map(({ type, label, icon: Icon, description }) => (
                <label
                  key={type}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMeetingType === type
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="meetingType"
                    value={type}
                    checked={selectedMeetingType === type}
                    onChange={(e) => setSelectedMeetingType(e.target.value as typeof type)}
                    className="sr-only"
                  />
                  <Icon className="h-5 w-5 mr-3 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedMeetingType === type
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  />
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="block text-sm font-medium mb-2">
                Special Requests or Questions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific requirements, questions, or additional context for your appointment?"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Confirmation Summary */}
          {selectedDate && selectedTime && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <strong>Service:</strong> {product.title}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div>
                  <strong>Time:</strong> {selectedTime} ({duration} minutes)
                </div>
                <div>
                  <strong>Meeting Type:</strong> {meetingTypes.find(m => m.type === selectedMeetingType)?.label}
                </div>
                <div>
                  <strong>Total:</strong> ${price.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedDate || !selectedTime}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
