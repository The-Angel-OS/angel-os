"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen, Upload, Grid, List } from 'lucide-react'

interface FilesChannelContentProps {
  spaceId: string
  channelId: string
  space: any
  currentUser: any
  liveKitEnabled: boolean
}

export function FilesChannelContent(props: FilesChannelContentProps) {
  return (
    <div className="flex-1 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {props.channelId} - Files Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            File management with drag-and-drop upload, version control, and collaborative editing.
          </p>
          <div className="flex gap-2">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <Button variant="outline">
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </Button>
            <Button variant="outline">
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
