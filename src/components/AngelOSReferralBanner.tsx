'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, ExternalLink, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AngelOSReferralBannerProps {
  tenantSlug: string
  tenantName: string
  className?: string
  variant?: 'banner' | 'card' | 'inline'
  showBenefits?: boolean
}

export function AngelOSReferralBanner({ 
  tenantSlug, 
  tenantName, 
  className = '',
  variant = 'banner',
  showBenefits = true 
}: AngelOSReferralBannerProps) {
  const referralUrl = `/auth/signup?angelos=true&referrer=${tenantSlug}`

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600">Want your own platform?</span>
        <Link 
          href={referralUrl}
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          <Sparkles className="h-3 w-3" />
          Join Angel OS
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={`border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Create Your Own Platform</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Inspired by {tenantName}? Start your own AI-powered business platform with Angel OS.
              </p>
              {showBenefits && (
                <div className="flex items-center gap-2 text-xs text-green-600 mb-4">
                  <TrendingUp className="h-3 w-3" />
                  <span>Referral rewards • Platform improvements • Open source</span>
                </div>
              )}
            </div>
            <Button asChild size="sm" className="ml-4">
              <Link href={referralUrl}>
                Get Started
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default banner variant
  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Love {tenantName}? Create Your Own Platform!</h3>
            <p className="text-blue-100 text-sm">
              Join Angel OS and build your AI-powered business platform
              {showBenefits && ' • Earn referral rewards'}
            </p>
          </div>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={referralUrl}>
            Get Started
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// Usage examples for tenants:
/*
// Banner at top of page
<AngelOSReferralBanner 
  tenantSlug="safeschool-map" 
  tenantName="SafeSchool MAP" 
  variant="banner"
  className="mb-6"
/>

// Card in sidebar or footer
<AngelOSReferralBanner 
  tenantSlug="safeschool-map" 
  tenantName="SafeSchool MAP" 
  variant="card"
  showBenefits={true}
/>

// Inline in content
<AngelOSReferralBanner 
  tenantSlug="safeschool-map" 
  tenantName="SafeSchool MAP" 
  variant="inline"
  showBenefits={false}
/>
*/

