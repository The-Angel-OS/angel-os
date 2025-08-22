import React from 'react'
import { Metadata } from 'next'
import IntegrationHub from '@/components/IntegrationHub'

export const metadata: Metadata = {
  title: 'Integration Hub | Spaces Commerce',
  description: 'Connect your favorite tools and automate your workflow with our comprehensive integration hub.',
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <IntegrationHub />
      </div>
    </div>
  )
}
