import { getPayload } from 'payload'
import configPromise from '../payload.config'
import type { Payload } from 'payload'

export class PrisonMinistryService {
  private payload: Payload | null = null

  async initialize() {
    this.payload = await getPayload({ config: configPromise })
  }

  private ensurePayload(): Payload {
    if (!this.payload) throw new Error('Not initialized')
    return this.payload
  }

  async allocateDonation(amount: number, recipientType: 'literal' | 'digital' | 'economic' | 'spiritual') {
    const payload = this.ensurePayload()
    const donation = await payload.create({
      collection: 'donations',
      data: {
        donationId: `prison-ministry-${Date.now()}`,
        amount,
        donorName: 'Prison Ministry Service',
        campaign: 'Prison Ministry Support',
        paymentMethod: 'bank_transfer',
        status: 'pending',
        donatedAt: new Date().toISOString()
      }
    })
    console.log(`[PrisonMinistry] Allocated $${amount} to ${recipientType} prisoners`)
    return donation
  }

  async processReentrySupport(tenantId: string, revenueShare: number) {
    const payload = this.ensurePayload()
    const tenant = await payload.findByID({ collection: 'tenants', id: tenantId })
    const monthlyRevenue = tenant.revenueTracking?.monthlyRevenue ?? 0
    const shareAmount = monthlyRevenue * (revenueShare / 100)
    return this.allocateDonation(shareAmount, 'literal')
  }
}

export const prisonMinistry = new PrisonMinistryService() 