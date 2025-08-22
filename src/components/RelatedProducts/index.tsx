import Link from 'next/link'
import { Product } from '@/payload-types'
import { Media } from '@/components/Media'

interface RelatedProductsProps {
  products: Product[]
  title?: string
  className?: string
}

export function RelatedProducts({
  products,
  title = 'Related Products',
  className = ''
}: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <RelatedProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

interface RelatedProductCardProps {
  product: Product
}

function RelatedProductCard({ product }: RelatedProductCardProps) {
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
      <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {mainImage ? (
            <Media
              resource={mainImage.image}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              alt={mainImage.alt || product.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
            {isOnSale && (
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                -{savingsPercent}%
              </span>
            )}
            {!isInStock && (
              <span className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-medium">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">
                ${currentPrice.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.pricing.compareAtPrice && product.pricing.compareAtPrice > currentPrice && (
              <p className="text-xs text-gray-500">
                Compare at ${product.pricing.compareAtPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Product Type Badge */}
          <div className="mt-3">
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium capitalize">
              {product.productType.replace('_', ' ')}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mt-2 text-xs">
            {isInStock ? (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Out of Stock</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
