import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const ChannelManagement: CollectionConfig = {
  slug: 'channel-management',
  labels: {
    singular: 'Channel',
    plural: 'Channel Management',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Communication',
    description: 'Virtual channel configuration and routing rules',
    defaultColumns: ['name', 'space', 'channelType', 'status'],
  },
  access: {
    create: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    read: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      // For now, allow platform admins to read all channels
      // TODO: Implement proper tenant-based filtering using TenantMemberships
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    update: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
    delete: ({ req }) => {
      if ((req.user as any)?.globalRole === 'super_admin') return true
      if ((req.user as any)?.globalRole === 'platform_admin') return true
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
    },
    {
      name: 'channelType',
      type: 'select',
      required: true,
      options: [
        { label: 'Customer Support', value: 'customer_support' },
        { label: 'Sales Inquiries', value: 'sales_inquiries' },
        { label: 'Technical Support', value: 'technical_support' },
        { label: 'Billing Questions', value: 'billing' },
        { label: 'General Chat', value: 'general' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'assignedAgents',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'autoAssignment',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'n8nWorkflowId',
      type: 'text',
    },
    {
      name: 'vapiEnabled',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'webChatEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'metadata',
      type: 'json',
    },
    // Channel Organization
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Business Operations', value: 'business' },
        { label: 'Customer Service', value: 'customer_service' },
        { label: 'Personal Collections', value: 'collections' },
        { label: 'Logs & Tracking', value: 'logs' },
        { label: 'System & Technical', value: 'system' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'business',
      admin: {
        description: 'Category for organizing channels in the UI',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order for displaying channels (lower numbers first)',
      },
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Emoji or icon identifier for the channel',
      },
    },
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Blue', value: 'blue' },
        { label: 'Green', value: 'green' },
        { label: 'Orange', value: 'orange' },
        { label: 'Purple', value: 'purple' },
        { label: 'Red', value: 'red' },
        { label: 'Yellow', value: 'yellow' },
        { label: 'Gray', value: 'gray' },
      ],
      defaultValue: 'blue',
      admin: {
        description: 'Color theme for the channel',
      },
    },
    // Add slug field for friendly URLs
    ...slugField(),
  ],
  timestamps: true,
}
