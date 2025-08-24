'use client'

import React from 'react'
import Link from 'next/link'
import { useTenant } from '@/app/dashboard/_hooks/useTenant'
import './styles.scss'

export const AdminNav: React.FC = () => {
  const { tenant, loading, error } = useTenant()

  if (loading) {
    return (
      <div className="admin-nav">
        <div className="admin-nav__loading">
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-nav">
        <div className="admin-nav__error">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-nav">
      {/* Current Tenant Display */}
      <div className="admin-nav__section">
        <div className="admin-nav__label">Current Tenant</div>
        <div className="admin-nav__current-tenant">
          {tenant?.name || 'No tenant selected'}
        </div>
      </div>

      {/* Quick Links */}
      <div className="admin-nav__section">
        <div className="admin-nav__label">Quick Links</div>
        <div className="admin-nav__links">
          <Link href="/" className="admin-nav__link">
            <span className="admin-nav__link-icon">🏠</span>
            Home
          </Link>
          <Link href="/dashboard" className="admin-nav__link">
            <span className="admin-nav__link-icon">📊</span>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminNav
