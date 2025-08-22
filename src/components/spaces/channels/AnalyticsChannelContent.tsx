"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download, Filter, Calendar } from 'lucide-react'

interface AnalyticsChannelContentProps {
  spaceId: string
  channelId: string
  space: any
  currentUser: any
  liveKitEnabled: boolean
}

export function AnalyticsChannelContent(props: AnalyticsChannelContentProps) {
  return (
    <div className="flex-1 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {props.channelId} - Analytics Channel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Business intelligence reporting with data visualization and export capabilities.
          </p>
          <div className="flex gap-2">
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Create Report
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Data
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
