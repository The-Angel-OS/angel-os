import type { GlobalAfterChangeHook } from 'payload'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    // Only import revalidateTag in server environment
    if (typeof window === 'undefined') {
      try {
        const { revalidateTag } = require('next/cache')
        revalidateTag('global_footer')
      } catch (error) {
        payload.logger.warn('Could not revalidate footer cache:', error)
      }
    }
  }

  return doc
}
