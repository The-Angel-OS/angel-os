import type { Metadata } from 'next'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { Event } from '@/payload-types'

import { generateMeta } from '@/utilities/generateMeta'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users, Clock, ExternalLink, Ticket } from 'lucide-react'
import { format } from 'date-fns'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const events = await payload.find({
    collection: 'events',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
    },
    where: {
      isPublic: {
        equals: true,
      },
    },
  })

  const params = events.docs.map(({ slug, id }) => {
    return { slug: slug || id.toString() }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function EventPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()

  const event = await queryEventBySlug({ slug, draft })

  if (!event) {
    return <PayloadRedirects url={`/events/${slug}`} />
  }

  return (
    <article className="pt-16 pb-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {event.eventType || 'Event'}
              </Badge>
              {event.venue?.capacity && (
                <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                  <Users className="w-3 h-3 mr-1" />
                  Max {event.venue.capacity} attendees
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.title}</h1>
            {event.description && (
              <div className="text-xl text-white/90 mb-6 max-w-2xl">
                {typeof event.description === 'string' ? (
                  <p>{event.description}</p>
                ) : (
                  <div>Event description available</div>
                )}
              </div>
            )}
            
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    {format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-white/80">
                    {event.startTime && format(new Date(event.startTime), 'h:mm a')}
                    {event.endTime && (
                      <> - {format(new Date(event.endTime), 'h:mm a')}</>
                    )}
                  </p>
                </div>
              </div>
              
              {event.venue && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {event.venue.name || 'Event Venue'}
                    </p>
                    {event.venue.address && (
                      <p className="text-white/80">{event.venue.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90">
                <Ticket className="w-4 h-4 mr-2" />
                Register Now
              </Button>
              {event.venue?.venueType === 'virtual' && (
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Virtual Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="prose dark:prose-invert max-w-none">
              <h2>About This Event</h2>
              <p>
                Join us for {event.title}! This {event.eventType?.toLowerCase() || 'event'} 
                promises to be an engaging experience for all attendees.
              </p>
              {event.description && typeof event.description === 'string' && (
                <p>{event.description}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Date & Time</h4>
                  <p className="font-medium">
                    {format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.startTime && format(new Date(event.startTime), 'h:mm a')}
                    {event.endTime && (
                      <> - {format(new Date(event.endTime), 'h:mm a')}</>
                    )}
                  </p>
                </div>

                {event.venue && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Location</h4>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {event.venue.name || 'Event Venue'}
                        </p>
                        {event.venue.address && (
                          <p className="text-sm text-muted-foreground">{event.venue.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {event.venue?.capacity && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Capacity</h4>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Maximum {event.venue.capacity} attendees</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button className="w-full" size="lg">
                    <Ticket className="w-4 h-4 mr-2" />
                    Register for Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle>Share This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const { isEnabled: draft } = await draftMode()

  const event = await queryEventBySlug({ slug, draft })

  return generateMeta({ doc: event })
}

const queryEventBySlug = cache(async ({ slug, draft }: { slug: string; draft: boolean }) => {
  const { isEnabled: isDraftMode } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'events',
    draft: isDraftMode || draft,
    limit: 1,
    overrideAccess: isDraftMode || draft,
    where: {
      or: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          id: {
            equals: slug, // Handle case where slug is actually an ID
          },
        },
      ],
    },
  })

  return result.docs?.[0] || null
})
