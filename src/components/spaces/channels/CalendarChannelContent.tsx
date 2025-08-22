"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, Users } from 'lucide-react'

interface CalendarChannelContentProps {
  spaceId: string
  channelId: string
  space: any
  currentUser: any
  liveKitEnabled: boolean
}

export function CalendarChannelContent(props: CalendarChannelContentProps) {
  return (
    <div className="flex-1 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {props.channelId} - Calendar Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Event management, scheduling, and team coordination.
          </p>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Team Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
