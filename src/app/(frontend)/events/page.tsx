import type { Metadata } from 'next'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Event } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const revalidate = 600

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
  }>
}) {
  const { page: pageParam } = await searchParams

  const page = Number(pageParam) || 1

  const payload = await getPayload({ config: configPromise })

  const events = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 12,
    page,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      description: true,
      eventDate: true,
      startTime: true,
      endTime: true,
      venue: true,
      isPublic: true,
      eventType: true,
      meta: true,
    },
    where: {
      and: [
        {
          isPublic: {
            equals: true,
          },
        },
        {
          eventDate: {
            greater_than: new Date().toISOString(),
          },
        },
      ],
    },
    sort: 'eventDate',
  })

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Upcoming Events</h1>
          <p className="text-lg">
            Discover and join our exciting events, workshops, and community gatherings.
          </p>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="events"
          currentPage={events.page}
          limit={12}
          totalDocs={events.totalDocs}
        />
      </div>

      <CollectionArchive posts={events.docs} relationTo="events" />

      <div className="container">
        {events.totalPages > 1 && events.page && (
          <Pagination page={events.page} totalPages={events.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Events`,
    description: `Discover upcoming events, workshops, and community gatherings.`,
    openGraph: {
      title: `Events`,
      description: `Discover upcoming events, workshops, and community gatherings.`,
    },
  }
}
