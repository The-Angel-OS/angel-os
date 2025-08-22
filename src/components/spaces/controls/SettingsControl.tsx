'use client'

import React, { useState } from 'react'
import type { Space, User as PayloadUser } from '@/payload-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save, Users, Shield, Bell, Palette } from 'lucide-react'

interface Channel {
  id: string
  name: string
  type: string
  description?: string
}

interface SettingsControlProps {
  space: Space | null
  channel: Channel
  currentUser: PayloadUser
  settingsType: 'space' | 'user' | 'tenant' | 'system'
}

export function SettingsControl({
  space,
  channel,
  currentUser,
  settingsType
}: SettingsControlProps) {
  const [spaceName, setSpaceName] = useState(space?.name || '')
  const [spaceDescription, setSpaceDescription] = useState(space?.description || '')
  const [notifications, setNotifications] = useState(true)
  const [publicAccess, setPublicAccess] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)

  const handleSave = () => {
    console.log('Saving settings:', {
      spaceName,
      spaceDescription,
      notifications,
      publicAccess,
      aiEnabled
    })
  }

  const getSettingsTitle = () => {
    switch (settingsType) {
      case 'space': return 'Space Settings'
      case 'user': return 'User Settings'
      case 'tenant': return 'Tenant Settings'
      case 'system': return 'System Settings'
      default: return 'Settings'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Settings Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{getSettingsTitle()}</h1>
              <p className="text-sm text-muted-foreground">
                Configure {settingsType} preferences and options
              </p>
            </div>
          </div>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the basic information for this {settingsType}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                      placeholder="Enter name..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={spaceDescription}
                      onChange={(e) => setSpaceDescription(e.target.value)}
                      placeholder="Enter description..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>
                    Enable or disable features for this {settingsType}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Assistant</Label>
                      <div className="text-sm text-muted-foreground">
                        Enable Leo AI assistant for this space
                      </div>
                    </div>
                    <Switch
                      checked={aiEnabled}
                      onCheckedChange={setAiEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Access</Label>
                      <div className="text-sm text-muted-foreground">
                        Allow public access to this space
                      </div>
                    </div>
                    <Switch
                      checked={publicAccess}
                      onCheckedChange={setPublicAccess}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissions Settings */}
            <TabsContent value="permissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Access Control</span>
                  </CardTitle>
                  <CardDescription>
                    Manage who can access and modify this {settingsType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Permission Management</h3>
                    <p className="text-muted-foreground">
                      Advanced permission controls coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </div>
                    </div>
                    <Switch
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <div className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Message Notifications</Label>
                      <div className="text-sm text-muted-foreground">
                        Get notified of new messages
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Theme & Appearance</span>
                  </CardTitle>
                  <CardDescription>
                    Customize the look and feel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Theme Customization</h3>
                    <p className="text-muted-foreground">
                      Advanced theming options coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}












