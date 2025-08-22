"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedPanel, AnimatedCard } from "./_components/animated-panel"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Users, DollarSign, TrendingUp, MessageSquare, Plus, Download, Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
// import { useDashboardMetrics, useUsers } from "./_hooks/usePayloadData"
// import { useTenantConfig } from "./_hooks/useTenant"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Dashboard"
  }, [])
  const [isLoading, setIsLoading] = useState(true)
  const [redirected, setRedirected] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fetch current user from API
        const response = await fetch('/api/users/me', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!response.ok) {
          throw new Error('Not authenticated')
        }
        
        const userData = await response.json()
        console.log('✅ Dashboard: User authenticated:', userData.user?.email)
        setUser(userData.user)
        setIsLoading(false)
      } catch (error) {
        console.log('🔄 Dashboard: Not authenticated, redirecting to login')
        // Only redirect once to prevent loops
        if (!redirected) {
          setRedirected(true)
          router.push('/admin/login?redirect=/dashboard')
        }
      }
    }
    
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <Button onClick={() => router.push('/admin/login?redirect=/dashboard')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  // Temporarily use mock data to get the dashboard working
  // TODO: Re-enable Payload integration once database schema is stable
  const mockMetrics = {
    totalUsers: 4,
    totalOrders: 156,
    totalProducts: 12,
    totalRevenue: 15231.89,
    monthlyRevenue: 3420.50
  }

  const mockTeamMembers = [
    { id: '1', name: 'Kenneth Courtney', email: 'kenneth.courtney@gmail.com', globalRole: 'super_admin' },
    { id: '2', name: 'Ahmed', email: 'ahmed@example.com', globalRole: 'admin' },
    { id: '3', name: 'Fifth Element', email: 'fifth@element.com', globalRole: 'user' },
    { id: '4', name: 'Leo AI', email: 'leo@angelOS.com', globalRole: 'guardian_angel' },
  ]

  // Generate chart data from mock metrics
  const revenueData = [
    { month: "Jan", revenue: 12000 },
    { month: "Feb", revenue: 15000 },
    { month: "Mar", revenue: 18000 },
    { month: "Apr", revenue: 14000 },
    { month: "May", revenue: 22000 },
    { month: "Jun", revenue: mockMetrics.monthlyRevenue },
  ]

  const subscriptionData = [
    { day: "Mon", count: 24 },
    { day: "Tue", count: 30 },
    { day: "Wed", count: 20 },
    { day: "Thu", count: 28 },
    { day: "Fri", count: 19 },
    { day: "Sat", count: 24 },
    { day: "Sun", count: 28 },
  ]
  return (
    <div className="space-y-6">
      <AnimatedPanel direction="down">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              22 Jul 2025 - 18 Aug 2025
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </AnimatedPanel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalOrders}</div>
            <p className="text-xs text-green-600">
              {mockMetrics.totalProducts} products available
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockMetrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600">
              ${mockMetrics.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedPanel direction="left" delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Invite your team members to collaborate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTeamMembers.map((member, index) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{member.globalRole}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardContent>
          </Card>
        </AnimatedPanel>

        <AnimatedPanel direction="right" delay={0.5}>
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>+180.1% from last month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subscriptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedPanel direction="left" delay={0.6}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Exercise Minutes</CardTitle>
                <CardDescription>Your exercise minutes are ahead of where you normally are.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </AnimatedPanel>

        <AnimatedPanel direction="right" delay={0.7}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Add a new payment method to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <div className="w-8 h-5 bg-blue-600 rounded mb-2"></div>
                  <span className="text-xs">Card</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <div className="w-8 h-5 bg-blue-500 rounded mb-2"></div>
                  <span className="text-xs">PayPal</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
                  <div className="w-8 h-5 bg-gray-800 rounded mb-2"></div>
                  <span className="text-xs">Apple</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedPanel>
      </div>

      <AnimatedPanel direction="down" delay={0.8}>
        <Card>
          <CardHeader>
            <CardTitle>Support Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Hi, how can I help you today?</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Hey, I'm having trouble with my account.</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>TB</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg max-w-xs">
                  <p className="text-sm">What seems to be the problem?</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                  <p className="text-sm">I can't log in.</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>TB</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
              />
              <Button size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedPanel>
    </div>
  )
}
