"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles } from "lucide-react"
import Image from "next/image"

interface FeatureStep {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  preview?: string
}

const platformFeatures: FeatureStep[] = [
  {
    title: "Multi-Tenant Architecture",
    description: "Scalable platform supporting unlimited tenants with isolated data and custom branding for each business.",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "Complete data isolation between tenants",
      "Custom branding and themes per tenant",
      "Unlimited user capacity per tenant",
      "Advanced role-based permissions",
      "White-label customization options"
    ],
    preview: "/api/placeholder/400/300"
  },
  {
    title: "Discord-Style Communities",
    description: "Rich communication features with channels, roles, real-time messaging, and engagement tools.",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "Real-time messaging and voice chat",
      "Organized channels by topic or team",
      "Advanced role and permission system",
      "Message reactions and threading",
      "File sharing and media support"
    ],
    preview: "/api/placeholder/400/300"
  },
  {
    title: "AI-Powered Business Agents",
    description: "Intelligent automation for customer service, content moderation, and business workflows.",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "24/7 automated customer support",
      "Intelligent content moderation",
      "Lead qualification and routing",
      "Business workflow automation",
      "Natural language understanding"
    ],
    preview: "/api/placeholder/400/300"
  },
  {
    title: "Complete Commerce Integration",
    description: "Full e-commerce suite with products, subscriptions, payments, and revenue optimization.",
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "Product catalog and inventory management",
      "Subscription and recurring billing",
      "Integrated payment processing",
      "Revenue analytics and optimization",
      "Advanced pricing strategies"
    ],
    preview: "/api/placeholder/400/300"
  }
]

interface FeatureShowcaseProps {
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function FeatureShowcase({
  className,
  autoPlay = true,
  autoPlayInterval = 5000,
}: FeatureShowcaseProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const totalSteps = platformFeatures.length

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % totalSteps)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isPlaying, autoPlayInterval, totalSteps])

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % totalSteps)
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + totalSteps) % totalSteps)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const currentFeature = platformFeatures[currentStep]

  return (
    <div className={cn("relative w-full", className)}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="relative z-10 p-8 lg:p-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Platform Features
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            Everything You Need to Succeed
          </h2>
          <p className="text-neutral-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Discover the powerful features that make Spaces the ultimate platform for building thriving digital communities and growing your business.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
          {/* Feature Details */}
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Feature Header */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  {currentFeature?.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">
                    {currentFeature?.title}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {currentFeature?.description}
                  </p>
                </div>
              </div>

              {/* Feature List */}
              <div className="space-y-3">
                {currentFeature?.features?.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-neutral-200">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayback}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Progress Indicators */}
              <div className="flex gap-2 ml-4">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <button
                    title={`View ${currentFeature?.title}`}
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      index === currentStep
                        ? "bg-blue-500 w-8"
                        : "bg-neutral-600 hover:bg-neutral-500 w-2"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="relative">
            <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700">
              {currentFeature?.preview && (
                <Image
                  src={currentFeature.preview}
                  alt={`${currentFeature?.title} preview`}
                  fill
                  className="object-cover transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}

              {/* Animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Floating elements for visual interest */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500/20 rounded-full animate-pulse" />
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-purple-500/20 rounded-full animate-bounce" />
            </div>

            {/* Step indicator */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-full text-neutral-400 text-sm">
              {currentStep + 1} of {totalSteps}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
