'use client'

import React, { useState } from 'react'
import { Package, Clock, CheckCircle, XCircle, DollarSign, Calendar } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { logBusiness } from '@/services/SystemMonitorService'

interface Order {
  id: string
  customer: string
  items: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: Date
}

export default function OrdersManager({ channelId }: { channelId: string }) {
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customer: 'Sarah Chen',
      items: 3,
      total: 299.99,
      status: 'pending',
      date: new Date()
    },
    {
      id: 'ORD-002',
      customer: 'John Doe',
      items: 1,
      total: 89.99,
      status: 'processing',
      date: new Date(Date.now() - 3600000)
    },
    {
      id: 'ORD-003',
      customer: 'Jane Smith',
      items: 5,
      total: 549.99,
      status: 'shipped',
      date: new Date(Date.now() - 86400000)
    }
  ])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'processing': return <Package className="w-4 h-4" />
      case 'shipped': return <Package className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
    }
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    logBusiness(`Order ${orderId} status changed to ${newStatus}`, {
      orderId,
      newStatus,
      channel: channelId
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-gray-400" />
          <h1 className="text-xl font-bold text-white">#orders</h1>
          <span className="text-sm text-gray-400">Order management</span>
          <Badge variant="destructive" className="ml-2">3 pending</Badge>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-900/30 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">156</div>
            <p className="text-xs text-green-400 mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">3</div>
            <p className="text-xs text-gray-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Revenue Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">$2,459</div>
            <p className="text-xs text-green-400 mt-1">+23% from yesterday</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">$89.50</div>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{order.id}</h3>
                      <Badge className={cn(getStatusColor(order.status), "flex items-center gap-1")}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span>{order.customer}</span>
                      <span>•</span>
                      <span>{order.items} items</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {order.date.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold text-white">
                      <DollarSign className="w-4 h-4" />
                      {order.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700"
                      onClick={() => handleStatusChange(order.id, 'processing')}
                    >
                      Process
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
