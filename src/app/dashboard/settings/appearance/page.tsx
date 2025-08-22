"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
// Using native HTML range input instead of external slider component
import { motion } from "framer-motion"
import { Palette, Monitor, Eye, Layout } from "lucide-react"
import { useState, useEffect } from "react"
import { ThemeChooser } from "@/components/ui/theme-chooser"

export default function AppearanceSettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [fontSize, setFontSize] = useState([14])
  const [density, setDensity] = useState("comfortable")

  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Appearance Settings"
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Appearance Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Customize the look and feel of your Angel OS dashboard.
          </p>
        </div>

        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Choose your color scheme and visual style preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeChooser showPresets={true} compact={false} />
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              <CardTitle>Layout</CardTitle>
            </div>
            <CardDescription>
              Adjust the layout and spacing of your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sidebar Auto-collapse</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically collapse sidebar on smaller screens
                  </p>
                </div>
                <Switch
                  checked={sidebarCollapsed}
                  onCheckedChange={setSidebarCollapsed}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing and padding for more content
                  </p>
                </div>
                <Switch
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>

              <div className="space-y-3">
                <Label>Content Density</Label>
                <Select value={density} onValueChange={setDensity}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Adjust how much information is displayed per screen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>
              Adjust text size and readability settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Font Size: {fontSize[0]}px</Label>
                <input
                  type="range"
                  value={fontSize[0]}
                  onChange={(e) => setFontSize([parseInt(e.target.value)])}
                  max={20}
                  min={12}
                  step={1}
                  title="Font Size Slider"
                  aria-label="Adjust font size"
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-sm text-muted-foreground">
                  Adjust the base font size for better readability
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <p style={{ fontSize: `${fontSize[0]}px` }} className="mb-2 font-medium">
                  Sample Text Preview
                </p>
                <p style={{ fontSize: `${(fontSize[0] || 14) - 2}px` }} className="text-muted-foreground">
                  This is how your text will appear with the selected font size. 
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animation Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Visual Effects</CardTitle>
            </div>
            <CardDescription>
              Control animations and visual feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Show smooth transitions and micro-interactions
                  </p>
                </div>
                <Switch
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations for accessibility
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <CardTitle>Display</CardTitle>
            </div>
            <CardDescription>
              Optimize display for your screen and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Display Scale</Label>
                <Select defaultValue="100">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="75">75% (Smaller)</SelectItem>
                    <SelectItem value="100">100% (Default)</SelectItem>
                    <SelectItem value="125">125% (Larger)</SelectItem>
                    <SelectItem value="150">150% (Extra Large)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Scale the entire interface for your display
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Tooltips</Label>
                  <p className="text-sm text-muted-foreground">
                    Display helpful tooltips on hover
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <div className="flex justify-end pt-4">
                <Button>Save Appearance Settings</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
