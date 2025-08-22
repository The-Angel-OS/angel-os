"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, Filter } from 'lucide-react'

interface CRMChannelContentProps {
  spaceId: string
  channelId: string
  space: any
  currentUser: any
  liveKitEnabled: boolean
}

export function CRMChannelContent(props: CRMChannelContentProps) {
  return (
    <div className="flex-1 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {props.channelId} - CRM Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Customer relationship management with lead tracking and pipeline management.
          </p>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Pipeline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
