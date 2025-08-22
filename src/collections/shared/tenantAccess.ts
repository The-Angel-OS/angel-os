import type { Access } from 'payload'

/**
 * Elegant tenant access control for collections
 * Follows Payload CMS best practices for multi-tenancy
 */
export const createTenantAccess = (): {
  create: Access
  read: Access
  update: Access
  delete: Access
} => ({
  create: ({ req: { user } }) => {
    if (!user) return false
    
    // Super admin can create in any tenant
    if ((user as any).globalRole === 'super_admin') return true
    
    // Platform admin can create in any tenant
    if ((user as any).globalRole === 'platform_admin') return true
    
    // Users can only create in their own tenant
    return {
      tenant: {
        equals: (user as any).tenant?.id || (user as any).tenant,
      },
    }
  },

  read: ({ req: { user } }) => {
    if (!user) return false
    
    // Super admin can read all
    if ((user as any).globalRole === 'super_admin') return true
    
    // Platform admin can read all
    if ((user as any).globalRole === 'platform_admin') return true
    
    // Users can only read from their tenant
    return {
      tenant: {
        equals: (user as any).tenant?.id || (user as any).tenant,
      },
    }
  },

  update: ({ req: { user } }) => {
    if (!user) return false
    
    // Super admin can update all
    if ((user as any).globalRole === 'super_admin') return true
    
    // Platform admin can update all
    if ((user as any).globalRole === 'platform_admin') return true
    
    // Users can only update in their tenant
    return {
      tenant: {
        equals: (user as any).tenant?.id || (user as any).tenant,
      },
    }
  },

  delete: ({ req: { user } }) => {
    if (!user) return false
    
    // Super admin can delete all
    if ((user as any).globalRole === 'super_admin') return true
    
    // Platform admin can delete all (be careful with this)
    if ((user as any).globalRole === 'platform_admin') return true
    
    // Users can only delete from their tenant
    return {
      tenant: {
        equals: (user as any).tenant?.id || (user as any).tenant,
      },
    }
  },
})

/**
 * Super admin only access (for tenant management, roadmap features, etc.)
 */
export const superAdminOnlyAccess: {
  create: Access
  read: Access
  update: Access
  delete: Access
} = {
  create: ({ req: { user } }: any) => (user as any)?.globalRole === 'super_admin',
  read: ({ req: { user } }: any) => (user as any)?.globalRole === 'super_admin',
  update: ({ req: { user } }: any) => (user as any)?.globalRole === 'super_admin',
  delete: ({ req: { user } }: any) => (user as any)?.globalRole === 'super_admin',
}

/**
 * Public read access (for roadmap features that everyone can see)
 */
export const publicReadAccess = {
  create: ({ req: { user } }: any) => (user as any)?.globalRole === 'super_admin',
  read: () => true, // Public readable
  update: ({ req: { user } }: any) => (user as any)?.globalRole === 'super_admin',
  delete: ({ req: { user } }: any) => (user as any)?.globalRole === 'super_admin',
}
