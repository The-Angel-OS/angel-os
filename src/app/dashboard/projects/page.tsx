"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"
import { motion } from "framer-motion"

export default function ProjectsPage() {
  const projects = [
    {
      id: "angel-os-mvp",
      name: "Angel OS MVP Development", 
      description: "Phase A1 MVP completion - LEO intelligence, navigation, and core functionality",
      status: "In Progress",
      priority: "High",
      progress: 85,
      dueDate: "Jan 26, 2025",
      team: [
        { name: "Kenneth Courtney", role: "Lead Developer", avatar: "/placeholder.svg" },
        { name: "LEO AI", role: "Assistant", avatar: "/placeholder.svg" }
      ],
      tasks: { total: 12, completed: 10, inProgress: 2 }
    },
    {
      id: "clearwater-cruisin",
      name: "Clearwater Cruisin' Ministries",
      description: "SoulFleet outreach platform integration and content management system",
      status: "Active",
      priority: "Medium", 
      progress: 60,
      dueDate: "Feb 15, 2025",
      team: [
        { name: "Kenneth Courtney", role: "Herald", avatar: "/placeholder.svg" },
        { name: "Fifth Element", role: "Consort", avatar: "/placeholder.svg" },
        { name: "Ahmed", role: "Soul Brother", avatar: "/placeholder.svg" }
      ],
      tasks: { total: 8, completed: 5, inProgress: 3 }
    },
    {
      id: "kendev-ecommerce",
      name: "KenDev.Co E-commerce Platform",
      description: "AI automation services storefront with booking and payment integration",
      status: "Planning",
      priority: "Medium",
      progress: 30,
      dueDate: "Mar 1, 2025", 
      team: [
        { name: "Kenneth Courtney", role: "Technical Lead", avatar: "/placeholder.svg" }
      ],
      tasks: { total: 15, completed: 4, inProgress: 1 }
    },
    {
      id: "parent-child-tenants",
      name: "Parent-Child Tenant Architecture",
      description: "Hierarchical tenant relationships for enterprise deployments (BJC.org → BJCHospice.org)",
      status: "Backlog",
      priority: "Low",
      progress: 5,
      dueDate: "Q2 2025",
      team: [
        { name: "System Architecture", role: "Planning", avatar: "/placeholder.svg" }
      ],
      tasks: { total: 20, completed: 1, inProgress: 0 }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100'
      case 'In Progress': return 'text-blue-600 bg-blue-100'
      case 'Active': return 'text-purple-600 bg-purple-100'
      case 'Planning': return 'text-yellow-600 bg-yellow-100'
      case 'Backlog': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all Angel OS development and outreach projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Projects</span>
            </div>
            <p className="text-2xl font-bold mt-2">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {projects.filter(p => p.status === 'In Progress' || p.status === 'Active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Completed Tasks</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {projects.reduce((acc, p) => acc + p.tasks.completed, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Team Members</span>
            </div>
            <p className="text-2xl font-bold mt-2">4</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Team and Tasks */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Due: {project.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {project.tasks.completed}/{project.tasks.total} tasks completed
                      </div>
                      <div className="flex -space-x-2">
                        {project.team.map((member, idx) => (
                          <Avatar key={idx} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common project management tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm">New Project</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Review Tasks</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Team Overview</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Timeline View</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
