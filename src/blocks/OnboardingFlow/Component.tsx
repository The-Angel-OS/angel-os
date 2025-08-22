"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  User, 
  Crown, 
  Laptop, 
  Home, 
  Briefcase,
  CheckCircle
} from "lucide-react"

interface OnboardingFlowProps {
  title?: string
  subtitle?: string
  redirectUrl?: string
  className?: string
}

interface OnboardingData {
  interests: string[]
  workStyle: {
    preferred: 'remote' | 'hybrid' | 'in-office'
    experience: 'entry' | 'mid' | 'senior'
    availability: 'full-time' | 'part-time' | 'contract'
  }
  accountType: 'individual' | 'business' | 'enterprise'
  businessInfo?: {
    businessName: string
    industry: string
    size: string
    description: string
  }
}

const INTEREST_OPTIONS = [
  { id: 'technology', label: 'Technology', icon: '💻', description: 'AI, automation, development' },
  { id: 'design', label: 'Design', icon: '🎨', description: 'UI/UX, branding, creative' },
  { id: 'marketing', label: 'Marketing', icon: '📈', description: 'Digital marketing, growth' },
  { id: 'finance', label: 'Finance', icon: '💰', description: 'Accounting, payments, analytics' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', description: 'Medical, wellness, health tech' },
  { id: 'education', label: 'Education', icon: '📚', description: 'Learning, training, courses' },
  { id: 'ecommerce', label: 'E-commerce', icon: '🛒', description: 'Online sales, retail' },
  { id: 'consulting', label: 'Consulting', icon: '🤝', description: 'Professional services' },
]

const ACCOUNT_TYPES = [
  {
    id: 'individual',
    title: 'Individual',
    description: 'Perfect for personal projects and freelancers',
    icon: User,
    features: ['Personal dashboard', 'Basic analytics', 'Community access'],
    recommended: false
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Ideal for small to medium businesses',
    icon: Building2,
    features: ['Team collaboration', 'Advanced analytics', 'Priority support'],
    recommended: true
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'For large organizations with advanced needs',
    icon: Crown,
    features: ['Custom integrations', 'Dedicated support', 'Advanced security'],
    recommended: false
  }
]

export const OnboardingFlowBlock: React.FC<OnboardingFlowProps> = ({ 
  title = "Welcome to Angel OS",
  subtitle = "Let's set up your workspace in just a few steps",
  redirectUrl = "/dashboard",
  className = ""
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    interests: [],
    workStyle: {
      preferred: 'hybrid',
      experience: 'mid',
      availability: 'full-time'
    },
    accountType: 'business'
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInterestToggle = (interestId: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }))
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/tenants/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboardingData: data,
          templateKey: determineTemplate(data)
        })
      })

      if (response.ok) {
        setIsComplete(true)
        setTimeout(() => {
          window.location.href = redirectUrl
        }, 2000)
      }
    } catch (error) {
      console.error('Onboarding failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const determineTemplate = (data: OnboardingData): string => {
    if (data.interests.includes('technology')) return 'tech-service'
    if (data.interests.includes('healthcare')) return 'healthcare'
    if (data.interests.includes('ecommerce')) return 'retail'
    return 'general-business'
  }

  if (isComplete) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Angel OS!</h1>
          <p className="text-gray-600 mb-4">Your workspace is ready. Redirecting you now...</p>
          <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto"></div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">{subtitle}</p>
          <div className="w-full max-w-md mx-auto">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Interests */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <CardTitle className="text-2xl">What sparks your interest?</CardTitle>
                  <CardDescription>Select the areas that best describe your business or interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {INTEREST_OPTIONS.map((interest) => (
                      <div
                        key={interest.id}
                        onClick={() => handleInterestToggle(interest.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                          data.interests.includes(interest.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{interest.icon}</div>
                          <h3 className="font-semibold text-gray-900">{interest.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">{interest.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" disabled>Back</Button>
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      disabled={data.interests.length === 0}
                    >
                      Continue ({data.interests.length} selected)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Work Style */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Tell us about your work style</CardTitle>
                  <CardDescription>This helps us customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Work Preference */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Preferred work style</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'remote', label: 'Remote', icon: Home, desc: 'Work from anywhere' },
                        { id: 'hybrid', label: 'Hybrid', icon: Briefcase, desc: 'Mix of remote and office' },
                        { id: 'in-office', label: 'In-office', icon: Building2, desc: 'Traditional office setting' }
                      ].map((option) => (
                        <div
                          key={option.id}
                          onClick={() => setData(prev => ({ ...prev, workStyle: { ...prev.workStyle, preferred: option.id as any } }))}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            data.workStyle.preferred === option.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <option.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                            <h4 className="font-semibold">{option.label}</h4>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button onClick={() => setCurrentStep(3)}>Continue</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Account Type */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">Choose your account type</CardTitle>
                  <CardDescription>Select the plan that best fits your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {ACCOUNT_TYPES.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setData(prev => ({ ...prev, accountType: type.id as any }))}
                        className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          data.accountType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type.recommended && (
                          <Badge className="absolute -top-2 left-4 bg-blue-600">Recommended</Badge>
                        )}
                        <div className="text-center">
                          <type.icon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                          <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                          <p className="text-gray-600 mb-4">{type.description}</p>
                          <ul className="text-sm space-y-1">
                            {type.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center justify-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                    <Button onClick={() => setCurrentStep(4)}>Continue</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Business Info & Processing */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">Business Information</CardTitle>
                  <CardDescription>Tell us about your business to customize your workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  {!isProcessing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          placeholder="Enter your business name"
                          onChange={(e) => setData(prev => ({
                            ...prev,
                            businessInfo: {
                              ...prev.businessInfo,
                              businessName: e.target.value,
                              industry: prev.interests[0] || 'technology',
                              size: prev.accountType === 'individual' ? 'solo' : 'small',
                              description: `${prev.interests.join(', ')} business`
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                        <Button onClick={handleSubmit}>
                          Complete Setup
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600 mb-2">Creating your workspace...</p>
                      <p className="text-sm text-gray-500">This may take a few moments</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OnboardingFlowBlock

