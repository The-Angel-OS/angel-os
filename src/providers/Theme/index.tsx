'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import type { Theme, ThemeContextType, ThemePreset } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { 
  defaultTheme, 
  defaultThemePreset,
  getImplicitPreference, 
  themeLocalStorageKey,
  themePresetLocalStorageKey,
  themePresets
} from './shared'
import { themeIsValid, themePresetIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  setThemePreset: () => null,
  theme: undefined,
  themePreset: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with stored preference or system preference
  const getInitialTheme = (): Theme => {
    if (!canUseDOM) return defaultTheme
    const stored = window.localStorage.getItem(themeLocalStorageKey)
    if (themeIsValid(stored)) return stored as Theme
    const implicit = getImplicitPreference()
    return implicit || defaultTheme
  }

  const getInitialThemePreset = (): ThemePreset => {
    if (!canUseDOM) return defaultThemePreset
    const stored = window.localStorage.getItem(themePresetLocalStorageKey)
    if (themePresetIsValid(stored)) return stored as ThemePreset
    return defaultThemePreset
  }

  const [theme, setThemeState] = useState<Theme | undefined>(getInitialTheme())
  const [themePreset, setThemePresetState] = useState<ThemePreset | undefined>(getInitialThemePreset())

  const setTheme = useCallback((themeToSet: Theme | null) => {
    console.log('setTheme called with:', themeToSet)
    
    if (themeToSet === null) {
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      document.documentElement.setAttribute('data-theme', implicitPreference || '')
      // Also set class for Shadcn UI compatibility
      document.documentElement.classList.remove('light', 'dark')
      if (implicitPreference) {
        document.documentElement.classList.add(implicitPreference)
      }
      setThemeState(undefined) // Set to undefined to indicate system preference
      
      // Apply current preset colors for the new theme
      const currentPreset = themePreset || defaultThemePreset
      const preset = themePresets[currentPreset]
      if (preset && implicitPreference) {
        const colors = preset[implicitPreference]
        if (colors) {
          applyThemeColors(colors)
        }
      }
    } else {
      setThemeState(themeToSet)
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
      // Also set class for Shadcn UI compatibility
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(themeToSet)
      
      // Apply current preset colors for the new theme
      const currentPreset = themePreset || defaultThemePreset
      const preset = themePresets[currentPreset]
      if (preset) {
        const colors = preset[themeToSet]
        if (colors) {
          applyThemeColors(colors)
        }
      }
    }
    
    // Force immediate component updates by triggering React re-renders
    // This follows the pattern from James Mikrut's video about proper theme handling
    requestAnimationFrame(() => {
      console.log('Theme applied, triggering component updates')
      // Trigger a custom event to notify components
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeToSet } }))
      
      // Force React to re-render by updating a state somewhere
      // This ensures all components using CSS custom properties update immediately
      const event = new Event('storage')
      window.dispatchEvent(event)
    })
  }, [themePreset])

  // Helper function to apply theme colors consistently
  // Following James Mikrut's guidance about CSS custom properties
  const applyThemeColors = (colors: Record<string, string>) => {
    // Apply all theme colors at once for immediate visual update
    const root = document.documentElement
    
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, `hsl(${value})`)
    })
    
    // Update sidebar variables to match theme (these update the badges correctly)
    if (colors['--background']) {
      root.style.setProperty('--sidebar', `hsl(${colors['--background']})`)
    }
    if (colors['--foreground']) {
      root.style.setProperty('--sidebar-foreground', `hsl(${colors['--foreground']})`)
    }
    if (colors['--border']) {
      root.style.setProperty('--sidebar-border', `hsl(${colors['--border']})`)
    }
    if (colors['--accent']) {
      root.style.setProperty('--sidebar-accent', `hsl(${colors['--accent']})`)
    }
    if (colors['--accent-foreground']) {
      root.style.setProperty('--sidebar-accent-foreground', `hsl(${colors['--accent-foreground']})`)
    }
    
    // Force immediate CSS recalculation - this is the key!
    // Following the pattern from Payload's own theming system
    root.style.setProperty('--theme-transition', 'all 0.2s ease-in-out')
    
    // Trigger a style recalculation to ensure all elements update
    void root.offsetHeight // Force reflow
  }

  const setThemePreset = useCallback((presetToSet: ThemePreset) => {
    setThemePresetState(presetToSet)
    window.localStorage.setItem(themePresetLocalStorageKey, presetToSet)
    document.documentElement.setAttribute('data-theme-preset', presetToSet)
    
    // Apply CSS custom properties for the preset
    const preset = themePresets[presetToSet] || themePresets[defaultThemePreset]
    if (preset) {
      // Get the current theme from DOM if not in state yet
      const currentTheme = theme || 
        document.documentElement.getAttribute('data-theme') as Theme || 
        defaultTheme
      const colors = preset[currentTheme] || preset[defaultTheme]
      
      if (colors) {
        Object.entries(colors).forEach(([property, value]) => {
          document.documentElement.style.setProperty(property, `hsl(${value})`)
        })
        
        // Update sidebar variables to match theme
        if (colors['--background']) {
          document.documentElement.style.setProperty('--sidebar', `hsl(${colors['--background']})`)
        }
        if (colors['--foreground']) {
          document.documentElement.style.setProperty('--sidebar-foreground', `hsl(${colors['--foreground']})`)
        }
        if (colors['--border']) {
          document.documentElement.style.setProperty('--sidebar-border', `hsl(${colors['--border']})`)
        }
        if (colors['--accent']) {
          document.documentElement.style.setProperty('--sidebar-accent', `hsl(${colors['--accent']})`)
        }
        if (colors['--accent-foreground']) {
          document.documentElement.style.setProperty('--sidebar-accent-foreground', `hsl(${colors['--accent-foreground']})`)
        }
      }
    }
  }, [theme])

  useEffect(() => {
    if (!canUseDOM) return

    let themeToSet: Theme = defaultTheme
    const preference = window.localStorage.getItem(themeLocalStorageKey)

    if (themeIsValid(preference)) {
      themeToSet = preference
    } else {
      const implicitPreference = getImplicitPreference()
      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    // Initialize theme preset
    const presetPreference = window.localStorage.getItem(themePresetLocalStorageKey)
    let presetToSet: ThemePreset = defaultThemePreset

    if (themePresetIsValid(presetPreference)) {
      presetToSet = presetPreference
    }

    // Set state first
    setThemeState(themeToSet)
    setThemePresetState(presetToSet)

    // Then apply to DOM
    document.documentElement.setAttribute('data-theme', themeToSet)
    document.documentElement.setAttribute('data-theme-preset', presetToSet)
    
    // Also set class for Shadcn UI compatibility
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(themeToSet)

    // Apply preset colors - always apply to ensure CSS variables are set
    const preset = themePresets[presetToSet] || themePresets[defaultThemePreset]
    if (preset) {
      const colors = preset[themeToSet] || preset[defaultTheme]
      if (colors) {
        Object.entries(colors).forEach(([property, value]) => {
          document.documentElement.style.setProperty(property, `hsl(${value})`)
        })
        
        // Update sidebar variables to match theme
        if (colors['--background']) {
          document.documentElement.style.setProperty('--sidebar', `hsl(${colors['--background']})`)
        }
        if (colors['--foreground']) {
          document.documentElement.style.setProperty('--sidebar-foreground', `hsl(${colors['--foreground']})`)
        }
        if (colors['--border']) {
          document.documentElement.style.setProperty('--sidebar-border', `hsl(${colors['--border']})`)
        }
        if (colors['--accent']) {
          document.documentElement.style.setProperty('--sidebar-accent', `hsl(${colors['--accent']})`)
        }
        if (colors['--accent-foreground']) {
          document.documentElement.style.setProperty('--sidebar-accent-foreground', `hsl(${colors['--accent-foreground']})`)
        }
      }
    }

    console.log('Theme initialized:', { theme: themeToSet, preset: presetToSet })
  }, [])

  return <ThemeContext value={{ setTheme, setThemePreset, theme, themePreset }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => useContext(ThemeContext)
