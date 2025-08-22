"use client"

import * as React from "react"
import { cn } from "@/utilities/ui"
import { motion } from "framer-motion"

interface BackgroundGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "purple" | "blue" | "green" | "orange" | "pink"
  intensity?: "subtle" | "medium" | "strong"
  animated?: boolean
  blur?: boolean
}

const BackgroundGradient = React.forwardRef<HTMLDivElement, BackgroundGradientProps>(
  ({ 
    className, 
    variant = "default",
    intensity = "medium",
    animated = true,
    blur = true,
    children,
    ...props 
  }, ref) => {
    const getGradientClasses = () => {
      const baseClasses = "absolute inset-0"
      const blurClass = blur ? "blur-3xl" : ""
      
      const intensityOpacity = {
        subtle: "opacity-20",
        medium: "opacity-40", 
        strong: "opacity-60"
      }

      const variantGradients = {
        default: "bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500",
        purple: "bg-gradient-to-br from-purple-400 via-pink-500 to-red-500",
        blue: "bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500",
        green: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500",
        orange: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-500",
        pink: "bg-gradient-to-br from-pink-400 via-rose-500 to-red-500"
      }

      return cn(
        baseClasses,
        variantGradients[variant],
        intensityOpacity[intensity],
        blurClass
      )
    }

    const gradientElement = animated ? (
      <motion.div
        className={getGradientClasses()}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ) : (
      <div className={getGradientClasses()} />
    )

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {gradientElement}
        
        {/* Content overlay */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
BackgroundGradient.displayName = "BackgroundGradient"

export { BackgroundGradient, type BackgroundGradientProps }

















