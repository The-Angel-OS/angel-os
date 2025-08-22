import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { SubscriptionPlans } from '@/components/SubscriptionPlans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface SubscribePageProps {
  searchParams: Promise<{
    content?: string
    tier?: string
    space?: string
  }>
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const params = await searchParams
  const { content, tier, space } = params

  const payload = await getPayload({ config })
  const cookieStore = await cookies()

  // Check if user is already logged in
  let currentUser = null
  try {
    const token = cookieStore.get('payload-token')?.value
    if (token) {
      const headers = new Headers()
      headers.set('Authorization', `Bearer ${token}`)
      const { user } = await payload.auth({ headers })
      currentUser = user
    }
  } catch (error) {
    console.error('Auth check failed:', error)
  }

  // Get space details if space parameter provided
  let targetSpace = null
  if (space) {
    try {
      targetSpace = await payload.findByID({
        collection: 'spaces',
        id: space,
        depth: 2,
      })
    } catch (error) {
      console.error('Failed to load space:', error)
    }
  }

  // If no space provided, try to find relevant space from content URL
  if (!targetSpace && content) {
    try {
      // Try to find space from post/page content
      const collections = ['posts', 'pages'] as const
      for (const collection of collections) {
        const contentSlug = content.split('/').pop()
        if (contentSlug) {
          const contentItem = await payload.find({
            collection: collection as any, // Cast to avoid CollectionSlug type issues
            where: { slug: { equals: contentSlug } },
            limit: 1,
          })

          if (contentItem.docs.length > 0) {
            // Find associated space (this would need to be enhanced based on your content-space relationships)
            break
          }
        }
      }
    } catch (error) {
      console.error('Failed to find space from content:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {targetSpace ? `Subscribe to ${targetSpace.name}` : 'Choose Your Subscription'}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Get exclusive access to premium content, early releases, and direct creator interaction
            </p>

            {content && (
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-200">
                <p className="text-sm text-gray-700">
                  🔒 You're trying to access premium content at{' '}
                  <code className="bg-purple-100 px-2 py-1 rounded text-purple-800">{content}</code>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Subscribe to unlock this content and gain access to our entire premium library
                </p>
              </div>
            )}

            {!currentUser && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-medium mb-2">
                  New to our platform?
                </p>
                <p className="text-blue-700 text-sm mb-3">
                  You'll need to create an account first to subscribe to premium content.
                </p>
                <Link href={`/admin/create-first-user?redirect=${encodeURIComponent('/subscribe')}`}>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Create Account
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Subscription Plans */}
          <Suspense fallback={<div className="text-center">Loading subscription plans...</div>}>
            <SubscriptionPlans
              currentUser={currentUser}
              targetSpace={targetSpace}
              selectedTier={tier}
              contentUrl={content}
            />
          </Suspense>

          {/* Benefits Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Why Subscribe?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-700">
                    🎯 Exclusive Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Access premium posts, behind-the-scenes content, and subscriber-only videos
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-pink-700">
                    ⚡ Early Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get new content before anyone else and participate in exclusive previews
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-rose-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-rose-700">
                    💬 Direct Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Message creators directly, join exclusive live streams, and get priority support
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-center">🔒 Secure & Private</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-800">Payment Security</p>
                <p>All payments processed securely through Stripe with industry-standard encryption</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Privacy Protection</p>
                <p>Your subscription data is private and never shared with third parties</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Cancel Anytime</p>
                <p>No long-term commitments. Cancel your subscription at any time from your account</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">Creator Support</p>
                <p>Your subscription directly supports content creators and platform development</p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-purple-600 mx-2">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-purple-600 mx-2">Privacy Policy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-purple-600 mx-2">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
