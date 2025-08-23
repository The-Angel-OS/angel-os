"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { FeedbackSystem } from "@/components/ui/feedback-system"
import { ArrowLeft, Edit, Share, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, Package, DollarSign, Truck, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useParams } from "next/navigation"
import { usePayloadDocument } from "@/hooks/usePayloadCollection"

interface Product {
  id: string
  title: string
  description?: string
  sku?: string
  status: 'draft' | 'active' | 'archived' | 'out_of_stock'
  productType: string
  pricing: {
    basePrice: number
    salePrice?: number
    compareAtPrice?: number
    currency: string
  }
  inventory: {
    trackQuantity: boolean
    quantity: number
    lowStockThreshold: number
    allowBackorder: boolean
  }
  gallery?: Array<{
    image: {
      id: string
      url: string
      alt?: string
    }
    alt: string
    caption?: string
  }>
  details?: {
    weight?: number
    dimensions?: {
      length?: number
      width?: number
      height?: number
      unit: string
    }
  }
  categories?: Array<{
    id: string
    name: string
  }>
  tags?: Array<{
    tag: string
  }>
  tenant: {
    id: string
    name: string
  }
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

const productImages = [
  "/hoodie-front-view.png",
  "/hoodie-back-view.png",
  "/hoodie-side-view.png",
  "/hoodie-detail.png",
]

const reviews = [
  {
    id: 1,
    user: "Mark P.",
    avatar: "/diverse-user-avatars.png",
    rating: 3.2,
    date: "6 days ago",
    title: "Decent but could be better",
    content: "The product is okay, but I expected more for the price. A few minor flaws, but overall, it's acceptable.",
  },
  {
    id: 2,
    user: "Jessica K.",
    avatar: "/female-user-avatar.png",
    rating: 3.2,
    date: "2 weeks ago",
    title: "Beautiful design",
    content:
      "I love the sleek design and the ease of use. Haven't come across such a stylish product in a long time. Highly satisfied!",
  },
  {
    id: 3,
    user: "Michael B.",
    avatar: "/male-user-avatar.png",
    rating: 3.2,
    date: "4 days ago",
    title: "Satisfied with my purchase",
    content:
      "I'm really happy with this purchase. The quality is great, and it works just as described. No complaints so far!",
  },
]

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  // Use Payload's native API via our hook
  const { data: product, loading, error, refresh } = usePayloadDocument<Product>(
    'products',
    productId,
    { depth: 2 } // Need depth=2 for gallery images and categories - overrides defaultPopulate
  )
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState("green")
  const [selectedSize, setSelectedSize] = useState("MD")

