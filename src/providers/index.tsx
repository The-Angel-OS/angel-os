'use client'

import React, { useEffect } from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { createApiInterceptor } from '@/utilities/apiInterceptor'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  // Initialize API interceptor on client side
  useEffect(() => {
    createApiInterceptor()
  }, [])

  return (
    <ThemeProvider>
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </ThemeProvider>
  )
}
