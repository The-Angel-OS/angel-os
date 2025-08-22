import type { CollectionConfig } from 'payload'

const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'formId',
    defaultColumns: ['formId', 'formType', 'status', 'submittedAt'],
    group: 'Forms',
  },
  fields: [
    {
      name: 'formId',
      type: 'text',
      required: true,
    },
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        { label: 'Quote Request', value: 'quote' },
        { label: 'Booking', value: 'booking' },
        { label: 'Payment', value: 'payment' },
        { label: 'Signature', value: 'signature' },
        { label: 'Poll', value: 'poll' },
        { label: 'Survey', value: 'survey' },
      ],
    },
    {
      name: 'conversationId',
      type: 'text',
      required: true,
    },
    {
      name: 'guardianAngelId',
      type: 'text',
      required: true,
    },
    {
      name: 'submissionData',
      type: 'json',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'processingNotes',
      type: 'textarea',
    },
  ],
}

export default FormSubmissions 