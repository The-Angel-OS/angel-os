'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Crown, Heart, Star, Zap } from 'lucide-react'

interface SubscriptionTier {
  id: string
  name: string
  description: string
  price: number
  currency: string
  features: string[]
  contentAccess: string[]
  stripePriceId?: string
  popular?: boolean
  exclusive?: boolean
}

interface SubscriptionPlansProps {
  currentUser: any
  targetSpace: any
  selectedTier?: string
  contentUrl?: string
}

export function SubscriptionPlans({ currentUser, targetSpace, selectedTier, contentUrl }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)

  // Default subscription tiers if no space-specific tiers are available
  const defaultTiers: SubscriptionTier[] = [
    {
      id: 'basic',
      name: 'Basic Fan',
      description: 'Get started with exclusive content',
      price: 9.99,
      currency: 'usd',
      features: [
        'Access to premium posts',
        'Monthly exclusive content',
        'Community access',
        'Creator updates'
      ],
      contentAccess: ['premium_posts'],
    },
    {
      id: 'premium',
      name: 'Premium Fan',
      description: 'Enhanced access and perks',
      price: 24.99,
      currency: 'usd',
      features: [
        'Everything in Basic',
        'Weekly exclusive videos',
        'Live stream access',
        'Direct messaging',
        'Early content access'
      ],
      contentAccess: ['premium_posts', 'exclusive_videos', 'live_streams', 'early_access'],
      popular: true,
    },
    {
      id: 'vip',
      name: 'VIP Fan',
      description: 'Ultimate fan experience',
      price: 49.99,
      currency: 'usd',
      features: [
        'Everything in Premium',
        'Custom content requests',
        'One-on-one video calls',
        'Exclusive merchandise',
        'Priority support',
        'Behind-the-scenes access'
      ],
      contentAccess: ['premium_posts', 'exclusive_videos', 'live_streams', 'early_access', 'custom_content', 'private_messages'],
      exclusive: true,
    }
  ]

  // Use space-specific tiers if available, otherwise use defaults
  const subscriptionTiers: SubscriptionTier[] = targetSpace?.monetization?.subscriptionTiers?.length > 0
    ? targetSpace.monetization.subscriptionTiers.map((tier: any) => ({
        id: tier.id || tier.name.toLowerCase().replace(/\s+/g, '-'),
        name: tier.name,
        description: tier.description || '',
        price: tier.price,
        currency: tier.currency || 'usd',
        features: tier.features || [],
        contentAccess: tier.contentAccess || [],
        stripePriceId: tier.stripePriceId,
      }))
    : defaultTiers

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!currentUser) {
      // Redirect to login/signup
      window.location.href = `/admin/create-first-user?redirect=${encodeURIComponent(window.location.href)}`
      return
    }

    setLoading(tier.id)

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tierId: tier.id,
          spaceId: targetSpace?.id,
          userId: currentUser.id,
          returnUrl: contentUrl || window.location.href,
        }),
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        alert('Failed to create subscription. Please try again.')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const getTierIcon = (tier: SubscriptionTier) => {
    if (tier.exclusive) return <Crown className="h-5 w-5" />
    if (tier.popular) return <Star className="h-5 w-5" />
    return <Heart className="h-5 w-5" />
  }

  const getTierColor = (tier: SubscriptionTier) => {
    if (tier.exclusive) return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
    if (tier.popular) return 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50'
    return 'border-gray-300 bg-white'
  }

  const getButtonColor = (tier: SubscriptionTier) => {
    if (tier.exclusive) return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
    if (tier.popular) return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
    return 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {subscriptionTiers.map((tier: SubscriptionTier) => (
        <Card
          key={tier.id}
          className={`relative transition-all duration-300 hover:shadow-lg ${getTierColor(tier)} ${
            selectedTier === tier.id ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
          )}

          {tier.exclusive && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                EXCLUSIVE
              </span>
            </div>
          )}

          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              {getTierIcon(tier)}
            </div>
            <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
            <CardDescription className="text-sm">{tier.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">${tier.price}</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Features */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Features Included:</h4>
              <ul className="space-y-1">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Access */}
            {tier.contentAccess.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Content Access:</h4>
                <div className="flex flex-wrap gap-1">
                  {tier.contentAccess.map((access, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                    >
                      {access.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subscribe Button */}
            <Button
              className={`w-full text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ${getButtonColor(tier)}`}
              onClick={() => handleSubscribe(tier)}
              disabled={loading === tier.id}
            >
              {loading === tier.id ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Subscribe Now
                </div>
              )}
            </Button>

            {/* Additional Info */}
            <div className="text-center text-xs text-gray-500 mt-2">
              <p>Cancel anytime • Secure payments via Stripe</p>
              {tier.exclusive && (
                <p className="text-yellow-600 font-medium mt-1">⭐ Limited availability</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
