import type { ServerProps } from 'payload'

import { TenantSelectorClient } from './index.client'

type Props = {
  enabledSlugs: string[]
  label?: string
} & ServerProps

export const TenantSelector = (props: Props) => {
  const { enabledSlugs, label, params, viewType } = props
  const enabled = Boolean(
    params?.segments &&
      Array.isArray(params.segments) &&
      params.segments[0] === 'collections' &&
      params.segments[1] &&
      enabledSlugs.includes(params.segments[1]),
  )

  return <TenantSelectorClient disabled={!enabled} label={label} viewType={viewType} />
}

export default TenantSelector