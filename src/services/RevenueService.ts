import type { Payload } from 'payload'
import type { Tenant } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface RevenueCalculation {
  baseRate: number
  effectiveRate: number
  monthlyRevenue: number
  platformCommission: number
  referralCommission: number
  netCommission: number
  volumeDiscount?: {
    threshold: number
    originalRate: number
    discountedRate: number
    savings: number
  }
}

interface CommissionPayment {
  tenantId: string
  referrerId?: string
  amount: number
  type: 'platform' | 'referral'
  period: string
  status: 'pending' | 'paid' | 'failed'
  productId?: string
  appointmentId?: string
  source?: 'system_generated' | 'pickup_job' | 'referral_source' | 'repeat_customer'
}

interface ProductCommissionCalculation {
  productId: string
  baseRate: number
  customRate?: number
  sourceMultiplier: number
  effectiveRate: number
  source: string
}

interface RevenueAnalytics {
  tenant: {
    name: string
    partnershipTier?: string | null
    setupFee?: number | null
  }
  revenue: RevenueCalculation
  referral: {
    referrerName: string | null | undefined
    commissionRate?: number | null
    terms?: string | null
    status?: string | null
  } | null
}

export class RevenueService {
  private payload: Payload | null = null

  constructor() {
    this.initializePayload()
  }

  private async initializePayload() {
    this.payload = await getPayload({ config: configPromise })
  }

  // Calculate effective revenue share rate based on volume and partnership tier
  async calculateEffectiveRate(tenant: Tenant, monthlyRevenue: number): Promise<RevenueCalculation> {
    const baseRate = tenant.revenueSharing?.revenueShareRate || 3.0
    let effectiveRate = baseRate
    let volumeDiscount = undefined

    // Apply volume discounts if configured
    if (tenant.revenueSharing?.volumeDiscounts && Array.isArray(tenant.revenueSharing.volumeDiscounts) && tenant.revenueSharing.volumeDiscounts.length > 0) {
      const applicableDiscounts = (tenant.revenueSharing.volumeDiscounts as any[])
        .filter((discount: any) => monthlyRevenue >= discount.threshold)
        .sort((a: any, b: any) => b.threshold - a.threshold) // Highest threshold first

      if (applicableDiscounts.length > 0) {
        const bestDiscount = applicableDiscounts[0]
        if (bestDiscount) {
          effectiveRate = bestDiscount.discountRate
          volumeDiscount = {
            threshold: bestDiscount.threshold,
            originalRate: baseRate,
            discountedRate: effectiveRate,
            savings: (baseRate - effectiveRate) * monthlyRevenue / 100
          }
        }
      }
    }

    // Apply partnership tier modifiers
    const tierMultiplier = this.getPartnershipTierMultiplier(tenant.revenueSharing?.partnershipTier || undefined)
    effectiveRate = effectiveRate * tierMultiplier

    const platformCommission = (monthlyRevenue * effectiveRate) / 100
    const referralCommission = await this.calculateReferralCommission(tenant, platformCommission)
    const netCommission = platformCommission - referralCommission

    return {
      baseRate,
      effectiveRate,
      monthlyRevenue,
      platformCommission,
      referralCommission,
      netCommission,
      volumeDiscount
    }
  }

  // Calculate commission owed to referrer
  private async calculateReferralCommission(tenant: Tenant, platformCommission: number): Promise<number> {
    if (!tenant.referralProgram?.referredBy || tenant.referralProgram.referralStatus !== 'active') {
      return 0
    }

    // Check if referral is still valid based on terms
    const isReferralActive = await this.isReferralActive(tenant)
    if (!isReferralActive) {
      return 0
    }

    const commissionRate = tenant.referralProgram.referralCommissionRate || 30.0
    return (platformCommission * commissionRate) / 100
  }

  // Check if referral is still active based on terms
  private async isReferralActive(tenant: Tenant): Promise<boolean> {
    if (!tenant.referralProgram?.referralTerms || !tenant.createdAt) {
      return false
    }

    const createdDate = new Date(tenant.createdAt)
    const now = new Date()
    const monthsSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)

