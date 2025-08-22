"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// Using basic props interface instead of next-themes types
interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string | string[]
  defaultTheme?: string
  enableSystem?: boolean
  [key: string]: any // Allow other props to pass through
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...(props as any)}>{children}</NextThemesProvider>
}
