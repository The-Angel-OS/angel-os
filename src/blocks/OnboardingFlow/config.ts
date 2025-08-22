import type { Block } from 'payload'

export const OnboardingFlow: Block = {
  slug: 'onboardingFlow',
  interfaceName: 'OnboardingFlowBlock',
  labels: {
    singular: 'Onboarding Flow',
    plural: 'Onboarding Flows',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Welcome to Angel OS',
      admin: {
        description: 'Main heading for the onboarding flow',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      defaultValue: "Let's set up your workspace in just a few steps",
      admin: {
        description: 'Subtitle text displayed below the main heading',
      },
    },
    {
      name: 'redirectUrl',
      type: 'text',
      defaultValue: '/dashboard',
      admin: {
        description: 'URL to redirect to after successful onboarding',
      },
    },
    {
      name: 'customization',
      type: 'group',
      // dbName: 'custom', // Removed - not supported for group fields
      label: 'Customization Options',
      fields: [
        {
          name: 'backgroundColor',
          type: 'select',
          dbName: 'bg_color',
          defaultValue: 'blue-gradient',
          options: [
            { label: 'Blue Gradient', value: 'blue-gradient' },
            { label: 'Purple Gradient', value: 'purple-gradient' },
            { label: 'Green Gradient', value: 'green-gradient' },
            { label: 'Custom', value: 'custom' },
          ],
          admin: {
            description: 'Background style for the onboarding flow',
          },
        },
        {
          name: 'enableAnalytics',
          type: 'checkbox',
          // dbName: 'analytics', // Removed - may not be supported for checkbox fields
          defaultValue: true,
          admin: {
            description: 'Track onboarding completion and step analytics',
          },
        },
        {
          name: 'requiredSteps',
          type: 'select',
          dbName: 'steps',
          hasMany: true,
          defaultValue: ['interests', 'workStyle', 'accountType', 'businessInfo'],
          options: [
            { label: 'Interest Selection', value: 'interests' },
            { label: 'Work Style', value: 'workStyle' },
            { label: 'Account Type', value: 'accountType' },
            { label: 'Business Information', value: 'businessInfo' },
          ],
          admin: {
            description: 'Which steps to include in the onboarding flow',
          },
        },
      ],
    },
    {
      name: 'integration',
      type: 'group',
      label: 'Integration Settings',
      fields: [
        {
          name: 'tenantTemplate',
          type: 'select',
          dbName: 'template',
          defaultValue: 'auto',
          options: [
            { label: 'Auto-detect from interests', value: 'auto' },
            { label: 'Service Business', value: 'service' },
            { label: 'Retail/E-commerce', value: 'retail' },
            { label: 'Content Creator', value: 'creator' },
            { label: 'Non-profit', value: 'nonprofit' },
          ],
          admin: {
            description: 'Default tenant template to use',
          },
        },
        {
          name: 'autoProvision',
          type: 'checkbox',
          // dbName: 'auto_prov', // Removed - may not be supported for checkbox fields
          defaultValue: true,
          admin: {
            description: 'Automatically provision tenant workspace on completion',
          },
        },
        {
          name: 'notificationEmail',
          type: 'email',
          // dbName: 'notify_email', // Removed - may not be supported for email fields
          admin: {
            description: 'Email to notify when new tenant is created (optional)',
          },
        },
      ],
    },
  ],
}