    switch (tenant.referralProgram.referralTerms) {
      case 'lifetime':
        return true
      case '12_months':
        return monthsSinceCreation <= 12
      case '24_months':
        return monthsSinceCreation <= 24
      case 'first_year':
        return monthsSinceCreation <= 12
      default:
        return false
    }
  }

  // Get partnership tier multiplier for rate adjustments
  private getPartnershipTierMultiplier(tier?: string): number {
    switch (tier) {
      case 'strategic':
        return 0.7  // 30% discount
      case 'enterprise':
        return 0.6  // 40% discount
      case 'preferred':
        return 0.85 // 15% discount
      case 'referral_source':
        return 0.5  // 50% discount (they bring business)
      case 'standard':
      default:
        return 1.0  // No discount
    }
  }

  // Process monthly revenue for a tenant (called by BusinessAgent or cron job)
  async processMonthlyRevenue(tenantId: string): Promise<RevenueCalculation | null> {
    if (!this.payload) await this.initializePayload()

    try {
      // Get tenant data
      const tenant = await this.payload!.findByID({
        collection: 'tenants',
        id: tenantId,
        depth: 1
      }) as Tenant

      if (!tenant) {
        console.error(`[RevenueService] Tenant not found: ${tenantId}`)
        return null
      }

      // Calculate current month revenue from orders
      const monthlyRevenue = await this.calculateMonthlyRevenue(tenantId)

      // Calculate effective rates and commissions
      const calculation = await this.calculateEffectiveRate(tenant, monthlyRevenue)

      // Update tenant with calculated values
      await this.payload!.update({
        collection: 'tenants',
        id: tenantId,
        data: {
          revenueTracking: {
            monthlyRevenue: calculation.monthlyRevenue,
            currentEffectiveRate: calculation.effectiveRate,
            lastRevenueCalculation: new Date().toISOString(),
            totalRevenue: (tenant.revenueTracking?.totalRevenue || 0) + calculation.monthlyRevenue,
            commissionsPaid: (tenant.revenueTracking?.commissionsPaid || 0) + calculation.platformCommission
          }
        }
      })

      // Create commission payment records
      await this.createCommissionPayments(tenant, calculation)

      // New: Allocate to prison ministry
      const { PrisonMinistryService } = await import('./PrisonMinistryService')
      const ministry = new PrisonMinistryService()
      await ministry.initialize()
      await ministry.processReentrySupport(tenantId, 10) // 10% to ministry

      console.log(`[RevenueService] Processed revenue for tenant ${tenantId}: $${calculation.monthlyRevenue} revenue, ${calculation.effectiveRate}% rate`)

      return calculation

    } catch (error) {
      console.error(`[RevenueService] Failed to process revenue for tenant ${tenantId}:`, error)
      return null
    }
  }

  // Calculate monthly revenue from orders
  private async calculateMonthlyRevenue(tenantId: string): Promise<number> {
    if (!this.payload) return 0

    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    try {
      const orders = await this.payload.find({
        collection: 'orders',
        where: {
          and: [
            { tenant: { equals: tenantId } },
            { status: { equals: 'completed' } },
            { createdAt: { greater_than_equal: firstDayOfMonth.toISOString() } },
            { createdAt: { less_than_equal: lastDayOfMonth.toISOString() } }
          ]
        }
      })

      return orders.docs.reduce((total, order) => {
        return total + (order.totalAmount || 0)
      }, 0)

    } catch (error) {
      console.error(`[RevenueService] Failed to calculate monthly revenue for tenant ${tenantId}:`, error)
      return 0
    }
  }

  // Create commission payment records for tracking
  private async createCommissionPayments(tenant: Tenant, calculation: RevenueCalculation): Promise<void> {
    if (!this.payload) return

    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    try {
      // Create platform commission record
      if (calculation.netCommission > 0) {
        await this.createCommissionRecord({
          tenantId: tenant.id.toString(),
          amount: calculation.netCommission,
          type: 'platform',
          period: currentMonth,
          status: 'pending'
        })
      }

      // Create referral commission record if applicable
      if (calculation.referralCommission > 0 && tenant.referralProgram?.referredBy) {
        await this.createCommissionRecord({
          tenantId: tenant.id.toString(),
          referrerId: typeof tenant.referralProgram.referredBy === 'object'
            ? tenant.referralProgram.referredBy.id.toString()
            : tenant.referralProgram.referredBy.toString(),
          amount: calculation.referralCommission,
          type: 'referral',
          period: currentMonth,
          status: 'pending'
        })
      }

    } catch (error) {
      console.error(`[RevenueService] Failed to create commission payments for tenant ${tenant.id}:`, error)
    }
  }

  // Create individual commission record (you might want to create a separate CommissionPayments collection)
  private async createCommissionRecord(payment: CommissionPayment): Promise<void> {
    // For now, we'll log this. You might want to create a separate collection for tracking commissions
    console.log(`[RevenueService] Commission due:`, payment)

    // TODO: Create CommissionPayments collection to track these
    // await this.payload!.create({
    //   collection: 'commissionPayments',
    //   data: payment
    // })
  }

  // Get revenue analytics for a tenant
  async getRevenueAnalytics(tenantId: string): Promise<RevenueAnalytics | null> {
    if (!this.payload) await this.initializePayload()

    try {
      const tenant = await this.payload!.findByID({
        collection: 'tenants',
        id: tenantId,
        depth: 1
      }) as Tenant

      if (!tenant) return null

      const monthlyRevenue = await this.calculateMonthlyRevenue(tenantId)
      const calculation = await this.calculateEffectiveRate(tenant, monthlyRevenue)

      return {
        tenant: {
          name: tenant.name,
          partnershipTier: tenant.revenueSharing?.partnershipTier,
          setupFee: tenant.revenueSharing?.setupFee
        },
        revenue: calculation,
        referral: tenant.referralProgram?.referredBy ? {
          referrerName: typeof tenant.referralProgram.referredBy === 'object'
            ? `${tenant.referralProgram.referredBy.firstName} ${tenant.referralProgram.referredBy.lastName}`.trim()
            : 'Unknown',
          commissionRate: tenant.referralProgram.referralCommissionRate,
          terms: tenant.referralProgram.referralTerms,
          status: tenant.referralProgram.referralStatus
        } : null
      }

    } catch (error) {
      console.error(`[RevenueService] Failed to get analytics for tenant ${tenantId}:`, error)
      return null
    }
  }

  // Adjust partnership tier (for manual adjustments)
  async adjustPartnershipTier(tenantId: string, newTier: string, negotiatedTerms?: string): Promise<boolean> {
    if (!this.payload) await this.initializePayload()

    try {
      await this.payload!.update({
        collection: 'tenants',
        id: tenantId,
        data: {
          revenueSharing: {
            partnershipTier: newTier as 'standard' | 'preferred' | 'strategic' | 'enterprise' | 'referral_source',
            negotiatedTerms: negotiatedTerms
          }
        }
      })

      console.log(`[RevenueService] Updated partnership tier for tenant ${tenantId} to ${newTier}`)
      return true

    } catch (error) {
      console.error(`[RevenueService] Failed to adjust partnership tier for tenant ${tenantId}:`, error)
      return false
    }
  }

  // NEW: Calculate commission for specific product/service with source consideration
  async calculateProductCommission(
    tenantId: string,
    productId: string,
    amount: number,
    source: 'system_generated' | 'pickup_job' | 'referral_source' | 'repeat_customer' = 'system_generated'
  ): Promise<ProductCommissionCalculation> {
    if (!this.payload) await this.initializePayload()

    // Get tenant and product data
    const [tenant, product] = await Promise.all([
      this.payload!.findByID({ collection: 'tenants', id: tenantId }) as Promise<any>,
      this.payload!.findByID({ collection: 'products', id: productId }) as Promise<any>
    ])

    // Determine base rate (product custom rate or tenant default)
    const baseRate = product.commission?.useCustomRate
      ? product.commission.customCommissionRate
      : tenant.revenueSharing?.revenueShareRate || 3.0

    // Get source multiplier from product configuration
    const sourceMultipliers = product.commission?.sourceMultipliers || {}
    let sourceMultiplier = 1.0

    switch (source) {
      case 'system_generated':
        sourceMultiplier = sourceMultipliers.systemGenerated || 1.0
        break
      case 'pickup_job':
        sourceMultiplier = sourceMultipliers.pickupJob || 0.5
        break
      case 'referral_source':
        sourceMultiplier = sourceMultipliers.referralSource || 1.5
        break
      case 'repeat_customer':
        sourceMultiplier = sourceMultipliers.repeatCustomer || 0.8
        break
    }

    // Apply partnership tier adjustments
    const tierMultiplier = this.getPartnershipTierMultiplier(tenant.revenueSharing?.partnershipTier)
    const effectiveRate = baseRate * sourceMultiplier * tierMultiplier

    return {
      productId,
      baseRate,
      customRate: product.commission?.useCustomRate ? product.commission.customCommissionRate : undefined,
      sourceMultiplier,
      effectiveRate,
      source
    }
  }

  // NEW: Process immediate commission distribution via Stripe
  async processImmediateCommission(
    tenantId: string,
    productId: string,
    amount: number,
    source: string,
    stripePaymentIntentId: string
  ): Promise<{ platformCommission: number, immediateTransfer: boolean }> {
    const commissionCalc = await this.calculateProductCommission(tenantId, productId, amount, source as any)
    const platformCommission = (amount * commissionCalc.effectiveRate) / 100
    const netAmount = amount - platformCommission

    try {
      // Get tenant's Stripe connected account
      const tenant = await this.payload!.findByID({ collection: 'tenants', id: tenantId }) as any
      const stripeAccountId = tenant.stripeConnect?.accountId

      if (stripeAccountId && netAmount > 0) {
        // Create immediate transfer to tenant's connected account
        // This would integrate with Stripe Connect API
        console.log(`[RevenueService] Immediate transfer: $${netAmount.toFixed(2)} to ${stripeAccountId}`)
        console.log(`[RevenueService] Platform commission: $${platformCommission.toFixed(2)} (${commissionCalc.effectiveRate}%)`)

        // TODO: Implement actual Stripe transfer
        // const transfer = await stripe.transfers.create({
        //   amount: Math.round(netAmount * 100), // Convert to cents
        //   currency: 'usd',
        //   destination: stripeAccountId,
        //   transfer_group: stripePaymentIntentId,
        // })

        return { platformCommission, immediateTransfer: true }
      }

      return { platformCommission, immediateTransfer: false }
    } catch (error) {
      console.error(`[RevenueService] Failed to process immediate commission:`, error)
      return { platformCommission, immediateTransfer: false }
    }
  }

  // NEW: Update appointment with calculated commission
  async updateAppointmentCommission(
    appointmentId: string,
    productId?: string,
    amount?: number
  ): Promise<void> {
    if (!this.payload) await this.initializePayload()

    try {
      const appointment = await this.payload!.findByID({
        collection: 'appointments',
        id: appointmentId
      }) as any

      if (!appointment) return

      const tenantId = appointment.tenant
      const source = appointment.revenueTracking?.source || 'system_generated'
      const paymentAmount = amount || appointment.payment?.amount || 0

      if (productId && paymentAmount > 0) {
        const commissionCalc = await this.calculateProductCommission(
          tenantId,
          productId,
          paymentAmount / 100, // Convert from cents
          source
        )

        const commissionAmount = (paymentAmount / 100) * (commissionCalc.effectiveRate / 100)

        await this.payload!.update({
          collection: 'appointments',
          id: appointmentId,
          data: {
            revenueTracking: {
              ...appointment.revenueTracking,
              commissionRate: commissionCalc.effectiveRate,
              commissionAmount: commissionAmount,
            }
          }
        })

        console.log(`[RevenueService] Updated appointment ${appointmentId} commission: ${commissionCalc.effectiveRate}% = $${commissionAmount.toFixed(2)}`)
      }
    } catch (error) {
      console.error(`[RevenueService] Failed to update appointment commission:`, error)
    }
  }
}

export default RevenueService
