'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type FieldConfig = {
  label?: string
  placeholder?: string
  description?: string
  className?: string
  inputProps?: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  fieldType?: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'custom'
  options?: Array<{ label: string; value: string; description?: string }>
  render?: (field: any) => React.ReactNode
}

type AutoFormProps<T extends z.ZodObject<any>> = {
  schema: T
  onSubmit: (data: z.infer<T>) => void | Promise<void>
  fieldConfig?: Record<string, FieldConfig>
  className?: string
  withSubmit?: boolean
  submitText?: string
  children?: React.ReactNode
}

export function AutoForm<T extends z.ZodObject<any>>({
  schema,
  onSubmit,
  fieldConfig = {},
  className = '',
  withSubmit = true,
  submitText = 'Submit',
  children,
}: AutoFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: getDefaultValues(schema),
  })

  const handleSubmit = async (data: z.infer<T>) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fields = getFieldsFromSchema(schema)

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-4 ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className="space-y-1">
          {renderField(field, form, fieldConfig[field.name])}
        </div>
      ))}

      {children}

      {withSubmit && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
      )}
    </form>
  )
}

function getDefaultValues(schema: z.ZodObject<any>): any {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const defaults: any = {}

    for (const [key, value] of Object.entries(shape)) {
      if (value instanceof z.ZodDefault) {
        defaults[key] = (value._def.defaultValue as any)()
      } else if (value instanceof z.ZodOptional) {
        // Skip optional fields
      } else if (value instanceof z.ZodEnum) {
        defaults[key] = value.options[0]
      } else if (value instanceof z.ZodBoolean) {
        defaults[key] = false
      } else if (value instanceof z.ZodNumber) {
        defaults[key] = 0
      } else if (value instanceof z.ZodString) {
        defaults[key] = ''
      } else if (value instanceof z.ZodArray) {
        defaults[key] = []
      }
    }

    return defaults
  }

  return {}
}

function getFieldsFromSchema(schema: z.ZodObject<any>): Array<{ name: string; type: string; schema: any }> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    return Object.entries(shape).map(([name, fieldSchema]) => ({
      name,
      type: getFieldType(fieldSchema),
      schema: fieldSchema,
    }))
  }

  return []
}

function getFieldType(schema: any): string {
  if (schema instanceof z.ZodOptional) {
    return getFieldType(schema.unwrap())
  }

  if (schema instanceof z.ZodDefault) {
    return getFieldType(schema._def.innerType)
  }

  if (schema instanceof z.ZodString) {
    const checks = (schema as any)._def.checks || []
    if (checks.some((c: any) => c.kind === 'email')) return 'email'
    if (checks.some((c: any) => c.kind === 'url')) return 'url'
    return 'text'
  }

  if (schema instanceof z.ZodNumber) return 'number'
  if (schema instanceof z.ZodBoolean) return 'checkbox'
  if (schema instanceof z.ZodDate) return 'date'
  if (schema instanceof z.ZodEnum) return 'select'
  if (schema instanceof z.ZodArray) return 'array'
  if (schema instanceof z.ZodObject) return 'object'

  return 'text'
}

function renderField(
  field: { name: string; type: string; schema: any },
  form: any,
  config?: FieldConfig
) {
  const { register, formState: { errors } } = form
  const error = errors[field.name]

  // Custom renderer
  if (config?.render) {
    return config.render({ ...field, register, error })
  }

  const label = config?.label || field.name.charAt(0).toUpperCase() + field.name.slice(1).replace(/([A-Z])/g, ' $1')
  const fieldType = config?.fieldType || field.type

  return (
    <>
      <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
        {label}
        {field.schema instanceof z.ZodOptional && <span className="text-gray-400 ml-1">(optional)</span>}
      </label>

      {config?.description && (
        <p className="text-xs text-gray-500">{config.description}</p>
      )}

      {fieldType === 'textarea' ? (
        <textarea
          id={field.name}
          {...register(field.name)}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${config?.className || ''}`}
          placeholder={config?.placeholder}
          {...config?.inputProps}
        />
      ) : fieldType === 'select' && field.schema instanceof z.ZodEnum ? (
        <select
          id={field.name}
          {...register(field.name)}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${config?.className || ''}`}
          {...config?.inputProps}
        >
          {config?.options ? (
            config.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          ) : (
            (field.schema.options || []).map((opt: any, index: number) => (
              <option key={index} value={String(opt)}>
                {String(opt).charAt(0).toUpperCase() + String(opt).slice(1)}
              </option>
            ))
          )}
        </select>
      ) : fieldType === 'checkbox' ? (
        <div className="flex items-center">
          <input
            id={field.name}
            type="checkbox"
            {...register(field.name)}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${config?.className || ''}`}
            {...config?.inputProps}
          />
          <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">
            {config?.placeholder || label}
          </label>
        </div>
      ) : (
        <input
          id={field.name}
          type={field.type}
          {...register(field.name)}
          className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'} ${config?.className || ''}`}
          placeholder={config?.placeholder}
          {...config?.inputProps}
        />
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1">{error.message}</p>
      )}
    </>
  )
}
