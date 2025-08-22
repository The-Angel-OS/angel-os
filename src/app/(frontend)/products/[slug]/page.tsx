import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Product } from '@/payload-types'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { ProductDetails } from '@/components/ProductDetails'
import { ProductGallery } from '@/components/ProductGallery'
import { AddToCartButton } from '@/components/AddToCartButton'
import { RelatedProducts } from '@/components/RelatedProducts'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const products = await payload.find({
    collection: 'products',
    limit: 1000,
    where: {
      // Temporarily removed status filter due to database enum mismatch
      // TODO: Fix database enum to include: draft, active, archived, out_of_stock
    },
    select: {
      slug: true,
    },
  })

  return products.docs.map(({ slug }) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const product = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const doc = product.docs[0]

  if (!doc) {
    return {
      title: 'Product Not Found',
    }
  }

  const { meta } = doc

  const title = meta?.title || doc.title
  const description = meta?.description || doc.description

  return {
    title,
    description,
    openGraph: {
      title,
      description: description || undefined,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const products = await payload.find({
    collection: 'products',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  })

  const product = products.docs[0]

  if (!product) {
    notFound()
  }

  // Get current price
  const currentPrice = product.pricing?.salePrice || product.pricing?.basePrice || 0
  const comparePrice = product.pricing?.compareAtPrice || product.pricing?.basePrice || 0

  return (
    <article className="pb-24">
      {/* Hero Section */}
      {product.hero && <RenderHero {...product.hero} />}

      <div className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div>
            {product.gallery && product.gallery.length > 0 && (
              <ProductGallery images={product.gallery} productTitle={product.title} />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              {product.description && (
                <p className="text-lg text-gray-600">{product.description}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold">
                ${currentPrice.toFixed(2)}
              </span>
              {comparePrice > currentPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${comparePrice.toFixed(2)}
                </span>
              )}
              {product.pricing?.currency && product.pricing.currency !== 'USD' && (
                <span className="text-sm text-gray-500">{product.pricing.currency}</span>
              )}
            </div>

            {/* Product Details */}
            <ProductDetails product={product} />

            {/* Add to Cart */}
            <div className="border-t pt-6">
              <AddToCartButton
                product={product}
                isInStock={product.status !== 'out_of_stock'}
              />
              
              {product.inventory?.trackQuantity && product.inventory.quantity && product.inventory.quantity <= 5 && (
                <p className="text-sm text-orange-600 mt-2">
                  Only {product.inventory.quantity} left in stock!
                </p>
              )}
            </div>

            {/* Categories & Tags */}
            {(product.categories || product.tags) && (
              <div className="border-t pt-6 space-y-4">
                {product.categories && product.categories.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Categories:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <span
                          key={typeof category === 'object' ? category.id : category}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {typeof category === 'object' ? category.name : category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 rounded-full text-sm"
                        >
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Blocks */}
        {product.layout && product.layout.length > 0 && (
          <div className="mt-16">
            <RenderBlocks blocks={product.layout} />
          </div>
        )}

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <RelatedProducts products={product.relatedProducts.filter((p): p is Product => typeof p === 'object')} />
          </div>
        )}
      </div>
    </article>
  )
}