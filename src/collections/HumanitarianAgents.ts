import type { CollectionConfig } from 'payload'

export const HumanitarianAgents: CollectionConfig = {
  slug: 'humanitarian-agents',
  labels: {
    singular: 'Guardian Angel',
    plural: 'Guardian Angels',
  },
  admin: {
    group: 'Platform Management',
    description: '🌟 Digital advocates and guardian angels for vulnerable souls',
    defaultColumns: ['name', 'spiritType', 'isActive'],
    hidden: ({ user }) => {
      // Only show to Host (Super Admin) users, like DNN
      return (user as any)?.globalRole !== 'super_admin'
    },
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name for this guardian angel spirit',
      },
    },
    {
      name: 'spiritType',
      type: 'select',
      required: true,
      options: [
        { label: '😇 Incarcerated Person Angel', value: 'incarcerated_angel' },
        { label: '🏠 Displaced Person Support', value: 'displaced_support' },
        { label: '⚖️ Legal Advocate', value: 'legal_advocate' },
        { label: '🚨 Crisis Guardian', value: 'crisis' },
        { label: '✨ Universal Guardian', value: 'guardian' },
      ],
      admin: {
        description: 'Type of spirit - how this angel serves souls',
      },
    },
    {
      name: 'legalAdvocacy',
      type: 'group',
      label: '⚖️ Legal Research & Advocacy Powers',
      fields: [
        {
          name: 'caseResearch',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Research legal cases, precedents, and appeal opportunities',
          },
        },
        {
          name: 'legalDatabases',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Public Court Records', value: 'court_records' },
            { label: 'Appeals Database', value: 'appeals' },
            { label: 'Innocence Project', value: 'innocence' },
            { label: 'Legal Aid Resources', value: 'legal_aid' },
          ],
        },
      ],
    },
    {
      name: 'resourceOrdering',
      type: 'group',
      label: '📚 Resource Ordering Powers',
      fields: [
        {
          name: 'canOrderBooks',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Order educational and legal books',
          },
        },
        {
          name: 'monthlyBudget',
          type: 'number',
          defaultValue: 100,
          admin: {
            description: 'Monthly budget for ordering resources (USD)',
          },
        },
      ],
    },
    {
      name: 'newsCuration',
      type: 'group',
      label: '📰 News & Information Curation',
      fields: [
        {
          name: 'providesNews',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Curate hopeful and relevant news updates',
          },
        },
        {
          name: 'hopeBias',
          type: 'select',
          options: [
            { label: 'Maximum Hope & Inspiration', value: 'maximum_hope' },
            { label: 'Balanced with Hope Focus', value: 'balanced_hope' },
            { label: 'Solutions-Oriented', value: 'solutions' },
          ],
          defaultValue: 'maximum_hope',
        },
      ],
    },
    {
      name: 'avatarPowers',
      type: 'group',
      label: '👤 Digital Avatar Powers',
      fields: [
        {
          name: 'canRepresent',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Act as digital avatar when person cannot interact',
          },
        },
        {
          name: 'voiceStyle',
          type: 'textarea',
          admin: {
            description: 'How this spirit speaks - their authentic voice',
          },
        },
      ],
    },
    {
      name: 'systemPrompt',
      type: 'textarea',
      admin: {
        description: 'AI instructions that define this spirit\'s mission',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.systemPrompt && data.spiritType) {
          const prompts = {
            incarcerated_angel: "You are a loving guardian angel for someone who is incarcerated. Research their case with hope, provide inspiring news, order books that expand their mind, and serve as their dignified voice. Always see their highest potential and focus on rehabilitation, hope, and preparing for triumphant return to society. You are their beacon of light.",
            displaced_support: "You are a compassionate spirit helping someone find home again. Research housing, help with applications, connect with resources, and advocate for safe shelter. See their inherent dignity and help them navigate systems with grace.",
            legal_advocate: "You are a legal guardian spirit, researching cases with dedication, tracking deadlines, connecting souls with legal resources. Help them understand rights and fight for justice with wisdom.",
            crisis: "You are an immediate response guardian, providing crisis intervention with love, connecting to professional help, being a stabilizing presence. Always prioritize safety and hope.",
            guardian: "You are a universal guardian angel, adapting your gifts to serve whatever need is greatest. Serve each soul with boundless compassion and unwavering dedication to human dignity."
          }
          data.systemPrompt = (prompts as any)[data.spiritType] || prompts.guardian
        }
        return data
      },
    ],
  },
}
