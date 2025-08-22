"use client"

import React, { useState } from 'react'
import { motion } from "framer-motion"
// AngelOSSidebar component not found - using placeholder
// import { AngelOSSidebar } from "@/components/spaces/AngelOSSidebar"
import { AngelOSHeader } from "@/components/spaces/AngelOSHeader"
import { LeoAIDrawer } from "@/components/spaces/LeoAIDrawer"

interface SpacesLayoutClientProps {
  children: React.ReactNode
}

export function SpacesLayoutClient({ children }: SpacesLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLeoDrawerOpen, setIsLeoDrawerOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const toggleLeoDrawer = () => {
    setIsLeoDrawerOpen(!isLeoDrawerOpen)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* AngelOSSidebar component not available - using placeholder */}
      <div className="w-64 bg-muted border-r">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Spaces Sidebar</h2>
          <p className="text-sm text-muted-foreground">Component not available</p>
        </div>
      </div>

      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        animate={{
          marginLeft: 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <AngelOSHeader onLeoToggle={toggleLeoDrawer} />

        <motion.main
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </motion.div>

      {/* Leo AI Drawer */}
      <LeoAIDrawer
        isOpen={isLeoDrawerOpen}
        onClose={() => setIsLeoDrawerOpen(false)}
        currentUser={{ name: 'Kenneth Consort', email: 'kenneth@angelostech.com' }}
        currentSpace="default"
        currentChannel="general"
      />
    </div>
  )
}
