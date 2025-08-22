import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Page } from '../../../payload-types'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate && typeof window === 'undefined') {
    try {
      const { revalidatePath, revalidateTag } = require('next/cache')
      
      if (doc._status === 'published') {
        const path = doc.slug === 'home' ? '/' : `/${doc.slug}`

        payload.logger.info(`Revalidating page at path: ${path}`)

        revalidatePath(path)
        revalidateTag('pages-sitemap')
      }

      // If the page was previously published, we need to revalidate the old path
      if (previousDoc?._status === 'published' && doc._status !== 'published') {
        const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`

        payload.logger.info(`Revalidating old page at path: ${oldPath}`)

        revalidatePath(oldPath)
        revalidateTag('pages-sitemap')
      }
    } catch (error) {
      payload.logger.warn('Could not revalidate page cache:', error)
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate && typeof window === 'undefined') {
    try {
      const { revalidatePath, revalidateTag } = require('next/cache')
      const path = doc?.slug === 'home' ? '/' : `/${doc?.slug}`
      revalidatePath(path)
      revalidateTag('pages-sitemap')
    } catch (error) {
      console.warn('Could not revalidate page cache on delete:', error)
    }
  }

  return doc
}
