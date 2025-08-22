export type Theme = 'dark' | 'light'

export type ThemePreset = 
  | 'default'
  | 'sunset-glow'
  | 'rose-garden' 
  | 'jade-view'
  | 'ocean-breeze'
  | 'forest-whisper'
  | 'lavender-dream'
  | 'spaces-starfleet'

export interface ThemeContextType {
  setTheme: (theme: Theme | null) => void
  setThemePreset: (preset: ThemePreset) => void
  theme?: Theme | null
  themePreset?: ThemePreset
}

export function themeIsValid(string: null | string): string is Theme {
  return string ? ['dark', 'light'].includes(string) : false
}

export function themePresetIsValid(string: null | string): string is ThemePreset {
  return string ? [
    'default', 'sunset-glow', 'rose-garden', 'jade-view', 
    'ocean-breeze', 'forest-whisper', 'lavender-dream', 
    'spaces-starfleet'
  ].includes(string) : false
}
