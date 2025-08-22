import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import crypto from 'crypto'

interface DocumentSigner {
  name: string
  email: string
  role: 'tenant' | 'landlord' | 'client' | 'contractor' | 'custom'
  signatureRequired: boolean
}

interface DocumentData {
  title: string
  type: 'rental_agreement' | 'service_contract' | 'nda' | 'custom'
  content: string
  templateVariables?: Record<string, string>
  signers: DocumentSigner[]
  expirationDate?: string
  notificationReminders?: boolean
  tenantId?: string
}

interface SignerData {
  signerEmail: string
  signature: string
  signatureType: 'drawn' | 'typed' | 'uploaded'
  ipAddress: string
  timestamp: string
}

interface SigningRequest {
  action: 'create' | 'sign' | 'status' | 'list' | 'templates'
  documentData?: DocumentData
  documentId?: string
  signerData?: SignerData
  templateType?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body: SigningRequest = await request.json()

    switch (body.action) {
      case 'create':
        return await createDocument(payload, body.documentData!)
      case 'sign':
        return await signDocument(payload, body.documentId!, body.signerData!)
      case 'status':
        return await getDocumentStatus(payload, body.documentId!)
      case 'list':
        return await listDocuments(payload, body.documentData?.tenantId)
      case 'templates':
        return await getDocumentTemplates(body.templateType)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Document signing API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function createDocument(payload: any, documentData: DocumentData) {
  try {
    const documentId = `DOC-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

    let processedContent = documentData.content
    if (documentData.templateVariables) {
      Object.entries(documentData.templateVariables).forEach(([key, value]) => {
        processedContent = processedContent.replace(new RegExp(`{${key}}`, 'g'), value)
      })
    }

    const document = await payload.create({
      collection: 'documents',
      data: {
        documentId,
        title: documentData.title,
        type: documentData.type,
        content: processedContent,
        signers: documentData.signers.map(signer => ({
          ...signer,
          status: 'pending',
          signedAt: null,
          signature: null
        })),
        status: 'draft',
        createdAt: new Date().toISOString(),
        expirationDate: documentData.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tenant: documentData.tenantId,
        securityHash: crypto.createHash('sha256').update(processedContent + documentId).digest('hex')
      }
    })

    const signingLinks = documentData.signers.map(signer => ({
      signer: signer.email,
      link: `${process.env.NEXT_PUBLIC_SITE_URL}/sign/${documentId}?signer=${encodeURIComponent(signer.email)}`
    }))

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        documentId,
        title: documentData.title,
        type: documentData.type,
        status: 'draft',
        signers: documentData.signers.length,
        signingLinks,
        viewUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/document/${documentId}`
      },
      message: 'Document created successfully - ready for signing!'
    })

  } catch (error) {
    console.error('Document creation failed:', error)
    return NextResponse.json({
      error: 'Document creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function signDocument(payload: any, documentId: string, signerData: SignerData) {
  try {
    const document = await payload.find({
      collection: 'documents',
      where: { documentId: { equals: documentId } }
    })

    if (!document.docs.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = document.docs[0]

    if (new Date() > new Date(doc.expirationDate)) {
      return NextResponse.json({ error: 'Document has expired' }, { status: 400 })
    }

    const signerIndex = doc.signers.findIndex((s: any) => s.email === signerData.signerEmail)
    if (signerIndex === -1) {
      return NextResponse.json({ error: 'Signer not authorized' }, { status: 403 })
    }

    if (doc.signers[signerIndex].status === 'signed') {
      return NextResponse.json({ error: 'Already signed by this signer' }, { status: 400 })
    }

    const updatedSigners = [...doc.signers]
    updatedSigners[signerIndex] = {
      ...updatedSigners[signerIndex],
      status: 'signed',
      signedAt: signerData.timestamp,
      signature: signerData.signature,
      signatureType: signerData.signatureType,
      ipAddress: signerData.ipAddress
    }

    const allSigned = updatedSigners.every((signer: any) =>
      !signer.signatureRequired || signer.status === 'signed'
    )

    await payload.update({
      collection: 'documents',
      id: doc.id,
      data: {
        signers: updatedSigners,
        status: allSigned ? 'completed' : 'partially_signed',
        completedAt: allSigned ? new Date().toISOString() : null
      }
    })

    return NextResponse.json({
      success: true,
      message: allSigned ? 'Document fully executed!' : 'Signature recorded successfully',
      document: {
        documentId,
        status: allSigned ? 'completed' : 'partially_signed',
        remainingSigners: updatedSigners.filter((s: any) => s.signatureRequired && s.status !== 'signed').length
      }
    })

  } catch (error) {
    console.error('Document signing failed:', error)
    return NextResponse.json({
      error: 'Document signing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getDocumentStatus(payload: any, documentId: string) {
  try {
    const document = await payload.find({
      collection: 'documents',
      where: { documentId: { equals: documentId } }
    })

    if (!document.docs.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const doc = document.docs[0]

    return NextResponse.json({
      success: true,
      document: {
        documentId,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        createdAt: doc.createdAt,
        signers: doc.signers.map((signer: any) => ({
          name: signer.name,
          email: signer.email,
          role: signer.role,
          status: signer.status,
          signedAt: signer.signedAt
        }))
      }
    })

  } catch (error) {
    console.error('Document status retrieval failed:', error)
    return NextResponse.json({
      error: 'Failed to get document status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function listDocuments(payload: any, tenantId?: string) {
  try {
    const where = tenantId ? { tenant: { equals: tenantId } } : {}

    const documents = await payload.find({
      collection: 'documents',
      where,
      sort: '-createdAt',
      limit: 50
    })

    return NextResponse.json({
      success: true,
      documents: documents.docs.map((doc: any) => ({
        id: doc.id,
        documentId: doc.documentId,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        createdAt: doc.createdAt,
        signers: doc.signers.length,
        signed: doc.signers.filter((s: any) => s.status === 'signed').length
      })),
      total: documents.totalDocs
    })

  } catch (error) {
    console.error('Document listing failed:', error)
    return NextResponse.json({
      error: 'Failed to list documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function getDocumentTemplates(templateType?: string) {
  const templates = {
    rental_agreement: {
      title: 'Residential Rental Agreement',
      description: 'Standard lease agreement for residential properties',
      variables: ['property_address', 'tenant_name', 'landlord_name', 'rent_amount', 'lease_start', 'lease_end'],
      template: `RESIDENTIAL LEASE AGREEMENT

Property: {property_address}
Tenant: {tenant_name}
Landlord: {landlord_name}
Monthly Rent: {rent_amount}
Term: {lease_start} to {lease_end}

1. Rent due on 1st of each month
2. Security deposit required
3. 30 days notice for termination

Signatures required below.`
    },
    service_contract: {
      title: 'Service Agreement',
      description: 'Professional services contract',
      variables: ['service_provider', 'client_name', 'service_description', 'payment_terms'],
      template: `SERVICE AGREEMENT

Provider: {service_provider}
Client: {client_name}
Services: {service_description}
Payment: {payment_terms}

Both parties agree to these terms.`
    }
  }

  if (templateType && templates[templateType as keyof typeof templates]) {
    return NextResponse.json({
      success: true,
      template: templates[templateType as keyof typeof templates]
    })
  }

  return NextResponse.json({
    success: true,
    templates: Object.entries(templates).map(([key, template]) => ({
      type: key,
      ...template
    }))
  })
}
