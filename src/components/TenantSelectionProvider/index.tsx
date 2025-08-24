import type { Payload, TypedUser } from 'payload'

import { cookies as getCookies } from 'next/headers.js'

import { TenantSelectionProviderClient } from './index.client'

type Args = {
  children: React.ReactNode
  payload: Payload
  tenantsArrayFieldName: string
  tenantsArrayTenantFieldName: string
  tenantsCollectionSlug: string
  useAsTitle: string
  user: TypedUser
  userHasAccessToAllTenants: (user: TypedUser) => boolean
}

export const TenantSelectionProvider = async ({
  children,
  payload,
  tenantsArrayFieldName,
  tenantsArrayTenantFieldName,
  tenantsCollectionSlug,
  useAsTitle,
  user,
  userHasAccessToAllTenants,
}: Args) => {
  const tenantOptions = await getTenantOptions({
    payload,
    tenantsArrayFieldName,
    tenantsArrayTenantFieldName,
    tenantsCollectionSlug,
    useAsTitle,
    user,
    userHasAccessToAllTenants,
  })

  const cookies = await getCookies()
  const tenantCookie = cookies.get('payload-tenant')?.value
  let initialValue = undefined

  /**
   * Ensure the cookie is a valid tenant
   */
  if (tenantCookie) {
    const matchingOption = tenantOptions.find((option) => String(option.value) === tenantCookie)
    if (matchingOption) {
      initialValue = matchingOption.value
    }
  }

  /**
   * If the there was no cookie or the cookie was an invalid tenantID set intialValue
   */
  if (!initialValue) {
    initialValue = tenantOptions.length > 1 ? undefined : tenantOptions[0]?.value
  }

  return (
    <TenantSelectionProviderClient
      initialTenantOptions={tenantOptions}
      initialValue={initialValue}
      tenantsCollectionSlug={tenantsCollectionSlug}
    >
      {children}
    </TenantSelectionProviderClient>
  )
}

const getTenantOptions = async ({
  payload,
  tenantsArrayFieldName,
  tenantsArrayTenantFieldName,
  tenantsCollectionSlug,
  useAsTitle,
  user,
  userHasAccessToAllTenants,
}: {
  payload: Payload
  tenantsArrayFieldName: string
  tenantsArrayTenantFieldName: string
  tenantsCollectionSlug: string
  useAsTitle: string
  user: TypedUser
  userHasAccessToAllTenants: (user: TypedUser) => boolean
}): Promise<Array<{ label: string; value: string }>> => {
  let tenantOptions: Array<{ label: string; value: string }> = []

  if (!user) {
    return tenantOptions
  }

  if (userHasAccessToAllTenants(user)) {
    console.log('🏢 TenantProvider Debug - User has access to all tenants, loading from DB...')
    // If the user has access to all tenants get them from the DB
    const collection = payload.collections[tenantsCollectionSlug as keyof typeof payload.collections]
    const isOrderable = collection?.config?.orderable || false
    const tenants = await payload.find({
      collection: tenantsCollectionSlug as any,
      depth: 0,
      limit: 0,
      overrideAccess: false,
      select: {
        [useAsTitle]: true,
        ...(isOrderable && { _order: true }),
      } as any,
      sort: isOrderable ? '_order' : useAsTitle,
      user,
    })

    console.log('🏢 TenantProvider Debug - Found tenants:', tenants.docs.length)
    console.log('🏢 TenantProvider Debug - Tenant docs:', tenants.docs)

    tenantOptions = tenants.docs.map((doc) => ({
      label: String((doc as any)[useAsTitle]), // useAsTitle is dynamic but the type thinks we are only selecting `id` | `_order`
      value: String(doc.id),
    }))
    
    console.log('🏢 TenantProvider Debug - Tenant options created:', tenantOptions)
  } else {
    const tenantsToPopulate: (number | string)[] = []

    // i.e. users.tenants
    ;(((user as any)[tenantsArrayFieldName] as { [key: string]: any }[]) || []).map((tenantRow) => {
      const tenantField = tenantRow[tenantsArrayTenantFieldName] // tenants.tenant
      if (typeof tenantField === 'string' || typeof tenantField === 'number') {
        tenantsToPopulate.push(tenantField)
      } else if (tenantField && typeof tenantField === 'object') {
        tenantOptions.push({
          label: String(tenantField[useAsTitle]),
          value: String(tenantField.id),
        })
      }
    })

    if (tenantsToPopulate.length > 0) {
      const populatedTenants = await payload.find({
        collection: tenantsCollectionSlug as any,
        depth: 0,
        limit: 0,
        overrideAccess: false,
        user,
        where: {
          id: {
            in: tenantsToPopulate,
          },
        },
      })

      tenantOptions = populatedTenants.docs.map((doc) => ({
        label: String((doc as any)[useAsTitle]),
        value: String(doc.id),
      }))
    }
  }

  return tenantOptions
}

export default TenantSelectionProvider
