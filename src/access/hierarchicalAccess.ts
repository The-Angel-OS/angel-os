import type { PayloadRequest } from 'payload'

// Use the actual request user type from Payload
type RequestUser = NonNullable<PayloadRequest['user']>

// Permission Context Interface
export interface PermissionContext {
  user: RequestUser
  tenant?: string | Record<string, any>
  space?: string | Record<string, any>
  resource: string
  action: string
}

// Permission Rule Interface
export interface PermissionRule {
  level: 'global' | 'tenant' | 'space' | 'resource'
  role: string
  permissions: string[]
  conditions?: {
    field: string
    operator: 'equals' | 'contains' | 'in'
    value: any
  }[]
}

// Default Permission Rules
const DEFAULT_PERMISSION_RULES: PermissionRule[] = [
  // Global Level Permissions
  {
    level: 'global',
    role: 'super_admin',
    permissions: ['*'], // All permissions
  },
  {
    level: 'global',
    role: 'platform_admin',
    permissions: [
      'read:*',
      'create:tenants',
      'update:tenants',
      'manage:users',
      'view:analytics',
      'export:data',
    ],
  },
  {
    level: 'global',
    role: 'user',
    permissions: [
      'read:own',
      'update:own',
      'create:content',
    ],
  },

  // Tenant Level Permissions
  {
    level: 'tenant',
    role: 'tenant_admin',
    permissions: [
      'manage:tenant',
      'manage:spaces',
      'manage:users',
      'manage:content',
      'manage:products',
      'manage:orders',
      'view:analytics',
      'manage:settings',
      'export:data',
    ],
  },
  {
    level: 'tenant',
    role: 'tenant_manager',
    permissions: [
      'read:tenant',
      'update:tenant',
      'create:spaces',
      'manage:content',
      'manage:products',
      'view:analytics',
    ],
  },
  {
    level: 'tenant',
    role: 'tenant_member',
    permissions: [
      'read:tenant',
      'create:content',
      'join:spaces',
    ],
  },

  // Space Level Permissions
  {
    level: 'space',
    role: 'space_admin',
    permissions: [
      'manage:space',
      'manage:members',
      'moderate:content',
      'manage:events',
      'view:analytics',
    ],
  },
  {
    level: 'space',
    role: 'moderator',
    permissions: [
      'read:space',
      'moderate:content',
      'manage:events',
      'post:messages',
    ],
  },
  {
    level: 'space',
    role: 'member',
    permissions: [
      'read:space',
      'post:messages',
      'upload:files',
      'join:events',
    ],
  },
  {
    level: 'space',
    role: 'guest',
    permissions: [
      'read:public',
    ],
  },
]

/**
 * Evaluate permission for a specific context
 */
export async function evaluatePermission(
  context: PermissionContext,
  req: PayloadRequest
): Promise<boolean> {
  const { user, resource, action } = context

  // Super admin has all permissions
  if ((user as any).globalRole === 'super_admin') {
    return true
  }

  // Get effective permissions for the user in this context
  const effectivePermissions = await getEffectivePermissions(user, context, req)

  // Check if user has the specific permission
  const hasPermission = effectivePermissions.some(permission => {
    // Wildcard permission
    if (permission === '*') return true

    // Exact match
    if (permission === `${action}:${resource}`) return true

    // Action wildcard
    if (permission === `${action}:*`) return true

    // Resource wildcard
    if (permission === `*:${resource}`) return true

    return false
  })

  return hasPermission
}

/**
 * Get all effective permissions for a user in a specific context
 */
export async function getEffectivePermissions(
  user: RequestUser,
  context: PermissionContext,
  req: PayloadRequest
): Promise<string[]> {
  const permissions: string[] = []

  // Add global permissions
  const globalPermissions = getGlobalPermissions(user)
  permissions.push(...globalPermissions)

  // Add tenant permissions if context includes tenant
  if (context.tenant) {
    const tenantPermissions = await getTenantPermissions(user, context.tenant, req)
    permissions.push(...tenantPermissions)
  }

  // Add space permissions if context includes space
  if (context.space) {
    const spacePermissions = await getSpacePermissions(user, context.space, req)
    permissions.push(...spacePermissions)
  }

  // Remove duplicates and return
  return [...new Set(permissions)]
}

/**
 * Get global permissions for a user
 */
function getGlobalPermissions(user: RequestUser): string[] {
  const globalRole = (user as any).globalRole || 'user'
  const rule = DEFAULT_PERMISSION_RULES.find(
    rule => rule.level === 'global' && rule.role === globalRole
  )

  return rule ? rule.permissions : []
}

/**
 * Get tenant-level permissions for a user
 */
