/**
 * Cleanup Duplicate Channels
 * 
 * This endpoint cleans up duplicate channels that may have been created
 * during development, keeping only the most recent version of each channel.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning up duplicate channels')
    const payload = await getPayload({ config: configPromise })
    
    const body = await request.json()
    const { tenantId = 1, dryRun = true } = body

    // Find all channels for the tenant
    const allChannels = await payload.find({
      collection: 'channels',
      where: {
        tenantId: { equals: tenantId.toString() }
      },
      limit: 100,
      sort: '-createdAt'
    })

    console.log(`🔍 Found ${allChannels.docs.length} channels for tenant ${tenantId}`)

    // Group channels by name
    const channelGroups: { [key: string]: any[] } = {}
    for (const channel of allChannels.docs) {
      const name = channel.name
      if (!channelGroups[name]) {
        channelGroups[name] = []
      }
      channelGroups[name].push(channel)
    }

    const duplicates = []
    const toDelete = []

    // Find duplicates
    for (const [name, channels] of Object.entries(channelGroups)) {
      if (channels.length > 1) {
        console.log(`🔍 Found ${channels.length} channels named "${name}"`)
        duplicates.push({
          name,
          count: channels.length,
          channels: channels.map(c => ({
            id: c.id,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          }))
        })

        // Keep the most recent one, mark others for deletion
        const sortedChannels = channels.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        const toKeep = sortedChannels[0]
        const toRemove = sortedChannels.slice(1)

        console.log(`✅ Keeping channel "${name}" (ID: ${toKeep.id}, created: ${toKeep.createdAt})`)
        
        for (const channel of toRemove) {
          console.log(`🗑️ Marking for deletion: "${name}" (ID: ${channel.id}, created: ${channel.createdAt})`)
          toDelete.push(channel)
        }
      }
    }

    let deletedCount = 0
    const deletionResults = []

    if (!dryRun && toDelete.length > 0) {
      console.log(`🗑️ Deleting ${toDelete.length} duplicate channels...`)
      
      for (const channel of toDelete) {
        try {
          await payload.delete({
            collection: 'channels',
            id: channel.id
          })
          deletedCount++
          deletionResults.push({
            id: channel.id,
            name: channel.name,
            status: 'deleted'
          })
          console.log(`✅ Deleted duplicate channel: ${channel.name} (ID: ${channel.id})`)
        } catch (deleteError) {
          console.error(`❌ Failed to delete channel ${channel.id}:`, deleteError)
          deletionResults.push({
            id: channel.id,
            name: channel.name,
            status: 'error',
            error: deleteError instanceof Error ? deleteError.message : String(deleteError)
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        totalChannels: allChannels.docs.length,
        duplicateGroups: duplicates.length,
        channelsToDelete: toDelete.length,
        channelsDeleted: deletedCount
      },
      duplicates,
      deletionResults: dryRun ? [] : deletionResults,
      message: dryRun 
        ? `Found ${toDelete.length} duplicate channels. Set dryRun=false to delete them.`
        : `Deleted ${deletedCount} duplicate channels.`
    })

  } catch (error) {
    console.error('❌ Failed to cleanup duplicate channels:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET endpoint to analyze duplicates without deleting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || '1'
    
    // Call POST with dryRun=true
    const response = await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ tenantId, dryRun: true }),
      headers: { 'Content-Type': 'application/json' }
    }))

    return response

  } catch (error) {
    console.error('❌ Failed to analyze duplicate channels:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
