"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { UniversalModal, projectModalFields } from "@/components/ui/universal-modal"
import { useProjects } from "@/hooks/usePayloadCollection"
import { TrendingUp, Eye, Edit, Trash2, FolderOpen, Users, Calendar, Target, Plus, Clock, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Project type interface based on Payload schema
interface Project {
  id: string
  title: string
  description?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectManager?: {
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
  client?: {
    id: string
    displayName: string
  }
  timeline: {
    startDate?: string
    endDate?: string
    estimatedDuration?: number
  }
  budget?: {
    totalBudget?: number
    spentBudget?: number
    currency?: string
  }
  progress: {
    completionPercentage: number
    milestonesCompleted?: number
    totalMilestones?: number
  }
  tags?: Array<{ tag: string }>
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    document.title = "Angel OS: Projects"
  }, [])

  const { data: projects, loading, error, refresh } = useProjects()

  const columns = [
    {
      accessorKey: 'title',
      header: 'Project',
      cell: (value: string, row: Project) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <Link href={`/dashboard/projects/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            {row.client && (
              <p className="text-sm text-muted-foreground">
                Client: {row.client.displayName}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'projectManager',
      header: 'Project Manager',
      cell: (value: Project['projectManager']) => (
        value ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {value.firstName?.[0] || value.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {value.firstName && value.lastName 
                  ? `${value.firstName} ${value.lastName}` 
                  : value.email}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )
      ),
    },
    {
      accessorKey: 'teamMembers',
      header: 'Team',
      cell: (value: Project['teamMembers']) => (
        <div className="flex items-center space-x-1">
          {value && value.length > 0 ? (
            <>
              <div className="flex -space-x-2">
                {value.slice(0, 3).map((member, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {member.firstName?.[0] || member.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {value.length > 3 && (
                <span className="text-xs text-muted-foreground">+{value.length - 3}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">No team</span>
          )}
        </div>
      ),
    },
    createColumn.badge('status', 'Status', {
      planning: { variant: 'secondary', label: 'Planning' },
      active: { variant: 'default', label: 'Active' },
      on_hold: { variant: 'secondary', label: 'On Hold' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    }),
    createColumn.badge('priority', 'Priority', {
      low: { variant: 'secondary', label: 'Low' },
      medium: { variant: 'outline', label: 'Medium' },
      high: { variant: 'default', label: 'High' },
      critical: { variant: 'destructive', label: 'Critical' },
    }),
    {
      accessorKey: 'progress.completionPercentage',
      header: 'Progress',
      cell: (value: number) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                value >= 100 ? 'bg-green-500' :
                value >= 75 ? 'bg-blue-500' :
                value >= 50 ? 'bg-yellow-500' :
                value >= 25 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'timeline.endDate',
      header: 'Due Date',
      cell: (value: string) => {
        if (!value) return <span className="text-muted-foreground">No due date</span>
        const dueDate = new Date(value)
        const today = new Date()
        const isOverdue = dueDate < today
        const isDueSoon = dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        
        return (
          <div className="flex items-center space-x-2">
            <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-muted-foreground'}`} />
            <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600' : ''}`}>
              {dueDate.toLocaleDateString()}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'budget.totalBudget',
      header: 'Budget',
      cell: (value: number, row: Project) => (
        value ? (
          <div className="text-right">
            <p className="font-medium">${value.toLocaleString()}</p>
            {row.budget?.spentBudget && (
              <p className="text-sm text-muted-foreground">
                Spent: ${row.budget.spentBudget.toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">No budget</span>
        )
      ),
    },
  ]

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (project: Project) => {
        window.location.href = `/dashboard/projects/${project.id}`
      },
    },
    {
      label: 'View Tasks',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (project: Project) => {
        window.location.href = `/dashboard/tasks?project=${project.id}`
      },
    },
    {
      label: 'Edit Project',
      icon: <Edit className="h-4 w-4" />,
      onClick: (project: Project) => {
        window.location.href = `/dashboard/projects/${project.id}/edit`
      },
    },
    {
      label: 'Delete Project',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (project: Project) => {
        if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete project:', project.id)
        }
      },
    },
  ]

  const handleCreateProject = async (data: any) => {
    try {
      // TODO: Implement project creation API call
      console.log('Creating project:', data)
      refresh()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  // Calculate metrics
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const onHoldProjects = projects.filter(p => p.status === 'on_hold').length
  const averageProgress = projects.length > 0 
    ? projects.reduce((sum, project) => sum + project.progress.completionPercentage, 0) / projects.length 
    : 0

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <div className="flex items-center text-xs text-emerald-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                All projects
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                In progress
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
              <div className="text-2xl font-bold">{completedProjects}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Finished
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
              <div className="flex items-center text-xs text-purple-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Overall completion
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateModal(true)}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Plus className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium">New Project</h3>
                  <p className="text-sm text-muted-foreground">Create project</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Active Projects</h3>
                  <p className="text-sm text-muted-foreground">In progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Team Projects</h3>
                  <p className="text-sm text-muted-foreground">Collaborative</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Due Soon</h3>
                  <p className="text-sm text-muted-foreground">Upcoming deadlines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Projects DataTable */}
      <DataTable
        data={projects}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search projects..."
        exportButton={true}
        className="mt-6"
      />

      {/* Create Project Modal */}
      <UniversalModal
        title="Create New Project"
        description="Start a new project and organize your work"
        fields={projectModalFields}
        onSubmit={handleCreateProject}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        submitLabel="Create Project"
        size="lg"
      />
    </div>
  )
}