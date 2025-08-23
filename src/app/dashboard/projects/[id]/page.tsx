"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePayloadDocument } from "@/hooks/usePayloadCollection"
import { Loader2, Calendar, Users, Target, DollarSign, Clock, CheckCircle, Edit, Trash2, Plus, FolderOpen, User, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import Link from "next/link"

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
    email?: string
    phone?: string
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
  tasks?: Array<{
    id: string
    title: string
    status: string
    assignedTo?: {
      firstName?: string
      lastName?: string
      email: string
    }
  }>
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    document.title = `Angel OS: Project - ${projectId}`
  }, [projectId])

  const { data: project, loading, error } = usePayloadDocument<Project>('projects', projectId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading project details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Project</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-gray-600">The requested project could not be found.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning': return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Target className="h-3 w-3 mr-1" />Planning</Badge>
      case 'active': return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'on_hold': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />On Hold</Badge>
      case 'completed': return <Badge variant="default" className="bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'cancelled': return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelled</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return <Badge variant="outline" className="bg-green-50 text-green-700">Low</Badge>
      case 'medium': return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Medium</Badge>
      case 'high': return <Badge variant="default" className="bg-orange-50 text-orange-700">High</Badge>
      case 'critical': return <Badge variant="destructive" className="bg-red-50 text-red-700">Critical</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(project.status)}
                {getPriorityBadge(project.priority)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{project.description}</p>
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-700">Progress</h4>
                    <span className="text-sm font-medium">{project.progress.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        project.progress.completionPercentage >= 100 ? 'bg-green-500' :
                        project.progress.completionPercentage >= 75 ? 'bg-blue-500' :
                        project.progress.completionPercentage >= 50 ? 'bg-yellow-500' :
                        project.progress.completionPercentage >= 25 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(project.progress.completionPercentage, 100)}%` }}
                    />
                  </div>
                  {project.progress.milestonesCompleted !== undefined && project.progress.totalMilestones && (
                    <p className="text-sm text-gray-500 mt-1">
                      {project.progress.milestonesCompleted} of {project.progress.totalMilestones} milestones completed
                    </p>
                  )}
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.timeline.startDate && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Start Date</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(project.timeline.startDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  )}
                  {project.timeline.endDate && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Due Date</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(project.timeline.endDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Budget */}
                {project.budget?.totalBudget && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Budget</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        <span className="font-medium">
                          ${project.budget.totalBudget.toLocaleString()} {project.budget.currency || 'USD'}
                        </span>
                      </div>
                      {project.budget.spentBudget !== undefined && (
                        <div className="text-sm text-gray-600">
                          Spent: ${project.budget.spentBudget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks */}
          {project.tasks && project.tasks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Project Tasks</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-gray-400" />
                          <div>
                            <Link href={`/dashboard/tasks/${task.id}`} className="font-medium hover:underline">
                              {task.title}
                            </Link>
                            <p className="text-sm text-gray-500">Status: {task.status}</p>
                          </div>
                        </div>
                        {task.assignedTo && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.assignedTo.firstName?.[0] || task.assignedTo.email[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              {task.assignedTo.firstName && task.assignedTo.lastName
                                ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                                : task.assignedTo.email}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Manager */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Manager</CardTitle>
              </CardHeader>
              <CardContent>
                {project.projectManager ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {project.projectManager.firstName?.[0] || project.projectManager.email[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {project.projectManager.firstName && project.projectManager.lastName
                          ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
                          : project.projectManager.email}
                      </p>
                      <p className="text-sm text-gray-500">{project.projectManager.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No project manager assigned</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {project.teamMembers && project.teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {project.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.firstName?.[0] || member.email[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.firstName && member.lastName
                              ? `${member.firstName} ${member.lastName}`
                              : member.email}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No team members assigned</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Client Information */}
          {project.client && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{project.client.displayName}</span>
                    </div>
                    {project.client.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{project.client.email}</span>
                      </div>
                    )}
                    {project.client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{project.client.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Project Metadata */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <span className="ml-2 text-gray-600">{format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
                </div>
                {project.timeline.estimatedDuration && (
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">{project.timeline.estimatedDuration} days</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
