import { NextRequest, NextResponse } from 'next/server'
import { InQuickerIntegration } from '@/services/InQuickerIntegration'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const inquickerService = InQuickerIntegration.getInstance()

    switch (action) {
      case 'check_availability':
        return await handleCheckAvailability(searchParams, inquickerService)

      case 'get_appointment':
        return await handleGetAppointment(searchParams, inquickerService)

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[InQuickerAPI] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const inquickerService = InQuickerIntegration.getInstance()

    switch (action) {
      case 'book_appointment':
        return await handleBookAppointment(body, inquickerService)

      case 'cancel_appointment':
        return await handleCancelAppointment(body, inquickerService)

      case 'add_to_waitlist':
        return await handleAddToWaitlist(body, inquickerService)

      case 'sync_updates':
        return await handleSyncUpdates(body, inquickerService)

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[InQuickerAPI] POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleCheckAvailability(searchParams: URLSearchParams, service: InQuickerIntegration) {
  const venueId = searchParams.get('venueId')
  const providerId = searchParams.get('providerId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const appointmentType = searchParams.get('appointmentType')

  if (!venueId || !providerId || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: venueId, providerId, startDate, endDate' },
      { status: 400 }
    )
  }

  try {
    const availability = await service.checkProviderAvailability(
      venueId,
      providerId,
      new Date(startDate),
      new Date(endDate),
      appointmentType || undefined
    )

    return NextResponse.json({
      success: true,
      data: {
        availability,
        venueId,
        providerId,
        dateRange: { startDate, endDate },
        appointmentType,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check availability' },
      { status: 500 }
    )
  }
}

async function handleGetAppointment(searchParams: URLSearchParams, service: InQuickerIntegration) {
  const venueId = searchParams.get('venueId')
  const appointmentId = searchParams.get('appointmentId')

  if (!venueId || !appointmentId) {
    return NextResponse.json(
      { error: 'Missing required parameters: venueId, appointmentId' },
      { status: 400 }
    )
  }

  try {
    const appointment = await service.getAppointmentDetails(venueId, appointmentId)

    return NextResponse.json({
      success: true,
      data: {
        appointment,
        venueId,
        appointmentId,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get appointment' },
      { status: 500 }
    )
  }
}

async function handleBookAppointment(body: any, service: InQuickerIntegration) {
  const { venueId, appointmentData } = body

  if (!venueId || !appointmentData) {
    return NextResponse.json(
      { error: 'Missing required parameters: venueId, appointmentData' },
      { status: 400 }
    )
  }

  // Validate appointment data
  const requiredFields = ['providerId', 'patientInfo', 'appointmentDateTime', 'appointmentType', 'duration']
  for (const field of requiredFields) {
    if (!appointmentData[field]) {
      return NextResponse.json(
        { error: `Missing required appointment field: ${field}` },
        { status: 400 }
      )
    }
  }

  // Validate patient info
  const requiredPatientFields = ['firstName', 'lastName', 'phone', 'email']
  for (const field of requiredPatientFields) {
    if (!appointmentData.patientInfo[field]) {
      return NextResponse.json(
        { error: `Missing required patient field: ${field}` },
        { status: 400 }
      )
    }
  }

  try {
    const result = await service.bookAppointment(venueId, appointmentData)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          appointmentId: result.appointmentId,
          confirmationNumber: result.confirmationNumber,
          message: 'Appointment booked successfully',
        },
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to book appointment' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to book appointment' },
      { status: 500 }
    )
  }
}

async function handleCancelAppointment(body: any, service: InQuickerIntegration) {
  const { venueId, appointmentId, reason } = body

  if (!venueId || !appointmentId) {
    return NextResponse.json(
      { error: 'Missing required parameters: venueId, appointmentId' },
      { status: 400 }
    )
  }

  try {
    const result = await service.cancelAppointment(venueId, appointmentId, reason)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Appointment canceled successfully',
          appointmentId,
        },
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to cancel appointment' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel appointment' },
      { status: 500 }
    )
  }
}

async function handleAddToWaitlist(body: any, service: InQuickerIntegration) {
  const { venueId, patientInfo, preferredDateTime, appointmentType } = body

  if (!venueId || !patientInfo || !preferredDateTime || !appointmentType) {
    return NextResponse.json(
      { error: 'Missing required parameters: venueId, patientInfo, preferredDateTime, appointmentType' },
      { status: 400 }
    )
  }

  // Validate patient info
  const requiredPatientFields = ['firstName', 'lastName', 'phone', 'email']
  for (const field of requiredPatientFields) {
    if (!patientInfo[field]) {
      return NextResponse.json(
        { error: `Missing required patient field: ${field}` },
        { status: 400 }
      )
    }
  }

  try {
    const result = await service.addToWaitlist(venueId, patientInfo, preferredDateTime, appointmentType)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          waitlistId: result.waitlistId,
          message: 'Successfully added to waitlist',
        },
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to add to waitlist' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add to waitlist' },
      { status: 500 }
    )
  }
}

async function handleSyncUpdates(body: any, service: InQuickerIntegration) {
  const { venueId } = body

  if (!venueId) {
    return NextResponse.json(
      { error: 'Missing required parameter: venueId' },
      { status: 400 }
    )
  }

  try {
    await service.syncRealTimeUpdates(venueId)

    return NextResponse.json({
      success: true,
      data: {
        message: 'Sync initiated successfully',
        venueId,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync updates' },
      { status: 500 }
    )
  }
}

// Webhook endpoint for InQuicker real-time updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { venueId, appointmentId, updateType, data } = body

    // Verify webhook signature/authentication here
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`[InQuickerAPI] Webhook received: ${updateType} for appointment ${appointmentId}`)

    // TODO: Process real-time updates from InQuicker
    // - Appointment confirmations
    // - Cancellations
    // - Reschedules
    // - Provider availability changes

    // Dispatch to Guardian Angels if needed
    // dispatchToGuardianAngels(venueId, updateType, data)

    return NextResponse.json({
      success: true,
      data: {
        message: 'Webhook processed successfully',
        updateType,
        appointmentId,
      },
    })
  } catch (error) {
    console.error('[InQuickerAPI] Webhook Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
