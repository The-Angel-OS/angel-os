"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { useCampaigns } from "@/hooks/usePayloadCollection"
import { TrendingUp, TrendingDown, Eye, Edit, Trash2, Play, Pause, BarChart3, Target, DollarSign, Users, Calendar, Mail } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Campaign type interface based on Payload schema
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
    campaignManager?: { id: string; email: string; firstName?: string; lastName?: string }
    teamMembers?: Array<{ id: string; email: string; firstName?: string; lastName?: string }>
  }
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function CampaignsPage() {
  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Campaigns"
  }, [])

  // Fetch campaigns data from Payload CMS
  const { data: campaigns, loading, error, refresh } = useCampaigns({
    limit: 20,
    sort: '-updatedAt',
  })

  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: 'name',
      header: 'Campaign',
      cell: (value: string, row: Campaign) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <Link href={`/dashboard/campaigns/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            <p className="text-sm text-muted-foreground capitalize">
              {row.type.replace('-', ' ')} Campaign
            </p>
          </div>
        </div>
      ),
    },
    createColumn.badge('status', 'Status', {
      draft: { variant: 'secondary', label: 'Draft' },
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      active: { variant: 'default', label: 'Active' },
      paused: { variant: 'secondary', label: 'Paused' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    }),
    createColumn.badge('type', 'Type', {
      email: { variant: 'outline', label: 'Email' },
      social: { variant: 'outline', label: 'Social' },
      ads: { variant: 'outline', label: 'Ads' },
      content: { variant: 'outline', label: 'Content' },
      seo: { variant: 'outline', label: 'SEO' },
      influencer: { variant: 'outline', label: 'Influencer' },
      event: { variant: 'outline', label: 'Event' },
      'direct-mail': { variant: 'outline', label: 'Direct Mail' },
      referral: { variant: 'outline', label: 'Referral' },
    }),
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: (value: Campaign['budget']) => (
        <div className="text-right">
          <p className="font-medium">
            {value.totalBudget 
              ? `$${value.totalBudget.toLocaleString()}` 
              : 'No budget set'}
          </p>
          <p className="text-sm text-muted-foreground">
            Spent: ${value.spentBudget.toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'metrics',
      header: 'Performance',
      cell: (value: Campaign['metrics']) => (
        <div className="text-center">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>
              <span className="font-medium">{value.impressions.toLocaleString()}</span>
              <p className="text-muted-foreground">Impressions</p>
            </div>
            <div>
              <span className="font-medium">{value.clicks.toLocaleString()}</span>
              <p className="text-muted-foreground">Clicks</p>
            </div>
            <div>
              <span className="font-medium">{value.conversions}</span>
              <p className="text-muted-foreground">Conversions</p>
            </div>
            <div>
              <span className="font-medium">${value.revenue.toLocaleString()}</span>
              <p className="text-muted-foreground">Revenue</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'metrics.clickThroughRate',
      header: 'CTR',
      cell: (value: number) => (
        <div className="text-center">
          <span className="font-medium">{value ? `${value.toFixed(2)}%` : 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'metrics.returnOnAdSpend',
      header: 'ROAS',
      cell: (value: number) => {
        if (!value) return <span className="text-muted-foreground">N/A</span>
        const color = value >= 3 ? 'text-green-600' : value >= 2 ? 'text-yellow-600' : 'text-red-600'
        return (
          <div className="text-center">
            <span className={`font-medium ${color}`}>{value.toFixed(2)}x</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'dates.startDate',
      header: 'Start Date',
      cell: (value: string) => (
        value ? new Date(value).toLocaleDateString() : '-'
      ),
    },
    {
      accessorKey: 'team.campaignManager',
      header: 'Manager',
      cell: (value: Campaign['team']['campaignManager']) => (
        value ? (
          <span className="text-sm">
            {value.firstName && value.lastName 
              ? `${value.firstName} ${value.lastName}` 
              : value.email}
          </span>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )
      ),
    },
  ]

  // Define actions for each row
  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (campaign: Campaign) => {
        window.location.href = `/dashboard/campaigns/${campaign.id}`
      },
    },
    {
      label: 'View Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      onClick: (campaign: Campaign) => {
        window.location.href = `/dashboard/campaigns/${campaign.id}/analytics`
      },
    },
    {
      label: 'Start Campaign',
      icon: <Play className="h-4 w-4" />,
      condition: (campaign: Campaign) => ['draft', 'scheduled', 'paused'].includes(campaign.status),
      onClick: (campaign: Campaign) => {
        // TODO: Implement campaign start functionality
        console.log('Start campaign:', campaign.id)
      },
    },
    {
      label: 'Pause Campaign',
      icon: <Pause className="h-4 w-4" />,
      condition: (campaign: Campaign) => campaign.status === 'active',
      onClick: (campaign: Campaign) => {
        // TODO: Implement campaign pause functionality
        console.log('Pause campaign:', campaign.id)
      },
    },
    {
      label: 'Edit Campaign',
      icon: <Edit className="h-4 w-4" />,
      onClick: (campaign: Campaign) => {
        window.location.href = `/dashboard/campaigns/${campaign.id}/edit`
      },
    },
    {
      label: 'Delete Campaign',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (campaign: Campaign) => {
        if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete campaign:', campaign.id)
        }
      },
    },
  ]

  // Calculate metrics
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget.totalBudget || 0), 0)
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.budget.spentBudget, 0)
  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.metrics.revenue, 0)
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.metrics.impressions, 0)
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.metrics.clicks, 0)
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.metrics.conversions, 0)
  const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
  const overallROAS = totalSpent > 0 ? totalRevenue / totalSpent : 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and track performance
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCampaigns}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                {activeCampaigns} active
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
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                ${totalSpent.toLocaleString()} spent
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                {overallROAS.toFixed(2)}x ROAS
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
              <CardTitle className="text-sm font-medium">Overall CTR</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallCTR.toFixed(2)}%</div>
              <div className="flex items-center text-xs text-purple-600">
                <Users className="mr-1 h-3 w-3" />
                {totalConversions} conversions
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Total reach
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Engagement
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversions}</div>
              <div className="flex items-center text-xs text-purple-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Goals achieved
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg CPA</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : '0.00'}
              </div>
              <div className="flex items-center text-xs text-orange-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                Cost per acquisition
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">New Campaign</h3>
                  <p className="text-sm text-muted-foreground">Create campaign</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Email Campaign</h3>
                  <p className="text-sm text-muted-foreground">Quick email setup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Schedule</h3>
                  <p className="text-sm text-muted-foreground">Campaign calendar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Campaigns DataTable */}
      <DataTable
        data={campaigns}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search campaigns..."
        addButton={{
          label: "Create Campaign",
          href: "/dashboard/campaigns/add"
        }}
        exportButton={true}
        className="mt-6"
      />
    </div>
  )
}
