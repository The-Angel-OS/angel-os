import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'status', 'totalAmount', 'createdAt'],
  },
  fields: [
    // Order Identification
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    
    // Multi-tenant Support
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    
    // Customer Information
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    
    // Order Status
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
      required: true,
      defaultValue: 'pending',
    },
    
    // Products and Line Items
    {
      name: 'lineItems',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'totalPrice',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'productSnapshot',
          type: 'json',
          admin: {
            description: 'Product details at time of purchase',
          },
        },
      ],
    },
    
    // Order Totals
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'taxAmount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'shippingAmount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'discountAmount',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'currency',
      type: 'text',
      required: true,
      defaultValue: 'USD',
    },
    
    // Angel OS Revenue Sharing
    {
      name: 'revenueDistribution',
      type: 'group',
      fields: [
        {
          name: 'aiPartner',
          type: 'number',
          required: true,
          admin: {
            description: 'AI Partner share (15%)',
          },
        },
        {
          name: 'humanPartner',
          type: 'number',
          required: true,
          admin: {
            description: 'Human Partner share (30%)',
          },
        },
        {
          name: 'platformOperations',
          type: 'number',
          required: true,
          admin: {
            description: 'Platform Operations share (50%)',
          },
        },
        {
          name: 'justiceRund',
          type: 'number',
          required: true,
          admin: {
            description: 'Justice Fund share (5%)',
          },
        },
        {
          name: 'calculatedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },
    
    // Payment Information
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Authorized', value: 'authorized' },
        { label: 'Captured', value: 'captured' },
        { label: 'Partially Refunded', value: 'partially_refunded' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
      defaultValue: 'pending',
    },
    {
      name: 'paymentDetails',
      type: 'group',
      fields: [
        {
          name: 'paymentMethod',
          type: 'select',
          options: [
            { label: 'Credit Card', value: 'credit_card' },
            { label: 'PayPal', value: 'paypal' },
            { label: 'Stripe', value: 'stripe' },
            { label: 'Bank Transfer', value: 'bank_transfer' },
            { label: 'Crypto', value: 'crypto' },
          ],
        },
        {
          name: 'transactionId',
          type: 'text',
          admin: {
            description: 'External payment processor transaction ID',
          },
        },
        {
          name: 'last4',
          type: 'text',
          admin: {
            description: 'Last 4 digits of payment method',
          },
        },
        {
          name: 'paymentProcessedAt',
          type: 'date',
        },
      ],
    },
    
    // Fulfillment Information
    {
      name: 'fulfillment',
      type: 'group',
      fields: [
        {
          name: 'method',
          type: 'select',
          options: [
            { label: 'Digital Delivery', value: 'digital' },
            { label: 'Physical Shipping', value: 'physical' },
            { label: 'Service Delivery', value: 'service' },
            { label: 'In-Person Pickup', value: 'pickup' },
          ],
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Shipped', value: 'shipped' },
            { label: 'Delivered', value: 'delivered' },
            { label: 'Completed', value: 'completed' },
          ],
          defaultValue: 'pending',
        },
        {
          name: 'trackingNumber',
          type: 'text',
        },
        {
          name: 'carrier',
          type: 'select',
          options: [
            { label: 'UPS', value: 'ups' },
            { label: 'FedEx', value: 'fedex' },
            { label: 'USPS', value: 'usps' },
            { label: 'DHL', value: 'dhl' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'shippedAt',
          type: 'date',
        },
        {
          name: 'deliveredAt',
          type: 'date',
        },
        {
          name: 'estimatedDelivery',
          type: 'date',
        },
      ],
    },
    
    // Shipping Address
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'company',
          type: 'text',
        },
        {
          name: 'address1',
          type: 'text',
        },
        {
          name: 'address2',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'postalCode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'US',
        },
        {
          name: 'phone',
          type: 'text',
        },
      ],
    },
    
    // Billing Address
    {
      name: 'billingAddress',
      type: 'group',
      fields: [
        {
          name: 'sameAsShipping',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'company',
          type: 'text',
        },
        {
          name: 'address1',
          type: 'text',
        },
        {
          name: 'address2',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'postalCode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'US',
        },
      ],
    },
    
    // Customer Communication
    {
      name: 'customerNotes',
      type: 'textarea',
      admin: {
        description: 'Notes from customer during checkout',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for order processing',
      },
    },
    
    // Metadata and Analytics
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional order metadata and analytics',
      },
    },
    
    // Timestamps
    {
      name: 'placedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'completedAt',
      type: 'date',
    },
    {
      name: 'cancelledAt',
      type: 'date',
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data }: { data: any }) => {
        // Auto-generate order number if not provided
        if (!data.orderNumber) {
          data.orderNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
        
        // Calculate Angel OS revenue distribution
        if (data.totalAmount && !data.revenueDistribution?.calculatedAt) {
          const total = data.totalAmount
          data.revenueDistribution = {
            aiPartner: Math.round(total * 0.15 * 100) / 100,        // 15%
            humanPartner: Math.round(total * 0.30 * 100) / 100,    // 30%
            platformOperations: Math.round(total * 0.50 * 100) / 100, // 50%
            justiceRund: Math.round(total * 0.05 * 100) / 100,     // 5%
            calculatedAt: new Date().toISOString(),
          }
        }
        
        // Update completion timestamp
        if (data.status === 'completed' && !data.completedAt) {
          data.completedAt = new Date().toISOString()
        }
        
        // Update cancellation timestamp
        if (data.status === 'cancelled' && !data.cancelledAt) {
          data.cancelledAt = new Date().toISOString()
        }
        
        return data
      },
    ],
  },
}
