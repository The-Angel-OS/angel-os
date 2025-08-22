import type { Field } from 'payload'

/**
 * Shared tenant field for multi-tenant collections
 * Ensures consistent tenant relationship across all collections
 */
export const tenantField: Field = {
  name: 'tenant',
  type: 'relationship',
  relationTo: 'tenants',
  required: true,
  admin: {
    description: 'Tenant this record belongs to',
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [
      ({ req, value }) => {
        // Auto-assign tenant from user if not provided
        if (!value && req.user && (req.user as any).tenant) {
          return (req.user as any).tenant
        }
        return value
      },
    ],
  },
}
