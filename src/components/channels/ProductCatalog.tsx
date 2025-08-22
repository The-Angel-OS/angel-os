'use client'

import React, { useState } from 'react'
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { logBusiness } from '@/services/SystemMonitorService'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  status: 'active' | 'draft' | 'out-of-stock'
  image?: string
}

export default function ProductCatalog({ channelId }: { channelId: string }) {
  const [products] = useState<Product[]>([
    {
      id: 'PROD-001',
      name: 'Premium Subscription',
      price: 99.99,
      stock: 999,
      category: 'Services',
      status: 'active'
    },
    {
      id: 'PROD-002',
      name: 'Enterprise Package',
      price: 499.99,
      stock: 50,
      category: 'Services',
      status: 'active'
    },
    {
      id: 'PROD-003',
      name: 'Starter Kit',
      price: 29.99,
      stock: 0,
      category: 'Products',
      status: 'out-of-stock'
    },
    {
      id: 'PROD-004',
      name: 'Custom Integration',
      price: 1999.99,
      stock: 10,
      category: 'Services',
      status: 'draft'
    }
  ])

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'out-of-stock': return 'bg-red-500/20 text-red-400 border-red-500/50'
    }
  }

  const handleProductAction = (action: string, productId: string) => {
    logBusiness(`Product ${action}: ${productId}`, {
      action,
      productId,
      channel: channelId
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-gray-400" />
            <h1 className="text-xl font-bold text-white">#products</h1>
            <span className="text-sm text-gray-400">Product catalog management</span>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-900/30 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-white">156</p>
              </div>
              <Package className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-400">142</p>
              </div>
              <Eye className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Out of Stock</p>
                <p className="text-2xl font-bold text-red-400">8</p>
              </div>
              <Package className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-blue-400">$45.2k</p>
              </div>
              <Package className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">{product.id}</p>
                </div>
                <Badge className={getStatusColor(product.status)}>
                  {product.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="text-lg font-bold text-white">${product.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Stock</span>
                  <span className={cn(
                    "font-medium",
                    product.stock === 0 ? "text-red-400" : product.stock < 10 ? "text-yellow-400" : "text-green-400"
                  )}>
                    {product.stock} units
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Category</span>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 border-gray-600 hover:bg-gray-700"
                  onClick={() => handleProductAction('edit', product.id)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm"
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleProductAction('view', product.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </div>
  )
}
