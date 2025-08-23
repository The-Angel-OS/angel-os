"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { useProducts } from "@/hooks/usePayloadCollection"
import { TrendingUp, TrendingDown, Eye, Edit, Trash2, Star } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Product type interface based on Payload schema
interface Product {
  id: string
  title: string
  slug: string
  description?: string
  sku?: string
  status: 'draft' | 'active' | 'archived' | 'out_of_stock'
  pricing?: {
    basePrice: number
    salePrice?: number
    currency: string
  }
  inventory?: {
    trackQuantity: boolean
    quantity?: number
    lowStockThreshold?: number
  }
  productType: string
  categories?: Array<{ id: string; name: string }>
  gallery?: Array<{ image: { url: string; alt: string } }>
  featured: boolean
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Products"
  }, [])

  // Fetch products data from Payload CMS
  const { data: products, loading, error, refresh } = useProducts({
    limit: 20,
    sort: '-updatedAt',
  })

  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: 'title',
      header: 'Product Name',
      cell: (value: string, row: Product) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={row.gallery?.[0]?.image?.url || "/placeholder.svg"} 
              alt={row.gallery?.[0]?.image?.alt || row.title} 
            />
            <AvatarFallback>{row.title.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/dashboard/products/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            {row.description && (
              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    createColumn.currency('pricing.basePrice', 'Price'),
    {
      accessorKey: 'categories',
      header: 'Categories',
      cell: (value: Product['categories']) => {
        if (!value || value.length === 0) return <span className="text-muted-foreground">-</span>
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((category) => (
              <Badge key={category.id} variant="outline" className="text-xs">
                {category.name}
              </Badge>
            ))}
            {value.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{value.length - 2}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'inventory.quantity',
      header: 'Stock',
      cell: (value: number, row: Product) => {
        if (!row.inventory?.trackQuantity) {
          return <span className="text-muted-foreground">Not tracked</span>
        }
        const quantity = value || 0
        const threshold = row.inventory?.lowStockThreshold || 5
        return (
          <div className="flex items-center space-x-2">
            <span className={quantity <= threshold ? 'text-red-600 font-medium' : ''}>
              {quantity}
            </span>
            {quantity <= threshold && quantity > 0 && (
              <Badge variant="destructive" className="text-xs">Low</Badge>
            )}
            {quantity === 0 && (
              <Badge variant="destructive" className="text-xs">Out</Badge>
            )}
          </div>
        )
      },
    },
    createColumn.text('sku', 'SKU', { className: 'font-mono text-sm' }),
    createColumn.badge('status', 'Status', {
      draft: { variant: 'secondary', label: 'Draft' },
      active: { variant: 'default', label: 'Active' },
      archived: { variant: 'secondary', label: 'Archived' },
      out_of_stock: { variant: 'destructive', label: 'Out of Stock' },
    }),
    {
      accessorKey: 'featured',
      header: 'Featured',
      cell: (value: boolean) => (
        value ? (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    createColumn.date('updatedAt', 'Updated'),
  ]

  // Define actions for each row
  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (product: Product) => {
        window.location.href = `/dashboard/products/${product.id}`
      },
    },
    {
      label: 'Edit Product',
      icon: <Edit className="h-4 w-4" />,
      onClick: (product: Product) => {
        window.location.href = `/dashboard/products/${product.id}/edit`
      },
    },
    {
      label: 'Delete Product',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (product: Product) => {
        if (confirm(`Are you sure you want to delete "${product.title}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete product:', product.id)
        }
      },
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Active products
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
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => 
                  p.inventory?.trackQuantity && 
                  (p.inventory?.quantity || 0) <= (p.inventory?.lowStockThreshold || 5)
                ).length}
              </div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                Need attention
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
              <CardTitle className="text-sm font-medium">Featured Products</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.featured).length}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Homepage featured
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
              <CardTitle className="text-sm font-medium">Draft Products</CardTitle>
              <TrendingDown className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.status === 'draft').length}
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                Awaiting publish
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Products DataTable */}
      <DataTable
        data={products}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search products..."
        addButton={{
          label: "Add Product",
          href: "/dashboard/products/add"
        }}
        exportButton={true}
        className="mt-6"
      />
    </div>
  )
}
