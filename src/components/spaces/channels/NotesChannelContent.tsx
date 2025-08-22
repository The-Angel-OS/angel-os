"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Edit, Save, Users } from 'lucide-react'

interface NotesChannelContentProps {
  spaceId: string
  channelId: string
  space: any
  currentUser: any
  liveKitEnabled: boolean
}

export function NotesChannelContent({ 
  spaceId, 
  channelId, 
  space, 
  currentUser, 
  liveKitEnabled 
}: NotesChannelContentProps) {
  return (
    <div className="flex-1 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {channelId} - Notes Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Collaborative document editing with real-time sync and version history.
          </p>
          <div className="flex gap-2">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Start Editing
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Collaborators
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
