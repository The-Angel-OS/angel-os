import type { GlobalAfterChangeHook } from 'payload'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    // Only import revalidateTag in server environment
    if (typeof window === 'undefined') {
      try {
        const { revalidateTag } = require('next/cache')
        revalidateTag('global_header')
      } catch (error) {
        payload.logger.warn('Could not revalidate header cache:', error)
      }
    }
  }

  return doc
}
