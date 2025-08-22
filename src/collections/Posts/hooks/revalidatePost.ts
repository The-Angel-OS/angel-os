import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate && typeof window === 'undefined') {
    try {
      const { revalidatePath, revalidateTag } = require('next/cache')
      
      if (doc._status === 'published') {
        const path = `/posts/${doc.slug}`

        payload.logger.info(`Revalidating post at path: ${path}`)

        revalidatePath(path)
        revalidateTag('posts-sitemap')
      }

      // If the post was previously published, we need to revalidate the old path
      if (previousDoc._status === 'published' && doc._status !== 'published') {
        const oldPath = `/posts/${previousDoc.slug}`

        payload.logger.info(`Revalidating old post at path: ${oldPath}`)

        revalidatePath(oldPath)
        revalidateTag('posts-sitemap')
      }
    } catch (error) {
      payload.logger.warn('Could not revalidate post cache:', error)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate && typeof window === 'undefined') {
    try {
      const { revalidatePath, revalidateTag } = require('next/cache')
      const path = `/posts/${doc?.slug}`

      revalidatePath(path)
      revalidateTag('posts-sitemap')
    } catch (error) {
      console.warn('Could not revalidate post cache on delete:', error)
    }
  }

  return doc
}
