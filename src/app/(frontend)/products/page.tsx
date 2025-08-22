import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductFilters } from '@/components/ProductFilters'
import { ProductGrid } from '@/components/ProductGrid'
import { FeaturedProducts } from '@/components/FeaturedProducts'

export const metadata: Metadata = {
  title: 'Products | Shop Our Collection',
  description: 'Browse our complete collection of products, services, and digital offerings.',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    type?: string
    sort?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 12

  const payload = await getPayload({ config })

  // Build where query
  const where: any = {
    // Temporarily removed status filter due to database enum mismatch
    // TODO: Fix database enum to include: draft, active, archived, out_of_stock
  }

  if (params.category) {
    where.categories = {
      contains: params.category,
    }
  }

  if (params.type) {
    where.productType = {
      equals: params.type,
    }
  }

  // Fetch products
  const products = await payload.find({
    collection: 'products',
    where,
    limit,
    page,
    sort: params.sort || '-createdAt',
    depth: 2,
  })

  // Fetch featured products
  const featuredProducts = await payload.find({
    collection: 'products',
    where: {
      ...where,
      featured: {
        equals: true,
      },
    },
    limit: 3,
    depth: 2,
  })

  // Fetch categories for filters
  const categories = await payload.find({
    collection: 'categories',
    limit: 50,
  })

  // Get unique product types for filters
  const allProducts = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    select: { productType: true },
    limit: 1000,
  })

  const uniqueProductTypes = Array.from(
    new Set(allProducts.docs.map(p => p.productType).filter(Boolean))
  ).sort()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Products</h1>
        <p className="text-lg text-gray-600">
          Discover our carefully curated selection of products and services
        </p>
      </div>

      {/* Featured Products */}
      {featuredProducts.docs.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
          <FeaturedProducts products={featuredProducts.docs} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilters
            categories={categories.docs}
            productTypes={uniqueProductTypes}
            searchParams={params}
            totalResults={products.totalDocs}
          />
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {products.docs.length > 0 ? (
            <>
              <ProductGrid products={products.docs} />
              
              {/* Pagination */}
              {products.totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...params,
                        page: String(page - 1),
                      })}`}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {page} of {products.totalPages}
                  </span>
                  
                  {page < products.totalPages && (
                    <Link
                      href={`/products?${new URLSearchParams({
                        ...params,
                        page: String(page + 1),
                      })}`}
                      className="px-4 py-2 border rounded hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">
                No products found matching your criteria
              </p>
              <Link
                href="/products"
                className="text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}