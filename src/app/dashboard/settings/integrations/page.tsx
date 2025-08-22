"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Plug, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import IntegrationHub from "@/components/IntegrationHub"

export default function IntegrationsSettingsPage() {
  const [connectedIntegrations, setConnectedIntegrations] = useState([
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and subscription management',
      status: 'connected',
      icon: '💳',
      lastSync: '2 minutes ago'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing and audience management',
      status: 'error',
      icon: '📧',
      lastSync: '1 hour ago',
      error: 'API key expired'
    }
  ])

  const availableIntegrations = [
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Website traffic and user behavior analytics',
      icon: '📊',
      category: 'Analytics'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'CRM and marketing automation platform',
      icon: '🎯',
      category: 'CRM'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and collaboration',
      icon: '💬',
      category: 'Communication'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Workflow automation and app connections',
      icon: '⚡',
      category: 'Automation'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repository and project management',
      icon: '🐙',
      category: 'Development'
    },
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Appointment scheduling and booking',
      icon: '📅',
      category: 'Scheduling'
    }
  ]

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Integrations"
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Plug className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Integrations</h1>
          </div>
          <p className="text-muted-foreground">
            Connect external services and manage API access to enhance your Angel OS experience.
          </p>
        </div>

        {/* Connected Integrations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Connected Integrations</CardTitle>
            <CardDescription>
              Services currently connected to your Angel OS account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectedIntegrations.length > 0 ? (
              <div className="space-y-4">
                {connectedIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{integration.name}</h3>
                          {integration.status === 'connected' ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                        {integration.error && (
                          <p className="text-sm text-destructive mt-1">
                            {integration.error}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Last sync: {integration.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No integrations connected yet. Explore available integrations below.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Hub */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration Hub</CardTitle>
            <CardDescription>
              Discover and connect new services to extend Angel OS functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationHub />
          </CardContent>
        </Card>

        {/* Available Integrations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
            <CardDescription>
              Popular services you can connect to Angel OS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{integration.icon}</div>
                    <Badge variant="outline">{integration.category}</Badge>
                  </div>
                  <h3 className="font-medium mb-2">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {integration.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle>API & Developer Settings</CardTitle>
            <CardDescription>
              Manage API access, webhooks, and developer tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">API Documentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete reference for the Angel OS API
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Webhook Endpoints</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure webhooks for real-time notifications
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Webhooks
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Rate Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    Current: 1,000 requests per hour
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade Limits
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Usage Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">This Month</p>
                    <p className="font-medium">2,847 requests</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">99.2%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Response</p>
                    <p className="font-medium">142ms</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
