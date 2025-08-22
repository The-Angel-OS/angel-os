"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Share, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState("green")
  const [selectedSize, setSelectedSize] = useState("MD")

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

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
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
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
                <h1 className="text-2xl font-bold mb-2">Acme Prism T-Shirt</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span>Seller: Poetic Fashion</span>
                  <span>Published: 20 Oct, 2024</span>
                  <span>SKU: WH000M14</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">$120.40</div>
                  <div className="text-sm text-muted-foreground">Price</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">250</div>
                  <div className="text-sm text-muted-foreground">No. of Orders</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">2,550</div>
                  <div className="text-sm text-muted-foreground">Available Stocks</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">$45,938</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Description:</h3>
                <p className="text-sm text-muted-foreground">
                  Tommy Hilfiger men striped pink sweatshirt. Crafted with cotton. Material composition is 100% organic
                  cotton.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Features:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Industry-leading noise cancellation</li>
                  <li>• 30-hour battery life</li>
                  <li>• Touch sensor controls</li>
                  <li>• Speak-to-chat technology</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Colors:</h3>
                <div className="flex space-x-2">
                  {["green", "blue", "purple"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? "border-primary" : "border-muted"
                      }`}
                      style={{ backgroundColor: color }}
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
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold">T-Shirt</div>
                <div className="text-sm text-muted-foreground">Category</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold">Tommy Hilfiger</div>
                <div className="text-sm text-muted-foreground">Brand</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold">Purple</div>
                <div className="text-sm text-muted-foreground">Color</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold">140 Gr</div>
              <div className="text-sm text-muted-foreground">Weight</div>
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
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : rating === 2 ? 4 : 2}%`,
                      }}
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
    </div>
  )
}
