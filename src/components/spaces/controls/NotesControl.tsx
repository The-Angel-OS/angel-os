'use client'

import React, { useState } from 'react'
import type { Space, User as PayloadUser } from '@/payload-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FileText, Edit, Save, Users, Clock } from 'lucide-react'

interface Channel {
  id: string
  name: string
  type: string
  description?: string
}

interface NotesControlProps {
  space: Space | null
  channel: Channel
  currentUser: PayloadUser
  noteContent?: any
}

export function NotesControl({
  space,
  channel,
  currentUser,
  noteContent
}: NotesControlProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('Project Planning Notes')
  const [content, setContent] = useState(`# Project Overview

## Goals
- Implement Shadcn UI Kit foundation
- Create dynamic widget ecosystem
- Build switchboard pattern for controls

## Progress
- [x] Remove Payload CMS wrapper from /spaces
- [x] Create dedicated Spaces layout
- [ ] Implement widget grid system
- [ ] Add LEO AI integration

## Notes
This is a collaborative notes space where team members can work together on documentation, planning, and knowledge sharing.

## Next Steps
1. Complete foundation implementation
2. Add real-time collaboration
3. Integrate with Lexical editor`)

  const [collaborators] = useState([
    { id: '1', name: 'Kenneth Consort', avatar: 'KC', status: 'online' },
    { id: '2', name: 'Leo AI', avatar: 'LA', status: 'active' },
    { id: '3', name: 'Team Member', avatar: 'TM', status: 'offline' }
  ])

  const handleSave = () => {
    // In real implementation, save to Payload CMS
    console.log('Saving notes:', { title, content })
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Notes Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{channel.name}</h1>
              {channel.description && (
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Collaborators */}
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex -space-x-1">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center border-2 border-background"
                    title={collaborator.name}
                  >
                    {collaborator.avatar}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Edit/Save Button */}
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Notes Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {isEditing ? (
            <div className="space-y-4">
              {/* Title Editor */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold"
                  placeholder="Note title..."
                />
              </div>
              
              {/* Content Editor */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Start writing your notes..."
                />
              </div>
              
              {/* Editor Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last saved: Just now</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title Display */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Last updated: 5 minutes ago</span>
                  <span>•</span>
                  <span>By {currentUser.email}</span>
                  <Badge variant="outline">Collaborative</Badge>
                </div>
              </div>
              
              {/* Content Display */}
              <Card>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans">{content}</pre>
                  </div>
                </CardContent>
              </Card>
              
              {/* Collaboration Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {collaborator.avatar}
                          </div>
                          <span className="text-sm">{collaborator.name}</span>
                        </div>
                        <Badge variant={collaborator.status === 'online' ? 'default' : 'secondary'}>
                          {collaborator.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

















