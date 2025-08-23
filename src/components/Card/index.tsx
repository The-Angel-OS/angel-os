'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Event } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> | Pick<Event, 'slug' | 'title' | 'eventType' | 'eventDate'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts' | 'events'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, title } = doc || {}
  
  // Handle different data structures for posts vs events
  const isPost = relationTo === 'posts'
  const isEvent = relationTo === 'events'
  
  const categories = isPost ? (doc as any)?.categories : null
  const meta = isPost ? (doc as any)?.meta : null
  const eventType = isEvent ? (doc as any)?.eventType : null
  const eventDate = isEvent ? (doc as any)?.eventDate : null
  
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full ">
        {!metaImage && <div className="">No image</div>}
        {metaImage && typeof metaImage !== 'string' && <Media resource={metaImage} size="33vw" />}
      </div>
      <div className="p-4">
        {showCategories && hasCategories && (
          <div className="uppercase text-sm mb-4">
            {showCategories && hasCategories && (
              <div>
                {categories?.map((category, index) => {
                  if (typeof category === 'object') {
                    const { name: titleFromCategory } = category

                    const categoryTitle = titleFromCategory || 'Untitled category'

                    const isLast = index === categories.length - 1

                    return (
                      <Fragment key={index}>
                        {categoryTitle}
                        {!isLast && <Fragment>, &nbsp;</Fragment>}
                      </Fragment>
                    )
                  }

                  return null
                })}
              </div>
            )}
          </div>
        )}
        {titleToUse && (
          <div className="prose">
            <h3>
              <Link className="not-prose" href={href} ref={link.ref}>
                {titleToUse}
              </Link>
            </h3>
          </div>
        )}
        {/* Description for posts */}
        {isPost && description && <div className="mt-2"><p>{sanitizedDescription}</p></div>}
        
        {/* Event-specific content */}
        {isEvent && (
          <div className="mt-2 space-y-1">
            {eventType && (
              <p className="text-sm text-muted-foreground capitalize">{eventType.replace('_', ' ')}</p>
            )}
            {eventDate && (
              <p className="text-sm text-muted-foreground">
                {new Date(eventDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
