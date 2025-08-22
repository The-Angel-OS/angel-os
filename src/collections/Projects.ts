import type { CollectionConfig } from 'payload'
import { tenantField } from './shared/tenantField'
import { createTenantAccess } from './shared/tenantAccess'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'priority', 'startDate', 'endDate'],
    group: 'Productivity',
    description: 'Project management with tasks and team collaboration',
  },
  access: createTenantAccess(),
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Project name or title',
      },
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Detailed project description and objectives',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Planning', value: 'planning' },
        { label: 'Active', value: 'active' },
        { label: 'On Hold', value: 'on-hold' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'planning',
      admin: {
        description: 'Current project status',
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
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Project priority level',
      },
    },
    {
      name: 'dates',
      type: 'group',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          admin: {
            description: 'Project start date',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            description: 'Project end date',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'actualEndDate',
          type: 'date',
          admin: {
            description: 'Actual completion date',
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
      ],
    },
    {
      name: 'budget',
      type: 'group',
      fields: [
        {
          name: 'estimatedBudget',
          type: 'number',
          admin: {
            description: 'Estimated project budget',
            step: 0.01,
          },
        },
        {
          name: 'actualBudget',
          type: 'number',
          admin: {
            description: 'Actual project cost',
            step: 0.01,
          },
        },
        {
          name: 'currency',
          type: 'select',
          options: [
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
            { label: 'GBP', value: 'gbp' },
          ],
          defaultValue: 'usd',
        },
      ],
    },
    {
      name: 'team',
      type: 'group',
      fields: [
        {
          name: 'projectManager',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'Primary project manager',
          },
        },
        {
          name: 'teamMembers',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Project team members',
          },
        },
        {
          name: 'stakeholders',
          type: 'relationship',
          relationTo: 'contacts',
          hasMany: true,
          admin: {
            description: 'External stakeholders and clients',
          },
        },
      ],
    },
    {
      name: 'progress',
      type: 'group',
      fields: [
        {
          name: 'completionPercentage',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 0,
          admin: {
            description: 'Project completion percentage',
            step: 1,
          },
        },
        {
          name: 'tasksTotal',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of tasks',
            readOnly: true,
          },
        },
        {
          name: 'tasksCompleted',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of completed tasks',
            readOnly: true,
          },
        },
        {
          name: 'hoursEstimated',
          type: 'number',
          admin: {
            description: 'Total estimated hours',
            step: 0.25,
          },
        },
        {
          name: 'hoursActual',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Actual hours worked',
            step: 0.25,
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        description: 'Project tags and categories',
      },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Project documents and files',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      admin: {
        description: 'Associated workspace or space',
      },
    },
    tenantField,
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update progress metrics when tasks change
        if (operation === 'update') {
          try {
            const tasks = await req.payload.find({
              collection: 'tasks',
              where: {
                project: {
                  equals: doc.id,
                },
              },
            })

            const totalTasks = tasks.totalDocs
            const completedTasks = tasks.docs.filter(task => task.status === 'done').length
            const totalHours = tasks.docs.reduce((sum, task) => sum + ((task as any).timeTracking?.actualHours || 0), 0)

            // Update project with calculated metrics
            await req.payload.update({
              collection: 'projects',
              id: doc.id,
              data: {
                progress: {
                  ...doc.progress,
                  tasksTotal: totalTasks,
                  tasksCompleted: completedTasks,
                  hoursActual: totalHours,
                  completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                },
              },
            })
          } catch (error) {
            console.error('Error updating project metrics:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}
