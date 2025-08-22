import Link from 'next/link'
import { Product } from '@/payload-types'
import { Media } from '@/components/Media'

interface ProductGridProps {
  products: Product[]
  className?: string
}

export function ProductGrid({ products, className = '' }: ProductGridProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  // Get main image from gallery
  const mainImage = product.gallery && product.gallery.length > 0 ? product.gallery[0] : null

  // Calculate pricing
  const currentPrice = product.pricing.salePrice || product.pricing.basePrice
  const originalPrice = product.pricing.basePrice
  const isOnSale = !!product.pricing.salePrice
  const savings = isOnSale ? originalPrice - currentPrice : 0
  const savingsPercent = isOnSale ? Math.round((savings / originalPrice) * 100) : 0

  // Check availability
  const isInStock = !product.inventory?.trackQuantity ||
    (product.inventory.quantity && product.inventory.quantity > 0) ||
    product.inventory?.allowBackorder

  const stockLevel = product.inventory?.trackQuantity ? product.inventory.quantity : null
  const isLowStock = stockLevel !== null && typeof stockLevel === 'number' && stockLevel <= (product.inventory?.lowStockThreshold || 5)

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <article className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2 border border-gray-100 hover:border-blue-200 relative">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {mainImage ? (
            <>
              <Media
                resource={mainImage.image}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt={mainImage.alt || product.title}
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-400 font-medium">No Image</p>
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                ⭐ Featured
              </span>
            )}
            {isOnSale && (
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                🔥 -{savingsPercent}% OFF
              </span>
            )}
            {!isInStock && (
              <span className="bg-gray-800/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                Out of Stock
              </span>
            )}
            {isLowStock && isInStock && (
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                ⚡ Low Stock
              </span>
            )}
          </div>

          {/* Product Type Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold capitalize shadow-lg backdrop-blur-sm border border-blue-200">
              {product.productType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          {/* Title & Description */}
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-tight">
              {product.title}
            </h3>
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-2 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ${currentPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {isOnSale && (
              <p className="text-xs text-green-600 font-medium">
                Save ${savings.toFixed(2)} ({savingsPercent}% off)
              </p>
            )}
            {product.pricing.compareAtPrice && product.pricing.compareAtPrice > currentPrice && (
              <p className="text-xs text-gray-500">
                Compare at ${product.pricing.compareAtPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Service Details (if applicable) */}
          {product.serviceDetails && ['service', 'experience', 'consultation', 'course', 'business_service'].includes(product.productType) && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
              {product.serviceDetails.duration && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">{Math.floor(product.serviceDetails.duration / 60)}h {product.serviceDetails.duration % 60}m session</span>
                </div>
              )}
              {product.serviceDetails.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="truncate capitalize font-medium">{product.serviceDetails.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-4">
            {isInStock ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Available</span>
                {isLowStock && stockLevel !== null && (
                  <span className="text-orange-600 text-xs">({stockLevel} left)</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {product.categories.slice(0, 2).map((cat, index) => (
                  <span 
                    key={typeof cat === 'object' ? cat.id : cat}
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200"
                  >
                    {typeof cat === 'object' ? cat.name : ''}
                  </span>
                ))}
                {product.categories.length > 2 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    +{product.categories.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {product.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium"
                >
                  #{tag.tag}
                </span>
              ))}
              {product.tags.length > 2 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                  +{product.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Call to Action Hint */}
          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              {product.sku && (
                <div className="text-xs text-gray-400 font-mono">
                  SKU: {product.sku}
                </div>
              )}
              <div className="text-xs text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                View Details →
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