async function getTenantPermissions(
  user: RequestUser,
  tenant: string | Record<string, any>,
  req: PayloadRequest
): Promise<string[]> {
  try {
    const tenantId = typeof tenant === 'object' ? tenant.id : tenant

    // Find tenant membership
    const tenantMembership = await req.payload.find({
      collection: 'tenant-memberships',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            tenant: {
              equals: tenantId,
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

    if (tenantMembership.docs.length === 0) {
      return []
    }

    const membership = tenantMembership.docs[0]
    if (!membership) {
      return []
    }

    const role = membership.role

    // Get permissions from rule
    const rule = DEFAULT_PERMISSION_RULES.find(
      rule => rule.level === 'tenant' && rule.role === role
    )

    const permissions = rule ? rule.permissions : []

    // Add custom permissions from membership
    if (membership.permissions && Array.isArray(membership.permissions)) {
      permissions.push(...membership.permissions)
    }

    return permissions
  } catch (error) {
    console.error('Error getting tenant permissions:', error)
    return []
  }
}

/**
 * Get space-level permissions for a user
 */
async function getSpacePermissions(
  user: RequestUser,
  space: string | Record<string, any>,
  req: PayloadRequest
): Promise<string[]> {
  try {
    const spaceId = typeof space === 'object' ? space.id : space

    // Find space membership
    const spaceMembership = await req.payload.find({
      collection: 'space-memberships',
      where: {
        and: [
          {
            user: {
              equals: user.id,
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

    if (spaceMembership.docs.length === 0) {
      return []
    }

    const membership = spaceMembership.docs[0]
    if (!membership) {
      return []
    }

    const role = membership.role

    // Get permissions from rule
    const rule = DEFAULT_PERMISSION_RULES.find(
      rule => rule.level === 'space' && rule.role === role
    )

    const permissions = rule ? rule.permissions : []

    // Add custom permissions from membership
    if (membership.customPermissions && Array.isArray(membership.customPermissions)) {
      permissions.push(...membership.customPermissions)
    }

    return permissions
  } catch (error) {
    console.error('Error getting space permissions:', error)
    return []
  }
}

/**
 * Check if user can access a specific resource with an action
 */
export async function canUserAccess(
  user: RequestUser,
  resource: any,
  action: string,
  req: PayloadRequest
): Promise<boolean> {
  // Extract context from resource
  const context: PermissionContext = {
    user,
    resource: resource.collection || 'unknown',
    action,
  }

  // Add tenant context if resource has tenant
  if (resource.tenant) {
    context.tenant = resource.tenant
  }

  // Add space context if resource has space
  if (resource.space) {
    context.space = resource.space
  }

  return await evaluatePermission(context, req)
}

/**
 * Access control helper for Payload collections
 */
export const hierarchicalAccess = {
  /**
   * Create access control
   */
  create: ({ req }: { req: PayloadRequest }) => {
    if (!req.user) return false

    // Super admin can create anything
    if ((req.user as any).globalRole === 'super_admin') return true

    // Platform admin can create most things
    if ((req.user as any).globalRole === 'platform_admin') return true

    // For other users, check specific permissions
    return async (doc: any) => {
      return await canUserAccess(req.user!, doc, 'create', req)
    }
  },

  /**
   * Read access control
   */
  read: ({ req }: { req: PayloadRequest }) => {
    if (!req.user) return false

    // Super admin can read anything
    if ((req.user as any).globalRole === 'super_admin') return true

    // Platform admin can read most things
    if ((req.user as any).globalRole === 'platform_admin') return true

    // For other users, check specific permissions
    return async (doc: any) => {
      return await canUserAccess(req.user!, doc, 'read', req)
    }
  },

  /**
   * Update access control
   */
  update: ({ req }: { req: PayloadRequest }) => {
    if (!req.user) return false

    // Super admin can update anything
    if ((req.user as any).globalRole === 'super_admin') return true

    // For other users, check specific permissions
    return async (doc: any) => {
      return await canUserAccess(req.user!, doc, 'update', req)
    }
  },

  /**
   * Delete access control
   */
  delete: ({ req }: { req: PayloadRequest }) => {
    if (!req.user) return false

    // Super admin can delete anything
    if ((req.user as any).globalRole === 'super_admin') return true

    // For other users, check specific permissions
    return async (doc: any) => {
      return await canUserAccess(req.user!, doc, 'delete', req)
    }
  },
}

/**
 * Tenant-specific access control
 */
export const tenantAccess = ({ req }: { req: PayloadRequest }) => {
  if (!req.user) return false

  // Super admin and platform admin can access all tenants
  if ((req.user as any).globalRole === 'super_admin' || (req.user as any).globalRole === 'platform_admin') {
    return true
  }

  // For other users, check tenant membership
  return async (doc: any) => {
    const tenantId = doc.tenant || doc.id

    if (!tenantId) return false

    try {
      const membership = await req.payload.find({
        collection: 'tenant-memberships',
        where: {
          and: [
            {
              user: {
                equals: req.user!.id,
              },
            },
            {
              tenant: {
                equals: tenantId,
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

      return membership.docs.length > 0
    } catch (error) {
      console.error('Error checking tenant access:', error)
      return false
    }
  }
}

/**
 * Space-specific access control
 */
export const spaceAccess = ({ req }: { req: PayloadRequest }) => {
  if (!req.user) return false

  // Super admin and platform admin can access all spaces
  if ((req.user as any).globalRole === 'super_admin' || (req.user as any).globalRole === 'platform_admin') {
    return true
  }

  // For other users, check space membership
  return async (doc: any) => {
    const spaceId = doc.space || doc.id

    if (!spaceId) return false

    try {
      const membership = await req.payload.find({
        collection: 'space-memberships',
        where: {
          and: [
            {
              user: {
                equals: req.user!.id,
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

      return membership.docs.length > 0
    } catch (error) {
      console.error('Error checking space access:', error)
      return false
    }
  }
}
