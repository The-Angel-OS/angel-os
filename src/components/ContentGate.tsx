'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Crown, Star, Heart, Zap, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface ContentGateProps {
  children: React.ReactNode
  accessLevel: 'public' | 'member' | 'premium' | 'exclusive' | 'payPerView'
  requiredTier?: string
  price?: number
  currency?: string
  title?: string
  description?: string
  previewContent?: React.ReactNode
  currentUser?: any
  userSubscriptions?: string[]
  spaceId?: string
  contentId?: string
  contentType?: 'post' | 'page' | 'product'
}

export function ContentGate({
  children,
  accessLevel,
  requiredTier,
  price,
  currency = 'usd',
  title,
  description,
  previewContent,
  currentUser,
  userSubscriptions = [],
  spaceId,
  contentId,
  contentType = 'post'
}: ContentGateProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [currentUser, userSubscriptions, accessLevel, requiredTier])

  const checkAccess = () => {
    // Public content is always accessible
    if (accessLevel === 'public') {
      setHasAccess(true)
      return
    }

    // Must be logged in for any restricted content
    if (!currentUser) {
      setHasAccess(false)
      return
    }

    // Member-only content just requires login
    if (accessLevel === 'member') {
      setHasAccess(true)
      return
    }

    // Premium/exclusive content requires subscription
    if (accessLevel === 'premium' || accessLevel === 'exclusive') {
      const hasRequiredTier = requiredTier 
        ? userSubscriptions.includes(requiredTier)
        : userSubscriptions.length > 0
      
      setHasAccess(hasRequiredTier)
      return
    }

    // Pay-per-view content requires individual purchase
    if (accessLevel === 'payPerView') {
      // Check if user has purchased this specific content
      // This would need to be implemented based on your purchase tracking system
      setHasAccess(false)
      return
    }

    setHasAccess(false)
  }

  const getGateIcon = () => {
    switch (accessLevel) {
      case 'exclusive':
        return <Crown className="h-8 w-8 text-yellow-500" />
      case 'premium':
        return <Star className="h-8 w-8 text-purple-500" />
      case 'payPerView':
        return <Zap className="h-8 w-8 text-green-500" />
      case 'member':
        return <Heart className="h-8 w-8 text-blue-500" />
      default:
        return <Lock className="h-8 w-8 text-gray-500" />
    }
  }

  const getGateColor = () => {
    switch (accessLevel) {
      case 'exclusive':
        return 'from-yellow-500 to-orange-500'
      case 'premium':
        return 'from-purple-500 to-pink-500'
      case 'payPerView':
        return 'from-green-500 to-emerald-500'
      case 'member':
        return 'from-blue-500 to-indigo-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const getGateTitle = () => {
    if (title) return title
    
    switch (accessLevel) {
      case 'exclusive':
        return 'Exclusive Content'
      case 'premium':
        return 'Premium Content'
      case 'payPerView':
        return 'Pay-Per-View Content'
      case 'member':
        return 'Members Only'
      default:
        return 'Restricted Content'
    }
  }

  const getGateDescription = () => {
    if (description) return description
    
    switch (accessLevel) {
      case 'exclusive':
        return 'This exclusive content is available only to VIP subscribers'
      case 'premium':
        return 'Subscribe to access this premium content and unlock our entire library'
      case 'payPerView':
        return `Purchase this content for $${price || 0} to view it anytime`
      case 'member':
        return 'Create a free account to access this members-only content'
      default:
        return 'This content requires special access'
    }
  }

  const handlePurchase = async () => {
    if (!currentUser) {
      window.location.href = `/admin/create-first-user?redirect=${encodeURIComponent(window.location.href)}`
      return
    }

    if (accessLevel === 'payPerView') {
      setLoading(true)
      try {
        const response = await fetch('/api/purchases/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentId,
            contentType,
            price,
            currency,
            userId: currentUser.id,
            spaceId,
          }),
        })

        const data = await response.json()
        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          alert('Failed to create purchase. Please try again.')
        }
      } catch (error) {
        console.error('Purchase error:', error)
        alert('An error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      // Redirect to subscription page
      const subscribeUrl = `/subscribe?content=${encodeURIComponent(window.location.pathname)}&tier=${requiredTier || 'premium'}&space=${spaceId || ''}`
      window.location.href = subscribeUrl
    }
  }

  // If user has access, show the content
  if (hasAccess) {
    return <>{children}</>
  }

  // Show the content gate
  return (
    <div className="space-y-6">
      {/* Preview Content */}
      {previewContent && (
        <div className="relative">
          <div className={`${showPreview ? '' : 'blur-sm'} transition-all duration-300`}>
            {previewContent}
          </div>
          {!showPreview && (
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="bg-white/90 backdrop-blur-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </Button>
            </div>
          )}
          {showPreview && (
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="bg-white/90 backdrop-blur-sm"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Content Gate */}
      <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getGateIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {getGateTitle()}
          </CardTitle>
          <CardDescription className="text-lg">
            {getGateDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pricing Display */}
          {accessLevel === 'payPerView' && price && (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                ${price}
                <span className="text-sm font-normal text-gray-600 ml-1">
                  {currency.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">One-time purchase</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!currentUser ? (
              <>
                <Link href={`/admin/create-first-user?redirect=${encodeURIComponent(window.location.href)}`}>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                    <Heart className="h-4 w-4 mr-2" />
                    Sign Up Free
                  </Button>
                </Link>
                <Link href={`/auth/login?redirect=${encodeURIComponent(window.location.href)}`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Already have an account? Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                onClick={handlePurchase}
                disabled={loading}
                className={`w-full sm:w-auto bg-gradient-to-r ${getGateColor()} hover:opacity-90 text-white font-semibold`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    {accessLevel === 'payPerView' ? (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Purchase Now
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </div>
                )}
              </Button>
            )}
          </div>

          {/* Benefits */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-700">What you get:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {accessLevel === 'payPerView' ? (
                <>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    Lifetime Access
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    HD Quality
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    No Subscription
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    All Premium Content
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    Early Access
                  </span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                    Creator Direct Access
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Security Note */}
          <div className="text-center text-xs text-gray-500 border-t pt-4">
            <p>🔒 Secure payments • Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 