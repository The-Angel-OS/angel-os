"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Search, Filter, MoreHorizontal, Plus, Star, Columns } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const products = [
  {
    id: 1,
    name: "HP Pavilion 15.6 inch Gaming Laptop",
    image: "/modern-laptop-workspace.png",
    price: "$960.99",
    category: "Electronics",
    stock: 8,
    sku: "HPGM001A",
    rating: 4.5,
    status: "Active",
  },
  {
    id: 2,
    name: "Samsung SM-A715 Galaxy A71S",
    image: "/modern-smartphone.png",
    price: "$350",
    category: "Electronics",
    stock: 25,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Active",
  },
  {
    id: 3,
    name: "Schwarzer KH5105 513 Bügeleisenhörer",
    image: "/diverse-people-listening-headphones.png",
    price: "$300",
    category: "Electronics",
    stock: 27,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Ultimate Ears Wonderboom Bluetooth Speaker",
    image: "/audio-speaker.png",
    price: "$119.99",
    category: "Electronics",
    stock: 10,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Active",
  },
  {
    id: 5,
    name: "Canon Pixma TS3350 Multifunction Printer",
    image: "/office-printer.png",
    price: "$439.50",
    category: "Electronics",
    stock: 25,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: 6,
    name: "Canon 4000D 18-55 MM II (Canon Eurasia Guaranteed)",
    image: "/vintage-camera-still-life.png",
    price: "$49.50",
    category: "Beauty",
    stock: 25,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: 7,
    name: "Lokmak Lenovo Tab M10 TB-X605F",
    image: "/modern-tablet-display.png",
    price: "$49.50",
    category: "Beauty",
    stock: 25,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: 8,
    name: '2019 55" QLED QLED 4K Quantum HDR Smart TV',
    image: "/retro-living-room-tv.png",
    price: "$49.50",
    category: "Beauty",
    stock: 25,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: 9,
    name: "Toshiba Canvio Partner 1 TB Portable",
    image: "/internal-hard-drive.png",
    price: "$49.50",
    category: "Beauty",
    stock: 25,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Closed For Sale",
  },
  {
    id: 10,
    name: "Projection Laser Presentation Controller 2.4ghz RF-Q401",
    image: "/presenter.png",
    price: "$49.50",
    category: "Beauty",
    stock: 25,
    sku: "MYCPZ7F",
    rating: 4.65,
    status: "Closed For Sale",
  },
]

export default function ProductsPage() {
  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Products"
  }, [])

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$30,230</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +20.1% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Number of Sales</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">982</div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                -8.02% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affiliate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,530</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +3.1% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discounts</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,230</div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                -3.8% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search products..." className="pl-10 w-[300px]" />
              </div>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="beauty">Beauty</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Price: $100-$300" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100">$0 - $100</SelectItem>
                  <SelectItem value="100-300">$100 - $300</SelectItem>
                  <SelectItem value="300-500">$300 - $500</SelectItem>
                  <SelectItem value="500+">$500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Columns className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded" aria-label="Select all products" />
                </TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <input type="checkbox" className="rounded" aria-label={`Select product ${product.name}`} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={product.image || "/placeholder.svg"} alt={product.name} />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/dashboard/products/${product.id}`} className="font-medium hover:underline">
                          {product.name}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.price}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "Active"
                          ? "default"
                          : product.status === "Out of Stock"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}/edit`}>Edit Product</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete Product</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">0 of 12 row(s) selected.</div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
