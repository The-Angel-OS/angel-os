"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { Bell, Mail, MessageSquare, Calendar, Users, ShoppingCart, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

export default function NotificationSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(false)

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Notification Settings"
  }, [])

  const notificationCategories = [
    {
      icon: MessageSquare,
      title: "Messages & Chat",
      description: "New messages, mentions, and chat activity",
      settings: {
        email: true,
        push: true,
        desktop: false,
        frequency: "immediate"
      }
    },
    {
      icon: Calendar,
      title: "Calendar & Events",
      description: "Meeting reminders, event updates, and schedule changes",
      settings: {
        email: true,
        push: true,
        desktop: true,
        frequency: "immediate"
      }
    },
    {
      icon: Users,
      title: "Team & Collaboration",
      description: "Project updates, task assignments, and team activity",
      settings: {
        email: true,
        push: false,
        desktop: false,
        frequency: "daily"
      }
    },
    {
      icon: ShoppingCart,
      title: "Orders & Commerce",
      description: "New orders, payment confirmations, and inventory alerts",
      settings: {
        email: true,
        push: true,
        desktop: false,
        frequency: "immediate"
      }
    },
    {
      icon: AlertCircle,
      title: "System & Security",
      description: "Security alerts, system updates, and important announcements",
      settings: {
        email: true,
        push: true,
        desktop: true,
        frequency: "immediate"
      }
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Notification Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Choose what notifications you receive and how you want to be notified.
          </p>
        </div>

        {/* Global Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>
              Master controls for all notification types.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <Label>Email Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <Label>Push Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications on mobile devices
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <Label>Desktop Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Show browser notifications on desktop
                  </p>
                </div>
                <Switch
                  checked={desktopNotifications}
                  onCheckedChange={setDesktopNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Quiet Hours</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Start Time</Label>
                    <Select defaultValue="22:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                        <SelectItem value="23:00">11:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">End Time</Label>
                    <Select defaultValue="08:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">6:00 AM</SelectItem>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Disable non-urgent notifications during these hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category-specific Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
            <CardDescription>
              Customize notifications for different types of activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {notificationCategories.map((category, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <category.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <Label className="text-base">{category.title}</Label>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Email</Label>
                      <Switch defaultChecked={category.settings.email} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Push</Label>
                      <Switch defaultChecked={category.settings.push} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Desktop</Label>
                      <Switch defaultChecked={category.settings.desktop} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Frequency</Label>
                      <Select defaultValue={category.settings.frequency}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {index < notificationCategories.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Digest Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Digest & Summary</CardTitle>
            <CardDescription>
              Receive periodic summaries of your activity and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a daily summary of your notifications and activity
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly overview of your projects and metrics
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="space-y-3">
                <Label>Digest Delivery Time</Label>
                <Select defaultValue="09:00">
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  When to send your daily digest
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button>Save Notification Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
