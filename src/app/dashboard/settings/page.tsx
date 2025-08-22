"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Settings, User, Bell, Palette, Plug, Shield, ArrowRight } from "lucide-react"
import { useEffect } from "react"
import { useAuth } from '@payloadcms/ui'
import Link from "next/link"

export default function SettingsPage() {
  const { user } = useAuth()

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Settings"
  }, [])

  const settingsCategories = [
    {
      title: 'Profile',
      description: 'Update your personal information and profile settings',
      icon: User,
      href: '/dashboard/settings/profile',
      color: 'text-blue-500',
    },
    {
      title: 'Account & Security',
      description: 'Manage your account security, password, and privacy settings',
      icon: Shield,
      href: '/dashboard/settings/account',
      color: 'text-green-500',
    },
    {
      title: 'Appearance',
      description: 'Customize the look and feel of your dashboard',
      icon: Palette,
      href: '/dashboard/settings/appearance',
      color: 'text-purple-500',
    },
    {
      title: 'Notifications',
      description: 'Choose what notifications you receive and how',
      icon: Bell,
      href: '/dashboard/settings/notifications',
      color: 'text-orange-500',
    },
    {
      title: 'Integrations',
      description: 'Connect external services and manage API access',
      icon: Plug,
      href: '/dashboard/settings/integrations',
      color: 'text-cyan-500',
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Quick Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>
              Quick overview of your account status and settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Account</p>
                <p className="text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-lg font-semibold capitalize">
                  {Array.isArray(user?.roles) ? user.roles.join(', ') : user?.roles || 'User'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-lg font-semibold">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={category.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <category.icon className={`h-8 w-8 ${category.color}`} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors duration-300">
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common settings tasks you might want to perform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/settings/account">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Shield className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Change Password</p>
                    <p className="text-xs text-muted-foreground">Update security</p>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard/settings/appearance">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Palette className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Switch Theme</p>
                    <p className="text-xs text-muted-foreground">Light or dark</p>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard/settings/notifications">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Bell className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">Manage alerts</p>
                  </div>
                </Button>
              </Link>
              
              <Link href="/dashboard/settings/integrations">
                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <Plug className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Connect Apps</p>
                    <p className="text-xs text-muted-foreground">Add integrations</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
