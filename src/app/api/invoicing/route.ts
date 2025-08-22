import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

interface InvoiceData {
  recipientName: string
  recipientEmail: string
  amount: number
  currency: string
  description: string
  dueDate?: string
  businessName?: string
  businessAddress?: string
  itemizedList?: InvoiceItem[]
  notes?: string
  paymentMethods?: string[]
  tenantId?: string
}

interface InvoiceRequest {
  action: 'create' | 'send' | 'pay' | 'status' | 'list'
  invoiceData?: InvoiceData
  invoiceId?: string
  paymentData?: {
    method: string
    amount: number
    cardDetails?: Record<string, unknown>
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body: InvoiceRequest = await request.json()

    switch (body.action) {
      case 'create':
        return await createInvoice(payload, body.invoiceData!)

      case 'send':
        return await sendInvoice(payload, body.invoiceId!)

      case 'pay':
        return await processPayment(payload, body.invoiceId!, body.paymentData!)

      case 'status':
        return await getInvoiceStatus(payload, body.invoiceId!)

      case 'list':
        return await listInvoices(payload, body.invoiceData?.tenantId)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Invoicing API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function createInvoice(payload: any, invoiceData: InvoiceData) {
  try {
    console.log(`[Invoicing] Creating invoice for ${invoiceData.recipientName}`)

    // Calculate total if itemized
    let totalAmount = invoiceData.amount
    if (invoiceData.itemizedList && invoiceData.itemizedList.length > 0) {
      totalAmount = invoiceData.itemizedList.reduce((sum, item) => sum + item.amount, 0)
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create invoice record
    const invoice = await payload.create({
      collection: 'invoices',
      data: {
        invoiceNumber,
        recipientName: invoiceData.recipientName,
        recipientEmail: invoiceData.recipientEmail,
        amount: totalAmount,
        currency: invoiceData.currency || 'USD',
        description: invoiceData.description,
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        businessName: invoiceData.businessName || 'Your Business',
        businessAddress: invoiceData.businessAddress,
        itemizedList: invoiceData.itemizedList || [],
        notes: invoiceData.notes,
        paymentMethods: invoiceData.paymentMethods || ['card', 'bank_transfer', 'paypal'],
        status: 'draft',
        tenant: invoiceData.tenantId,
        createdAt: new Date().toISOString(),
        paymentLink: `${process.env.NEXT_PUBLIC_SITE_URL}/pay/${invoiceNumber}`,
        metadata: {
          created_via: 'api',
          invoice_type: invoiceData.itemizedList ? 'itemized' : 'simple'
        }
      }
    })

    const paymentLink = `${process.env.NEXT_PUBLIC_SITE_URL}/pay/${invoiceNumber}`
    const invoiceViewLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invoice/${invoiceNumber}`

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber,
        amount: totalAmount,
        currency: invoiceData.currency || 'USD',
        recipient: invoiceData.recipientName,
        status: 'draft',
        paymentLink,
        invoiceViewLink,
        dueDate: invoiceData.dueDate
      },
      message: 'Invoice created successfully - ready to send!'
    })

  } catch (error) {
    console.error('Invoice creation failed:', error)
    return NextResponse.json({
      error: 'Invoice creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function sendInvoice(payload: any, invoiceId: string) {
  try {
    const invoice = await payload.findByID({
      collection: 'invoices',
      id: invoiceId
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await payload.update({
      collection: 'invoices',
      id: invoiceId,
      data: {
        status: 'sent',
        sentAt: new Date().toISOString()
      }
    })

    const emailSent = await sendInvoiceEmail(invoice)

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${invoice.recipientEmail}`,
      emailSent
    })

  } catch (error) {
    console.error('Invoice sending failed:', error)
    return NextResponse.json({
      error: 'Invoice sending failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function processPayment(payload: any, invoiceId: string, paymentData: any) {
  try {
    const invoice = await payload.findByID({
      collection: 'invoices',
      id: invoiceId
    })

    if (!invoice || invoice.status === 'paid') {
      return NextResponse.json({
        error: invoice ? 'Invoice already paid' : 'Invoice not found'
      }, { status: invoice ? 400 : 404 })
    }

    const paymentResult = await processSecurePayment(invoice, paymentData)

    if (paymentResult.success) {
      await payload.update({
        collection: 'invoices',
        id: invoiceId,
        data: {
          status: 'paid',
          paidAt: new Date().toISOString(),
          paymentMethod: paymentData.method,
          paymentId: paymentResult.paymentId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: paymentResult.transactionId
      })
    } else {
      return NextResponse.json({
        error: 'Payment failed',
        details: (paymentResult as any).error || 'Payment processing failed'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Payment processing failed:', error)
    return NextResponse.json({
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getInvoiceStatus(payload: any, invoiceId: string) {
  try {
    const invoice = await payload.findByID({
      collection: 'invoices',
      id: invoiceId
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        amount: invoice.amount,
        recipient: invoice.recipientName,
        createdAt: invoice.createdAt,
        paidAt: invoice.paidAt,
        overdue: invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid'
      }
    })

  } catch (error) {
    console.error('Invoice status retrieval failed:', error)
    return NextResponse.json({
      error: 'Failed to get invoice status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function listInvoices(payload: any, tenantId?: string) {
  try {
    const where = tenantId ? { tenant: { equals: tenantId } } : {}

    const invoices = await payload.find({
      collection: 'invoices',
      where,
      sort: '-createdAt',
      limit: 50
    })

    return NextResponse.json({
      success: true,
      invoices: invoices.docs.map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        recipient: invoice.recipientName,
        amount: invoice.amount,
        status: invoice.status,
        createdAt: invoice.createdAt,
        overdue: invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid'
      })),
      total: invoices.totalDocs
    })

  } catch (error) {
    console.error('Invoice listing failed:', error)
    return NextResponse.json({
      error: 'Failed to list invoices',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function sendInvoiceEmail(invoice: any): Promise<boolean> {
  console.log(`Sending invoice email to ${invoice.recipientEmail}`)
  // TODO: Integrate with email service
  return true
}

async function processSecurePayment(invoice: any, paymentData: any) {
  console.log(`Processing payment for invoice ${invoice.invoiceNumber}`)
  // TODO: Integrate with payment processor
  return {
    success: true,
    paymentId: `pay_${Date.now()}`,
    transactionId: `txn_${Date.now()}`
  }
}
