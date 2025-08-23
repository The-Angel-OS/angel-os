"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { useOrders } from "@/hooks/usePayloadCollection"
import { TrendingUp, TrendingDown, Eye, Edit, Truck, DollarSign, Package, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Order type interface based on Payload schema
interface Order {
  id: string
  orderNumber: string
  customer: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'authorized' | 'captured' | 'partially_refunded' | 'refunded' | 'failed'
  totalAmount: number
  currency: string
  lineItems: Array<{
    product: { id: string; title: string }
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  fulfillment: {
    method: 'digital' | 'physical' | 'service' | 'pickup'
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed'
    trackingNumber?: string
    carrier?: string
  }
  revenueDistribution: {
    aiPartner: number
    humanPartner: number
    platformOperations: number
    justiceRund: number
  }
  tenant: { id: string; name: string }
  placedAt: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Orders"
  }, [])

  // Fetch orders data from Payload CMS
  const { data: orders, loading, error, refresh } = useOrders({
    limit: 20,
    sort: '-placedAt',
  })

  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order',
      cell: (value: string, row: Order) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <Link href={`/dashboard/orders/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            <p className="text-sm text-muted-foreground">
              {row.lineItems.length} item{row.lineItems.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (value: Order['customer']) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {value.firstName?.[0] || value.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {value.firstName && value.lastName 
                ? `${value.firstName} ${value.lastName}` 
                : value.email}
            </p>
            <p className="text-sm text-muted-foreground">{value.email}</p>
          </div>
        </div>
      ),
    },
    createColumn.badge('status', 'Order Status', {
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'default', label: 'Processing' },
      shipped: { variant: 'default', label: 'Shipped' },
      delivered: { variant: 'default', label: 'Delivered' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      refunded: { variant: 'destructive', label: 'Refunded' },
    }),
    createColumn.badge('paymentStatus', 'Payment', {
      pending: { variant: 'secondary', label: 'Pending' },
      authorized: { variant: 'secondary', label: 'Authorized' },
      captured: { variant: 'default', label: 'Paid' },
      partially_refunded: { variant: 'secondary', label: 'Partial Refund' },
      refunded: { variant: 'destructive', label: 'Refunded' },
      failed: { variant: 'destructive', label: 'Failed' },
    }),
    {
      accessorKey: 'fulfillment.status',
      header: 'Fulfillment',
      cell: (value: string, row: Order) => {
        const statusConfig = {
          pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
          processing: { variant: 'default' as const, label: 'Processing', icon: Package },
          shipped: { variant: 'default' as const, label: 'Shipped', icon: Truck },
          delivered: { variant: 'default' as const, label: 'Delivered', icon: CheckCircle },
          completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
        }
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending
        const Icon = config.icon
        
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={config.variant}>
              <Icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            {row.fulfillment.trackingNumber && (
              <span className="text-xs text-muted-foreground font-mono">
                {row.fulfillment.trackingNumber}
              </span>
            )}
          </div>
        )
      },
    },
    createColumn.currency('totalAmount', 'Total'),
    {
      accessorKey: 'revenueDistribution',
      header: 'Revenue Split',
      cell: (value: Order['revenueDistribution']) => (
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform:</span>
            <span className="font-medium">${value.platformOperations.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Human:</span>
            <span className="font-medium">${value.humanPartner.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AI:</span>
            <span className="font-medium">${value.aiPartner.toFixed(2)}</span>
          </div>
        </div>
      ),
    },
    createColumn.date('placedAt', 'Order Date'),
  ]

  // Define actions for each row
  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (order: Order) => {
        window.location.href = `/dashboard/orders/${order.id}`
      },
    },
    {
      label: 'Update Status',
      icon: <Edit className="h-4 w-4" />,
      onClick: (order: Order) => {
        // TODO: Implement status update modal
        console.log('Update status for order:', order.id)
      },
    },
    {
      label: 'Process Fulfillment',
      icon: <Truck className="h-4 w-4" />,
      condition: (order: Order) => ['pending', 'processing'].includes(order.status),
      onClick: (order: Order) => {
        // TODO: Implement fulfillment processing
        console.log('Process fulfillment for order:', order.id)
      },
    },
    {
      label: 'Refund Order',
      icon: <AlertTriangle className="h-4 w-4" />,
      variant: 'destructive' as const,
      condition: (order: Order) => ['completed', 'delivered'].includes(order.status),
      onClick: (order: Order) => {
        if (confirm(`Are you sure you want to refund order "${order.orderNumber}"?`)) {
          // TODO: Implement refund functionality
          console.log('Refund order:', order.id)
        }
      },
    },
  ]

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const processingOrders = orders.filter(o => o.status === 'processing').length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage orders, fulfillment, and customer transactions
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                From {orders.length} orders
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
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <div className="flex items-center text-xs text-orange-600">
                <AlertTriangle className="mr-1 h-3 w-3" />
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
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processingOrders}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                In fulfillment
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
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Per transaction
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Orders DataTable */}
      <DataTable
        data={orders}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search orders..."
        exportButton={true}
        className="mt-6"
      />
    </div>
  )
}