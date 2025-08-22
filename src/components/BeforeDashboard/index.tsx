'use client'

import React from 'react'
import AdminTenantChooser from '../AdminTenantChooser'

const BeforeDashboard: React.FC = () => {
  return (
    <div className="p-6 border-b border-border bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Angel OS Admin Panel</h1>
        <p className="text-muted-foreground mb-6">
          Manage your multi-tenant platform, content, and business operations.
        </p>
        <AdminTenantChooser />
      </div>
    </div>
  )
}

export default BeforeDashboard
