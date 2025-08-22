import type { CollectionConfig } from 'payload'

const MileageLogs: CollectionConfig = {
  slug: 'mileage-logs',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'vehicle',
    defaultColumns: ['vehicle', 'odometerReading', 'location', 'date', 'type'],
    group: 'Business',
  },
  fields: [
    {
      name: 'tenantId',
      type: 'text',
      required: true,
    },
    {
      name: 'odometerReading',
      type: 'number',
      required: true,
    },
    {
      name: 'vehicle',
      type: 'text',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      required: true,
    },
    {
      name: 'date',
      type: 'date',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Business', value: 'business' },
        { label: 'Personal', value: 'personal' },
      ],
    },
    {
      name: 'purpose',
      type: 'textarea',
    },
    {
      name: 'photos',
      type: 'array',
      fields: [
        {
          name: 'filename',
          type: 'text',
        },
      ],
    },
    {
      name: 'miles',
      type: 'number',
    },
    {
      name: 'rate',
      type: 'number',
      admin: {
        description: 'IRS mileage rate (e.g., 0.655 for 2023)',
      },
    },
    {
      name: 'deduction',
      type: 'number',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.miles && data.rate) {
          data.deduction = data.miles * data.rate
        }
        return data
      },
    ],
  },
}

export default MileageLogs 