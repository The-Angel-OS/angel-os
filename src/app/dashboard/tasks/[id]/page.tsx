"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePayloadDocument } from "@/hooks/usePayloadCollection"
import { Loader2, Calendar, User, Target, Clock, CheckCircle, Edit, Trash2, Flag, FolderOpen, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import Link from "next/link"

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  project?: {
    id: string
    title: string
  }
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  category?: string
  tags?: Array<{ tag: string }>
  dependencies?: Array<{
    id: string
    title: string
    status: string
  }>
  attachments?: Array<{
    id: string
    filename: string
    url: string
  }>
  comments?: Array<{
    id: string
    content: string
    author: {
      firstName?: string
      lastName?: string
      email: string
    }
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string

  useEffect(() => {
    document.title = `Angel OS: Task - ${taskId}`
  }, [taskId])

  const { data: task, loading, error } = usePayloadDocument<Task>('tasks', taskId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading task details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-red-600">Error Loading Task</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Task Not Found</h2>
        <p className="text-gray-600">The requested task could not be found.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo': return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />To Do</Badge>
      case 'in_progress': return <Badge variant="default" className="bg-blue-100 text-blue-800"><Target className="h-3 w-3 mr-1" />In Progress</Badge>
      case 'review': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Flag className="h-3 w-3 mr-1" />Review</Badge>
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'cancelled': return <Badge variant="destructive" className="bg-red-100 text-red-800">Cancelled</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return <Badge variant="outline" className="bg-green-50 text-green-700">Low</Badge>
      case 'medium': return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">Medium</Badge>
      case 'high': return <Badge variant="default" className="bg-orange-50 text-orange-700">High</Badge>
      case 'urgent': return <Badge variant="destructive" className="bg-red-50 text-red-700">Urgent</Badge>
      default: return <Badge variant="outline">{priority}</Badge>
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{task.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
                {isOverdue && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.description && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">{task.description}</p>
                  </div>
                )}

                {/* Project Link */}
                {task.project && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Project</h4>
                    <Link 
                      href={`/dashboard/projects/${task.project.id}`}
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>{task.project.title}</span>
                    </Link>
                  </div>
                )}

                {/* Time Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.estimatedHours && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Estimated Hours</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {task.estimatedHours}h
                      </div>
                    </div>
                  )}
                  {task.actualHours && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Actual Hours</h4>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {task.actualHours}h
                      </div>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Due Date</h4>
                    <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      {isOverdue && <span className="ml-2 font-medium">(Overdue)</span>}
                    </div>
                  </div>
                )}

                {/* Category */}
                {task.category && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Category</h4>
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
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

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.dependencies.map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Link href={`/dashboard/tasks/${dep.id}`} className="font-medium hover:underline">
                            {dep.title}
                          </Link>
                          <p className="text-sm text-gray-500">Status: {dep.status}</p>
                        </div>
                        <Badge variant="outline">{dep.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comments */}
          {task.comments && task.comments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.author.firstName?.[0] || comment.author.email[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {comment.author.firstName && comment.author.lastName
                                ? `${comment.author.firstName} ${comment.author.lastName}`
                                : comment.author.email}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{comment.content}</p>
                        </div>
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
          {/* Assigned To */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned To</CardTitle>
              </CardHeader>
              <CardContent>
                {task.assignedTo ? (
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {task.assignedTo.firstName?.[0] || task.assignedTo.email[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {task.assignedTo.firstName && task.assignedTo.lastName
                          ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                          : task.assignedTo.email}
                      </p>
                      <p className="text-sm text-gray-500">{task.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Unassigned</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {task.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{attachment.filename}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Task Metadata */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-600">{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <span className="ml-2 text-gray-600">{format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2">{getStatusBadge(task.status)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className="ml-2">{getPriorityBadge(task.priority)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
