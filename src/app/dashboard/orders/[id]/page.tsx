"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, PrinterIcon as Print, Edit, CheckCircle, Truck, Package, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const orderItems = [
  {
    id: 1,
    name: "Wireless Headphones",
    image: "/diverse-people-listening-headphones.png",
    quantity: 2,
    price: "$25.99",
    total: "$51.98",
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    image: "/audio-speaker.png",
    quantity: 1,
    price: "$49.99",
    total: "$49.99",
  },
]

const deliverySteps = [
  { status: "Processing", completed: true, date: "on December 23, 2024" },
  { status: "Shipped", completed: true, date: "" },
  { status: "Out for Delivery", completed: false, date: "" },
  { status: "Delivered", completed: false, date: "" },
]

export default function OrderDetailPage() {
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
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Print className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Details */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Order ORD-12345</CardTitle>
                  <CardDescription>Placed on 2025-08-15</CardDescription>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Shipped
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Alice Johnson</h4>
                <p className="text-sm text-muted-foreground">alice@example.com</p>
                <p className="text-sm text-muted-foreground">123 Main St, Anytown, AN 12345</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <span className="text-sm">Visa ending in **** 5234</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliverySteps.map((step, index) => (
                  <div key={step.status} className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? "bg-green-600 text-white"
                          : index === 2
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : index === 0 ? (
                        <Package className="w-4 h-4" />
                      ) : index === 1 ? (
                        <Truck className="w-4 h-4" />
                      ) : index === 2 ? (
                        <Truck className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            step.completed ? "text-green-600" : index === 2 ? "text-blue-600" : "text-muted-foreground"
                          }`}
                        >
                          {step.status}
                        </span>
                        {step.date && <span className="text-sm text-muted-foreground">{step.date}</span>}
                      </div>
                      {index < deliverySteps.length - 1 && (
                        <div className={`w-px h-8 ml-4 mt-2 ${step.completed ? "bg-green-600" : "bg-muted"}`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
                  <div>Product</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-center">Price</div>
                  <div className="text-right">Total</div>
                </div>

                <Separator />

                {orderItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-4 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={item.image || "/placeholder.svg"} alt={item.name} />
                        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-center">{item.quantity}</div>
                    <div className="text-center">{item.price}</div>
                    <div className="text-right font-medium">{item.total}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$101.97</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$10.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>$111.97</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline">
                Update Status
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Send Tracking Info
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Contact Customer
              </Button>
              <Button className="w-full" variant="destructive">
                Cancel Order
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">Alice Johnson</p>
                <p>123 Main Street</p>
                <p>Anytown, AN 12345</p>
                <p>United States</p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">Alice Johnson</p>
                <p>123 Main Street</p>
                <p>Anytown, AN 12345</p>
                <p>United States</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
