"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { UniversalModal, taskModalFields } from "@/components/ui/universal-modal"
import { useTasks } from "@/hooks/usePayloadCollection"
import { TrendingUp, Eye, Edit, Trash2, CheckSquare, Clock, User, AlertTriangle, Plus, Calendar, Flag } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Task type interface based on Payload schema
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
  tags?: Array<{ tag: string }>
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function TasksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    document.title = "Angel OS: Tasks"
  }, [])

  const { data: tasks, loading, error, refresh } = useTasks()

  const columns = [
    {
      accessorKey: 'title',
      header: 'Task',
      cell: (value: string, row: Task) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <Link href={`/dashboard/tasks/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            {row.project && (
              <p className="text-sm text-muted-foreground">
                Project: {row.project.title}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: (value: Task['assignedTo']) => (
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
    createColumn.badge('status', 'Status', {
      todo: { variant: 'secondary', label: 'To Do' },
      in_progress: { variant: 'default', label: 'In Progress' },
      review: { variant: 'default', label: 'Review' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    }),
    createColumn.badge('priority', 'Priority', {
      low: { variant: 'secondary', label: 'Low' },
      medium: { variant: 'outline', label: 'Medium' },
      high: { variant: 'default', label: 'High' },
      urgent: { variant: 'destructive', label: 'Urgent' },
    }),
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: (value: string) => {
        if (!value) return <span className="text-muted-foreground">No due date</span>
        const dueDate = new Date(value)
        const today = new Date()
        const isOverdue = dueDate < today
        const isDueSoon = dueDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
        
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
      accessorKey: 'estimatedHours',
      header: 'Est. Hours',
      cell: (value: number) => (
        value ? <span className="text-sm">{value}h</span> : <span className="text-muted-foreground">-</span>
      ),
    },
    createColumn.date('updatedAt', 'Updated'),
  ]

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (task: Task) => {
        window.location.href = `/dashboard/tasks/${task.id}`
      },
    },
    {
      label: 'Mark Complete',
      icon: <CheckSquare className="h-4 w-4" />,
      condition: (task: Task) => task.status !== 'completed',
      onClick: (task: Task) => {
        // TODO: Implement mark complete functionality
        console.log('Mark complete:', task.id)
      },
    },
    {
      label: 'Edit Task',
      icon: <Edit className="h-4 w-4" />,
      onClick: (task: Task) => {
        window.location.href = `/dashboard/tasks/${task.id}/edit`
      },
    },
    {
      label: 'Delete Task',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (task: Task) => {
        if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete task:', task.id)
        }
      },
    },
  ]

  const handleCreateTask = async (data: any) => {
    try {
      // TODO: Implement task creation API call
      console.log('Creating task:', data)
      refresh()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  // Calculate metrics
  const totalTasks = tasks.length
  const todoTasks = tasks.filter(t => t.status === 'todo').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate) return false
    return new Date(t.dueDate) < new Date() && t.status !== 'completed'
  }).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage your tasks and track progress
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <div className="flex items-center text-xs text-indigo-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                All tasks
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Active work
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
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
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueTasks}</div>
              <div className="flex items-center text-xs text-red-600">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Need attention
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
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Plus className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium">New Task</h3>
                  <p className="text-sm text-muted-foreground">Create task</p>
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
                  <Flag className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">High Priority</h3>
                  <p className="text-sm text-muted-foreground">Urgent tasks</p>
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
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">My Tasks</h3>
                  <p className="text-sm text-muted-foreground">Assigned to me</p>
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
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Due Today</h3>
                  <p className="text-sm text-muted-foreground">Today's tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tasks DataTable */}
      <DataTable
        data={tasks}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search tasks..."
        exportButton={true}
        className="mt-6"
      />

      {/* Create Task Modal */}
      <UniversalModal
        title="Create New Task"
        description="Add a new task to your workflow"
        fields={taskModalFields}
        onSubmit={handleCreateTask}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        submitLabel="Create Task"
        size="md"
      />
    </div>
  )
}
