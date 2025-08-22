"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, Plus, X } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

export default function AddProductPage() {
  const [variants, setVariants] = useState([
    { option: "", value: "", price: "" },
    { option: "", value: "", price: "" },
  ])

  const addVariant = () => {
    setVariants([...variants, { option: "", value: "", price: "" }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
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
          <h2 className="text-3xl font-bold tracking-tight">Add Products</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Discard</Button>
          <Button variant="outline">Save Draft</Button>
          <Button>Publish</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Product Details */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter product name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="Enter SKU" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" placeholder="Enter barcode" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" placeholder="Enter product description" className="min-h-[100px]" />
                <p className="text-sm text-muted-foreground">Set a description to the product for better visibility.</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Drop your images here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
                <Button variant="outline" className="mt-4 bg-transparent">
                  Select Images
                </Button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" size="sm">
                  Add media from URL
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground">
                <div>Options</div>
                <div>Value</div>
                <div>Price</div>
              </div>

              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Enter value" />
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Enter price" />
                    {variants.length > 2 && (
                      <Button variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addVariant} className="w-full bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base-price">Base Price</Label>
                <Input id="base-price" placeholder="Enter price" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discounted-price">Discounted Price</Label>
                <Input id="discounted-price" placeholder="Enter discounted price" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="charge-tax" />
                <Label htmlFor="charge-tax" className="text-sm">
                  Charge tax on this product
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="in-stock" defaultChecked />
                <Label htmlFor="in-stock" className="text-sm">
                  In stock
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Draft" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">Set the product status.</p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sub category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptops">Laptops</SelectItem>
                  <SelectItem value="smartphones">Smartphones</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
