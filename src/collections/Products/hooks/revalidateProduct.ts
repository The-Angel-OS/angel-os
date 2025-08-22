import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import type { Product } from '../../../payload-types'

export const revalidateProduct: CollectionAfterChangeHook<Product> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate && typeof window === 'undefined') {
    try {
      const { revalidatePath, revalidateTag } = require('next/cache')
      
      if (doc._status === 'published') {
        const path = `/products/${doc.slug}`

        payload.logger.info(`Revalidating product at path: ${path}`)

        revalidatePath(path)
        revalidateTag('products-sitemap')
      }

      // If the product was previously published, we need to revalidate the old path
      if (previousDoc?._status === 'published' && doc._status !== 'published') {
        const oldPath = `/products/${previousDoc.slug}`

        payload.logger.info(`Revalidating old product at path: ${oldPath}`)

        revalidatePath(oldPath)
      }
    } catch (error) {
      payload.logger.warn('Could not revalidate product cache:', error)
    }
  }
  return doc
}

export const revalidateDeleteProduct: CollectionAfterDeleteHook<Product> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate && typeof window === 'undefined') {
    try {
      const { revalidatePath, revalidateTag } = require('next/cache')
      const path = `/products/${doc?.slug}`

      revalidatePath(path)
      revalidateTag('products-sitemap')
    } catch (error) {
      console.warn('Could not revalidate product cache on delete:', error)
    }
  }
  return doc
}




















