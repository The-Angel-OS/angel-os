"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Card, CardContent } from "./card"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "./drawer"

interface IntroStep {
  title: string
  short_description: string
  full_description: string
  media?: {
    type: "image" | "video"
    src: string
    alt?: string
  }
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

interface IntroDisclosureProps {
  steps: IntroStep[]
  featureId: string
  onComplete?: () => void
  onSkip?: () => void
  forceVariant?: "desktop" | "mobile"
  className?: string
}

export function IntroDisclosure({
  steps,
  featureId,
  onComplete,
  onSkip,
  forceVariant,
  className,
}: IntroDisclosureProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if intro should be shown
  useEffect(() => {
    const shouldShow = !localStorage.getItem(featureId)
    setIsOpen(shouldShow)
  }, [featureId])

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const variant = forceVariant || (isMobile ? "mobile" : "desktop")

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem(featureId, "true")
    }
    setIsOpen(false)
    onComplete?.()
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Rest of the component code remains unchanged */}
    </div>
  )
}
