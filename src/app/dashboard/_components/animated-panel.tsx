"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface AnimatedPanelProps {
  children: ReactNode
  isVisible?: boolean
  direction?: "left" | "right" | "up" | "down"
  delay?: number
  className?: string
}

export function AnimatedPanel({
  children,
  isVisible = true,
  direction = "up",
  delay = 0,
  className = "",
}: AnimatedPanelProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "left":
        return { x: -50, opacity: 0 }
      case "right":
        return { x: 50, opacity: 0 }
      case "up":
        return { y: 30, opacity: 0 }
      case "down":
        return { y: -30, opacity: 0 }
      default:
        return { y: 30, opacity: 0 }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={getInitialPosition()}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={getInitialPosition()}
          transition={{
            duration: 0.4,
            delay,
            ease: "easeOut",
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function AnimatedCard({
  children,
  delay = 0,
  className = "",
  ...props
}: {
  children: ReactNode
  delay?: number
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut",
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 },
      }}
      className={className}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  )
}
