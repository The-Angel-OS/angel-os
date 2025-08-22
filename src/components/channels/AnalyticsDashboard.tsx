'use client'

import React from 'react'
import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utilities/ui'

interface Metric {
  label: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

export default function AnalyticsDashboard({ channelId }: { channelId: string }) {
  const metrics: Metric[] = [
    {
      label: 'Total Revenue',
      value: '$124,500',
      change: 15.3,
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      label: 'Active Users',
      value: '2,847',
      change: 8.1,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      label: 'Conversion Rate',
      value: '3.24%',
      change: -2.1,
      icon: TrendingUp,
      color: 'text-purple-400'
    },
    {
      label: 'Avg. Response Time',
      value: '1.2s',
      change: -12.5,
      icon: Activity,
      color: 'text-orange-400'
    }
  ]

  const recentActivity = [
    { time: '2 min ago', event: 'New order placed', value: '$89.99', positive: true },
    { time: '5 min ago', event: 'User registration', value: 'john.doe@email.com', positive: true },
    { time: '12 min ago', event: 'Payment failed', value: '$45.00', positive: false },
    { time: '15 min ago', event: 'Product viewed', value: 'Premium Package', positive: true },
    { time: '23 min ago', event: 'Cart abandoned', value: '$234.50', positive: false },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-gray-400" />
          <h1 className="text-xl font-bold text-white">#analytics</h1>
          <span className="text-sm text-gray-400">Real-time metrics and insights</span>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-900/30 space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">
                  {metric.label}
                </span>
                <metric.icon className={cn("w-4 h-4", metric.color)} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", metric.color)}>
                {metric.value}
              </div>
              <div className="flex items-center gap-1 mt-2">
                {metric.change > 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-400" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-400" />
                )}
                <span className={cn(
                  "text-sm",
                  metric.change > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-sm text-gray-500">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Activity Feed */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Real-time Activity
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1" />
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activity.positive ? "bg-green-400" : "bg-red-400"
                  )} />
                  <div>
                    <p className="text-white font-medium">{activity.event}</p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  activity.positive 
                    ? "border-green-500/50 text-green-400"
                    : "border-red-500/50 text-red-400"
                )}>
                  {activity.value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Placeholder */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">Showing last 30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
