import React from 'react'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import AngelOSCommandCenter from '@/components/AngelOSCommandCenter'
import ChannelService from '@/services/ChannelService'
import { logInfo } from '@/services/SystemMonitorService'

// Channel component registry - lazy loaded for performance
const channelComponents = {
  ChatContainer: dynamic(() => import('@/components/channels/ChatContainer')),
  OrdersManager: dynamic(() => import('@/components/channels/OrdersManager')),
  AnalyticsDashboard: dynamic(() => import('@/components/channels/AnalyticsDashboard')),
  ProductCatalog: dynamic(() => import('@/components/channels/ProductCatalog')),
  CustomerContainer: dynamic(() => import('@/components/channels/CustomerContainer')),
  SystemContainer: dynamic(() => import('@/components/channels/SystemContainer')),
}

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params
  
  // Try to get channel by slug from database
  const channel = await ChannelService.getChannelBySlug(channelId)
  
  if (!channel) {
    notFound()
  }

  // Log channel navigation (server-side)
  logInfo(`Navigated to #${channel.name} channel (${channelId})`, 'Navigation', { 
    channelId: channel.id, 
    channelSlug: channelId,
    type: channel.type 
  })

  const Component = channelComponents[channel.component as keyof typeof channelComponents]

  return (
    <AngelOSCommandCenter variant="tactical" showChannelSidebar={true}>
      {Component ? (
        <Component channelId={channel.id} />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>Channel component not found: {channel.component}</p>
        </div>
      )}
    </AngelOSCommandCenter>
  )
}
