import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    
    const tenant = await payload.findByID({
      collection: 'tenants',
      id
    })

    return NextResponse.json({
      success: true,
      tenant
    })

  } catch (error) {
    console.error('Error fetching tenant:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch tenant',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const { id } = await params
    
    const tenant = await payload.update({
      collection: 'tenants',
      id,
      data: body
    })

    return NextResponse.json({
      success: true,
      tenant
    })

  } catch (error) {
    console.error('Error updating tenant:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update tenant',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    
    await payload.delete({
      collection: 'tenants',
      id
    })

    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting tenant:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete tenant',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
