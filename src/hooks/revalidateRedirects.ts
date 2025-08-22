import type { CollectionAfterChangeHook } from 'payload'

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  // Only import revalidateTag in server environment
  if (typeof window === 'undefined') {
    try {
      const { revalidateTag } = require('next/cache')
      revalidateTag('redirects')
    } catch (error) {
      payload.logger.warn('Could not revalidate redirects cache:', error)
    }
  }

  return doc
}
