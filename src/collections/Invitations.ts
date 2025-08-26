import type { CollectionConfig } from 'payload'

const Invitations: CollectionConfig = {
  slug: 'invitations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'type', 'status', 'createdAt', 'expiresAt'],
    group: 'User Management',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.globalRole === 'super_admin') return true
      
      // Users can read invitations sent to their email
      if (!user?.email || !user?.id) return false
      
      return {
        or: [
          { email: { equals: user.email } },
          { invitedBy: { equals: user.id } }
        ]
      } as any // Type assertion to bypass complex Where type checking
    },
    create: ({ req: { user } }) => {
      // Only authenticated users can create invitations
      return !!user
    },
    update: ({ req: { user } }) => {
      if (user?.globalRole === 'super_admin') return true
      
      // Users can only update invitations they sent
      return {
        invitedBy: { equals: user?.id }
      }
    },
    delete: ({ req: { user } }) => {
      if (user?.globalRole === 'super_admin') return true
      
      // Users can only delete invitations they sent
      return {
        invitedBy: { equals: user?.id }
      }
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Email address of the person being invited',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Account Creation',
          value: 'account_creation',
        },
        {
          label: 'Space Invitation',
          value: 'space_invitation',
        },
      ],
      admin: {
        description: 'Type of invitation - account creation for new users, space invitation for existing users',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Expired',
          value: 'expired',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique token for the invitation link',
        readOnly: true,
      },
    },
    {
      name: 'spaceId',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Space the user is being invited to',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [
        {
          label: 'Member',
          value: 'member',
        },
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Owner',
          value: 'owner',
        },
      ],
      admin: {
        description: 'Role the user will have in the space',
      },
    },
    {
      name: 'invitedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who sent the invitation',
      },
    },
    {
      name: 'userId',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User ID if the invited person already has an account',
        condition: (data) => data.type === 'space_invitation',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      admin: {
        description: 'When the invitation expires',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      admin: {
        description: 'When the invitation was accepted',
        condition: (data) => data.status === 'accepted',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'message',
      type: 'textarea',
      admin: {
        description: 'Optional personal message to include with the invitation',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Generate token for new invitations
        if (operation === 'create' && !data.token) {
          data.token = Math.random().toString(36).substring(2) + 
                      Math.random().toString(36).substring(2) +
                      Date.now().toString(36)
        }
        
        // Set expiration date if not provided (7 days from now)
        if (operation === 'create' && !data.expiresAt) {
          data.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        
        return data
      },
    ],
  },
}

export default Invitations

