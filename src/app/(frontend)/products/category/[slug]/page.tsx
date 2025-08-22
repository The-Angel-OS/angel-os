import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductFilters } from '@/components/ProductFilters'
import { Pagination } from '@/components/Pagination'
import RichText from '@/components/RichText'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    search?: string
    price_min?: string
    price_max?: string
    type?: string
    page?: string
    sort?: string
    in_stock?: string
    subcategory?: string
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const payload = await getPayload({ config })

  try {
    // Find the category
    const categories = await payload.find({
      collection: 'categories',
      where: {
        slug: { equals: slug },
        // isActive removed - not available on Category type
      },
      depth: 2,
      limit: 1,
    })

    const category = categories.docs[0]

    if (!category) {
      notFound()
    }

    // Build product query
    const where: any = {
      status: { equals: 'published' },
      categories: { contains: category.id },
    }

    // Additional filters from search params
    if (searchParamsResolved.search) {
      where.or = [
        { title: { contains: searchParamsResolved.search } },
        { description: { contains: searchParamsResolved.search } },
        { 'tags.tag': { contains: searchParamsResolved.search } },
        { sku: { contains: searchParamsResolved.search } },
      ]
    }

    if (searchParamsResolved.price_min || searchParamsResolved.price_max) {
      where['pricing.basePrice'] = {}
      if (searchParamsResolved.price_min) {
        where['pricing.basePrice'].greater_than_equal = parseFloat(searchParamsResolved.price_min)
      }
      if (searchParamsResolved.price_max) {
        where['pricing.basePrice'].less_than_equal = parseFloat(searchParamsResolved.price_max)
      }
    }

    if (searchParamsResolved.type) {
      where.productType = { equals: searchParamsResolved.type }
    }

    // Stock filter
    if (searchParamsResolved.in_stock === 'true') {
      where.or = [
        { 'inventory.trackQuantity': { equals: false } },
        {
          and: [
            { 'inventory.trackQuantity': { equals: true } },
            { 'inventory.quantity': { greater_than: 0 } }
          ]
        },
        {
          and: [
            { 'inventory.trackQuantity': { equals: true } },
            { 'inventory.quantity': { equals: 0 } },
            { 'inventory.allowBackorder': { equals: true } }
          ]
        }
      ]
    }

    // Subcategory filter
    if (searchParamsResolved.subcategory) {
      where.categories = { in: [category.id, searchParamsResolved.subcategory] }
    }

    const page = parseInt(searchParamsResolved.page || '1')
    const limit = 12 // Default products per page

    // Sort options - use category default or user selection
    const sortMap = {
      'price_asc': 'pricing.basePrice',
      'price_desc': '-pricing.basePrice',
      'newest': '-createdAt',
      'name': 'title',
      'featured': '-featured',
      'sku': 'sku',
    }
    const defaultSort = 'featured' // Default sort option
    const sort = sortMap[searchParamsResolved.sort as keyof typeof sortMap] || sortMap[defaultSort as keyof typeof sortMap] || '-featured'

    // Fetch products in this category
    const products = await payload.find({
      collection: 'products',
      where,
      sort,
      limit,
      page,
      depth: 2,
    })

    // Get subcategories
    const subcategories = await payload.find({
      collection: 'categories',
      where: {
        parent: { equals: category.id },
        // isActive removed - not available on Category type
      },
      sort: 'name', // displayOrder changed to name
    })

    // Get product types for this category
    const categoryProducts = await payload.find({
      collection: 'products',
      where: {
        categories: { contains: category.id },
        status: { equals: 'published' },
      },
      select: { productType: true },
      limit: 1000,
    })

    const uniqueProductTypes = Array.from(
      new Set(categoryProducts.docs.map(p => p.productType))
    ).sort()

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/products" className="hover:text-blue-600 transition-colors">
              Products
            </Link>
            {category.parent && typeof category.parent === 'object' && (
              <>
                <span>›</span>
                <Link
                  href={`/products/category/${category.parent.slug}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {category.parent.name}
                </Link>
              </>
            )}
            <span>›</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

          <div className="flex items-start gap-6">
            {/* Category image removed - not available on Category type */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{category.name}</h1>
                {/* Featured badge removed - not available on Category type */}
              </div>

              {category.description && (
                <p className="text-gray-600 text-lg mb-4 leading-relaxed">{category.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  {products.totalDocs} products
                </span>
                {/* Business type removed - not available on Category type */}
                {subcategories.totalDocs > 0 && (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {subcategories.totalDocs} subcategories
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rich Content Description - removed as not available on Category type */}

        {/* Subcategories */}
        {subcategories.docs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {subcategories.docs.map((subcat) => (
                <Link
                  key={subcat.id}
                  href={`/products/category/${subcat.slug}`}
                  className="group text-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Subcategory image removed - not available on Category type */}
                  <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                    {subcat.name}
                  </h3>
                  {/* Product count removed - not available on Category type */}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80">
            <ProductFilters
              categories={subcategories.docs}
              productTypes={uniqueProductTypes}
              searchParams={searchParamsResolved}
              totalResults={products.totalDocs}
              categorySlug={slug}
            />
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {products.docs.length > 0 ? (
              <>
                {/* Results header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">
                      {searchParamsResolved.search
                        ? `Search results in ${category.name}`
                        : `${category.name} Products`
                      }
                    </h2>

                    <span className="text-gray-500 text-sm">
                      {((page - 1) * limit) + 1}-{Math.min(page * limit, products.totalDocs)} of {products.totalDocs}
                    </span>
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm text-gray-600 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      name="sort"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={searchParamsResolved.sort || defaultSort}
                    >
                      <option value="featured">Featured</option>
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                      <option value="sku">SKU</option>
                    </select>
                  </div>
                </div>

                {/* Active filters display */}
                {(searchParamsResolved.search || searchParamsResolved.type || searchParamsResolved.price_min || searchParamsResolved.price_max || searchParamsResolved.in_stock || searchParamsResolved.subcategory) && (
                  <div className="flex items-center gap-2 text-sm mb-6">
                    <span className="text-gray-500">Active filters:</span>
                    <div className="flex flex-wrap gap-2">
                      {searchParamsResolved.search && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Search: {searchParamsResolved.search}
                        </span>
                      )}
                      {searchParamsResolved.type && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Type: {searchParamsResolved.type}
                        </span>
                      )}
                      {(searchParamsResolved.price_min || searchParamsResolved.price_max) && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Price: ${searchParamsResolved.price_min || '0'} - ${searchParamsResolved.price_max || '∞'}
                        </span>
                      )}
                      {searchParamsResolved.in_stock === 'true' && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          In stock only
                        </span>
                      )}
                      {searchParamsResolved.subcategory && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          Subcategory filter
                        </span>
                      )}

                      {/* Clear filters link */}
                      <Link
                        href={`/products/category/${slug}`}
                        className="text-xs text-red-600 hover:text-red-800 ml-2"
                      >
                        Clear all filters
                      </Link>
                    </div>
                  </div>
                )}

                {/* Product Grid */}
                <ProductGrid products={products.docs} />

                {/* Pagination */}
                <div className="mt-12">
                  <Pagination
                    page={products.page || 1}
                    totalPages={products.totalPages || 1}
                  />
                </div>
              </>
            ) : (
              /* No results state */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a2 2 0 00-2-2H7a2 2 0 00-2 2v1m14 0H5m11 1L9 19l-2-2" />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {searchParamsResolved.search ? 'No products found' : 'No products in this category'}
                  </h2>

                  <p className="text-gray-600 mb-6">
                    {searchParamsResolved.search
                      ? `We couldn&apos;t find any products in ${category.name} matching your search.`
                      : `There are no products in ${category.name} at this time.`
                    }
                  </p>

                  <div className="space-y-4">
                    {/* Clear filters or browse other categories */}
                    {(searchParamsResolved.search || searchParamsResolved.type || searchParamsResolved.price_min || searchParamsResolved.price_max) && (
                      <Link
                        href={`/products/category/${slug}`}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear Filters
                      </Link>
                    )}

                    <div className="text-sm text-gray-500">
                      <Link
                        href="/products"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Browse all products
                      </Link>
                      {subcategories.docs.length > 0 && (
                        <span>
                          {' '}or try a subcategory:
                          <div className="flex flex-wrap gap-2 mt-2 justify-center">
                            {subcategories.docs.slice(0, 3).map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/products/category/${subcat.slug}`}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                              >
                                {subcat.name}
                              </Link>
                            ))}
                          </div>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading category:', error)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Category not found
          </h1>
          <p className="text-gray-600 mb-6">
            The category you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    )
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })

  try {
    const categories = await payload.find({
      collection: 'categories',
      where: {
        slug: { equals: slug },
        // isActive removed - not available on Category type
      },
      limit: 1,
    })

    const category = categories.docs[0]

    if (!category) {
      return {
        title: 'Category Not Found',
        description: 'The category you are looking for does not exist.',
      }
    }

    // Get category image for open graph - meta and image properties not available on Category type
    const imageUrl = null

    return {
      title: `${category.name} - Products`,
      description: category.description || `Browse ${category.name} products`,
      // keywords removed - meta property not available on Category type
      openGraph: {
        title: category.name,
        description: category.description || '',
        images: imageUrl ? [
          {
            url: imageUrl,
            alt: category.name,
          }
        ] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: category.name,
        description: category.description || '',
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    }
  }
}

// Generate static params for better performance
export async function generateStaticParams() {
  const payload = await getPayload({ config })

  try {
    const categories = await payload.find({
      collection: 'categories',
      where: {
        // isActive removed - not available on Category type
      },
      limit: 1000,
      select: {
        slug: true,
      },
    })

    return categories.docs.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    return []
  }
}
