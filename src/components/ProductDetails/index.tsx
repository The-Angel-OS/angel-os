'use client'

import { useState } from 'react'
import { Product } from '@/payload-types'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState('details')

  const tabs = [
    { id: 'details', label: 'Details', count: null },
    { id: 'shipping', label: 'Shipping', count: null },
    { id: 'reviews', label: 'Reviews', count: null },
  ]

  // Filter out tabs that don't have content
  const availableTabs = tabs.filter(tab => {
    switch (tab.id) {
      case 'details':
        return true // Always show details
      case 'shipping':
        return product.shipping && (product.shipping.requiresShipping || product.shipping.freeShipping)
      case 'reviews':
        return false // TODO: Implement reviews system
      default:
        return false
    }
  })

  if (availableTabs.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Details */}
                <div className="space-y-3">
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-mono text-sm">{product.sku}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Type:</span>
                    <span className="capitalize">{product.productType.replace('_', ' ')}</span>
                  </div>

                  {product.categories && product.categories.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categories:</span>
                      <span className="text-right">
                        {product.categories.map((cat, index) => (
                          <span key={typeof cat === 'object' ? cat.id : cat}>
                            {index > 0 && ', '}
                            {typeof cat === 'object' ? cat.name : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tags:</span>
                      <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                          >
                            {tag.tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inventory Details */}
                <div className="space-y-3">
                  {product.inventory && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock Tracking:</span>
                        <span>{product.inventory.trackQuantity ? 'Enabled' : 'Disabled'}</span>
                      </div>

                      {product.inventory.trackQuantity && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quantity Available:</span>
                            <span className={`font-medium ${
                              product.inventory.quantity === 0 ? 'text-red-600' :
                              (product.inventory.quantity || 0) <= (product.inventory.lowStockThreshold || 5) ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {product.inventory.quantity || 0}
                            </span>
                          </div>

                          {product.inventory.lowStockThreshold && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Low Stock Threshold:</span>
                              <span>{product.inventory.lowStockThreshold}</span>
                            </div>
                          )}

                          <div className="flex justify-between">
                            <span className="text-gray-600">Allow Backorder:</span>
                            <span>{product.inventory.allowBackorder ? 'Yes' : 'No'}</span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Service Details */}
            {product.serviceDetails && ['service', 'experience', 'consultation', 'course'].includes(product.productType) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Service Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {product.serviceDetails.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span>{product.serviceDetails.duration} minutes</span>
                      </div>
                    )}

                    {product.serviceDetails.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="text-right max-w-xs">{product.serviceDetails.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {product.serviceDetails.maxParticipants && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Participants:</span>
                        <span>{product.serviceDetails.maxParticipants}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Required:</span>
                      <span>{product.serviceDetails.bookingRequired ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Digital Assets */}
            {product.digitalAssets && product.digitalAssets.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Digital Downloads</h3>
                <div className="space-y-2">
                  {product.digitalAssets.map((asset, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        {asset.description && (
                          <p className="text-sm text-gray-600">{asset.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shipping' && product.shipping && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requires Shipping:</span>
                    <span>{product.shipping.requiresShipping ? 'Yes' : 'No'}</span>
                  </div>

                  {product.shipping.requiresShipping && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free Shipping:</span>
                        <span className={product.shipping.freeShipping ? 'text-green-600 font-medium' : ''}>
                          {product.shipping.freeShipping ? 'Yes' : 'No'}
                        </span>
                      </div>


                    </>
                  )}
                </div>

                <div className="space-y-3">
                  {product.shipping.shippingClass && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping Class:</span>
                      <span className="capitalize">{product.shipping.shippingClass}</span>
                    </div>
                  )}
                </div>
              </div>

              {!product.shipping.freeShipping && product.shipping.requiresShipping && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Shipping costs will be calculated at checkout based on your location and selected shipping method.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
            <div className="text-center py-8">
              <p className="text-gray-600">Reviews feature coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
