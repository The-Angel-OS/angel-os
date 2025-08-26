'use client'

import React, { useState, useEffect } from 'react'
import { useTenant } from '../_hooks/useTenant'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Plus, 
  School,
  Shield,
  MessageSquare,
  BarChart3,
  Users,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react'

interface SchoolStats {
  totalSchools: number
  verifiedSchools: number
  pendingReviews: number
  averageScore: number
}

interface ReviewStats {
  totalReviews: number
  pendingReviews: number
  approvedReviews: number
  flaggedReviews: number
  averageRating: number
}

export default function SafeSchoolDashboard() {
  const { tenant, loading: tenantLoading } = useTenant()
  const [schoolStats, setSchoolStats] = useState<SchoolStats>({
    totalSchools: 0,
    verifiedSchools: 0,
    pendingReviews: 0,
    averageScore: 0
  })
  
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    flaggedReviews: 0,
    averageRating: 0
  })

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch school stats
      const schoolResponse = await fetch('/api/admin/schools/stats')
      if (schoolResponse.ok) {
        const schoolData = await schoolResponse.json()
        setSchoolStats(schoolData)
      }

      // Fetch review stats
      const reviewResponse = await fetch('/api/admin/reviews/stats')
      if (reviewResponse.ok) {
        const reviewData = await reviewResponse.json()
        setReviewStats(reviewData)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeoCommand = (command: string) => {
    // This will integrate with LEO for content management
    console.log('LEO Command:', command)
    // TODO: Implement LEO integration for SafeSchool management
  }

  // Check if SafeSchool feature is enabled for this tenant
  if (tenantLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tenant information...</p>
          </div>
        </div>
      </div>
    )
  }

  // Temporarily disabled feature check until database schema is fixed
  // TODO: Re-enable once safeschool feature is properly added to database
  /*
  if (!tenant?.features?.safeschool) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SafeSchool|MAP℠ Not Available</h2>
            <p className="text-gray-600 mb-6">
              The SafeSchool|MAP℠ feature is not enabled for your tenant. 
              Contact your administrator to enable this feature.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }
  */

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SafeSchool|MAP℠ Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage school safety platform with LEO assistance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => handleLeoCommand('help safeschool')}
          >
            <MessageSquare className="h-4 w-4" />
            Ask LEO
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add School
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Schools</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : schoolStats.totalSchools}
                </p>
              </div>
              <School className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Schools</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : schoolStats.verifiedSchools}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {loading ? '...' : reviewStats.pendingReviews}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Safety Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? '...' : schoolStats.averageScore}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="leo">LEO Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates across the SafeSchool platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lincoln Elementary verified</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">3 new reviews submitted</p>
                      <p className="text-xs text-gray-600">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Roosevelt High needs attention</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common SafeSchool management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                    <School className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Manage Schools</p>
                      <p className="text-xs text-gray-600">View all schools</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                    <MessageSquare className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Review Queue</p>
                      <p className="text-xs text-gray-600">Moderate reviews</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                    <Shield className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Verification</p>
                      <p className="text-xs text-gray-600">SITE|SAFETYNET℠</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 h-auto p-4">
                    <BarChart3 className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Analytics</p>
                      <p className="text-xs text-gray-600">View reports</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Management</CardTitle>
              <CardDescription>
                Manage schools through Payload CMS or ask LEO for assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <School className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  School Management via Payload CMS
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Schools are managed through the Payload CMS interface with full content management capabilities, 
                  or you can ask LEO to help with specific tasks.
                </p>
                <div className="flex gap-3">
                  <Button asChild>
                    <a href="/admin/collections/schools" target="_blank">
                      Open Schools in CMS
                    </a>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleLeoCommand('manage schools')}
                  >
                    Ask LEO for Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Management</CardTitle>
              <CardDescription>
                Moderate safety reviews and feedback through Payload CMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Review Moderation via Payload CMS
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Safety reviews are managed through the Feedback collection in Payload CMS, 
                  or LEO can help with review moderation tasks.
                </p>
                <div className="flex gap-3">
                  <Button asChild>
                    <a href="/admin/collections/feedback" target="_blank">
                      Open Reviews in CMS
                    </a>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleLeoCommand('moderate reviews')}
                  >
                    Ask LEO for Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LEO Assistant</CardTitle>
              <CardDescription>
                Get help managing SafeSchool content and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Available LEO Commands:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• "Help me add a new school"</li>
                    <li>• "Show me schools that need verification"</li>
                    <li>• "Moderate pending reviews"</li>
                    <li>• "Generate safety report for [school name]"</li>
                    <li>• "Update safety scores"</li>
                    <li>• "Find schools with low ratings"</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Input 
                    placeholder="Ask LEO about SafeSchool management..."
                    className="flex-1"
                  />
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask LEO
                  </Button>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>LEO integration for SafeSchool management coming soon!</p>
                  <p className="text-sm">For now, use Payload CMS for content management.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

