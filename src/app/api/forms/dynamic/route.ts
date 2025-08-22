import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const formData = await request.json()

    const {
      formId,
      formType,
      conversationId,
      guardianAngelId,
      data,
      timestamp
    } = formData

    // Create form submission record
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: formId, // Changed from formId to form
        submissionData: data && typeof data === 'object' ?
          Object.entries(data).map(([field, value]) => ({
            field,
            value: String(value)
          })) : null
      }
    })

    // Handle different form types
    switch (formType) {
      case 'quote':
        await handleQuoteSubmission(payload, submission, data)
        break
      case 'booking':
        await handleBookingSubmission(payload, submission, data)
        break
      case 'payment':
        await handlePaymentSubmission(payload, submission, data)
        break
      case 'signature':
        await handleSignatureSubmission(payload, submission, data)
        break
      default:
        console.log(`Unknown form type: ${formType}`)
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Form submitted successfully'
    })

  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { error: 'Form submission failed' },
      { status: 500 }
    )
  }
}

async function handleQuoteSubmission(payload: any, submission: any, data: any) {
  // Create quote request
  await payload.create({
    collection: 'quote-requests',
    data: {
      submissionId: submission.id,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      serviceAddress: data.address,
      serviceDescription: data.description,
      status: 'pending'
    }
  })

  // TODO: Trigger quote calculation logic
  // TODO: Schedule follow-up with customer
}

async function handleBookingSubmission(payload: any, submission: any, data: any) {
  // Create appointment
  await payload.create({
    collection: 'appointments',
    data: {
      submissionId: submission.id,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      serviceAddress: data.address,
      status: 'pending'
    }
  })

  // TODO: Check availability and confirm appointment
  // TODO: Send confirmation to customer
}

async function handlePaymentSubmission(payload: any, submission: any, data: any) {
  // Process payment
  // TODO: Integrate with Stripe payment processing
  console.log('Processing payment:', data)
}

async function handleSignatureSubmission(payload: any, submission: any, data: any) {
  // Store signature
  // TODO: Create signed-documents collection or use existing document storage
  console.log('Processing signature:', data)
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const url = new URL(request.url)
    const formId = url.searchParams.get('formId')
    const formType = url.searchParams.get('formType')

    let where: any = {}
    if (formId) where.form = formId
    // Note: formType is not part of FormSubmission schema, would need custom filtering

    const submissions = await payload.find({
      collection: 'form-submissions',
      where,
      sort: '-createdAt'
    })

    return NextResponse.json({
      success: true,
      submissions: submissions.docs
    })

  } catch (error) {
    console.error('Error fetching form submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    )
  }
}
