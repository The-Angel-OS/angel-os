import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { School } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import { SchoolProfileHeader } from './_components/SchoolProfileHeader'
import { SafetyScoreCard } from './_components/SafetyScoreCard'
import { SchoolDetailsCard } from './_components/SchoolDetailsCard'
import { SchoolReviewsSection } from './_components/SchoolReviewsSection'
import { SchoolMapCard } from './_components/SchoolMapCard'
import { AddReviewModal } from './_components/AddReviewModal'
import { Button } from "@/components/ui/button"
import { Plus, Share, Flag, Heart } from "lucide-react"

export async function generateStaticParams() {
  // Temporarily return empty array until database is seeded
  // TODO: Re-enable after running seed script
  return []
  
  /* 
  const payload = await getPayload({ config: configPromise })
  const schools = await payload.find({
    collection: 'schools',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: {
      slug: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const params = schools.docs.map(({ slug }) => {
    return { slug }
  })

  return params
  */
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function SchoolPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()

  const school = await querySchoolBySlug({ slug, draft })

  if (!school) {
    return <PayloadRedirects url={`/schools/${slug}`} />
  }

  return (
    <article className="pt-16 pb-24">
      {/* School Profile Header */}
      <SchoolProfileHeader 
        school={school}
        onShare={() => {}}
        onReport={() => {}}
        onFavorite={() => {}}
        isFavorited={false}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Safety Scores */}
            <SafetyScoreCard 
              communityScore={school.safetyScores.communityScore}
              verifiedScore={school.safetyScores.verifiedScore}
            />

            {/* School Reviews */}
            <SchoolReviewsSection 
              reviews={[]}
              schoolId={school.id}
              onAddReview={() => {}}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* School Details */}
            <SchoolDetailsCard 
              school={school}
            />

            {/* Map */}
            {school.address.coordinates && school.address.coordinates.latitude && school.address.coordinates.longitude && (
              <SchoolMapCard 
                school={school}
                coordinates={{
                  lat: school.address.coordinates.latitude,
                  lng: school.address.coordinates.longitude
                }}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Safety Review
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
                <Button 
                  variant="outline"
                  className="w-full text-muted-foreground"
                  size="sm"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()

  const school = await querySchoolBySlug({ slug, draft })

  return generateMeta({ doc: school })
}

const querySchoolBySlug = cache(async ({ slug, draft }: { slug: string; draft: boolean }) => {
  const { isEnabled: isDraftMode } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'schools',
    draft: isDraftMode || draft,
    limit: 1,
    overrideAccess: isDraftMode || draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
