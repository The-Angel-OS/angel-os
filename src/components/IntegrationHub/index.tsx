"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Heart,
  Calendar,
  Users,
  Phone,
  CreditCard,
  MessageSquare,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Settings,
  Mail,
  Camera,
  Image as ImageIcon,
  Archive,
  Package
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface IntegrationConnection {
  id: string
  title: string
  description: string
  category: 'Healthcare' | 'Communication' | 'Payment' | 'Productivity' | 'Analytics' | 'Operations' | 'Social' | 'Storage' | 'Inventory'
  icon: string | React.ReactNode
  connectionKey: string
  isConnected: boolean
  lastSync?: Date
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  authUrl?: string
  features: string[]
  pricing?: string
  popularity: number
}

interface IntegrationHubProps {
  organizationId?: string
  venueId?: string
  showCategory?: string
  className?: string
}

export default function IntegrationHub({
  organizationId,
  venueId,
  showCategory,
  className = ""
}: IntegrationHubProps) {
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(showCategory || 'All')
  
  // Force rebuild to clear webpack cache - useEffect is used below

  // Enhanced integrations with Google services and photo inventory
  const availableIntegrations: IntegrationConnection[] = [
    // Social & Productivity Integrations
    {
      id: 'google-calendar',
      title: 'Google Calendar',
      description: 'Sync appointments and schedules with Google Calendar - source of truth integration',
      category: 'Social',
      icon: <Calendar className="w-8 h-8 text-red-600" />,
      connectionKey: 'googleCalendarNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/google-calendar-integration/auth',
      features: ['Calendar Sync', 'Appointment Reminders', 'Provider Scheduling', 'Room Booking', 'Two-way Sync'],
      pricing: 'Free',
      popularity: 95
    },
    {
      id: 'gmail',
      title: 'Gmail',
      description: 'Email integration for customer communication and automated responses',
      category: 'Social',
      icon: <Mail className="w-8 h-8 text-red-500" />,
      connectionKey: 'gmailNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/gmail-integration/auth',
      features: ['Email Automation', 'Customer Communication', 'Template Management', 'Threading', 'Smart Replies'],
      pricing: 'Free',
      popularity: 92
    },
    {
      id: 'google-photos',
      title: 'Google Photos',
      description: 'Photo archive and inventory management - mileage logs, collections, and business inventory',
      category: 'Storage',
      icon: <Camera className="w-8 h-8 text-blue-600" />,
      connectionKey: 'googlePhotosNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/google-photos-integration/auth',
      features: ['Photo Analysis', 'Mileage Logging', 'Collection Inventory', 'Smart Categorization', 'Business Inventory'],
      pricing: 'Free (15GB) - $1.99/month (100GB)',
      popularity: 88
    },
    {
      id: 'apple-photos',
      title: 'Apple Photos',
      description: 'Apple Photos integration for inventory and collection management',
      category: 'Storage',
      icon: <ImageIcon className="w-8 h-8 text-gray-600" />,
      connectionKey: 'applePhotosNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/apple-photos-integration/auth',
      features: ['Photo Sync', 'Album Management', 'Collection Tracking', 'Smart Albums', 'Cross-Platform Sync'],
      pricing: 'Free (5GB) - $0.99/month (50GB)',
      popularity: 78
    },
    {
      id: 'photo-inventory',
      title: 'Photo Inventory AI',
      description: 'AI-powered inventory management from photo sequences - vape shops, collections, any business',
      category: 'Inventory',
      icon: <Package className="w-8 h-8 text-green-600" />,
      connectionKey: 'photoInventoryNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/photo-inventory-integration/auth',
      features: ['Sequence Analysis', 'Product Recognition', 'Inventory Tracking', 'Collection Management', 'Business Cataloging'],
      pricing: '$0.10/photo analysis',
      popularity: 85
    },
    
    // Healthcare Integrations
    {
      id: 'inquicker',
      title: 'InQuicker',
      description: 'Patient scheduling and appointment management for healthcare providers',
      category: 'Healthcare',
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      connectionKey: 'inquickerNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/inquicker-integration/auth',
      features: ['Patient Scheduling', 'Provider Management', 'Waitlist Management', 'Real-time Sync'],
      pricing: 'Contact for pricing',
      popularity: 95
    },
    {
      id: 'epic',
      title: 'Epic MyChart',
      description: 'Electronic health records and patient portal integration',
      category: 'Healthcare',
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      connectionKey: 'epicNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/epic-integration/auth',
      features: ['EHR Integration', 'Patient Records', 'Lab Results', 'Medication Management'],
      pricing: 'Enterprise',
      popularity: 88
    },
    
    // Communication & Payment
    {
      id: 'stripe',
      title: 'Stripe',
      description: 'Payment processing for appointments and services',
      category: 'Payment',
      icon: <CreditCard className="w-8 h-8 text-indigo-600" />,
      connectionKey: 'stripeNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/stripe-integration/auth',
      features: ['Payment Processing', 'Subscription Billing', 'Refunds', 'Analytics'],
      pricing: '2.9% + 30¢',
      popularity: 92
    },
    {
      id: 'vapi',
      title: 'VAPI Voice AI',
      description: 'AI-powered phone system for customer communication',
      category: 'Communication',
      icon: <Phone className="w-8 h-8 text-green-600" />,
      connectionKey: 'vapiNode',
      isConnected: true,
      status: 'connected',
      lastSync: new Date(),
      features: ['Voice AI', 'Phone Numbers', 'Call Routing', 'Transcription'],
      pricing: '$0.05/minute',
      popularity: 78
    },
    
    // Operations & Productivity
    {
      id: 'route4me',
      title: 'Route4Me',
      description: 'Route optimization and fleet management for delivery and service businesses',
      category: 'Operations',
      icon: <Users className="w-8 h-8 text-orange-600" />,
      connectionKey: 'route4meNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/route4me-integration/auth',
      features: ['Route Optimization', 'GPS Tracking', 'Driver Management', 'Real-time Updates'],
      pricing: '$40/vehicle/month',
      popularity: 85
    },
    {
      id: 'servicetitan',
      title: 'ServiceTitan',
      description: 'Field service management platform for service-based businesses',
      category: 'Productivity',
      icon: <Settings className="w-8 h-8 text-blue-700" />,
      connectionKey: 'servicetitanNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/servicetitan-integration/auth',
      features: ['Job Scheduling', 'Customer Management', 'Invoicing', 'Inventory Tracking'],
      pricing: '$99/user/month',
      popularity: 78
    },
    {
      id: 'quickbooks',
      title: 'QuickBooks',
      description: 'Accounting and financial management for small businesses and franchises',
      category: 'Productivity',
      icon: <FileText className="w-8 h-8 text-green-700" />,
      connectionKey: 'quickbooksNode',
      isConnected: false,
      status: 'disconnected',
      authUrl: '/api/quickbooks-integration/auth',
      features: ['Accounting', 'Invoicing', 'Expense Tracking', 'Financial Reporting', 'Tax Preparation'],
      pricing: '$25-$180/month',
      popularity: 82
    }
  ]

    useEffect(() => {
    fetchIntegrationStatus()

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    const categoryParam = urlParams.get('category')

    // Set category from URL parameter
    if (categoryParam && !showCategory) {
      setSelectedCategory(categoryParam)
    }

        if (success === 'inquicker_connected') {
      alert('🎉 InQuicker integration connected successfully!')
      // Update the integration status
      setIntegrations(prev =>
        prev.map(int =>
          int.id === 'inquicker'
            ? { ...int, isConnected: true, status: 'connected' as const, lastSync: new Date() }
            : int
        )
      )
    } else if (success === 'route4me_connected') {
      alert('🎉 Route4Me integration connected successfully! Franchise operations are now optimized.')
      // Update the integration status
      setIntegrations(prev =>
        prev.map(int =>
          int.id === 'route4me'
            ? { ...int, isConnected: true, status: 'connected' as const, lastSync: new Date() }
            : int
        )
      )
    } else if (error) {
      let errorMessage = 'Integration connection failed'
      switch (error) {
        case 'oauth_failed':
          errorMessage = 'OAuth authentication failed'
          break
        case 'missing_params':
          errorMessage = 'Missing required parameters'
          break
        case 'invalid_state':
          errorMessage = 'Invalid security token'
          break
        case 'token_exchange_failed':
          errorMessage = 'Token exchange failed'
          break
        case 'callback_failed':
          errorMessage = 'Callback processing failed'
          break
        case 'franchise_oauth_failed':
          errorMessage = 'Franchise OAuth authentication failed'
          break
        case 'missing_franchise_params':
          errorMessage = 'Missing franchise OAuth parameters'
          break
        case 'invalid_franchise_state':
          errorMessage = 'Invalid franchise security token'
          break
        case 'franchise_token_failed':
          errorMessage = 'Franchise token exchange failed'
          break
        case 'franchise_callback_failed':
          errorMessage = 'Franchise callback processing failed'
          break
      }
      alert(`❌ ${errorMessage}. Please try again.`)
    }

    // Clean up URL parameters (keep category if it was set via URL)
    if (success || error) {
      const cleanUrl = categoryParam ?
        `${window.location.pathname}?category=${categoryParam}` :
        window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [organizationId, venueId, showCategory])

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true)

      // TODO: Fetch actual connection status from API
      // For now, using mock data
      setIntegrations(availableIntegrations)

    } catch (error) {
      console.error('[IntegrationHub] Error fetching status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integration: IntegrationConnection) => {
    if (integration.authUrl) {
      // Redirect to OAuth URL
      window.location.href = integration.authUrl
    } else {
      // Handle direct connection
      console.log(`Connecting to ${integration.title}...`)
      // TODO: Implement direct connection logic
    }
  }

  const handleDisconnect = async (integration: IntegrationConnection) => {
    try {
      // TODO: Implement disconnect logic
      console.log(`Disconnecting from ${integration.title}...`)
    } catch (error) {
      console.error('[IntegrationHub] Disconnect error:', error)
    }
  }

  const getStatusIcon = (status: IntegrationConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (integration: IntegrationConnection) => {
    if (integration.isConnected) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-gray-600">
        Not Connected
      </Badge>
    )
  }

  const categories = ['All', 'Healthcare', 'Communication', 'Payment', 'Productivity', 'Analytics', 'Operations']

  const filteredIntegrations = selectedCategory === 'All'
    ? integrations
    : integrations.filter(int => int.category === selectedCategory)

  const sortedIntegrations = filteredIntegrations.sort((a, b) => {
    // Connected integrations first, then by popularity
    if (a.isConnected && !b.isConnected) return -1
    if (!a.isConnected && b.isConnected) return 1
    return b.popularity - a.popularity
  })

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="p-6">
                <div className="h-8 bg-gray-200 rounded w-8 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            Integration Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Connect your favorite tools and automate your workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredIntegrations.filter(i => i.isConnected).length} of {filteredIntegrations.length} connected
          </span>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Manage All
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="text-sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedIntegrations.map((integration) => (
          <Card
            key={integration.id}
            className={`transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
              integration.isConnected ? 'ring-2 ring-green-200 bg-green-50/30' : ''
            }`}
          >
            <CardHeader className="pb-4">
              {/* Integration Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {typeof integration.icon === 'string' ? (
                    <Image
                      src={integration.icon}
                      alt={integration.title}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  ) : (
                    integration.icon
                  )}
                  <div>
                    <CardTitle className="text-lg">{integration.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                {getStatusIcon(integration.status)}
              </div>

              {/* Description */}
              <CardDescription className="text-sm line-clamp-2 mb-4">
                {integration.description}
              </CardDescription>

              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 3).map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {integration.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{integration.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Status & Pricing */}
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(integration)}
                <span className="text-sm text-gray-500 font-medium">
                  {integration.pricing}
                </span>
              </div>

              {/* Action Button */}
              <div className="flex gap-2">
                {integration.isConnected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration)}
                      className="flex-1"
                    >
                      Disconnect
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      Configure
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleConnect(integration)}
                    className="w-full"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Settings className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No integrations found
            </h3>
            <p className="text-sm text-gray-500">
              Try selecting a different category or contact support to request new integrations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
