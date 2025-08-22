import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { id } = await params
    const result = await payload.update({
      collection: 'media',
      id,
      data: body
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Delete the media file - this should trigger any afterDelete hooks
    // that handle remote storage cleanup
    const { id } = await params
    await payload.delete({
      collection: 'media',
      id
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media file' },
      { status: 500 }
    )
  }
}

