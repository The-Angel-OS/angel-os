"use client"

import { useState } from "react"
import { Check, Palette, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Popover component not available - using dropdown instead
import { useTheme } from "@/providers/Theme"
import { themePresets } from "@/providers/Theme/shared"
import type { ThemePreset } from "@/providers/Theme/types"

interface ThemeChooserProps {
  className?: string
  showPresets?: boolean
  compact?: boolean
}

export function ThemeChooser({ className = "", showPresets = true, compact = false }: ThemeChooserProps) {
  const { theme, themePreset, setTheme, setThemePreset } = useTheme()
  const [open, setOpen] = useState(false)

  const handlePresetChange = (preset: ThemePreset) => {
    setThemePreset(preset)
    if (!compact) {
      setOpen(false)
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | null) => {
    console.log('Theme chooser clicked:', newTheme, 'current:', theme)
    console.log('setTheme function:', setTheme)
    setTheme(newTheme)
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Dark/Light Toggle */}
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={theme === 'light' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleThemeChange('light')}
            className="h-7 px-2"
          >
            <Sun className="h-3 w-3" />
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleThemeChange('dark')}
            className="h-7 px-2"
          >
            <Moon className="h-3 w-3" />
          </Button>
        </div>

        {/* Theme Preset Selector */}
        {showPresets && (
          <div className="relative">
            <Button variant="outline" size="sm" className="h-7">
              <Palette className="h-3 w-3 mr-1" />
              {themePresets[themePreset || 'default']?.name || 'Theme'}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Mode Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3">Color mode</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange('light')}
              className="justify-start"
            >
              <Sun className="h-4 w-4 mr-2" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange('dark')}
              className="justify-start"
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </Button>
            <Button
              variant={!theme ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange(null)}
              className="justify-start"
            >
              <Monitor className="h-4 w-4 mr-2" />
              System
            </Button>
          </div>
        </div>

        {/* Theme Presets */}
        {showPresets && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Theme preset</h4>
              <Badge variant="secondary" className="text-xs">
                {themePresets[themePreset || 'default']?.name || 'Default'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(themePresets).map(([key, preset]) => (
                <Button
                  key={key}
                  variant={themePreset === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(key as ThemePreset)}
                  className="justify-start h-10 text-left"
                >
                  <div className="flex items-center gap-2">
                    {themePreset === key && <Check className="h-3 w-3" />}
                    <div>
                      <div className="text-xs font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {key === 'default' ? 'System default' : 'Custom colors'}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Preview</h4>
          <div className="grid grid-cols-4 gap-2">
            <div className="h-8 rounded bg-primary" title="Primary" />
            <div className="h-8 rounded bg-accent" title="Accent" />
            <div className="h-8 rounded bg-muted" title="Muted" />
            <div className="h-8 rounded bg-background border" title="Background" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
