// CRM Service - Customer Relationship Management for Angel OS
import { RelationshipProfile, BusinessInsights } from '../types/ship-mind'

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  source: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Interaction {
  id: string
  customerId: string
  type: 'call' | 'email' | 'meeting' | 'chat' | 'note'
  subject: string
  content: string
  timestamp: Date
  userId: string
  outcome?: string
  nextAction?: string
}

export interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
  isDefault: boolean
}

export interface PipelineStage {
  id: string
  name: string
  order: number
  probability: number
  color: string
}

export interface Deal {
  id: string
  customerId: string
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  expectedCloseDate?: Date
  actualCloseDate?: Date
  status: 'open' | 'won' | 'lost'
  assignedTo: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

export class CRMService {
  private customers: Map<string, Customer> = new Map()
  private interactions: Map<string, Interaction[]> = new Map()
  private deals: Map<string, Deal> = new Map()

  async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const customer: Customer = {
      id: `cust_${Date.now()}`,
      ...customerData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.customers.set(customer.id, customer)
    return customer
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    return this.customers.get(customerId) || null
  }

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customer = this.customers.get(customerId)
    if (!customer) return null

    const updatedCustomer = {
      ...customer,
      ...updates,
      updatedAt: new Date()
    }

    this.customers.set(customerId, updatedCustomer)
    return updatedCustomer
  }

  async addInteraction(interaction: Omit<Interaction, 'id' | 'timestamp'>): Promise<Interaction> {
    const newInteraction: Interaction = {
      id: `int_${Date.now()}`,
      ...interaction,
      timestamp: new Date()
    }

    const customerInteractions = this.interactions.get(interaction.customerId) || []
    customerInteractions.push(newInteraction)
    this.interactions.set(interaction.customerId, customerInteractions)

    return newInteraction
  }

  async getCustomerInteractions(customerId: string): Promise<Interaction[]> {
    return this.interactions.get(customerId) || []
  }

  async createDeal(dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const deal: Deal = {
      id: `deal_${Date.now()}`,
      ...dealData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.deals.set(deal.id, deal)
    return deal
  }

  async updateDealStage(dealId: string, stage: string, probability: number): Promise<Deal | null> {
    const deal = this.deals.get(dealId)
    if (!deal) return null

    const updatedDeal = {
      ...deal,
      stage,
      probability,
      updatedAt: new Date()
    }

    this.deals.set(dealId, updatedDeal)
    return updatedDeal
  }

  async getCustomerRelationshipProfile(customerId: string): Promise<RelationshipProfile | null> {
    const customer = this.customers.get(customerId)
    if (!customer) return null

    const interactions = await this.getCustomerInteractions(customerId)
    
    return {
      userId: customerId,
      businessContext: customer.company || 'Individual',
      communicationStyle: 'friendly',
      preferences: customer.customFields,
      trustLevel: 0.8,
      interactionHistory: interactions.map(int => ({
        timestamp: int.timestamp,
        type: int.type,
        content: int.content,
        outcome: int.outcome || 'completed'
      }))
    }
  }

  async getBusinessInsights(): Promise<BusinessInsights> {
    return {
      industryTrends: [],
      competitiveIntelligence: [],
      customerBehavior: [],
      revenueProjections: [],
      riskAssessment: []
    }
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const allCustomers = Array.from(this.customers.values())
    return allCustomers.filter(customer => 
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      customer.company?.toLowerCase().includes(query.toLowerCase())
    )
  }

  async getCustomersByStatus(status: Customer['status']): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(customer => customer.status === status)
  }

  async getRecentInteractions(limit: number = 10): Promise<Interaction[]> {
    const allInteractions: Interaction[] = []
    
    for (const interactions of this.interactions.values()) {
      allInteractions.push(...interactions)
    }

    return allInteractions
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
}

export default CRMService 