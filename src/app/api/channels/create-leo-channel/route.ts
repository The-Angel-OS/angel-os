/**
 * Create LEO AI Private Channel
 * 
 * This endpoint creates the dedicated LEO AI private message channel
 * that users can use for direct conversations with LEO.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Creating LEO AI channel')
    const payload = await getPayload({ config: configPromise })
    
    const body = await request.json()
    const { tenantId = 1, userId = 1 } = body

    // Check if LEO AI channel already exists
    const existingChannels = await payload.find({
      collection: 'channels',
      where: {
        and: [
          { name: { equals: 'LEO AI' } },
          { tenantId: { equals: tenantId.toString() } }
        ]
      },
      limit: 1
    })

    if (existingChannels.docs.length > 0) {
      console.log('✅ LEO AI channel already exists:', existingChannels.docs[0]?.id)
      return NextResponse.json({
        success: true,
        channel: existingChannels.docs[0],
        message: 'LEO AI channel already exists'
      })
    }

    // Create LEO AI private channel
    const leoChannel = await payload.create({
      collection: 'channels',
      data: {
        name: 'LEO AI',
        description: 'Direct conversation with LEO AI Assistant',
        channelType: 'chat',
        reportType: 'general',
        tenantId: tenantId.toString(),
        guardianAngelId: '1', // LEO's user ID
        members: [
          {
            user: parseInt(userId.toString()),
            role: 'member',
            joinedAt: new Date().toISOString(),
            permissions: {
              canRead: true,
              canWrite: true,
              canInvite: false,
              canManage: false
            }
          },
          {
            user: 1, // LEO
            role: 'admin',
            joinedAt: new Date().toISOString(),
            permissions: {
              canRead: true,
              canWrite: true,
              canInvite: false,
              canManage: true
            }
          }
        ],
        isPrivate: true,
        isSystem: false,
        isVirtual: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    })

    console.log('✅ Created LEO AI channel:', leoChannel.id)

    return NextResponse.json({
      success: true,
      channel: leoChannel,
      message: 'LEO AI channel created successfully'
    })

  } catch (error) {
    console.error('❌ Failed to create LEO AI channel:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET endpoint to check if LEO AI channel exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || '1'
    
    const payload = await getPayload({ config: configPromise })
    
    const existingChannels = await payload.find({
      collection: 'channels',
      where: {
        and: [
          { name: { equals: 'LEO AI' } },
          { tenantId: { equals: tenantId } }
        ]
      },
      limit: 1
    })

    return NextResponse.json({
      success: true,
      exists: existingChannels.docs.length > 0,
      channel: existingChannels.docs[0] || null
    })

  } catch (error) {
    console.error('❌ Failed to check LEO AI channel:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
