"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  User, 
  Crown, 
  Laptop, 
  Home, 
  Briefcase,
  Clock,
  Users,
  Calendar,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
}

interface OnboardingData {
  source?: 'invitation' | 'signup'
  accountType: 'individual' | 'business' | 'enterprise'
  businessInfo?: {
    businessName: string
    businessType: string
    description: string
  }
  tenantCreation?: {
    createTenant: boolean
    tenantName: string
    tenantDomain: string
    tenantDescription: string
  }
  preferences: {
    notifications: boolean
    analytics: boolean
    publicProfile: boolean
  }
}

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams.get('source') as 'invitation' | 'signup' | null
  const welcome = searchParams.get('welcome') === 'true'
  const tenantId = searchParams.get('tenant') // Specific tenant onboarding
  const angelOsReferral = searchParams.get('angelos') === 'true' // Angel OS referral signup
  
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    source: source || 'signup',
    accountType: 'individual',
    preferences: {
      notifications: true,
      analytics: true,
      publicProfile: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps: OnboardingStep[] = [
    {
      id: 'account-type',
      title: 'Choose Your Account Type',
      description: 'Select the type of account that best fits your needs',
      component: AccountTypeStep
    },
    {
      id: 'business-info',
      title: 'Business Information',
      description: 'Tell us about your business',
      component: BusinessInfoStep
    },
    {
      id: 'tenant-creation',
      title: 'Create Your Space',
      description: 'Set up your own business workspace and tenant',
      component: TenantCreationStep
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      component: PreferencesStep
    },
    {
      id: 'complete',
      title: 'Welcome to Angel OS!',
      description: 'Your account is ready',
      component: CompleteStep
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      setLoading(true)
      setError(null)

      // Submit onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Redirect based on what was created
        if (data.tenantCreation?.createTenant) {
          router.push(`/dashboard/spaces?welcome=true&tenant=${result.tenantId}`)
        } else {
          router.push('/dashboard?welcome=true')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to complete onboarding')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setError('Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {angelOsReferral 
                ? 'Welcome to Angel OS Platform!'
                : tenantId 
                  ? 'Welcome! Let\'s Get You Set Up'
                  : welcome && source === 'signup' 
                    ? 'Account Created Successfully!' 
                    : 'Welcome to Angel OS'
              }
            </h1>
          </div>
          <p className="text-muted-foreground">
            {angelOsReferral 
              ? "You've been referred to join the Angel OS ecosystem. Let's create your platform!"
              : tenantId 
                ? "Complete your setup to access your personalized business platform"
                : welcome && source === 'signup' 
                  ? "Great! Now let's set up your AI-powered business platform"
                  : source === 'invitation' 
                    ? "Complete your setup to join your team's space"
                    : "Let's set up your AI-powered business platform"
            }
          </p>
          
          {/* Referral Benefits Banner */}
          {angelOsReferral && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Angel OS Referral Benefits</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Earn residuals when your referrals generate revenue + access to all platform improvements
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{steps[currentStep]?.title}</CardTitle>
                  <CardDescription>{steps[currentStep]?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {CurrentStepComponent && (
                    <CurrentStepComponent
                      data={data}
                      updateData={updateData}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      onComplete={handleComplete}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Step Components
function AccountTypeStep({ data, updateData, onNext }: any) {
  const accountTypes = [
    {
      type: 'individual',
      title: 'Individual',
      description: 'Personal productivity and small projects',
      icon: User,
      features: ['Personal dashboard', 'Basic AI assistance', 'File management']
    },
    {
      type: 'business',
      title: 'Business',
      description: 'Small to medium businesses',
      icon: Briefcase,
      features: ['Team collaboration', 'Advanced AI', 'Business analytics', 'Custom domains']
    },
    {
      type: 'enterprise',
      title: 'Enterprise',
      description: 'Large organizations with advanced needs',
      icon: Building2,
      features: ['Advanced security', 'Custom integrations', 'Priority support', 'White-label options']
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {accountTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card
              key={type.type}
              className={`cursor-pointer transition-all ${
                data.accountType === type.type
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => updateData({ accountType: type.type })}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {data.accountType === type.type && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!data.accountType}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function BusinessInfoStep({ data, updateData, onNext, onPrevious }: any) {
  const [businessInfo, setBusinessInfo] = useState(data.businessInfo || {
    businessName: '',
    businessType: '',
    description: ''
  })

  const businessTypes = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail',
    'Manufacturing', 'Consulting', 'Marketing', 'Real Estate', 'Other'
  ]

  const handleUpdate = (field: string, value: string) => {
    const updated = { ...businessInfo, [field]: value }
    setBusinessInfo(updated)
    updateData({ businessInfo: updated })
  }

  if (data.accountType === 'individual') {
    // Skip this step for individual accounts
    onNext()
    return null
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={businessInfo.businessName}
            onChange={(e) => handleUpdate('businessName', e.target.value)}
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <Label htmlFor="businessType">Business Type *</Label>
          <select
            id="businessType"
            value={businessInfo.businessType}
            onChange={(e) => handleUpdate('businessType', e.target.value)}
            className="w-full p-2 border border-input rounded-md bg-background"
            title="Select your business type"
          >
            <option value="">Select business type</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            value={businessInfo.description}
            onChange={(e) => handleUpdate('description', e.target.value)}
            placeholder="Briefly describe your business"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!businessInfo.businessName || !businessInfo.businessType}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function TenantCreationStep({ data, updateData, onNext, onPrevious }: any) {
  const [tenantData, setTenantData] = useState(data.tenantCreation || {
    createTenant: false,
    tenantName: '',
    tenantDomain: '',
    tenantDescription: ''
  })

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...tenantData, [field]: value }
    setTenantData(updated)
    updateData({ tenantCreation: updated })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Create Your Business Space</h3>
        <p className="text-muted-foreground">
          Your business space is a dedicated tenant with its own domain, AI assistant, 
          and collaborative workspace for your team.
        </p>
      </div>

      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="createTenant"
              checked={tenantData.createTenant}
              onChange={(e) => handleUpdate('createTenant', e.target.checked)}
              className="mt-1"
              title="Create business space"
            />
            <div className="flex-1">
              <Label htmlFor="createTenant" className="text-base font-medium cursor-pointer">
                Yes, create my business space
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Your space will have its own subdomain and can be customized for your business needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {tenantData.createTenant && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="tenantName">Space Name *</Label>
            <Input
              id="tenantName"
              value={tenantData.tenantName}
              onChange={(e) => handleUpdate('tenantName', e.target.value)}
              placeholder="e.g., Acme Corp, Marketing Team, Project Alpha"
            />
          </div>

          <div>
            <Label htmlFor="tenantDomain">Subdomain *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="tenantDomain"
                value={tenantData.tenantDomain}
                onChange={(e) => handleUpdate('tenantDomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-business"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">.angelOS.com</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your space will be accessible at {tenantData.tenantDomain || 'your-business'}.angelOS.com
            </p>
          </div>

          <div>
            <Label htmlFor="tenantDescription">Space Description</Label>
            <Textarea
              id="tenantDescription"
              value={tenantData.tenantDescription}
              onChange={(e) => handleUpdate('tenantDescription', e.target.value)}
              placeholder="Describe your business space and what it's for"
              rows={3}
            />
          </div>
        </motion.div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={tenantData.createTenant && (!tenantData.tenantName || !tenantData.tenantDomain)}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function PreferencesStep({ data, updateData, onNext, onPrevious }: any) {
  const [preferences, setPreferences] = useState(data.preferences)

  const handleUpdate = (field: string, value: boolean) => {
    const updated = { ...preferences, [field]: value }
    setPreferences(updated)
    updateData({ preferences: updated })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Email Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Receive updates about your spaces and important events
            </p>
          </div>
          <input
            type="checkbox"
            id="notifications"
            checked={preferences.notifications}
            onChange={(e) => handleUpdate('notifications', e.target.checked)}
            title="Enable email notifications"
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Analytics & Insights</h4>
            <p className="text-sm text-muted-foreground">
              Enable analytics to get insights about your business performance
            </p>
          </div>
          <input
            type="checkbox"
            id="analytics"
            checked={preferences.analytics}
            onChange={(e) => handleUpdate('analytics', e.target.checked)}
            title="Enable analytics and insights"
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium">Public Profile</h4>
            <p className="text-sm text-muted-foreground">
              Make your profile discoverable by other Angel OS users
            </p>
          </div>
          <input
            type="checkbox"
            id="publicProfile"
            checked={preferences.publicProfile}
            onChange={(e) => handleUpdate('publicProfile', e.target.checked)}
            title="Make profile public"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

function CompleteStep({ data, onComplete, loading }: any) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-2">You're All Set!</h3>
        <p className="text-muted-foreground">
          {data.tenantCreation?.createTenant
            ? `Your business space "${data.tenantCreation.tenantName}" is being created and will be ready shortly.`
            : 'Your Angel OS account is ready to use.'
          }
        </p>
      </div>

      {data.tenantCreation?.createTenant && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm">
            <strong>Your Space URL:</strong>{' '}
            <code className="bg-background px-2 py-1 rounded">
              {data.tenantCreation.tenantDomain}.angelOS.com
            </code>
          </p>
        </div>
      )}

      <Button onClick={onComplete} disabled={loading} size="lg">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Setting up your account...
          </>
        ) : (
          <>
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </>
        )}
      </Button>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
