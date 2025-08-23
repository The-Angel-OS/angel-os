"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { UniversalModal, FormField } from "@/components/ui/universal-modal"
import { usePayloadCollection } from "@/hooks/usePayloadCollection"
import { TrendingUp, Eye, Edit, Trash2, Star, ThumbsUp, Target, Zap, CheckCircle, Plus } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Roadmap Feature type interface
interface RoadmapFeature {
  id: string
  title: string
  description?: string
  category: string
  status: string
  priority: string
  timeline: {
    estimatedCompletion?: string
    quarterTarget?: string
    estimatedEffort?: number
  }
  voting: {
    votes: number
    allowVoting: boolean
  }
  progress: {
    completionPercentage: number
  }
  tags?: Array<{ tag: string }>
  createdAt: string
  updatedAt: string
}

// Hook for roadmap features
const useRoadmapFeatures = (options?: any) => {
  return usePayloadCollection<RoadmapFeature>({
    collection: 'roadmap-features',
    limit: 20,
    sort: '-voting.votes',
    ...options,
  })
}

export default function RoadmapPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    document.title = "Angel OS: Roadmap"
  }, [])

  const { data: features, loading, error, refresh } = useRoadmapFeatures()

  const roadmapModalFields: FormField[] = [
    {
      name: 'title',
      label: 'Feature Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., Dark Mode Support, API Rate Limiting'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the feature and its benefits...'
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { label: 'User Interface', value: 'ui' },
        { label: 'API & Integration', value: 'api' },
        { label: 'Performance', value: 'performance' },
        { label: 'Security', value: 'security' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' }
      ]
    },
    {
      name: 'estimatedEffort',
      label: 'Estimated Effort (hours)',
      type: 'number',
      min: 1,
      max: 1000,
      placeholder: 'How many hours will this take?'
    },
    {
      name: 'targetQuarter',
      label: 'Target Quarter',
      type: 'select',
      options: [
        { label: 'Q1 2024', value: 'Q1 2024' },
        { label: 'Q2 2024', value: 'Q2 2024' },
        { label: 'Q3 2024', value: 'Q3 2024' },
        { label: 'Q4 2024', value: 'Q4 2024' },
        { label: 'Q1 2025', value: 'Q1 2025' },
        { label: 'Q2 2025', value: 'Q2 2025' }
      ]
    }
  ]

  const handleCreateFeature = async (data: any) => {
    console.log('Creating roadmap feature:', data)
    // TODO: Submit to API
    // await createRoadmapFeature(data)
    refresh()
  }

  const columns = [
    {
      accessorKey: 'title',
      header: 'Feature',
      cell: (value: string, row: RoadmapFeature) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <Link href={`/dashboard/roadmap/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            <p className="text-sm text-muted-foreground capitalize">
              {row.category.replace('-', ' ')}
            </p>
          </div>
        </div>
      ),
    },
    createColumn.badge('status', 'Status'),
    createColumn.badge('priority', 'Priority'),
    createColumn.badge('category', 'Category'),
    {
      accessorKey: 'voting.votes',
      header: 'Votes',
      cell: (value: number, row: RoadmapFeature) => (
        <div className="flex items-center space-x-2">
          <ThumbsUp className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      accessorKey: 'progress.completionPercentage',
      header: 'Progress',
      cell: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      ),
    },
  ]

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (feature: RoadmapFeature) => {
        window.location.href = `/dashboard/roadmap/${feature.id}`
      },
    },
    {
      label: 'Edit Feature',
      icon: <Edit className="h-4 w-4" />,
      onClick: (feature: RoadmapFeature) => {
        window.location.href = `/dashboard/roadmap/${feature.id}/edit`
      },
    },
  ]

  const totalFeatures = features.length
  const inProgressFeatures = features.filter(f => f.status === 'in-progress').length
  const completedFeatures = features.filter(f => f.status === 'completed').length
  const totalVotes = features.reduce((sum, feature) => sum + feature.voting.votes, 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Roadmap</h2>
          <p className="text-muted-foreground">
            Track feature development and community feedback
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Feature Request
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Features</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFeatures}</div>
              <div className="flex items-center text-xs text-purple-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                In roadmap
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressFeatures}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Active development
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedFeatures}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Delivered
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Votes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotes}</div>
              <div className="flex items-center text-xs text-orange-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Total votes
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Roadmap Features DataTable */}
      <DataTable
        data={features}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search roadmap features..."
        exportButton={true}
        className="mt-6"
      />

      {/* Create Feature Modal */}
      <UniversalModal
        title="Create Feature Request"
        description="Propose a new feature for the product roadmap"
        fields={roadmapModalFields}
        onSubmit={handleCreateFeature}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        submitLabel="Create Feature Request"
        size="lg"
      />
    </div>
  )
}