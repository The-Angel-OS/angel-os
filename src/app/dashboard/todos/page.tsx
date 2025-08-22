"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Circle,
  Trash2
} from "lucide-react"
import { motion } from "framer-motion"

export default function TodoListsPage() {
  const [newTodo, setNewTodo] = useState("")

  const todoLists = [
    {
      id: "mvp-week",
      name: "Angel OS MVP Week",
      description: "Critical tasks for MVP completion by Jan 26",
      items: [
        { id: 1, text: "LEO navigation system", completed: true, priority: "High", assignee: "Kenneth" },
        { id: 2, text: "Fix TypeScript errors", completed: false, priority: "High", assignee: "Kenneth" },
        { id: 3, text: "Wire Products to Payload", completed: false, priority: "High", assignee: "Kenneth" },
        { id: 4, text: "Wire Orders to Payload", completed: false, priority: "High", assignee: "Kenneth" },
        { id: 5, text: "Parent-child tenant design", completed: false, priority: "Medium", assignee: "Kenneth" }
      ]
    },
    {
      id: "clearwater-cruisin",
      name: "Clearwater Cruisin' Content",
      description: "Video content and outreach mission planning",
      items: [
        { id: 6, text: "Edit Episode 5 - Angel OS Dev Session", completed: false, priority: "Medium", assignee: "Kenneth" },
        { id: 7, text: "Upload Enterprise Dog Park footage", completed: true, priority: "Low", assignee: "Kenneth" },
        { id: 8, text: "Plan next outreach mission", completed: false, priority: "Medium", assignee: "Team" },
        { id: 9, text: "Update YouTube channel art", completed: false, priority: "Low", assignee: "Kenneth" }
      ]
    },
    {
      id: "business-development",
      name: "KenDev.Co Business",
      description: "Client work and business development tasks",
      items: [
        { id: 10, text: "Follow up with Donato collaboration", completed: false, priority: "High", assignee: "Kenneth" },
        { id: 11, text: "Apply to fence technician position", completed: true, priority: "Medium", assignee: "Kenneth" },
        { id: 12, text: "Update portfolio website", completed: false, priority: "Medium", assignee: "Kenneth" },
        { id: 13, text: "Prepare R-MA homecoming trip", completed: false, priority: "Low", assignee: "Kenneth" }
      ]
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100' 
      case 'Low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const totalTasks = todoLists.reduce((acc, list) => acc + list.items.length, 0)
  const completedTasks = todoLists.reduce((acc, list) => acc + list.items.filter(item => item.completed).length, 0)
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Todo Lists</h1>
          <p className="text-muted-foreground mt-2">
            Organize and track tasks across all Angel OS projects and missions
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
            New List
          </Button>
        </div>
      </div>

      {/* Todo Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Tasks</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{completedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalTasks - completedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold mt-2">{completionRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Todo Lists */}
      <div className="space-y-6">
        {todoLists.map((list, listIndex) => (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: listIndex * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5" />
                      {list.name}
                    </CardTitle>
                    <CardDescription>{list.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {list.items.filter(item => item.completed).length}/{list.items.length} completed
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {list.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (listIndex * 0.1) + (itemIndex * 0.05) }}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox 
                        checked={item.completed}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {item.text}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(item.priority)} variant="secondary">
                        {item.priority}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{item.assignee}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Add new todo */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new task..."
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTodo.trim()) {
                          // TODO: Add new todo item
                          console.log('Adding todo:', newTodo)
                          setNewTodo("")
                        }
                      }}
                    />
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
          <CardDescription>
            Rapidly add tasks to any list or create new lists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input 
              placeholder="What needs to be done?"
              className="flex-1"
            />
            <Button>Add Task</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
