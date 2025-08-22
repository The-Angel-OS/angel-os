import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    
    const { messageId, feedback, userId } = body
    
    if (!messageId || !feedback) {
      return NextResponse.json({ error: 'messageId and feedback are required' }, { status: 400 })
    }

    // Find the message to add feedback to
    const message = await payload.findByID({
      collection: 'messages',
      id: messageId
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Get existing reactions or initialize
    const currentReactions = (message.reactions as any) || {}
    
    // Update reactions based on feedback
    if (feedback === 'like') {
      currentReactions.likes = currentReactions.likes || []
      const userIndex = currentReactions.likes.indexOf(userId)
      
      if (userIndex === -1) {
        // Add like
        currentReactions.likes.push(userId)
        // Remove from dislikes if present
        if (currentReactions.dislikes) {
          currentReactions.dislikes = currentReactions.dislikes.filter((id: string) => id !== userId)
        }
      } else {
        // Remove like
        currentReactions.likes.splice(userIndex, 1)
      }
    } else if (feedback === 'dislike') {
      currentReactions.dislikes = currentReactions.dislikes || []
      const userIndex = currentReactions.dislikes.indexOf(userId)
      
      if (userIndex === -1) {
        // Add dislike
        currentReactions.dislikes.push(userId)
        // Remove from likes if present
        if (currentReactions.likes) {
          currentReactions.likes = currentReactions.likes.filter((id: string) => id !== userId)
        }
      } else {
        // Remove dislike
        currentReactions.dislikes.splice(userIndex, 1)
      }
    }

    // Update the message with new reactions
    await payload.update({
      collection: 'messages',
      id: messageId,
      data: {
        reactions: currentReactions
      }
    })

    return NextResponse.json({
      success: true,
      reactions: currentReactions,
      messageId
    })

  } catch (error) {
    console.error('Message feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}
