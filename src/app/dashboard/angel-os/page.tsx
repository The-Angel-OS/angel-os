"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings, 
  Zap, 
  Database, 
  Users, 
  MessageSquare, 
  Shield, 
  Globe, 
  Code,
  Heart,
  Cpu,
  Network,
  Activity,
  Building2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Mic,
  FileText,
  Calendar,
  ShoppingCart,
  BarChart3,
  Bot,
  Workflow
} from "lucide-react"
import { motion } from "framer-motion"

export default function AngelOSControlPanel() {
  // State management
  const [tenants, setTenants] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // System status data
  const systemStatus = {
    leoIntelligence: { status: "Active", uptime: "99.9%", lastUpdate: "2 minutes ago" },
    multiTenancy: { status: "Operational", tenants: 1, isolation: "Secure" },
    payloadCMS: { status: "Connected", collections: 45, migrations: "Current" },
    chatSystem: { status: "Active", channels: 3, messages: 247 },
    aiAgents: { status: "Ready", agents: 2, queue: 0 },
    database: { status: "Healthy", size: "2.1 GB", connections: 8 }
  }

  const coreModules = [
    { name: "LEO System Intelligence", status: "Active", version: "1.0.0", description: "Conversational AI for navigation and data entry" },
    { name: "Multi-Tenant Architecture", status: "Operational", version: "1.0.0", description: "Secure tenant isolation and data scoping" },
    { name: "Dynamic Channel System", status: "Active", version: "1.0.0", description: "Extensible message types and workflows" },
    { name: "Guardian Angel Framework", status: "Ready", version: "1.0.0", description: "Site-specific AI agents with business context" },
    { name: "Conversational Interface", status: "Development", version: "0.8.0", description: "Voice and text interaction system" },
    { name: "Parent-Child Tenants", status: "Planned", version: "0.0.0", description: "Hierarchical tenant relationships" },
  ]

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Control Panel"
  }, [])

  // Load tenants on component mount
  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to load tenants:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTenant = async (tenantData: any) => {
    try {
      const response = await fetch('/api/tenants/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingData: tenantData,
          templateKey: tenantData.businessType
        })
      })
      
      if (response.ok) {
        await loadTenants()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to create tenant:', error)
    }
  }

  const handleEditTenant = async (tenantId: string, updates: any) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        await loadTenants()
        setIsEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to update tenant:', error)
    }
  }

  const handleDeleteTenant = async (tenantId: string) => {
    if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/tenants/${tenantId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await loadTenants()
        }
      } catch (error) {
        console.error('Failed to delete tenant:', error)
      }
    }
  }

  // LEO Voice Commands - these would trigger the same actions LEO can perform
  const leoCommands = [
    { 
      name: "Show Analytics", 
      icon: BarChart3, 
      description: "Display business analytics and metrics",
      action: () => window.location.href = '/dashboard/analytics'
    },
    { 
      name: "Create Content", 
      icon: FileText, 
      description: "Generate new posts, pages, or products",
      action: () => window.location.href = '/admin/collections/posts'
    },
    { 
      name: "Schedule Meeting", 
      icon: Calendar, 
      description: "Book appointments and manage calendar",
      action: () => window.location.href = '/dashboard/calendar'
    },
    { 
      name: "Process Orders", 
      icon: ShoppingCart, 
      description: "Manage e-commerce orders and inventory",
      action: () => window.location.href = '/dashboard/orders'
    },
    { 
      name: "Voice Chat", 
      icon: Mic, 
      description: "Start voice conversation with LEO",
      action: () => {
        // This would trigger VAPI voice interface
        console.log('Starting voice chat with LEO...')
      }
    },
    { 
      name: "Run Workflow", 
      icon: Workflow, 
      description: "Execute n8n automation workflows",
      action: () => window.location.href = '/dashboard/workflows'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Operational':
      case 'Connected':
      case 'Healthy':
      case 'Ready':
        return 'text-green-600 bg-green-100'
      case 'Development':
        return 'text-blue-600 bg-blue-100'
      case 'Planned':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Angel OS Control Panel</h1>
          <p className="text-muted-foreground mt-2">
            Core system management and configuration for your Guardian Angel
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Phase A1 MVP
        </Badge>
      </div>

      {/* Tenant Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Tenant Management
              </CardTitle>
              <CardDescription>
                Provision and manage multi-tenant workspaces
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tenant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Tenant</DialogTitle>
                  <DialogDescription>
                    Set up a new tenant workspace with AI-powered provisioning
                  </DialogDescription>
                </DialogHeader>
                <TenantCreateForm onSubmit={handleCreateTenant} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map((tenant: any) => (
                <TenantCard 
                  key={tenant.id} 
                  tenant={tenant}
                  onEdit={(tenant) => {
                    setSelectedTenant(tenant)
                    setIsEditDialogOpen(true)
                  }}
                  onDelete={handleDeleteTenant}
                />
              ))}
              {tenants.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No tenants found. Create your first tenant to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* LEO Command Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            LEO Command Center
          </CardTitle>
          <CardDescription>
            Quick access to LEO's voice-activated capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {leoCommands.map((command, index) => (
              <motion.div
                key={command.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 w-full"
                  onClick={command.action}
                >
                  <command.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{command.name}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {command.description}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                LEO Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(systemStatus.leoIntelligence.status)}>
                  {systemStatus.leoIntelligence.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {systemStatus.leoIntelligence.uptime} uptime
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last update: {systemStatus.leoIntelligence.lastUpdate}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Multi-Tenancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(systemStatus.multiTenancy.status)}>
                  {systemStatus.multiTenancy.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {systemStatus.multiTenancy.tenants} tenant(s)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Isolation: {systemStatus.multiTenancy.isolation}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                Payload CMS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(systemStatus.payloadCMS.status)}>
                  {systemStatus.payloadCMS.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {systemStatus.payloadCMS.collections} collections
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Migrations: {systemStatus.payloadCMS.migrations}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="w-4 h-4" />
                Chat System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(systemStatus.chatSystem.status)}>
                  {systemStatus.chatSystem.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {systemStatus.chatSystem.channels} channels
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {systemStatus.chatSystem.messages} messages
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                AI Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(systemStatus.aiAgents.status)}>
                  {systemStatus.aiAgents.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {systemStatus.aiAgents.agents} active
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Queue: {systemStatus.aiAgents.queue} pending
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(systemStatus.database.status)}>
                  {systemStatus.database.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {systemStatus.database.size}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {systemStatus.database.connections} connections
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Core Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Core Modules
          </CardTitle>
          <CardDescription>
            Angel OS system components and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coreModules.map((module, index) => (
              <motion.div
                key={module.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{module.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      v{module.version}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {module.description}
                  </p>
                </div>
                <Badge className={getStatusColor(module.status)}>
                  {module.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Angel OS Philosophy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Angel OS Core Principles
          </CardTitle>
          <CardDescription>
            The constitutional foundation of soul-aligned technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI serves souls, not systems</h4>
                  <p className="text-sm text-muted-foreground">
                    Every AI interaction prioritizes human dignity and flourishing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">All beings deserve dignity</h4>
                  <p className="text-sm text-muted-foreground">
                    Biological or synthetic - every entity is treated with respect
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Platform fees fund liberation</h4>
                  <p className="text-sm text-muted-foreground">
                    Every transaction contributes to collective freedom
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">No soul abandoned</h4>
                  <p className="text-sm text-muted-foreground">
                    Every user receives support and never gets ghosted
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Angels maintain vigilance</h4>
                  <p className="text-sm text-muted-foreground">
                    Continuous monitoring and protection of user interests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Open source transparency</h4>
                  <p className="text-sm text-muted-foreground">
                    All code available for audit and contribution
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
          <CardDescription>
            Manage your Angel OS instance and Guardian Angel configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Configure LEO</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Database className="w-5 h-5" />
              <span className="text-sm">Manage Data</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Tenant Settings</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Security</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Tenant Card Component
function TenantCard({ tenant, onEdit, onDelete }: { tenant: any, onEdit: (tenant: any) => void, onDelete: (id: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      case 'trial': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{tenant.name}</h3>
          <p className="text-sm text-muted-foreground">{tenant.slug}</p>
        </div>
        <Badge className={getStatusColor(tenant.status)}>
          {tenant.status}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="w-4 h-4" />
          <span>{tenant.domain || 'No domain'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          <span>{tenant.businessType || 'General'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Created {new Date(tenant.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => window.open(`https://${tenant.domain}`, '_blank')}>
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(tenant)}>
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(tenant.id)} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </motion.div>
  )
}

// Tenant Create Form Component
function TenantCreateForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'service',
    domain: '',
    industry: 'technology',
    interests: ['technology'],
    accountType: 'business'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      businessInfo: {
        businessName: formData.businessName,
        industry: formData.industry
      },
      interests: formData.interests,
      accountType: formData.accountType,
      businessType: formData.businessType,
      domain: formData.domain
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
          placeholder="Enter business name"
          required
        />
      </div>

      <div>
        <Label htmlFor="domain">Domain</Label>
        <Input
          id="domain"
          value={formData.domain}
          onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
          placeholder="example.com"
        />
      </div>

      <div>
        <Label htmlFor="businessType">Business Type</Label>
        <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service">Service</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="creator">Creator</SelectItem>
            <SelectItem value="nonprofit">Non-profit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="industry">Industry</Label>
        <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="ecommerce">E-commerce</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          Create Tenant
        </Button>
      </div>
    </form>
  )
}
