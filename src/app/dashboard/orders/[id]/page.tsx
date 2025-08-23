"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Truck, DollarSign, Package, Clock, User, MapPin, CreditCard, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useParams } from "next/navigation"
import { usePayloadDocument } from "@/hooks/usePayloadCollection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  currency: string
  lineItems: Array<{
    product: { 
      id: string
      title: string
      gallery?: Array<{ image: { url: string; alt?: string } }>
    }
    quantity: number
    unitPrice: number
    totalPrice: number
    productSnapshot?: any
  }>
  fulfillment: {
    method: 'digital' | 'physical' | 'service' | 'pickup'
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed'
    trackingNumber?: string
    carrier?: string
    shippedAt?: string
    deliveredAt?: string
    estimatedDelivery?: string
  }
  paymentDetails: {
    paymentMethod?: string
    transactionId?: string
    last4?: string
    paymentProcessedAt?: string
  }
  shippingAddress: {
    name?: string
    company?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
    phone?: string
  }
  billingAddress: {
    sameAsShipping?: boolean
    name?: string
    company?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  revenueDistribution: {
    aiPartner: number
    humanPartner: number
    platformOperations: number
    justiceRund: number
    calculatedAt: string
  }
  customerNotes?: string
  internalNotes?: string
  tenant: { id: string; name: string }
  placedAt: string
  completedAt?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  
  // Use Payload's native API via our hook
  const { data: order, loading, error, refresh } = usePayloadDocument<Order>(
    'orders',
    orderId,
    { depth: 2 } // Need depth=2 for product details and customer info
  )
  
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-8 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
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
            <Link href="/dashboard/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard/orders">Return to Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No order found
  if (!order) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested order could not be found.</p>
            <Button asChild>
              <Link href="/dashboard/orders">Return to Orders</Link>
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

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      refunded: { color: 'bg-red-100 text-red-800', icon: RefreshCw },
    }
    return configs[status as keyof typeof configs] || configs.pending
  }

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon

  const handleStatusUpdate = async (newStatus: string) => {
    setStatusUpdateLoading(true)
    try {
      // TODO: Implement status update API call
      console.log('Updating order status to:', newStatus)
      // This would trigger workflow hooks in Payload
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h2>
            <p className="text-muted-foreground">
              Placed on {new Date(order.placedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Order Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <StatusIcon className="h-5 w-5" />
                  <span>Order Status</span>
                </CardTitle>
                <Badge className={statusConfig.color}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{order.status.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">Order Status</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{order.paymentStatus.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">Payment Status</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{order.fulfillment.status.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">Fulfillment</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{formatPrice(order.totalAmount, order.currency)}</div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('processing')} disabled={statusUpdateLoading}>
                    Mark as Processing
                  </Button>
                )}
                {order.status === 'processing' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('shipped')} disabled={statusUpdateLoading}>
                    Mark as Shipped
                  </Button>
                )}
                {order.status === 'shipped' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('delivered')} disabled={statusUpdateLoading}>
                    Mark as Delivered
                  </Button>
                )}
                {order.status === 'delivered' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('completed')} disabled={statusUpdateLoading}>
                    Mark as Completed
                  </Button>
                )}
                {!['cancelled', 'refunded', 'completed'].includes(order.status) && (
                  <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('cancelled')} disabled={statusUpdateLoading}>
                    Cancel Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.lineItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        {item.product.gallery?.[0]?.image?.url ? (
                          <img
                            src={item.product.gallery[0].image.url}
                            alt={item.product.gallery[0].image.alt || item.product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatPrice(item.unitPrice, order.currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.totalPrice, order.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal, order.currency)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(order.shippingAmount, order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatPrice(order.taxAmount, order.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalAmount, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Angel OS Revenue Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {formatPrice(order.revenueDistribution.platformOperations, order.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">Platform Operations (50%)</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {formatPrice(order.revenueDistribution.humanPartner, order.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">Human Partner (30%)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {formatPrice(order.revenueDistribution.aiPartner, order.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Partner (15%)</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {formatPrice(order.revenueDistribution.justiceRund, order.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">Justice Fund (5%)</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Calculated on {new Date(order.revenueDistribution.calculatedAt).toLocaleDateString()}
              </p>
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
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar>
                  <AvatarFallback>
                    {order.customer.firstName?.[0] || order.customer.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {order.customer.firstName && order.customer.lastName 
                      ? `${order.customer.firstName} ${order.customer.lastName}` 
                      : 'Customer'}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Customer Profile
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress.address1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {order.shippingAddress.name && <p className="font-medium">{order.shippingAddress.name}</p>}
                  {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="capitalize">{order.paymentDetails.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                </div>
                {order.paymentDetails.last4 && (
                  <div className="flex justify-between">
                    <span>Card:</span>
                    <span>****{order.paymentDetails.last4}</span>
                  </div>
                )}
                {order.paymentDetails.transactionId && (
                  <div className="flex justify-between">
                    <span>Transaction:</span>
                    <span className="font-mono text-xs">{order.paymentDetails.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={order.paymentStatus === 'captured' ? 'default' : 'secondary'}>
                    {order.paymentStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment Tracking */}
          {order.fulfillment.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Carrier:</span>
                    <span className="uppercase">{order.fulfillment.carrier || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tracking:</span>
                    <span className="font-mono">{order.fulfillment.trackingNumber}</span>
                  </div>
                  {order.fulfillment.shippedAt && (
                    <div className="flex justify-between">
                      <span>Shipped:</span>
                      <span>{new Date(order.fulfillment.shippedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {order.fulfillment.estimatedDelivery && (
                    <div className="flex justify-between">
                      <span>Est. Delivery:</span>
                      <span>{new Date(order.fulfillment.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Track Package
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(order.customerNotes || order.internalNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {order.customerNotes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Customer Notes:</h4>
                    <p className="text-sm text-muted-foreground">{order.customerNotes}</p>
                  </div>
                )}
                {order.internalNotes && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Internal Notes:</h4>
                    <p className="text-sm text-muted-foreground">{order.internalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}