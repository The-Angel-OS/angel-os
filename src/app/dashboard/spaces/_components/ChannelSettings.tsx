"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Settings,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Trash2,
  Edit3,
  Lock,
  Globe,
  Hash,
  MessageCircle
} from "lucide-react"
import type { Channel, SpaceMember } from "./ChannelChooser"

interface ChannelSettingsProps {
  channel: Channel
  spaceMembers: SpaceMember[]
  currentUser: { id: string; name: string; role: string }
  onUpdateChannel: (updates: Partial<Channel>) => void
  onAddMember: (memberId: string, role: string) => void
  onRemoveMember: (memberId: string) => void
  onUpdateMemberRole: (memberId: string, role: string) => void
  onDeleteChannel: () => void
  className?: string
}

export function ChannelSettings({
  channel,
  spaceMembers,
  currentUser,
  onUpdateChannel,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onDeleteChannel,
  className = ""
}: ChannelSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: channel.name,
    description: channel.description || "",
    isPrivate: channel.isPrivate || false
  })
  const [selectedNewMember, setSelectedNewMember] = useState("")

  // Get current channel members with their details
  const channelMembers = spaceMembers.filter(member => 
    channel.members.includes(member.id)
  )

  // Get available members to add (not already in channel)
  const availableMembers = spaceMembers.filter(member => 
    !channel.members.includes(member.id)
  )

  const canManageChannel = currentUser.role === 'admin' || currentUser.role === 'owner' || 
    !channel.isSystem

  const canDeleteChannel = (currentUser.role === 'admin' || currentUser.role === 'owner') && 
    !channel.isSystem && channel.name !== 'main'

  const handleSaveChanges = () => {
    onUpdateChannel({
      name: editForm.name,
      description: editForm.description,
      isPrivate: editForm.isPrivate
    })
    setIsEditing(false)
  }

  const handleAddMember = () => {
    if (selectedNewMember) {
      onAddMember(selectedNewMember, 'member')
      setSelectedNewMember("")
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "chat": return Hash
      case "pm": return MessageCircle
      default: return Hash
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "busy": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Channel Header */}
      <div className="flex items-center gap-3">
        {(() => {
          const Icon = getChannelIcon(channel.type)
          return <Icon className="h-6 w-6 text-muted-foreground" />
        })()}
        <div>
          <h2 className="text-xl font-semibold">{channel.name}</h2>
          <p className="text-sm text-muted-foreground">
            {channel.type === 'pm' ? 'Direct Message' : `${channel.type} channel`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {channel.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
          {channel.isSystem && <Badge variant="outline">System</Badge>}
        </div>
      </div>

      <Separator />

      {/* Channel Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Channel Information
          </CardTitle>
          <CardDescription>
            Basic information about this channel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input
                  id="channel-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={channel.isSystem || channel.type === 'pm'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel-description">Description</Label>
                <Textarea
                  id="channel-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this channel for?"
                  disabled={channel.type === 'pm'}
                />
              </div>

              {channel.type !== 'pm' && !channel.isSystem && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private-channel"
                    checked={editForm.isPrivate}
                    onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isPrivate: checked }))}
                  />
                  <Label htmlFor="private-channel">Private channel (invite only)</Label>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveChanges} size="sm">
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      name: channel.name,
                      description: channel.description || "",
                      isPrivate: channel.isPrivate || false
                    })
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm text-muted-foreground">{channel.name}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">
                  {channel.description || "No description provided"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Privacy</Label>
                <div className="flex items-center gap-2">
                  {channel.isPrivate ? (
                    <>
                      <Lock className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">Public</span>
                    </>
                  )}
                </div>
              </div>

              {canManageChannel && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="w-fit"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Channel
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Channel Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({channelMembers.length})
          </CardTitle>
          <CardDescription>
            People who have access to this channel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {channelMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                    
                    {canManageChannel && member.id !== currentUser.id && !channel.isSystem && (
                      <div className="flex gap-1">
                        <Select
                          value={member.role}
                          onValueChange={(role) => onUpdateMemberRole(member.id, role)}
                        >
                          <SelectTrigger className="w-20 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveMember(member.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Add Member */}
          {canManageChannel && availableMembers.length > 0 && !channel.isSystem && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-2">
                <Select value={selectedNewMember} onValueChange={setSelectedNewMember}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select member to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {member.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddMember} 
                  disabled={!selectedNewMember}
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {canDeleteChannel && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-4 w-4" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for this channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Channel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Channel</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{channel.name}"? This action cannot be undone.
                    All messages and files in this channel will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteChannel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Channel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
