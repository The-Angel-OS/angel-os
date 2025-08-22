import type { CollectionConfig } from 'payload'

export const SecurityLogs: CollectionConfig = {
  slug: 'security-logs',
  admin: {
    useAsTitle: 'eventType',
    defaultColumns: ['eventType', 'phoneNumber', 'securityLevel', 'timestamp'],
    group: 'Security',
  },
  access: {
    read: ({ req }) => {
      // Only super admin and platform admin can read security logs
      const userWithRole = req.user as any
      return userWithRole?.globalRole === 'super_admin' || userWithRole?.globalRole === 'platform_admin'
    },
    create: ({ req }) => {
      // Only system can create security logs
      const userWithRole = req.user as any
      return userWithRole?.globalRole === 'super_admin' || userWithRole?.globalRole === 'platform_admin'
    },
    update: () => false, // Security logs are immutable
    delete: () => false, // Security logs cannot be deleted
  },
  fields: [
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Context Created', value: 'CONTEXT_CREATED' },
        { label: 'Context Expired', value: 'CONTEXT_EXPIRED' },
        { label: 'Context Destroyed', value: 'CONTEXT_DESTROYED' },
        { label: 'Tool Executed', value: 'TOOL_EXECUTED' },
        { label: 'Unauthorized Tool Execution', value: 'UNAUTHORIZED_TOOL_EXECUTION' },
        { label: 'Security Violation', value: 'SECURITY_VIOLATION' },
        { label: 'Authentication Failed', value: 'AUTHENTICATION_FAILED' },
        { label: 'Authorization Failed', value: 'AUTHORIZATION_FAILED' },
      ],
    },
    {
      name: 'callId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'securityLevel',
      type: 'select',
      required: true,
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Customer', value: 'customer' },
        { label: 'Tenant Member', value: 'tenant_member' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      name: 'details',
      type: 'json',
      admin: {
        description: 'Additional security event details',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date(),
      index: true,
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address if available',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'User agent if available',
      },
    },
    {
      name: 'severity',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
        { label: 'Critical', value: 'critical' },
      ],
    },
  ],
  timestamps: true,
} 