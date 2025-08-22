"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  MessageSquare, 
  Zap, 
  Brain, 
  Navigation, 
  Mic, 
  Globe, 
  Shield,
  Settings,
  Activity,
  Users,
  Database,
  Code
} from "lucide-react"
import { motion } from "framer-motion"

export default function LEOSystemIntelligencePage() {
  // Set page title
  useEffect(() => {
    document.title = "Angel OS: LEO System Intelligence"
  }, [])

  const leoCapabilities = [
    {
      name: "Conversational Navigation",
      description: "Navigate users to any dashboard page via voice or text commands",
      status: "Active",
      example: "LEO, take me to the products page"
    },
    {
      name: "Form Data Entry",
      description: "Fill out form controls and user inputs conversationally",
      status: "Development",
      example: "LEO, create a new product called 'Wireless Headphones' for $99"
    },
    {
      name: "Business Intelligence",
      description: "Analyze tenant data and provide insights and recommendations",
      status: "Active", 
      example: "LEO, show me our best-selling products this month"
    },
    {
      name: "Multi-language Support",
      description: "Communicate in multiple languages for international tenants",
      status: "Planned",
      example: "LEO, explícame las ventas de este mes en español"
    },
    {
      name: "Guardian Angel Scope",
      description: "Maintain strict tenant data isolation and context awareness",
      status: "Active",
      example: "LEO only sees and acts on KenDev.Co data"
    },
    {
      name: "Voice Interface (VAPI)",
      description: "Full voice input/output with natural conversation flow",
      status: "Integration",
      example: "Natural voice conversations with LEO"
    }
  ]

  const leoMetrics = {
    totalInteractions: 1247,
    successfulNavigations: 892,
    formsCompleted: 156,
    averageResponseTime: "0.8s",
    userSatisfaction: 94,
    activeChannels: 3
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100'
      case 'Development': return 'text-blue-600 bg-blue-100'
      case 'Integration': return 'text-purple-600 bg-purple-100'
      case 'Planned': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500" />
            LEO System Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Your Guardian Angel - Conversational AI for navigation, data entry, and business intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-green-600 bg-green-50">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            KenDev.Co Scoped
          </Badge>
        </div>
      </div>

      {/* LEO Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Interactions</span>
            </div>
            <p className="text-2xl font-bold mt-2">{leoMetrics.totalInteractions.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Navigations</span>
            </div>
            <p className="text-2xl font-bold mt-2">{leoMetrics.successfulNavigations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Forms Filled</span>
            </div>
            <p className="text-2xl font-bold mt-2">{leoMetrics.formsCompleted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Response Time</span>
            </div>
            <p className="text-2xl font-bold mt-2">{leoMetrics.averageResponseTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Satisfaction</span>
            </div>
            <p className="text-2xl font-bold mt-2">{leoMetrics.userSatisfaction}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Channels</span>
            </div>
            <p className="text-2xl font-bold mt-2">{leoMetrics.activeChannels}</p>
          </CardContent>
        </Card>
      </div>

      {/* LEO Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Current Capabilities
          </CardTitle>
          <CardDescription>
            What LEO can do for you right now and what's coming next
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leoCapabilities.map((capability, index) => (
              <motion.div
                key={capability.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{capability.name}</h4>
                    <Badge className={getStatusColor(capability.status)}>
                      {capability.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {capability.description}
                  </p>
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-600">
                    Example: "{capability.example}"
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LEO Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              LEO Configuration
            </CardTitle>
            <CardDescription>
              Customize your Guardian Angel's behavior and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Voice Responses</label>
                <p className="text-xs text-muted-foreground">Enable LEO to speak responses aloud</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Auto-Navigation</label>
                <p className="text-xs text-muted-foreground">Allow LEO to navigate pages automatically</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Form Auto-Fill</label>
                <p className="text-xs text-muted-foreground">Let LEO fill forms based on conversation</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Proactive Suggestions</label>
                <p className="text-xs text-muted-foreground">LEO offers helpful suggestions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Test LEO
            </CardTitle>
            <CardDescription>
              Try out LEO's capabilities in a safe testing environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Command</label>
              <Input 
                placeholder="LEO, take me to the products page"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Response</label>
              <Textarea 
                placeholder="LEO's response will appear here..."
                className="min-h-[100px] text-sm"
                readOnly
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Test Command
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Voice Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guardian Angel Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Guardian Angel Scope
          </CardTitle>
          <CardDescription>
            LEO's current tenant context and data access boundaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">Tenant Data</h4>
              <p className="text-sm text-muted-foreground">
                Scoped to KenDev.Co only
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">User Context</h4>
              <p className="text-sm text-muted-foreground">
                Kenneth Courtney (super_admin)
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Globe className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium">Access Level</h4>
              <p className="text-sm text-muted-foreground">
                Full tenant administration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
