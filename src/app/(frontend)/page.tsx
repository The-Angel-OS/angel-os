import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Users, Globe, ShoppingBag, MessageSquare, BarChart3, Settings, Zap } from 'lucide-react'
import config from '@payload-config'

async function getSystemStatus() {
  try {
    const payload = await getPayload({ config })
    
    // Check if system is initialized by looking for essential collections
    const [users, tenants, spaces, products] = await Promise.all([
      payload.find({
        collection: 'users',
        limit: 1,
      }),
      payload.find({
        collection: 'tenants',
        limit: 1,
      }),
      payload.find({
        collection: 'spaces',
        limit: 1,
      }),
      payload.find({
        collection: 'products',
        limit: 1,
      }),
    ])
    
    const isNewInstance = tenants.totalDocs === 0 && users.totalDocs <= 1
    
    return {
      isNewInstance,
      hasUsers: users.totalDocs > 0,
      hasTenants: tenants.totalDocs > 0,
      hasSpaces: spaces.totalDocs > 0,
      hasProducts: products.totalDocs > 0,
      stats: {
        users: users.totalDocs,
        tenants: tenants.totalDocs,
        spaces: spaces.totalDocs,
        products: products.totalDocs
      }
    }
  } catch (error) {
    console.error('Error checking system status:', error)
    return {
      isNewInstance: true,
      hasUsers: false,
      hasTenants: false,
      hasSpaces: false,
      hasProducts: false,
      stats: { users: 0, tenants: 0, spaces: 0, products: 0 }
    }
  }
}

export const metadata: Metadata = {
  title: 'Angel OS - Multi-Tenant Platform',
  description: 'The ultimate platform for creators, businesses, and communities to build, engage, and monetize their digital presence.',
}

export default async function HomePage() {
  const status = await getSystemStatus()

  // New Instance - Show setup wizard
  if (status.isNewInstance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Angel OS
                </h1>
              </div>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Welcome to your new Angel OS instance! This platform provides everything you need to build, 
                manage, and monetize digital experiences with AI-powered automation.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System ready for configuration
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Multi-Tenant Platform</CardTitle>
                  <CardDescription>
                    Host multiple websites and applications with isolated data and configurations
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-2">
                    <ShoppingBag className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">E-Commerce Ready</CardTitle>
                  <CardDescription>
                    Complete product catalog, order management, and payment processing
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <CardDescription>
                    Leo AI provides contextual help, automation, and intelligent responses
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Collaboration Spaces</CardTitle>
                  <CardDescription>
                    Team workspaces with messaging, file sharing, and project management
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center mb-2">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                  </div>
                  <CardTitle className="text-lg">Business Intelligence</CardTitle>
                  <CardDescription>
                    Analytics, reporting, and insights to grow your business
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">Integrations</CardTitle>
                  <CardDescription>
                    Connect Google, social media, payment providers, and more
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Setup Actions */}
            <div className="mt-16 space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Get Started</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/admin">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                    <Settings className="w-5 h-5 mr-2" />
                    Setup Admin Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="shadow-lg">
                    <Globe className="w-5 h-5 mr-2" />
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start by creating your admin account, then configure your first tenant and begin building your digital presence.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Existing Instance - Show platform overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Platform Status */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Angel OS
              </h1>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Platform Active</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{status.stats.tenants}</div>
                <div className="text-sm text-muted-foreground">Active Tenants</div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{status.stats.spaces}</div>
                <div className="text-sm text-muted-foreground">Collaboration Spaces</div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{status.stats.users}</div>
                <div className="text-sm text-muted-foreground">Platform Users</div>
              </CardContent>
            </Card>
            
            <Card className="border shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">{status.stats.products}</div>
                <div className="text-sm text-muted-foreground">Products Listed</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access */}
          <div className="mt-16 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard">
                <Card className="border shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold">Dashboard</div>
                    <div className="text-sm text-muted-foreground">Analytics & Management</div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/spaces">
                <Card className="border shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold">Spaces</div>
                    <div className="text-sm text-muted-foreground">Collaboration Hubs</div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/products">
                <Card className="border shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold">Products</div>
                    <div className="text-sm text-muted-foreground">E-commerce Catalog</div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Admin Access */}
          <div className="mt-12">
            <Link href="/admin">
              <Button variant="outline" size="lg" className="shadow-lg">
                <Settings className="w-5 h-5 mr-2" />
                Admin Panel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}