'use client'

import React, { useState } from 'react'
import type { Space, User as PayloadUser } from '@/payload-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, Move, Trash2 } from 'lucide-react'

interface Channel {
  id: string
  name: string
  type: string
  description?: string
}

interface ChannelWidget {
  id: string
  type: 'sql' | 'analytics' | 'chart' | 'kpi' | 'notes' | 'calendar' | 'geo-validation'
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: any
}

interface DashboardControlProps {
  space: Space | null
  channel: Channel
  currentUser: PayloadUser
  widgets: ChannelWidget[]
}

export function DashboardControl({
  space,
  channel,
  currentUser,
  widgets: initialWidgets
}: DashboardControlProps) {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [isEditMode, setIsEditMode] = useState(false)

  const addWidget = () => {
    const newWidget: ChannelWidget = {
      id: `widget-${Date.now()}`,
      type: 'kpi',
      title: 'New Widget',
      position: { x: 0, y: 0, w: 4, h: 3 },
      config: {}
    }
    setWidgets([...widgets, newWidget])
  }

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
  }

  const renderWidget = (widget: ChannelWidget) => {
    const getWidgetContent = () => {
      switch (widget.type) {
        case 'kpi':
          return (
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">$24,500</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              <div className="text-xs text-green-600 mt-1">+12% from last month</div>
            </div>
          )
        
        case 'chart':
          return (
            <div className="h-32 bg-muted/20 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-medium">Sales Chart</div>
                <div className="text-xs text-muted-foreground">Chart visualization here</div>
              </div>
            </div>
          )
        
        case 'analytics':
          return (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Page Views</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Unique Visitors</span>
                <span className="font-medium">567</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Conversion Rate</span>
                <span className="font-medium">3.2%</span>
              </div>
            </div>
          )
        
        case 'geo-validation':
          return (
            <div className="text-center">
              <div className="text-sm font-medium">Address Validator</div>
              <div className="text-xs text-muted-foreground mt-1">
                Check address restrictions
              </div>
              <Button size="sm" className="mt-2">
                Validate Address
              </Button>
            </div>
          )
        
        default:
          return (
            <div className="text-center text-muted-foreground">
              <div className="text-sm">Widget: {widget.type}</div>
              <div className="text-xs">Configuration needed</div>
            </div>
          )
      }
    }

    return (
      <Card key={widget.id} className="relative group">
        {isEditMode && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Move className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Settings className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={() => removeWidget(widget.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{widget.title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {widget.type}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {getWidgetContent()}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Dashboard Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">📊</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">{channel.name}</h1>
              {channel.description && (
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
            >
              {isEditMode ? "Done" : "Edit"}
            </Button>
            
            {isEditMode && (
              <Button size="sm" onClick={addWidget}>
                <Plus className="h-4 w-4 mr-1" />
                Add Widget
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-auto p-6">
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Add widgets to create your custom dashboard
            </p>
            <Button onClick={addWidget}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Widget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {widgets.map(renderWidget)}
          </div>
        )}
      </div>
    </div>
  )
}

















