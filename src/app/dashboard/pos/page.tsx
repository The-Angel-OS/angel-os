"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Search, ShoppingCart } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
}

interface CartItem extends Product {
  quantity: number
}

const categories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "snack", name: "Snack", icon: "🍿" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "hamburger", name: "Hamburger", icon: "🍔" },
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "drink", name: "Drink", icon: "🍷" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
]

const products: Product[] = [
  { id: "1", name: "Margherita Pizza", price: 10.0, category: "pizza", image: "/products/margherita-pizza.png" },
  { id: "2", name: "Pepperoni Pizza", price: 12.0, category: "pizza", image: "/products/pepperoni-pizza.png" },
  { id: "3", name: "Supreme Pizza", price: 16.0, category: "pizza", image: "/products/placeholder-bhgpr.png" },
  { id: "4", name: "Meat Lovers Pizza", price: 18.0, category: "pizza", image: "/products/meat-lovers-pizza.png" },
  { id: "5", name: "Classic Burger", price: 18.4, category: "hamburger", image: "/products/classic-burger.png" },
  { id: "6", name: "Deluxe Burger", price: 21.15, category: "hamburger", image: "/products/deluxe-burger.png" },
  { id: "7", name: "Simple Burger", price: 10.15, category: "hamburger", image: "/products/simple-burger.png" },
  { id: "8", name: "Espresso", price: 4.0, category: "coffee", image: "/products/placeholder-10or2.png" },
  { id: "9", name: "Cappuccino", price: 12.0, category: "coffee", image: "/products/cappuccino-coffee.png" },
  { id: "10", name: "Latte", price: 5.0, category: "coffee", image: "/products/latte-coffee.png" },
  { id: "11", name: "Hot Chocolate", price: 6.5, category: "drink", image: "/products/steaming-hot-chocolate.png" },
  { id: "12", name: "Milkshake", price: 8.0, category: "drink", image: "/products/classic-milkshake.png" },
  { id: "13", name: "French Fries", price: 4.5, category: "snack", image: "/products/crispy-french-fries.png" },
  { id: "14", name: "Chicken Nuggets", price: 7.0, category: "snack", image: "/products/crispy-chicken-nuggets.png" },
  { id: "15", name: "Spaghetti Carbonara", price: 14.0, category: "pasta", image: "/products/spaghetti-carbonara.png" },
]

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([
    { id: "2", name: "Pizza", price: 12.0, category: "pizza", image: "", quantity: 1 },
    { id: "7", name: "Burger", price: 10.15, category: "hamburger", image: "", quantity: 1 },
  ])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch = (product.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, change: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Pos System</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button variant="outline">Tables</Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="flex gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex flex-col items-center p-4 h-auto min-w-[80px]"
              >
                <span className="text-2xl mb-1">{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={product.image || "/products/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                    <Button size="sm" onClick={() => addToCart(product)} className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-80 border-l bg-card">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Your Cart
          </h2>

          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0">
                  <img
                    src={item.image || `/products/abstract-geometric-shapes.png`}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {cart.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          )}

          {cart.length > 0 && (
            <>
              <Separator className="mb-4" />

              {/* Order Summary */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Create Order
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
