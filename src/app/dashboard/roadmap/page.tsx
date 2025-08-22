"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Users, 
  MessageSquare, 
  Zap,
  Globe,
  Code,
  Lightbulb,
  Vote,
  Plus
} from "lucide-react"
import { motion } from "framer-motion"

export default function ProductRoadmapPage() {
  const roadmapItems = [
    {
      id: "leo-navigation",
      title: "LEO Navigation & Data Entry",
      description: "Enable LEO to navigate users to any page and fill form controls conversationally",
      status: "in-progress",
      phase: "MVP",
      votes: 47,
      priority: "High",
      progress: 75,
      assignee: "Kenneth Courtney",
      dueDate: "Jan 26, 2025"
    },
    {
      id: "conversational-interface",
      title: "Fully Conversational Interface",
      description: "Make entire web interface optional - everything accessible via voice/text",
      status: "planned",
      phase: "A1.1",
      votes: 34,
      priority: "High", 
      progress: 25,
      assignee: "LEO AI",
      dueDate: "Feb 15, 2025"
    },
    {
      id: "parent-child-tenants",
      title: "Parent-Child Tenant Architecture",
      description: "Hierarchical tenants (BJC.org → BJCHospice.org) with directory controls",
      status: "planned",
      phase: "A1.2",
      votes: 28,
      priority: "Medium",
      progress: 10,
      assignee: "System Architecture",
      dueDate: "Mar 1, 2025"
    },
    {
      id: "dynamic-containers",
      title: "Dynamic Container Types",
      description: "User-voted container types for different use cases (Hospice, Medical, etc.)",
      status: "backlog",
      phase: "A2",
      votes: 19,
      priority: "Medium",
      progress: 0,
      assignee: "Community",
      dueDate: "TBD"
    },
    {
      id: "oqtane-integration",
      title: "Oqtane Frontend (Phase A2D)",
      description: "Enterprise .NET frontend for regulated environments and Microsoft shops",
      status: "research",
      phase: "A2D",
      votes: 15,
      priority: "Low",
      progress: 5,
      assignee: "Kenneth Courtney",
      dueDate: "Q2 2025"
    },
    {
      id: "soulfleet-integration",
      title: "SoulFleet Mobile Integration",
      description: "Mobile app for outreach vehicles and field operations",
      status: "vision",
      phase: "A3",
      votes: 42,
      priority: "Future",
      progress: 0,
      assignee: "Clearwater Cruisin'",
      dueDate: "Q3 2025"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'planned': return 'text-purple-600 bg-purple-100'
      case 'backlog': return 'text-gray-600 bg-gray-100'
      case 'research': return 'text-orange-600 bg-orange-100'
      case 'vision': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Future': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />
      default: return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Angel OS Product Roadmap</h1>
          <p className="text-muted-foreground mt-2">
            Community-driven development roadmap for the soul-aligned operating system
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Suggest Feature
        </Button>
      </div>

      {/* Roadmap Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-2">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Total Votes</span>
            </div>
            <p className="text-2xl font-bold mt-2">185</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Contributors</span>
            </div>
            <p className="text-2xl font-bold mt-2">8</p>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Items */}
      <div className="space-y-4">
        {roadmapItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {item.phase}
                        </Badge>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Vote className="w-3 h-3" />
                      {item.votes}
                    </Button>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Assignee: <span className="font-medium">{item.assignee}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Due: <span className="font-medium">{item.dueDate}</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Community Voting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Community Voting
          </CardTitle>
          <CardDescription>
            Help shape Angel OS by voting on features and suggesting new ideas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Suggest New Feature
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Join Discussion
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              View on GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
