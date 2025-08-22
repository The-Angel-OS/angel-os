'use client'

import React from 'react'
import { AutoForm } from './AutoForm'
import {
  tenantProvisionSchema,
  spaceCreationSchema,
  paymentRequestSchema,
  inventoryUpdateSchema,
  contactFormSchema,
  productCreationSchema,
  type TenantProvisionData,
  type SpaceCreationData,
  type PaymentRequestData,
  type InventoryUpdateData,
  type ContactFormData,
  type ProductCreationData,
} from '@/utilities/form-schemas'

type FormIntent =
  | 'provision_tenant'
  | 'create_space'
  | 'collect_payment'
  | 'update_inventory'
  | 'create_contact'
  | 'create_product'

interface DynamicFormRendererProps {
  intent: FormIntent
  onSubmit: (data: any) => void | Promise<void>
  className?: string
}

export function DynamicFormRenderer({ intent, onSubmit, className }: DynamicFormRendererProps) {
  switch (intent) {
    case 'provision_tenant':
      return (
        <div className={className}>
          <h3 className="text-lg font-semibold mb-4">Provision New Tenant</h3>
          <AutoForm
            schema={tenantProvisionSchema}
            onSubmit={onSubmit as (data: TenantProvisionData) => void}
            fieldConfig={{
              name: {
                placeholder: 'Enter business name',
                description: 'The name of your business or organization',
              },
              voicePrompt: {
                fieldType: 'textarea',
                placeholder: 'Describe your business in your own words...',
                description: 'Tell us about your business and we\'ll configure everything automatically',
              },
              businessType: {
                options: [
                  { label: 'Service Business', value: 'service' },
                  { label: 'Retail Store', value: 'retail' },
                  { label: 'Content Creator', value: 'creator' },
                  { label: 'Restaurant', value: 'restaurant' },
                  { label: 'Other', value: 'other' },
                ],
              },
            }}
            submitText="Provision Tenant"
          />
        </div>
      )

    case 'create_space':
      return (
        <div className={className}>
          <h3 className="text-lg font-semibold mb-4">Create New Space</h3>
          <AutoForm
            schema={spaceCreationSchema}
            onSubmit={onSubmit as (data: SpaceCreationData) => void}
            fieldConfig={{
              name: {
                placeholder: 'Space name',
              },
              businessType: {
                options: [
                  { label: 'E-commerce Store', value: 'ecommerce' },
                  { label: 'Blog/Content', value: 'blog' },
                  { label: 'Portfolio', value: 'portfolio' },
                  { label: 'Service Business', value: 'service' },
                  { label: 'Community', value: 'community' },
                ],
              },
            }}
            submitText="Create Space"
          />
        </div>
      )

    case 'collect_payment':
      return (
        <div className={className}>
          <h3 className="text-lg font-semibold mb-4">Payment Request</h3>
          <AutoForm
            schema={paymentRequestSchema}
            onSubmit={onSubmit as (data: PaymentRequestData) => void}
            fieldConfig={{
              amount: {
                placeholder: '0.00',
                inputProps: { step: '0.01' },
              },
              recipient: {
                placeholder: 'customer@example.com',
              },
              description: {
                fieldType: 'textarea',
                placeholder: 'What is this payment for?',
              },
            }}
            submitText="Create Payment Request"
          />
        </div>
      )

    case 'update_inventory':
      return (
        <div className={className}>
          <h3 className="text-lg font-semibold mb-4">Update Inventory</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a photo or manually enter inventory adjustments
          </p>
          <AutoForm
            schema={inventoryUpdateSchema}
            onSubmit={onSubmit as (data: InventoryUpdateData) => void}
            fieldConfig={{
              notes: {
                fieldType: 'textarea',
                placeholder: 'Additional notes about this update',
              },
            }}
            submitText="Update Inventory"
          />
        </div>
      )

    case 'create_contact':
      return (
        <div className={className}>
          <h3 className="text-lg font-semibold mb-4">New Contact</h3>
          <AutoForm
            schema={contactFormSchema}
            onSubmit={onSubmit as (data: ContactFormData) => void}
            fieldConfig={{
              message: {
                fieldType: 'textarea',
                placeholder: 'How can we help you?',
              },
              source: {
                options: [
                  { label: 'Website', value: 'website' },
                  { label: 'Referral', value: 'referral' },
                  { label: 'Social Media', value: 'social' },
                  { label: 'Advertisement', value: 'advertisement' },
                  { label: 'Other', value: 'other' },
                ],
              },
            }}
            submitText="Save Contact"
          />
        </div>
      )

    case 'create_product':
      return (
        <div className={className}>
          <h3 className="text-lg font-semibold mb-4">Create Product</h3>
          <AutoForm
            schema={productCreationSchema}
            onSubmit={onSubmit as (data: ProductCreationData) => void}
            fieldConfig={{
              description: {
                fieldType: 'textarea',
                placeholder: 'Describe your product...',
              },
              price: {
                inputProps: { step: '0.01' },
                placeholder: '0.00',
              },
            }}
            submitText="Create Product"
          />
        </div>
      )

    default:
      return <div>Unknown form type</div>
  }
}

// Utility to generate forms from voice prompts
export async function generateFormFromPrompt(prompt: string): Promise<{
  schema: any
  fieldConfig: Record<string, any>
}> {
  // This would call an AI service to generate a Zod schema from the prompt
  // For now, return a placeholder
  return {
    schema: contactFormSchema,
    fieldConfig: {},
  }
}
