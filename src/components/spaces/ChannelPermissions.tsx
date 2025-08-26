"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UniversalModal } from '@/components/ui/universal-modal'
import { 
  Users, 
  Shield, 
  UserPlus, 
  UserMinus, 
  Settings,
  Crown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface ChannelPermission {
  read: 'public' | 'members' | 'admin'
  write: 'members' | 'admin'
  admin: 'creator' | 'admin'
}

interface ChannelMember {
  id: string | number
  user: {
    id: string | number
    firstName: string
    lastName: string
    email: string
  }
  role: 'admin' | 'member'
  joinedAt: string
}

interface ChannelPermissionsProps {
  channelId: string | number
  isSystem: boolean
  currentUserId: string | number
  onPermissionsChange?: (permissions: ChannelPermission) => void
}

export function ChannelPermissions({ 
  channelId, 
  isSystem, 
  currentUserId,
  onPermissionsChange 
}: ChannelPermissionsProps) {
  const [permissions, setPermissions] = useState<ChannelPermission>({
    read: 'members',
    write: 'members',
    admin: 'creator'
  })
  const [members, setMembers] = useState<ChannelMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)

  useEffect(() => {
    loadPermissions()
  }, [channelId])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/channels/${channelId}/permissions`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || permissions)
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Failed to load permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePermissions = async (newPermissions: Partial<ChannelPermission>) => {
    try {
      const updatedPermissions = { ...permissions, ...newPermissions }
      
      const response = await fetch(`/api/channels/${channelId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: updatedPermissions,
          members
        })
      })

      if (response.ok) {
        setPermissions(updatedPermissions)
        onPermissionsChange?.(updatedPermissions)
      }
    } catch (error) {
      console.error('Failed to update permissions:', error)
    }
  }

  const addMember = async (data: any) => {
    try {
      const newMember = {
        user: data.userId,
        role: data.role || 'member',
        joinedAt: new Date().toISOString()
      }

      const updatedMembers = [...members, newMember as ChannelMember]
      
      const response = await fetch(`/api/channels/${channelId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions,
          members: updatedMembers
        })
      })

      if (response.ok) {
        setMembers(updatedMembers)
        setShowAddMember(false)
      }
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const addMemberFields = useMemo(() => [
    {
      name: 'userId',
      label: 'User',
      type: 'text' as const,
      required: true,
      placeholder: 'Enter user ID or email'
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Admin', value: 'admin' }
      ]
    }
  ], [])

  const removeMember = async (memberId: string | number) => {
    if (confirm('Remove this member from the channel?')) {
      try {
        const updatedMembers = members.filter(m => m.id !== memberId)
        
        const response = await fetch(`/api/channels/${channelId}/permissions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permissions,
            members: updatedMembers
          })
        })

        if (response.ok) {
          setMembers(updatedMembers)
        }
      } catch (error) {
        console.error('Failed to remove member:', error)
      }
    }
  }

  const updateMemberRole = async (memberId: string | number, newRole: 'admin' | 'member') => {
    try {
      const updatedMembers = members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      )
      
      const response = await fetch(`/api/channels/${channelId}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions,
          members: updatedMembers
        })
      })

      if (response.ok) {
        setMembers(updatedMembers)
      }
    } catch (error) {
      console.error('Failed to update member role:', error)
    }
  }

  const getPermissionIcon = (level: string) => {
    switch (level) {
      case 'public': return <Eye className="w-4 h-4" />
      case 'members': return <Users className="w-4 h-4" />
      case 'admin': return <Shield className="w-4 h-4" />
      case 'creator': return <Crown className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const getPermissionColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
      case 'members': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
      case 'admin': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
      case 'creator': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Permissions Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Channel Permissions
            {isSystem && (
              <Badge variant="secondary" className="ml-2">
                System Channel
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSystem ? (
            <p className="text-sm text-muted-foreground">
              System channels have fixed permissions that cannot be modified.
            </p>
          ) : (
            <>
              {/* Read Permission */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Who can view this channel?</span>
                </div>
                <div className="flex gap-2">
                  {['public', 'members', 'admin'].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={permissions.read === level ? 'default' : 'outline'}
                      onClick={() => updatePermissions({ read: level as any })}
                      className="capitalize"
                    >
                      {getPermissionIcon(level)}
                      <span className="ml-1">{level}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Write Permission */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <span className="font-medium">Who can send messages?</span>
                </div>
                <div className="flex gap-2">
                  {['members', 'admin'].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={permissions.write === level ? 'default' : 'outline'}
                      onClick={() => updatePermissions({ write: level as any })}
                      className="capitalize"
                    >
                      {getPermissionIcon(level)}
                      <span className="ml-1">{level}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Admin Permission */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">Who can manage this channel?</span>
                </div>
                <div className="flex gap-2">
                  {['creator', 'admin'].map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={permissions.admin === level ? 'default' : 'outline'}
                      onClick={() => updatePermissions({ admin: level as any })}
                      className="capitalize"
                    >
                      {getPermissionIcon(level)}
                      <span className="ml-1">{level}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Channel Members ({members.length})
            </CardTitle>
            {!isSystem && (
              <Button
                size="sm"
                onClick={() => setShowAddMember(true)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No members added to this channel yet.
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.firstName} {member.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={getPermissionColor(member.role)}
                    >
                      {getPermissionIcon(member.role)}
                      <span className="ml-1 capitalize">{member.role}</span>
                    </Badge>
                    {!isSystem && member.user.id !== currentUserId && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateMemberRole(
                            member.id, 
                            member.role === 'admin' ? 'member' : 'admin'
                          )}
                        >
                          {member.role === 'admin' ? <Users className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <UniversalModal
        title="Add Channel Member"
        description="Add a user to this channel"
        fields={addMemberFields}
        onSubmit={addMember}
        open={showAddMember}
        onOpenChange={setShowAddMember}
        submitLabel="Add Member"
        size="md"
      />
    </div>
  )
}

export default ChannelPermissions

