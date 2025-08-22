import type { Theme, ThemePreset } from './types'

export const themeLocalStorageKey = 'payload-theme'
export const themePresetLocalStorageKey = 'payload-theme-preset'

export const defaultTheme = 'light'
export const defaultThemePreset: ThemePreset = 'default'

export const getImplicitPreference = (): Theme | null => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  const mql = window.matchMedia(mediaQuery)
  const hasImplicitPreference = typeof mql.matches === 'boolean'

  if (hasImplicitPreference) {
    return mql.matches ? 'dark' : 'light'
  }

  return null
}

// Theme preset configurations inspired by ShadCN UI Kit
export const themePresets = {
  'default': {
    name: 'Default',
    light: {
      '--primary': '222.2 84% 4.9%',
      '--primary-foreground': '210 40% 98%',
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--accent': '210 40% 96%',
      '--accent-foreground': '222.2 84% 4.9%',
      '--border': '214.3 31.8% 91.4%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215.4 16.3% 46.9%'
    },
    dark: {
      '--primary': '210 40% 98%',
      '--primary-foreground': '222.2 84% 4.9%',
      '--background': '222.2 84% 4.9%',
      '--foreground': '210 40% 98%',
      '--accent': '217.2 32.6% 17.5%',
      '--accent-foreground': '210 40% 98%',
      '--border': '217.2 32.6% 17.5%',
      '--muted': '217.2 32.6% 17.5%',
      '--muted-foreground': '215 20.2% 65.1%'
    }
  },
  'sunset-glow': {
    name: 'Sunset Glow',
    light: {
      '--primary': '24 95% 53%',
      '--primary-foreground': '0 0% 100%',
      '--background': '0 0% 100%',
      '--foreground': '20 14.3% 4.1%',
      '--accent': '33 100% 96.5%',
      '--accent-foreground': '24 95% 53%',
      '--border': '33 100% 90%',
      '--muted': '33 100% 96.5%',
      '--muted-foreground': '25 5.3% 44.7%'
    },
    dark: {
      '--primary': '24 95% 53%',
      '--primary-foreground': '0 0% 100%',
      '--background': '20 14.3% 4.1%',
      '--foreground': '0 0% 95%',
      '--accent': '12 6.5% 15.1%',
      '--accent-foreground': '0 0% 98%',
      '--border': '12 6.5% 15.1%',
      '--muted': '12 6.5% 15.1%',
      '--muted-foreground': '24 5.4% 63.9%'
    }
  },
  'rose-garden': {
    name: 'Rose Garden',
    light: {
      '--primary': '346.8 77.2% 49.8%',
      '--primary-foreground': '355.7 100% 97.3%',
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--border': '240 5.9% 90%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%'
    },
    dark: {
      '--primary': '346.8 77.2% 49.8%',
      '--primary-foreground': '355.7 100% 97.3%',
      '--background': '20 14.3% 4.1%',
      '--foreground': '0 0% 95%',
      '--accent': '12 6.5% 15.1%',
      '--accent-foreground': '0 0% 98%',
      '--border': '12 6.5% 15.1%',
      '--muted': '12 6.5% 15.1%',
      '--muted-foreground': '24 5.4% 63.9%'
    }
  },
  'jade-view': {
    name: 'Jade View',
    light: {
      '--primary': '142.1 76.2% 36.3%',
      '--primary-foreground': '355.7 100% 97.3%',
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--border': '240 5.9% 90%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%'
    },
    dark: {
      '--primary': '142.1 76.2% 36.3%',
      '--primary-foreground': '355.7 100% 97.3%',
      '--background': '20 14.3% 4.1%',
      '--foreground': '0 0% 95%',
      '--accent': '12 6.5% 15.1%',
      '--accent-foreground': '0 0% 98%',
      '--border': '12 6.5% 15.1%',
      '--muted': '12 6.5% 15.1%',
      '--muted-foreground': '24 5.4% 63.9%'
    }
  },
  'ocean-breeze': {
    name: 'Ocean Breeze',
    light: {
      '--primary': '199.1 89.1% 48.4%',
      '--primary-foreground': '0 0% 100%',
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--border': '240 5.9% 90%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%'
    },
    dark: {
      '--primary': '199.1 89.1% 48.4%',
      '--primary-foreground': '0 0% 100%',
      '--background': '20 14.3% 4.1%',
      '--foreground': '0 0% 95%',
      '--accent': '12 6.5% 15.1%',
      '--accent-foreground': '0 0% 98%',
      '--border': '12 6.5% 15.1%',
      '--muted': '12 6.5% 15.1%',
      '--muted-foreground': '24 5.4% 63.9%'
    }
  },
  'forest-whisper': {
    name: 'Forest Whisper',
    light: {
      '--primary': '84.1 61.1% 40.4%',
      '--primary-foreground': '0 0% 100%',
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--border': '240 5.9% 90%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%'
    },
    dark: {
      '--primary': '84.1 61.1% 40.4%',
      '--primary-foreground': '0 0% 100%',
      '--background': '20 14.3% 4.1%',
      '--foreground': '0 0% 95%',
      '--accent': '12 6.5% 15.1%',
      '--accent-foreground': '0 0% 98%',
      '--border': '12 6.5% 15.1%',
      '--muted': '12 6.5% 15.1%',
      '--muted-foreground': '24 5.4% 63.9%'
    }
  },
  'lavender-dream': {
    name: 'Lavender Dream',
    light: {
      '--primary': '262.1 83.3% 57.8%',
      '--primary-foreground': '0 0% 100%',
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--border': '240 5.9% 90%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%'
    },
    dark: {
      '--primary': '262.1 83.3% 57.8%',
      '--primary-foreground': '0 0% 100%',
      '--background': '20 14.3% 4.1%',
      '--foreground': '0 0% 95%',
      '--accent': '12 6.5% 15.1%',
      '--accent-foreground': '0 0% 98%',
      '--border': '12 6.5% 15.1%',
      '--muted': '12 6.5% 15.1%',
      '--muted-foreground': '24 5.4% 63.9%'
    }
  },
  'spaces-starfleet': {
    name: 'Spaces Starfleet',
    light: {
      '--primary': '213 94% 68%',        // Elegant Starfleet blue
      '--primary-foreground': '0 0% 100%',
      '--background': '210 11% 96%',      // Soft off-white like modern corduroy
      '--foreground': '213 27% 24%',      // Professional blue-gray text
      '--accent': '213 100% 96%',         // Light blue accent
      '--accent-foreground': '213 94% 68%',
      '--border': '213 27% 84%',          // Subtle blue borders
      '--muted': '210 11% 96%',           // Corduroy texture feel
      '--muted-foreground': '213 13% 44%' // Professional blue-gray
    },
    dark: {
      '--primary': '213 94% 68%',        // Same Starfleet blue
      '--primary-foreground': '0 0% 100%',
      '--background': '213 27% 8%',       // Deep blue-gray like quality fabric
      '--foreground': '210 11% 96%',      // Light text
      '--accent': '213 50% 24%',          // Darker blue accent
      '--accent-foreground': '210 11% 96%',
      '--border': '213 50% 24%',          // Subtle borders
      '--muted': '213 50% 24%',           // Rich texture
      '--muted-foreground': '213 27% 64%' // Elegant contrast
    }
  }
}
