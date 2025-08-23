"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, MapPin, User, Users, Star, AlertTriangle, CheckCircle, X, Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'datetime' | 'number' | 'email' | 'tel' | 'checkbox' | 'relationship' | 'array'
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  min?: number
  max?: number
  defaultValue?: any
  validation?: (value: any) => string | null
  condition?: (formData: any) => boolean
}

export interface UniversalModalProps {
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  initialData?: Record<string, any>
}

export function UniversalModal({
  title,
  description,
  fields,
  onSubmit,
  onCancel,
  trigger,
  open,
  onOpenChange,
  submitLabel = "Create",
  cancelLabel = "Cancel",
  loading = false,
  className,
  size = 'md',
  initialData = {}
}: UniversalModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data with default values and initial data
  useEffect(() => {
    const defaultData: Record<string, any> = {}
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue
      }
    })
    // Merge default values with initial data (initial data takes precedence)
    setFormData({ ...defaultData, ...initialData })
  }, [fields, initialData])

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`
    }
    
    if (field.validation) {
      return field.validation(value)
    }
    
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address'
    }
    
    if (field.type === 'number' && value !== undefined) {
      if (field.min !== undefined && value < field.min) {
        return `Must be at least ${field.min}`
      }
      if (field.max !== undefined && value > field.max) {
        return `Must be no more than ${field.max}`
      }
    }
    
    return null
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      if (!field.condition || field.condition(formData)) {
        const error = validateField(field, formData[field.name])
        if (error) {
          newErrors[field.name] = error
        }
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onOpenChange?.(false)
      setFormData({})
      setErrors({})
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle error - could show toast or set form-level error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
    setFormData({})
    setErrors({})
  }

  const renderField = (field: FormField) => {
    if (field.condition && !field.condition(formData)) {
      return null
    }

    const value = formData[field.name]
    const error = errors[field.name]
    const fieldId = `field-${field.name}`

    const commonProps = {
      id: fieldId,
      className: error ? 'border-red-500' : '',
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-900 dark:text-white font-semibold text-sm">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type={field.type}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className={cn(
                "bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500",
                "text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400",
                "font-medium",
                error ? 'border-red-600 dark:border-red-400' : ''
              )}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-900 dark:text-white font-semibold text-sm">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="number"
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || undefined)}
              className={cn(
                "bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500",
                "text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400",
                "font-medium",
                error ? 'border-red-600 dark:border-red-400' : ''
              )}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-900 dark:text-white font-semibold text-sm">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </Label>
            <Textarea
              {...commonProps}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              rows={4}
              className={cn(
                "bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500",
                "text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400",
                "font-medium",
                error ? 'border-red-600 dark:border-red-400' : ''
              )}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-900 dark:text-white font-semibold text-sm">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </Label>
            <Select value={value || ''} onValueChange={(val) => handleFieldChange(field.name, val)}>
              <SelectTrigger className={cn(
                "bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500",
                "text-gray-900 dark:text-white font-medium",
                "focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400",
                error ? 'border-red-600 dark:border-red-400' : ''
              )}>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500">
                {field.options?.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-900 dark:text-white font-semibold text-sm">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="date"
              value={value ? new Date(value).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const date = new Date(e.target.value)
                  handleFieldChange(field.name, date.toISOString())
                } else {
                  handleFieldChange(field.name, '')
                }
              }}
              className={cn(
                "bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500",
                "text-gray-900 dark:text-white font-medium",
                "focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400",
                error ? 'border-red-600 dark:border-red-400' : ''
              )}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'datetime':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className="text-gray-900 dark:text-white font-semibold text-sm">
              {field.label}
              {field.required && <span className="text-red-600 ml-1">*</span>}
            </Label>
            <Input
              {...commonProps}
              type="datetime-local"
              value={value ? new Date(value).toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const date = new Date(e.target.value)
                  handleFieldChange(field.name, date.toISOString())
                } else {
                  handleFieldChange(field.name, '')
                }
              }}
              className={cn(
                "bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-500",
                "text-gray-900 dark:text-white font-medium",
                "focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400",
                error ? 'border-red-600 dark:border-red-400' : ''
              )}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                {...commonProps}
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor={fieldId}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  const modalContent = (
    <DialogContent className={cn(
      sizeClasses[size], 
      // Perfect contrast: Crisp white background with sharp borders in light mode
      "bg-white dark:bg-gray-950 text-gray-900 dark:text-white",
      "border-gray-400 dark:border-gray-600 shadow-2xl",
      "ring-1 ring-gray-400 dark:ring-gray-600",
      className
    )}>
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white font-bold text-xl">{title}</DialogTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{description}</p>
        )}
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map(renderField)}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {modalContent}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {modalContent}
    </Dialog>
  )
}

// Preset configurations for common modals
export const appointmentModalFields: FormField[] = [
  {
    name: 'title',
    label: 'Appointment Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., Client Consultation, Team Meeting'
  },
  {
    name: 'appointmentType',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Consultation', value: 'consultation' },
      { label: 'Meeting', value: 'meeting' },
      { label: 'Interview', value: 'interview' },
      { label: 'Training', value: 'training' },
      { label: 'Support', value: 'support' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'startDateTime',
    label: 'Start Date & Time',
    type: 'datetime',
    required: true
  },
  {
    name: 'duration',
    label: 'Duration (minutes)',
    type: 'number',
    required: true,
    defaultValue: 60,
    min: 15,
    max: 480
  },
  {
    name: 'location.type',
    label: 'Location Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Virtual', value: 'virtual' },
      { label: 'In-Person', value: 'in_person' },
      { label: 'Phone', value: 'phone' }
    ]
  },
  {
    name: 'location.details',
    label: 'Location Details',
    type: 'textarea',
    placeholder: 'Meeting room, address, or virtual meeting link',
    condition: (data) => data['location.type'] !== 'phone'
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Meeting agenda, notes, or additional details'
  }
]

export const eventModalFields: FormField[] = [
  {
    name: 'title',
    label: 'Event Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., Summer Music Festival, Product Launch'
  },
  {
    name: 'eventType',
    label: 'Event Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Conference', value: 'conference' },
      { label: 'Workshop', value: 'workshop' },
      { label: 'Webinar', value: 'webinar' },
      { label: 'Networking', value: 'networking' },
      { label: 'Concert/Performance', value: 'performance' },
      { label: 'Class', value: 'class' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'startDateTime',
    label: 'Start Date & Time',
    type: 'datetime',
    required: true
  },
  {
    name: 'endDateTime',
    label: 'End Date & Time',
    type: 'datetime',
    required: true
  },
  {
    name: 'location.type',
    label: 'Location Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Virtual', value: 'virtual' },
      { label: 'Venue', value: 'venue' },
      { label: 'Outdoor', value: 'outdoor' }
    ]
  },
  {
    name: 'location.venue',
    label: 'Venue Name',
    type: 'text',
    condition: (data) => data['location.type'] === 'venue'
  },
  {
    name: 'location.address',
    label: 'Address',
    type: 'textarea',
    condition: (data) => ['venue', 'outdoor'].includes(data['location.type'])
  },
  {
    name: 'capacity',
    label: 'Maximum Capacity',
    type: 'number',
    min: 1,
    placeholder: 'Maximum number of attendees'
  },
  {
    name: 'description',
    label: 'Event Description',
    type: 'textarea',
    placeholder: 'Describe your event, agenda, speakers, etc.'
  },
  {
    name: 'isPublic',
    label: 'Public Event',
    type: 'checkbox',
    defaultValue: true,
    description: 'Allow public registration and discovery'
  }
]

export const taskModalFields: FormField[] = [
  {
    name: 'title',
    label: 'Task Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., Update website content, Call client'
  },
  {
    name: 'project',
    label: 'Project',
    type: 'select',
    placeholder: 'Link to a project (optional)',
    options: [
      // TODO: Dynamically populate from projects API
      { label: 'Website Redesign', value: 'website-redesign' },
      { label: 'Mobile App Development', value: 'mobile-app' },
      { label: 'Marketing Campaign', value: 'marketing-campaign' },
      { label: 'E-commerce Platform', value: 'ecommerce-platform' }
    ]
  },
  {
    name: 'assignedTo',
    label: 'Assign To',
    type: 'select',
    placeholder: 'Assign to team member (optional)',
    options: [
      // TODO: Dynamically populate from users API
      { label: 'John Doe', value: 'john-doe' },
      { label: 'Jane Smith', value: 'jane-smith' },
      { label: 'Mike Johnson', value: 'mike-johnson' }
    ]
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    defaultValue: 'medium',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Urgent', value: 'urgent' }
    ]
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    defaultValue: 'todo',
    options: [
      { label: 'To Do', value: 'todo' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Review', value: 'review' },
      { label: 'Completed', value: 'completed' }
    ]
  },
  {
    name: 'dueDate',
    label: 'Due Date',
    type: 'date'
  },
  {
    name: 'estimatedHours',
    label: 'Estimated Hours',
    type: 'number',
    min: 0.25,
    max: 40,
    placeholder: 'How long will this take?'
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'Development', value: 'development' },
      { label: 'Design', value: 'design' },
      { label: 'Marketing', value: 'marketing' },
      { label: 'Sales', value: 'sales' },
      { label: 'Support', value: 'support' },
      { label: 'Admin', value: 'admin' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Task details, requirements, notes...'
  }
]

export const projectModalFields: FormField[] = [
  {
    name: 'title',
    label: 'Project Title',
    type: 'text',
    required: true,
    placeholder: 'e.g., Website Redesign, Mobile App Development'
  },
  {
    name: 'projectType',
    label: 'Project Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Development', value: 'development' },
      { label: 'Design', value: 'design' },
      { label: 'Marketing Campaign', value: 'marketing' },
      { label: 'Research', value: 'research' },
      { label: 'Operations', value: 'operations' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
    required: true
  },
  {
    name: 'targetEndDate',
    label: 'Target End Date',
    type: 'date'
  },
  {
    name: 'budget',
    label: 'Budget',
    type: 'number',
    min: 0,
    placeholder: 'Project budget in USD'
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    defaultValue: 'medium',
    options: [
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
      { label: 'Critical', value: 'critical' }
    ]
  },
  {
    name: 'description',
    label: 'Project Description',
    type: 'textarea',
    placeholder: 'Project goals, scope, requirements...'
  }
]
