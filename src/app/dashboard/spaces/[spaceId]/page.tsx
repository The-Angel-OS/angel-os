import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
// Space page redirects to dashboard channel
import type { Space, User as PayloadUser } from '@/payload-types'

interface SpacePageProps {
  params: Promise<{
    spaceId: string
  }>
}

export async function generateMetadata({ params }: SpacePageProps) {
  const { spaceId } = await params
  const payload = await getPayload({ config })

  try {
    const space = await payload.findByID({
      collection: 'spaces',
      id: spaceId,
    })

    return {
      title: `${space.name} - Spaces`,
      description: space.description || 'Real-time collaboration space',
    }
  } catch {
    return {
      title: 'Space Not Found - Spaces',
      description: 'The requested space could not be found',
    }
  }
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { spaceId } = await params
  const payload = await getPayload({ config })
  const cookieStore = await cookies()

  // Get current user from session
  let currentUser: PayloadUser | null = null

  try {
    const token = cookieStore.get('payload-token')?.value
    if (token) {
      // Create Headers object with Authorization header
      const headers = new Headers()
      headers.set('Authorization', `Bearer ${token}`)
      
      const { user } = await payload.auth({ headers })
      currentUser = user as PayloadUser
    }
  } catch (error) {
    console.error('Failed to authenticate user:', error)
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    redirect(`/auth/login?redirect=/spaces/${spaceId}`)
  }

  // Get user's tenant memberships
  let userTenantIds: (string | number)[] = []
  try {
    const tenantMemberships = await payload.find({
      collection: 'tenant-memberships',
      where: {
        user: {
          equals: currentUser.id,
        },
        status: {
          equals: 'active',
        },
      },
    })

    userTenantIds = tenantMemberships.docs.map((membership: any) => {
      const tenant = membership.tenant
      return typeof tenant === 'object' ? tenant.id : tenant
    })
  } catch (error) {
    console.error('Failed to load tenant memberships:', error)
  }

  // Load the specific space
  let targetSpace: Space | null = null

  try {
    targetSpace = await payload.findByID({
      collection: 'spaces',
      id: spaceId,
      depth: 2,
    }) as Space

    // Verify user has access to this space through tenant membership or space membership
    const spaceTenantId = typeof targetSpace.tenant === 'object' ? targetSpace.tenant.id : targetSpace.tenant
    const hasAccessThroughTenant = userTenantIds.includes(spaceTenantId)
    
         // Check if user is a member of this specific space
     let hasAccessThroughSpaceMembership = false
     try {
       const spaceMembership = await payload.find({
        collection: 'space-memberships',
         where: {
           and: [
             {
               user: {
                 equals: currentUser.id,
               },
             },
             {
               space: {
                 equals: spaceId,
               },
             },
             {
               status: {
                 equals: 'active',
               },
             },
           ],
         },
         limit: 1,
       })
       hasAccessThroughSpaceMembership = spaceMembership.docs.length > 0
     } catch (error) {
       console.error('Failed to check space membership:', error)
     }

    if (!hasAccessThroughTenant && !hasAccessThroughSpaceMembership) {
      notFound()
    }
  } catch (error) {
    console.error('Failed to load space:', error)
    notFound()
  }

  // Load all spaces user has access to
  let allSpaces: Space[] = []

  try {
    // Get spaces through tenant membership
    const tenantSpacesQuery = await payload.find({
      collection: 'spaces',
      where: {
        tenant: {
          in: userTenantIds,
        },
      },
      depth: 2,
      limit: 50,
      sort: 'name',
    })

         // Get spaces through direct space membership
    const spaceMemberships = await payload.find({
      collection: 'space-memberships',
       where: {
         user: {
           equals: currentUser.id,
         },
         status: {
           equals: 'active',
         },
       },
     })

     const directSpaceIds = spaceMemberships.docs.map((membership: any) => {
       const space = membership.space
       return typeof space === 'object' ? space.id : space
     })

    const directSpacesQuery = await payload.find({
      collection: 'spaces',
      where: {
        id: {
          in: directSpaceIds,
        },
      },
      depth: 2,
      limit: 50,
      sort: 'name',
    })

    // Combine and deduplicate spaces
    const combinedSpaces = [...tenantSpacesQuery.docs, ...directSpacesQuery.docs]
    const uniqueSpaces = combinedSpaces.filter((space, index, self) => 
      index === self.findIndex(s => s.id === space.id)
    )

    allSpaces = uniqueSpaces as Space[]
  } catch (error) {
    console.error('Failed to load spaces:', error)
  }

  // Redirect to default dashboard channel
  redirect(`/spaces/${spaceId}/dashboard`)
}
