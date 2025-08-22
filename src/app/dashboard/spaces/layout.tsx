import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { SpacesLayoutClient } from '@/components/spaces/SpacesLayoutClient'
import { PayloadChatBubble } from '@/components/chat/PayloadChatBubble'

import '../../(frontend)/globals.css'

export default async function SpacesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <Providers>
          {/* No Payload CMS Header/Footer - Clean Spaces interface */}
          <SpacesLayoutClient>
            {children}
          </SpacesLayoutClient>
          <PayloadChatBubble variant="spaces" />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  title: 'Angel OS Spaces',
  description: 'Collaborative workspace and AI-powered business intelligence',
}