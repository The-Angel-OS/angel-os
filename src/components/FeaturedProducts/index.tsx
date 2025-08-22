import Link from 'next/link'
import { Media } from '@/components/Media'
import type { Product } from '@/payload-types'

interface FeaturedProductsProps {
  products: Product[]
  title?: string
  className?: string
  showViewAll?: boolean
}

interface FeaturedProductCardProps {
  product: Product
}

export function FeaturedProducts({
  products,
  title = 'Featured Products',
  className = '',
  showViewAll = true
}: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {showViewAll && (
            <Link
              href="/products?featured=true"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 group"
            >
              View All Featured
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>

        {showViewAll && products.length > 8 && (
          <div className="text-center mt-8">
            <Link
              href="/products?featured=true"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View All {products.length} Featured Products
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  // Get main image
  const mainImage = product.gallery && product.gallery.length > 0 ? product.gallery[0] : null

  // Calculate pricing
  const currentPrice = product.pricing.salePrice || product.pricing.basePrice
  const originalPrice = product.pricing.basePrice
  const isOnSale = !!product.pricing.salePrice
  const savingsPercent = isOnSale ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0

  // Check availability
  const isInStock = !product.inventory?.trackQuantity ||
    (product.inventory.quantity && product.inventory.quantity > 0) ||
    product.inventory?.allowBackorder

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <article className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {mainImage ? (
            <Media
              resource={mainImage.image}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              alt={mainImage.alt || product.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              ⭐ Featured
            </span>
            {isOnSale && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                -{savingsPercent}% OFF
              </span>
            )}
            {!isInStock && (
              <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
              View Details
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="mb-2">
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium capitalize">
              {product.productType.replace('_', ' ')}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${currentPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="text-xs">
              {isInStock ? (
                <span className="text-green-600 font-medium">✓ In Stock</span>
              ) : (
                <span className="text-red-600 font-medium">✗ Out of Stock</span>
              )}
            </div>
          </div>

          {/* Product type specific info */}
          {(['consultation', 'service', 'experience', 'course'].includes(product.productType)) && product.serviceDetails && (
            <div className="mt-2 text-xs text-gray-500">
              {product.serviceDetails.duration && (
                <span>⏱️ {Math.floor(product.serviceDetails.duration / 60)}h {product.serviceDetails.duration % 60}m</span>
              )}
              {product.serviceDetails.location && (
                <span className="ml-2">📍 {product.serviceDetails.location}</span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
