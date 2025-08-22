import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'signature' | 'payment'
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

interface DynamicFormConfig {
  id: string
  title: string
  description?: string
  fields: FormField[]
  submitLabel: string
  conversationId: string
  guardianAngelId: string
  formType: 'quote' | 'booking' | 'payment' | 'signature' | 'poll' | 'survey'
}

interface DynamicFormBuilderProps {
  config: DynamicFormConfig
  onSubmit: (data: any) => void
  onCancel?: () => void
}

export const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  config,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    config.fields.forEach(field => {
      const value = formData[field.id]
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.id] = `${field.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const submissionData = {
        formId: config.id,
        formType: config.formType,
        conversationId: config.conversationId,
        guardianAngelId: config.guardianAngelId,
        data: formData,
        timestamp: new Date().toISOString()
      }

      await onSubmit(submissionData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        {config.description && (
          <p className="text-sm text-gray-600">{config.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {config.fields.map(renderField)}
          
          <div className="flex justify-between pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? 'Submitting...' : config.submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Form Builder Service for Guardian Angels
export class GuardianAngelFormBuilder {
  static async generateQuoteForm(service: string, details: any): Promise<DynamicFormConfig> {
    return {
      id: `quote-${Date.now()}`,
      title: `${service} Quote Request`,
      description: `Please provide details for your ${service} quote`,
      formType: 'quote',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone Number',
          required: true
        },
        {
          id: 'address',
          type: 'textarea',
          label: 'Service Address',
          placeholder: 'Where do you need the service?',
          required: true
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Service Description',
          placeholder: 'Please describe what you need...',
          required: true
        }
      ],
      submitLabel: 'Get Quote',
      conversationId: details.conversationId,
      guardianAngelId: details.guardianAngelId
    }
  }

  static async generateBookingForm(service: string, details: any): Promise<DynamicFormConfig> {
    return {
      id: `booking-${Date.now()}`,
      title: `Book ${service} Service`,
      description: `Schedule your ${service} appointment`,
      formType: 'booking',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Phone Number',
          required: true
        },
        {
          id: 'address',
          type: 'textarea',
          label: 'Service Address',
          required: true
        }
      ],
      submitLabel: 'Book Appointment',
      conversationId: details.conversationId,
      guardianAngelId: details.guardianAngelId
    }
  }

  static async generateSignatureForm(document: string, details: any): Promise<DynamicFormConfig> {
    return {
      id: `signature-${Date.now()}`,
      title: 'Document Signature',
      description: `Please sign: ${document}`,
      formType: 'signature',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true
        },
        {
          id: 'signature',
          type: 'signature',
          label: 'Signature',
          required: true
        }
      ],
      submitLabel: 'Sign Document',
      conversationId: details.conversationId,
      guardianAngelId: details.guardianAngelId
    }
  }
}

export default DynamicFormBuilder 