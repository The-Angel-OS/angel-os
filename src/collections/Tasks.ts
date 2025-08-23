import type { CollectionConfig } from 'payload'
import { tenantField } from './shared/tenantField'
import { createTenantAccess } from './shared/tenantAccess'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  labels: {
    singular: 'Task',
    plural: 'Tasks',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'priority', 'assignee', 'dueDate', 'project'],
    group: 'Productivity',
    description: 'Task management with project integration',
  },
  access: createTenantAccess(),
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Task title or summary',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed task description and requirements',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'To Do', value: 'todo' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Review', value: 'review' },
        { label: 'Blocked', value: 'blocked' },
        { label: 'Done', value: 'done' },
      ],
      defaultValue: 'todo',
      admin: {
        description: 'Current task status',
      },
    },
    {
      name: 'priority',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Task priority level',
      },
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      admin: {
        description: 'Associated project',
      },
    },
    {
      name: 'assignee',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Task assignee',
      },
    },
    {
      name: 'reporter',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Person who created/reported this task',
      },
      hooks: {
        beforeValidate: [
          ({ req, value }) => {
            // Auto-assign reporter as current user if not provided
            if (!value && req.user) {
              return req.user.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'dates',
      type: 'group',
      fields: [
        {
          name: 'dueDate',
          type: 'date',
          admin: {
            description: 'Task due date',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'startDate',
          type: 'date',
          admin: {
            description: 'Task start date',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'completedDate',
          type: 'date',
          admin: {
            description: 'Date task was completed',
            date: {
              pickerAppearance: 'dayAndTime',
            },
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'timeTracking',
      type: 'group',
      fields: [
        {
          name: 'estimatedHours',
          type: 'number',
          admin: {
            description: 'Estimated hours to complete',
            step: 0.25,
          },
        },
        {
          name: 'actualHours',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Actual hours worked',
            step: 0.25,
          },
        },
        {
          name: 'timeEntries',
          type: 'array',
          admin: {
            description: 'Time tracking entries',
          },
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                },
              },
            },
            {
              name: 'hours',
              type: 'number',
              required: true,
              admin: {
                step: 0.25,
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'What was worked on',
              },
            },
            {
              name: 'user',
              type: 'relationship',
              relationTo: 'users',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'dependencies',
      type: 'group',
      fields: [
        {
          name: 'blockedBy',
          type: 'relationship',
          relationTo: 'tasks',
          hasMany: true,
          admin: {
            description: 'Tasks that must be completed before this one',
          },
        },
        {
          name: 'blocks',
          type: 'relationship',
          relationTo: 'tasks',
          hasMany: true,
          admin: {
            description: 'Tasks that are waiting on this one',
          },
        },
        {
          name: 'relatedTasks',
          type: 'relationship',
          relationTo: 'tasks',
          hasMany: true,
          admin: {
            description: 'Related or similar tasks',
          },
        },
      ],
    },
    {
      name: 'labels',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Bug', value: 'bug' },
        { label: 'Feature', value: 'feature' },
        { label: 'Enhancement', value: 'enhancement' },
        { label: 'Documentation', value: 'documentation' },
        { label: 'Testing', value: 'testing' },
        { label: 'Research', value: 'research' },
        { label: 'Design', value: 'design' },
        { label: 'Backend', value: 'backend' },
        { label: 'Frontend', value: 'frontend' },
      ],
      admin: {
        description: 'Task labels and categories',
      },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Task-related files and documents',
      },
    },
    {
      name: 'comments',
      type: 'array',
      admin: {
        description: 'Task comments and updates',
      },
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'isInternal',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Internal comment (not visible to clients)',
          },
        },
      ],
    },
    tenantField,
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Auto-set completion date when status changes to 'done'
        if (data.status === 'done' && !data.dates?.completedDate) {
          data.dates = {
            ...data.dates,
            completedDate: new Date().toISOString(),
          }
        }
        
        // Clear completion date if status changes from 'done'
        if (data.status !== 'done' && data.dates?.completedDate) {
          data.dates = {
            ...data.dates,
            completedDate: null,
          }
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update project metrics when task changes
        if (doc.project && (operation === 'create' || operation === 'update')) {
          try {
            // Extract project ID - handle both populated object and direct ID
            const projectId = typeof doc.project === 'object' && doc.project !== null 
              ? doc.project.id 
              : doc.project
            
            if (projectId) {
              // Trigger project hook to recalculate metrics
              await req.payload.update({
                collection: 'projects',
                id: projectId,
                data: {}, // Empty update to trigger hooks
              })
            }
          } catch (error) {
            console.error('Error updating project metrics from task change:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}
