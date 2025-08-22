'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Hash, MessageSquare, FileText, BarChart3, Settings, Users } from 'lucide-react'

interface DefaultChannelViewProps {
  channelId: string
}

export function DefaultChannelView({ channelId }: DefaultChannelViewProps) {
  const channelTypes = [
    {
      id: 'text',
      name: 'Text Chat',
      description: 'Real-time messaging with team members and AI agents',
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      id: 'notes',
      name: 'Collaborative Notes',
      description: 'Notion-style collaborative editing with Lexical editor',
      icon: FileText,
      color: 'text-green-500'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Customizable widgets and analytics in a grid layout',
      icon: BarChart3,
      color: 'text-purple-500'
    },
    {
      id: 'crm',
      name: 'CRM Pipeline',
      description: 'Customer relationship management and sales tracking',
      icon: Users,
      color: 'text-orange-500'
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Configuration for space, user, tenant, or system levels',
      icon: Settings,
      color: 'text-gray-500'
    }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
            <Hash className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Channel Not Found</h1>
            <p className="text-sm text-muted-foreground">
              The channel "{channelId}" could not be loaded
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Channel Not Available</h2>
            <p className="text-muted-foreground">
              The requested channel "{channelId}" doesn't exist or you don't have access to it.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Available Channel Types</CardTitle>
              <CardDescription>
                Angel OS Spaces supports various channel types for different workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channelTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <div key={type.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`flex-shrink-0 ${type.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

















