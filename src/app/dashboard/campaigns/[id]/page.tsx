"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Play, Pause, BarChart3, Target, DollarSign, Users, Eye, TrendingUp, Calendar, MapPin, User, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useParams } from "next/navigation"
import { usePayloadDocument } from "@/hooks/usePayloadCollection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'email' | 'social' | 'ads' | 'content' | 'seo' | 'influencer' | 'event' | 'direct-mail' | 'referral'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  dates: {
    startDate?: string
    endDate?: string
    launchDate?: string
  }
  budget: {
    totalBudget?: number
    spentBudget: number
    currency: string
    costPerClick?: number
    costPerAcquisition?: number
  }
  targeting: {
    targetAudience?: string
    demographics?: {
      ageRange?: string
      gender?: string
      locations?: Array<{ location: string }>
      interests?: Array<{ interest: string }>
    }
  }
  content: {
    creativeAssets?: Array<{ id: string; url: string; alt?: string }>
    copyVariations?: Array<{
      headline: string
      description?: string
      callToAction?: string
      variation?: string
    }>
    landingPages?: Array<{ id: string; title: string; slug: string }>
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    leads: number
    sales: number
    revenue: number
    clickThroughRate?: number
    conversionRate?: number
    returnOnAdSpend?: number
    costPerLead?: number
  }
  team: {
    campaignManager?: { 
      id: string
      email: string
      firstName?: string
      lastName?: string
    }
    teamMembers?: Array<{ 
      id: string
      email: string
      firstName?: string
      lastName?: string
    }>
    approvers?: Array<{ 
      id: string
      email: string
      firstName?: string
      lastName?: string
    }>
  }
  integrations: {
    googleAdsId?: string
    facebookAdId?: string
    mailchimpId?: string
    trackingPixels?: Array<{
      platform: string
      pixelId: string
    }>
  }
  notes?: string
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  
  // Use Payload's native API via our hook
  const { data: campaign, loading, error, refresh } = usePayloadDocument<Campaign>(
    'campaigns',
    campaignId,
    { depth: 2 } // Need depth=2 for team member details and content
  )
  
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/campaigns">
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
            <Link href="/dashboard/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Campaign Not Found</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard/campaigns">Return to Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No campaign found
  if (!campaign) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Campaign Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested campaign could not be found.</p>
            <Button asChild>
              <Link href="/dashboard/campaigns">Return to Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // Get status color and configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft', icon: Edit },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled', icon: Calendar },
      active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: Play },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused', icon: Pause },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed', icon: Target },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: Target },
    }
    return configs[status as keyof typeof configs] || configs.draft
  }

  const statusConfig = getStatusConfig(campaign.status)
  const StatusIcon = statusConfig.icon

  const handleStatusUpdate = async (newStatus: string) => {
    setStatusUpdateLoading(true)
    try {
      // TODO: Implement status update API call
      console.log('Updating campaign status to:', newStatus)
      // This would trigger workflow hooks in Payload
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Calculate budget utilization
  const budgetUtilization = campaign.budget.totalBudget 
    ? (campaign.budget.spentBudget / campaign.budget.totalBudget) * 100 
    : 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{campaign.name}</h2>
            <p className="text-muted-foreground capitalize">
              {campaign.type.replace('-', ' ')} Campaign
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
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
          {/* Campaign Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <StatusIcon className="h-5 w-5" />
                  <span>Campaign Status</span>
                </CardTitle>
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold capitalize">{campaign.status}</div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold capitalize">{campaign.type.replace('-', ' ')}</div>
                  <div className="text-sm text-muted-foreground">Type</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">
                    {campaign.dates.startDate 
                      ? new Date(campaign.dates.startDate).toLocaleDateString() 
                      : 'Not set'}
                  </div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">
                    {campaign.dates.endDate 
                      ? new Date(campaign.dates.endDate).toLocaleDateString() 
                      : 'Not set'}
                  </div>
                  <div className="text-sm text-muted-foreground">End Date</div>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                {campaign.status === 'draft' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('active')} disabled={statusUpdateLoading}>
                    Launch Campaign
                  </Button>
                )}
                {campaign.status === 'scheduled' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('active')} disabled={statusUpdateLoading}>
                    Start Now
                  </Button>
                )}
                {campaign.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('paused')} disabled={statusUpdateLoading}>
                    Pause Campaign
                  </Button>
                )}
                {campaign.status === 'paused' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('active')} disabled={statusUpdateLoading}>
                    Resume Campaign
                  </Button>
                )}
                {['active', 'paused'].includes(campaign.status) && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('completed')} disabled={statusUpdateLoading}>
                    Mark Complete
                  </Button>
                )}
                {!['completed', 'cancelled'].includes(campaign.status) && (
                  <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('cancelled')} disabled={statusUpdateLoading}>
                    Cancel Campaign
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {campaign.metrics.impressions.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Impressions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {campaign.metrics.clicks.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Clicks</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {campaign.metrics.conversions}
                  </div>
                  <div className="text-sm text-muted-foreground">Conversions</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(campaign.metrics.revenue, campaign.budget.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {campaign.metrics.clickThroughRate ? `${campaign.metrics.clickThroughRate.toFixed(2)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Click-Through Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {campaign.metrics.conversionRate ? `${campaign.metrics.conversionRate.toFixed(2)}%` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {campaign.metrics.returnOnAdSpend ? `${campaign.metrics.returnOnAdSpend.toFixed(2)}x` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Return on Ad Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {campaign.metrics.costPerLead ? formatCurrency(campaign.metrics.costPerLead, campaign.budget.currency) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Cost per Lead</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Budget Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Budget:</span>
                  <span className="font-bold">
                    {campaign.budget.totalBudget 
                      ? formatCurrency(campaign.budget.totalBudget, campaign.budget.currency)
                      : 'No budget set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Spent:</span>
                  <span className="font-bold">
                    {formatCurrency(campaign.budget.spentBudget, campaign.budget.currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Remaining:</span>
                  <span className="font-bold">
                    {campaign.budget.totalBudget 
                      ? formatCurrency(campaign.budget.totalBudget - campaign.budget.spentBudget, campaign.budget.currency)
                      : 'Unlimited'}
                  </span>
                </div>

                {campaign.budget.totalBudget && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span>{budgetUtilization.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          budgetUtilization >= 90 ? 'bg-red-500' :
                          budgetUtilization >= 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Description */}
          {campaign.description && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.description }} />
              </CardContent>
            </Card>
          )}

          {/* Copy Variations */}
          {campaign.content.copyVariations && campaign.content.copyVariations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Copy Variations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaign.content.copyVariations.map((copy, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{copy.headline}</h4>
                        {copy.variation && (
                          <Badge variant="outline">{copy.variation}</Badge>
                        )}
                      </div>
                      {copy.description && (
                        <p className="text-sm text-muted-foreground mb-2">{copy.description}</p>
                      )}
                      {copy.callToAction && (
                        <Button size="sm" variant="outline">
                          {copy.callToAction}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Campaign Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.team.campaignManager && (
                  <div>
                    <p className="font-medium text-sm mb-2">Campaign Manager</p>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {campaign.team.campaignManager.firstName?.[0] || campaign.team.campaignManager.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {campaign.team.campaignManager.firstName && campaign.team.campaignManager.lastName
                            ? `${campaign.team.campaignManager.firstName} ${campaign.team.campaignManager.lastName}`
                            : campaign.team.campaignManager.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{campaign.team.campaignManager.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {campaign.team.teamMembers && campaign.team.teamMembers.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2">Team Members</p>
                    <div className="space-y-2">
                      {campaign.team.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {member.firstName?.[0] || member.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {member.firstName && member.lastName
                              ? `${member.firstName} ${member.lastName}`
                              : member.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          {campaign.targeting.demographics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Targeting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaign.targeting.demographics.ageRange && (
                    <div>
                      <p className="font-medium text-sm">Age Range</p>
                      <p className="text-sm text-muted-foreground">{campaign.targeting.demographics.ageRange}</p>
                    </div>
                  )}
                  {campaign.targeting.demographics.gender && (
                    <div>
                      <p className="font-medium text-sm">Gender</p>
                      <p className="text-sm text-muted-foreground capitalize">{campaign.targeting.demographics.gender}</p>
                    </div>
                  )}
                  {campaign.targeting.demographics.locations && campaign.targeting.demographics.locations.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Locations</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.targeting.demographics.locations.map((loc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {loc.location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {campaign.targeting.demographics.interests && campaign.targeting.demographics.interests.length > 0 && (
                    <div>
                      <p className="font-medium text-sm">Interests</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.targeting.demographics.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {interest.interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations */}
          {Object.values(campaign.integrations).some(Boolean) && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaign.integrations.googleAdsId && (
                    <div className="flex justify-between">
                      <span className="text-sm">Google Ads:</span>
                      <span className="text-sm font-mono">{campaign.integrations.googleAdsId}</span>
                    </div>
                  )}
                  {campaign.integrations.facebookAdId && (
                    <div className="flex justify-between">
                      <span className="text-sm">Facebook Ads:</span>
                      <span className="text-sm font-mono">{campaign.integrations.facebookAdId}</span>
                    </div>
                  )}
                  {campaign.integrations.mailchimpId && (
                    <div className="flex justify-between">
                      <span className="text-sm">Mailchimp:</span>
                      <span className="text-sm font-mono">{campaign.integrations.mailchimpId}</span>
                    </div>
                  )}
                  {campaign.integrations.trackingPixels && campaign.integrations.trackingPixels.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Tracking Pixels:</p>
                      {campaign.integrations.trackingPixels.map((pixel, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span>{pixel.platform}:</span>
                          <span className="font-mono">{pixel.pixelId}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {campaign.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.notes }} />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