  // Get product images from gallery or fallback to placeholder
  const productImages = product?.gallery?.map(item => item.image.url) || [
    "/hoodie-front-view.png",
    "/hoodie-back-view.png", 
    "/hoodie-side-view.png",
    "/hoodie-detail.png",
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard/products">Return to Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No product found
  if (!product) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested product could not be found.</p>
            <Button asChild>
              <Link href="/dashboard/products">Return to Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format price
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  // Get current price (sale price if available, otherwise base price)
  const currentPrice = product.pricing.salePrice || product.pricing.basePrice
  const isOnSale = !!product.pricing.salePrice

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={refresh}>
            <Share className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Images */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                  <img
                    src={productImages[currentImageIndex] || "/placeholder.svg"}
                    alt="Product"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2 mt-4">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? "border-primary" : "border-muted"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Details */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{product.title}</h1>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    product.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span>Tenant: {product.tenant.name}</span>
                  {product.publishedAt && (
                    <span>Published: {new Date(product.publishedAt).toLocaleDateString()}</span>
                  )}
                  {product.sku && <span>SKU: {product.sku}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatPrice(currentPrice, product.pricing.currency)}
                    {isOnSale && (
                      <div className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.pricing.basePrice, product.pricing.currency)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isOnSale ? 'Sale Price' : 'Price'}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">-</div>
                  <div className="text-sm text-muted-foreground">No. of Orders</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">
                    {product.inventory.trackQuantity ? product.inventory.quantity : '∞'}
                  </div>
                  <div className="text-sm text-muted-foreground">Available Stock</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">-</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>

              <Separator />

              {product.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Product Type:</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {product.productType.replace(/_/g, ' ')}
                </p>
              </div>

              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-muted rounded-md text-sm">
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Colors:</h3>
                <div className="flex space-x-2">
                  {["green", "blue", "purple"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? "border-primary" : "border-muted"
                      } ${
                        color === 'green' ? 'bg-green-500' :
                        color === 'blue' ? 'bg-blue-500' :
                        color === 'purple' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}
                      aria-label={`Select ${color} color`}
                      title={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Sizes:</h3>
                <div className="flex space-x-2">
                  {["SM", "MD", "LG", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 text-sm border rounded ${
                        selectedSize === size ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Info Sidebar */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {product.categories && product.categories.length > 0 && product.categories[0] && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold">{product.categories[0].name}</div>
                  <div className="text-sm text-muted-foreground">Category</div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold capitalize">
                  {product.productType.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-muted-foreground">Type</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold">
                  {product.pricing.currency}
                </div>
                <div className="text-sm text-muted-foreground">Currency</div>
              </CardContent>
            </Card>
          </div>

          {product.details?.weight && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold">{product.details.weight} lbs</div>
                <div className="text-sm text-muted-foreground">Weight</div>
              </CardContent>
            </Card>
          )}

          {product.details?.dimensions && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-center">Dimensions</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {product.details.dimensions.length && (
                    <div className="text-center">
                      <div className="font-medium">{product.details.dimensions.length}</div>
                      <div className="text-muted-foreground">Length</div>
                    </div>
                  )}
                  {product.details.dimensions.width && (
                    <div className="text-center">
                      <div className="font-medium">{product.details.dimensions.width}</div>
                      <div className="text-muted-foreground">Width</div>
                    </div>
                  )}
                  {product.details.dimensions.height && (
                    <div className="text-center">
                      <div className="font-medium">{product.details.dimensions.height}</div>
                      <div className="text-muted-foreground">Height</div>
                    </div>
                  )}
                </div>
                <div className="text-center text-xs text-muted-foreground mt-2">
                  All measurements in {product.details.dimensions.unit}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory Status */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 text-center">Inventory Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock Tracking:</span>
                  <span className="text-sm font-medium">
                    {product.inventory.trackQuantity ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {product.inventory.trackQuantity && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Stock:</span>
                      <span className="text-sm font-medium">{product.inventory.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Low Stock Alert:</span>
                      <span className="text-sm font-medium">{product.inventory.lowStockThreshold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Backorder:</span>
                      <span className="text-sm font-medium">
                        {product.inventory.allowBackorder ? 'Allowed' : 'Not Allowed'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Reviews</CardTitle>
          </div>
          <Button variant="outline" size="sm">
            <Star className="mr-2 h-4 w-4" />
            Submit Review
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">4.3</div>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">(12 reviews)</div>
              </div>
            </div>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="w-2">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className={`bg-yellow-400 h-2 rounded-full ${
                        rating === 5 ? 'w-[70%]' :
                        rating === 4 ? 'w-[20%]' :
                        rating === 3 ? 'w-[7%]' :
                        rating === 2 ? 'w-[4%]' :
                        'w-[2%]'
                      }`}
                    ></div>
                  </div>
                  <span className="text-muted-foreground">
                    {rating === 5 ? "70%" : rating === 4 ? "20%" : rating === 3 ? "7%" : rating === 2 ? "4%" : "2%"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex space-x-4">
                <Avatar>
                  <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.user} />
                  <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.user}</span>
                      <div className="flex">
                        {[1, 2, 3].map((star) => (
                          <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{review.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{review.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback System */}
      <FeedbackSystem
        entityType="product"
        entityId={product.id}
        entityTitle={product.title}
        showRatings={true}
        showRecommendation={true}
        allowAnonymous={false}
        requireVerification={true}
        className="mt-6"
        onFeedbackSubmit={(feedback) => {
          console.log('New product feedback:', feedback)
          // You could show a success toast here
        }}
      />
    </div>
  )
}
