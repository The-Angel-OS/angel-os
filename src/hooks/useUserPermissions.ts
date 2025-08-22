import { useMemo } from 'react'

export interface UserPermissions {
  canViewChannel: (channelId: string) => boolean
  canEditContent: (channelId: string) => boolean
  canInviteUsers: boolean
  canManageSpace: boolean
  canAccessAnalytics: boolean
  canCreateChannels: boolean
  canManageChannels: boolean
  canExportData: boolean
  role: 'owner' | 'admin' | 'member' | 'guest' | 'viewer'
}

interface User {
  id: string
  name?: string
  email?: string
  role?: string
  permissions?: string[]
}

// Mock permission system - replace with actual Payload CMS logic
export function useUserPermissions(user: User | null, spaceId?: string): UserPermissions {
  return useMemo(() => {
    if (!user) {
      // Anonymous user - very limited access
      return {
        canViewChannel: (channelId: string) => {
          // Only allow viewing of public channels
          const publicChannels = ['general', 'announcements']
          return publicChannels.includes(channelId)
        },
        canEditContent: () => false,
        canInviteUsers: false,
        canManageSpace: false,
        canAccessAnalytics: false,
        canCreateChannels: false,
        canManageChannels: false,
        canExportData: false,
        role: 'viewer'
      }
    }

    // Determine user role (mock logic - replace with Payload CMS membership query)
    const userRole = user.role || 'member'
    const isOwner = userRole === 'owner' || user.email === 'kenneth@angelostech.com'
    const isAdmin = userRole === 'admin' || isOwner
    const isMember = userRole === 'member' || isAdmin
    const isGuest = userRole === 'guest'

    return {
      canViewChannel: (channelId: string) => {
        // Owners and admins can view all channels
        if (isOwner || isAdmin) return true
        
        // Members can view most channels except admin-only ones
        if (isMember) {
          const adminOnlyChannels = ['business-analytics', 'customer-pipeline']
          return !adminOnlyChannels.includes(channelId)
        }
        
        // Guests can only view basic channels
        if (isGuest) {
          const guestChannels = ['general', 'announcements', 'project-notes']
          return guestChannels.includes(channelId)
        }
        
        return false
      },
      
      canEditContent: (channelId: string) => {
        if (isOwner || isAdmin) return true
        if (isMember) {
          // Members can edit most channels except read-only ones
          const readOnlyChannels = ['announcements']
          return !readOnlyChannels.includes(channelId)
        }
        return false
      },
      
      canInviteUsers: isAdmin,
      canManageSpace: isOwner,
      canAccessAnalytics: isAdmin,
      canCreateChannels: isAdmin,
      canManageChannels: isAdmin,
      canExportData: isAdmin,
      role: isOwner ? 'owner' : isAdmin ? 'admin' : isMember ? 'member' : isGuest ? 'guest' : 'viewer'
    }
  }, [user, spaceId])
}
