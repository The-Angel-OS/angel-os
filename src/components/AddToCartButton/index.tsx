'use client'

import React, { useState } from 'react'
import { Product } from '@/payload-types'
import { BookingModal } from '@/components/BookingModal'

interface AddToCartButtonProps {
  product: Product
  isInStock: boolean
  className?: string
  quantity?: number
  variant?: 'primary' | 'secondary'
}

export function AddToCartButton({
  product,
  isInStock,
  className = '',
  quantity = 1,
  variant = 'primary'
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(quantity)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleAddToCart = async () => {
    if (!isInStock || isAdding) return

    setIsAdding(true)

    try {
      // For service/booking products, show booking modal instead
      const isBookingRequired = ['service', 'experience', 'consultation', 'course'].includes(product.productType)

      if (isBookingRequired) {
        setShowBookingModal(true)
        setIsAdding(false)
        return
      }

      // Handle regular cart items (physical products)
      console.log('Adding to cart:', {
        productId: product.id,
        quantity: selectedQuantity,
        product: {
          title: product.title,
          slug: product.slug,
          price: product.pricing.salePrice || product.pricing.basePrice,
          image: product.gallery?.[0]?.image
        }
      })

      // TODO: Implement actual cart functionality for physical products
      await new Promise(resolve => setTimeout(resolve, 1000))

      setTimeout(() => {
        setIsAdding(false)
      }, 500)

    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAdding(false)
    }
  }

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      setIsAdding(true)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${product.title} - Appointment`,
          description: `Appointment for ${product.title} service`,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          timezone: bookingData.timezone || 'America/New_York',
          location: product.serviceDetails?.location || 'To be determined',
          meetingType: bookingData.meetingType || 'video_call',
          status: product.serviceDetails?.bookingRequired ? 'scheduled' : 'confirmed',
          bookingSettings: {
            allowReschedule: true,
            allowCancellation: true,
            requireConfirmation: !!product.serviceDetails?.bookingRequired,
          },
          payment: {
            required: true,
            amount: Math.round((product.pricing.salePrice || product.pricing.basePrice) * 100),
            currency: 'usd',
            paymentStatus: 'pending'
          }
        })
      })

      if (response.ok) {
        const appointment = await response.json()
        console.log('Appointment created:', appointment)
        setShowBookingModal(false)

        // Show success message or redirect to payment
        alert('Appointment booked successfully! Payment processing...')

        // TODO: Integrate with Stripe payment flow

      } else {
        throw new Error('Failed to create appointment')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to book appointment. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  const buttonBaseClasses = `
    flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
  `

  const buttonVariantClasses = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500'

  // For service/experience/consultation products, show different button text
  const isBookingRequired = ['service', 'experience', 'consultation', 'course'].includes(product.productType)

  const getButtonText = () => {
    if (isAdding) return 'Adding...'
    if (!isInStock) return 'Out of Stock'
    if (isBookingRequired) return 'Book Now'
    return 'Add to Cart'
  }

  const getButtonIcon = () => {
    if (isAdding) {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }

    if (!isInStock) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }

    if (isBookingRequired) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h.01M12 4v1m-6 7h12l-1 9H7l-1-9z" />
        </svg>
      )
    }

    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L3 3H1m6 6v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
      </svg>
    )
  }

  return (
    <div className="space-y-3">
      {/* Quantity Selector (for physical products only) */}
      {isInStock && !isBookingRequired && product.productType === 'physical' && (
        <div className="flex items-center gap-3">
          <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
            Quantity:
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              title="Decrease quantity"
              type="button"
              onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
              className="p-2 hover:bg-gray-50 transition-colors"
              disabled={selectedQuantity <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.inventory?.trackQuantity ? (product.inventory.quantity || 99) : 99}
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border-0 focus:ring-0 py-2"
            />
            <button
              title="Increase quantity"
              type="button"
              onClick={() => {
                const maxQty = product.inventory?.trackQuantity ? product.inventory.quantity : 99
                setSelectedQuantity(Math.min(maxQty || 99, selectedQuantity + 1))
              }}
              className="p-2 hover:bg-gray-50 transition-colors"
              disabled={!!(product.inventory?.trackQuantity && selectedQuantity >= (product.inventory.quantity || 0))}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!isInStock || isAdding}
        className={`${buttonBaseClasses} ${buttonVariantClasses} ${className}`}
      >
        {getButtonIcon()}
        <span>{getButtonText()}</span>
      </button>

      {/* Additional Info */}
      {isBookingRequired && isInStock && (
        <p className="text-xs text-gray-600">
          {product.serviceDetails?.bookingRequired
            ? 'Booking confirmation required after purchase'
            : 'Instant booking available'
          }
        </p>
      )}

      {/* Low stock warning */}
      {isInStock && product.inventory?.trackQuantity && (
        product.inventory.quantity && product.inventory.quantity <= (product.inventory.lowStockThreshold || 5)
      ) && (
        <p className="text-xs text-orange-600 font-medium">
          Only {product.inventory.quantity} left in stock!
        </p>
      )}

      {/* Backorder info */}
      {!isInStock && product.inventory?.allowBackorder && (
        <div className="text-xs text-gray-600">
          <p className="font-medium text-orange-600 mb-1">Available for Backorder</p>
          <p>This item is currently out of stock but can be backordered. You will be charged when the item ships.</p>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSubmit={handleBookingSubmit}
        product={product}
        isLoading={isAdding}
      />
    </div>
  )
}
