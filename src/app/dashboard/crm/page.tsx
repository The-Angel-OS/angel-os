"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
  value: number
  source: string
  assignedTo: string
  createdAt: string
}

interface Task {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed"
  dueDate: string
  assignedTo: string
}

const leadsData: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Corp",
    status: "qualified",
    value: 15000,
    source: "Website",
    assignedTo: "Sarah Johnson",
    createdAt: "2025-08-15",
  },
  {
    id: "2",
    name: "Emily Davis",
    email: "emily@startup.com",
    phone: "+1 (555) 987-6543",
    company: "Startup Inc",
    status: "proposal",
    value: 25000,
    source: "Referral",
    assignedTo: "Mike Wilson",
    createdAt: "2025-08-14",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "michael@corp.com",
    phone: "+1 (555) 456-7890",
    company: "Big Corp",
    status: "negotiation",
    value: 50000,
    source: "Cold Call",
    assignedTo: "Sarah Johnson",
    createdAt: "2025-08-13",
  },
  {
    id: "4",
    name: "Lisa Wilson",
    email: "lisa@company.com",
    phone: "+1 (555) 321-0987",
    company: "Company LLC",
    status: "new",
    value: 8000,
    source: "Social Media",
    assignedTo: "Tom Anderson",
    createdAt: "2025-08-12",
  },
  {
    id: "5",
    name: "David Johnson",
    email: "david@business.com",
    phone: "+1 (555) 654-3210",
    company: "Business Co",
    status: "closed-won",
    value: 35000,
    source: "Email Campaign",
    assignedTo: "Mike Wilson",
    createdAt: "2025-08-11",
  },
]

const tasksData: Task[] = [
  {
    id: "1",
    title: "Follow up with Acme Inc.",
    description: "Send proposal and schedule meeting",
    priority: "high",
    status: "pending",
    dueDate: "2025-08-20",
    assignedTo: "Sarah Johnson",
  },
  {
    id: "2",
    title: "Prepare quarterly report",
    description: "Compile sales data and forecasts",
    priority: "medium",
    status: "in-progress",
    dueDate: "2025-08-22",
    assignedTo: "Mike Wilson",
  },
  {
    id: "3",
    title: "Update customer profiles",
    description: "Verify contact information and preferences",
    priority: "low",
    status: "completed",
    dueDate: "2025-08-18",
    assignedTo: "Tom Anderson",
  },
  {
    id: "4",
    title: "Call potential leads",
    description: "Contact 10 new leads from website",
    priority: "high",
    status: "pending",
    dueDate: "2025-08-19",
    assignedTo: "Sarah Johnson",
  },
]

const leadsSourceData = [
  { name: "Social", value: 275, color: "#8884d8" },
  { name: "Email", value: 200, color: "#82ca9d" },
  { name: "Call", value: 287, color: "#ffc658" },
  { name: "Others", value: 173, color: "#ff7300" },
]

const salesPipelineData = [
  { stage: "Lead", deals: 235, value: 420500, percentage: 36 },
  { stage: "Qualified", deals: 146, value: 267800, percentage: 24 },
  { stage: "Proposal", deals: 84, value: 192400, percentage: 18 },
  { stage: "Negotiation", deals: 52, value: 129600, percentage: 12 },
  { stage: "Closed Won", deals: 36, value: 97200, percentage: 8 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-500"
    case "contacted":
      return "bg-yellow-500"
    case "qualified":
      return "bg-green-500"
    case "proposal":
      return "bg-purple-500"
    case "negotiation":
      return "bg-orange-500"
    case "closed-won":
      return "bg-green-600"
    case "closed-lost":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-600"
    case "medium":
      return "text-yellow-600"
    case "low":
      return "text-green-600"
    default:
      return "text-gray-600"
  }
}

export default function CRMPage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: CRM"
  }, [])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLeads = leadsData.filter((lead) => {
    const search = (searchTerm || "").toLowerCase()
    if (!search) return true

    return (
      (lead.name || "").toLowerCase().includes(search) ||
      (lead.company || "").toLowerCase().includes(search) ||
      (lead.email || "").toLowerCase().includes(search)
    )
  })

  const totalCustomers = leadsData.length
  const totalDeals = leadsData.reduce((sum, lead) => sum + lead.value, 0)
  const totalRevenue = leadsData
    .filter((lead) => lead.status === "closed-won")
    .reduce((sum, lead) => sum + lead.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            22 Jul 2025 - 18 Aug 2025
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1890</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +10.4% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,02,890</div>
            <p className="text-xs text-red-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$435,578</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your target is incomplete</CardTitle>
          <CardDescription>
            You have completed <span className="font-semibold text-primary">48%</span> of the given target, you can also
            check your status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted stroke-current"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary stroke-current"
                  strokeWidth="3"
                  strokeDasharray="48, 100"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">48%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                You have completed 48% of the given target, you can also check your status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by Source */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Leads by Source</CardTitle>
              <CardDescription>Track and manage your upcoming tasks.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={leadsSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadsSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {leadsSourceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name.toUpperCase()}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Track and manage your upcoming tasks.</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {tasksData.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Checkbox checked={task.status === "completed"} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {task.dueDate}
                        </div>
                        <div className="flex items-center gap-1">
                          {task.status === "completed" ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : task.status === "in-progress" ? (
                            <Clock className="h-3 w-3 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-600" />
                          )}
                          {task.status.replace("-", " ")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Sales Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
          <CardDescription>Current deals in your sales pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesPipelineData.map((stage, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{stage.stage}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">
                      {stage.deals} deals • ${stage.value.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium">{stage.percentage}%</span>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leads</CardTitle>
              <CardDescription>Manage your sales leads and prospects</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value || "")}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {lead.status?.replace("-", " ") || "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{lead.name || "N/A"}</TableCell>
                  <TableCell>{lead.email || "N/A"}</TableCell>
                  <TableCell>{lead.company || "N/A"}</TableCell>
                  <TableCell>${lead.value?.toLocaleString() || "0"}</TableCell>
                  <TableCell>{lead.source || "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
