'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Category } from '@/payload-types'

interface ProductFiltersProps {
  categories: Category[]
  productTypes: string[]
  searchParams: Record<string, string | undefined>
  totalResults: number
  categorySlug?: string
}

export function ProductFilters({
  categories,
  productTypes,
  searchParams,
  totalResults,
  categorySlug
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentSearchParams = useSearchParams()

  const [priceMin, setPriceMin] = useState(searchParams.price_min || '')
  const [priceMax, setPriceMax] = useState(searchParams.price_max || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '')

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(currentSearchParams.toString())

    // Update or remove parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    const queryString = params.toString()
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }

  const clearAllFilters = () => {
    const baseUrl = categorySlug ? `/products/category/${categorySlug}` : '/products'
    router.push(baseUrl)
  }

  const hasActiveFilters = searchParams.search ||
                          searchParams.type ||
                          searchParams.price_min ||
                          searchParams.price_max ||
                          searchParams.in_stock ||
                          searchParams.featured ||
                          searchParams.subcategory

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-2">
            Search Products
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilters({ search: searchQuery })
                }
              }}
              placeholder="Search by name, description, SKU..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              title="Search"
              onClick={() => updateFilters({ search: searchQuery })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories (only show if not on a category page or show subcategories) */}
        {categories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">
              {categorySlug ? 'Subcategories' : 'Categories'}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchParams.category === String(category.id) || searchParams.subcategory === String(category.id)}
                    onChange={(e) => {
                      const paramKey = categorySlug ? 'subcategory' : 'category'
                      updateFilters({
                        [paramKey]: e.target.checked ? String(category.id) : undefined
                      })
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex-1">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Product Types */}
        {productTypes.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Product Type</h3>
            <div className="space-y-2">
              {productTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchParams.type === type}
                    onChange={(e) => {
                      updateFilters({
                        type: e.target.checked ? type : undefined
                      })
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-medium mb-3">Price Range</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => updateFilters({
                price_min: priceMin,
                price_max: priceMax
              })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Apply Price Filter
            </button>
            {(searchParams.price_min || searchParams.price_max) && (
              <button
                onClick={() => {
                  setPriceMin('')
                  setPriceMax('')
                  updateFilters({ price_min: undefined, price_max: undefined })
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Price Filter
              </button>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <h3 className="text-sm font-medium mb-3">Availability</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchParams.in_stock === 'true'}
                onChange={(e) => {
                  updateFilters({
                    in_stock: e.target.checked ? 'true' : undefined
                  })
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                In Stock Only
              </span>
            </label>
          </div>
        </div>

        {/* Featured */}
        <div>
          <h3 className="text-sm font-medium mb-3">Special</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchParams.featured === 'true'}
                onChange={(e) => {
                  updateFilters({
                    featured: e.target.checked ? 'true' : undefined
                  })
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Featured Products
              </span>
            </label>
          </div>
        </div>

        {/* Results Summary */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>
                <strong>{totalResults}</strong> products found
              </span>
            </div>
            {hasActiveFilters && (
              <p className="text-xs text-blue-600">
                Filters are active
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
