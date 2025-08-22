'use client'

import React, { useState, useCallback } from 'react'
import { useAuth } from '@payloadcms/ui'
import LeoAIPanel from './LeoAIPanel'
import './styles.scss'

interface DashboardCardProps {
  title: string
  description: string
  count?: number
  href?: string
  icon: string
  color: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  count,
  href,
  icon,
  color,
  onClick,
  loading,
  disabled,
}) => {
  const isClickable = onClick || href
  const Component = href ? 'a' : 'div'

  return (
    <Component
      href={href}
      className={`dashboard-card dashboard-card--${color} ${isClickable ? 'dashboard-card--clickable' : ''} ${disabled ? 'dashboard-card--disabled' : ''}`}
      onClick={onClick}
      style={{ cursor: isClickable && !disabled ? 'pointer' : 'default' }}
    >
      <div className="dashboard-card__icon">
        <span className={`icon-${icon}`}>
          {loading ? '⏳' :
           icon === 'seed' ? '🌱' :
           icon === 'reset' ? '🗑️' :
           icon === 'templates' ? '⚙️' :
           icon === 'analytics' ? '📊' :
           icon === 'control' ? '🎛️' :
           icon === 'revenue' ? '💰' :
           icon === 'robot' ? '🤖' :
           icon === 'partnership' ? '🤝' :
           icon === 'social' ? '📱' :
           icon === 'ceo' ? '👔' :
           icon === 'chat' ? '💬' :
           icon === 'voice' ? '📞' :
           icon === 'building' ? '🏢' :
           icon === 'users' ? '👥' :
           icon === 'shield' ? '🛡️' :
           icon === 'team' ? '👨‍👩‍👧‍👦' :
           icon === 'space' ? '🌌' :
           icon === 'message' ? '💬' :
           icon === 'contact' ? '👤' :
           icon === 'calendar' ? '📅' :
           icon === 'package' ? '📦' :
           icon === 'shopping-cart' ? '🛒' :
           icon === 'tag' ? '🏷️' :
           icon === 'document' ? '📄' :
           icon === 'edit' ? '✏️' :
           icon === 'image' ? '🖼️' :
           icon === 'plus' ? '➕' :
           icon === 'user-plus' ? '👤➕' :
           icon === 'package-plus' ? '📦➕' :
           icon === 'calendar-plus' ? '📅➕' :
           icon === 'docs' ? '📚' :
           icon === 'globe' ? '🌐' :
           icon === 'settings' ? '⚙️' :
           icon === 'hub' ? '🔗' :
           icon === 'truck' ? '🚛' : '📋'}
        </span>
      </div>
      <div className="dashboard-card__content">
        <h3>{title}</h3>
        <p>{description}</p>
        {count !== undefined && (
          <div className="dashboard-card__count">{count} items</div>
        )}
        {loading && <div className="dashboard-card__loading">Processing...</div>}
      </div>
      {!onClick && <div className="dashboard-card__arrow">→</div>}
    </Component>
  )
}

interface DashboardSectionProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => (
  <section className={`dashboard-section ${className}`}>
    <div className="dashboard-section__header">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    <div className="dashboard-section__content">
      {children}
    </div>
  </section>
)

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [seedLoading, setSeedLoading] = useState(false)
  const [templateExpanded, setTemplateExpanded] = useState(false)

  const isSuper = user?.globalRole === 'super_admin'
  const isPlatformAdmin = user?.globalRole === 'platform_admin'
  const isTenantAdmin = user?.role === 'tenant-admin'

  const handleSeedOperation = useCallback(
    async (mode: 'additive' | 'reset' | 'clean', tenant: string = 'kendevco') => {
      if (seedLoading) return

      // Confirm destructive operations
      if (mode === 'reset') {
        const confirmed = window.confirm(
          `⚠️ DATABASE RESET WARNING ⚠️\n\n` +
          `This will COMPLETELY WIPE the database and rebuild it from scratch.\n\n` +
          `• All existing data will be PERMANENTLY DELETED\n` +
          `• This is useful for major schema changes or onboarding iterations\n` +
          `• Consider backing up important data first\n\n` +
          `Are you sure you want to proceed with a complete database reset?`
        )
        if (!confirmed) return
      }

      setSeedLoading(true)

      try {
        const response = await fetch('/api/reseed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            mode,
            tenant,
            force: false
          })
        })

        if (response.ok) {
          const result = await response.json()
          alert(`✅ ${mode === 'additive' ? 'Content added' : 'Database reset'} successfully! You can now visit your website.`)
          console.log('Database operation result:', result)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to ${mode} database`)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        alert(`❌ Database operation failed: ${errorMessage}`)
      } finally {
        setSeedLoading(false)
      }
    },
    [seedLoading]
  )

  return (
    <div className="admin-dashboard">
      <LeoAIPanel />
      <div className="admin-dashboard__header">
        <h1>Spaces Commerce Platform</h1>
        <p className="admin-dashboard__subtitle">
          Welcome back, {user?.firstName || user?.name || user?.email}
        </p>
        <div className="admin-dashboard__role-badge">
          {user?.globalRole === 'super_admin' && (
            <span className="role-badge role-badge--super">Super Admin</span>
          )}
          {user?.globalRole === 'platform_admin' && (
            <span className="role-badge role-badge--platform">Platform Admin</span>
          )}
          {user?.role === 'tenant-admin' && (
            <span className="role-badge role-badge--tenant">Tenant Admin</span>
          )}
        </div>
      </div>

      {/* Development Tools - Available to Admins */}
      {(isSuper || isPlatformAdmin) && (
        <DashboardSection
          title="Development Tools"
          description="Database seeding, tenant templates, and development utilities"
          className="dashboard-section--development"
        >
          <div className="dashboard-grid">
            <DashboardCard
              title="🌱 Add Content"
              description="Safe additive operation - preserves existing data and adds new content"
              icon="seed"
              color="green"
              onClick={() => handleSeedOperation('additive', 'kendevco')}
              loading={seedLoading}
              disabled={seedLoading}
            />
            <DashboardCard
              title="🗑️ Reset Database"
              description="Complete database wipe and rebuild - DESTRUCTIVE operation"
              icon="reset"
              color="red"
              onClick={() => handleSeedOperation('reset', 'kendevco')}
              loading={seedLoading}
              disabled={seedLoading}
            />
            <DashboardCard
              title="⚙️ Tenant Templates"
              description="Business templates for AI-powered client onboarding"
              icon="templates"
              color="blue"
              onClick={() => setTemplateExpanded(!templateExpanded)}
              disabled={seedLoading}
            />
            <DashboardCard
              title="📊 Revenue Analytics"
              description="Partnership revenue sharing and commission tracking"
              icon="analytics"
              color="purple"
              href="/admin/collections/tenants"
            />
          </div>

          {/* Expanded Template Options */}
          {templateExpanded && (
            <div className="dashboard-grid dashboard-grid--templates mt-5 pt-5 border-t border-gray-200">
              <DashboardCard
                title="🏢 KenDev.Co"
                description="AI Automation & Implementation Agency template"
                icon="seed"
                color="blue"
                onClick={() => handleSeedOperation('additive', 'kendevco')}
                loading={seedLoading}
                disabled={seedLoading}
              />
              <DashboardCard
                title="💼 Celersoft"
                description="Enterprise Software Development template"
                icon="seed"
                color="indigo"
                onClick={() => handleSeedOperation('additive', 'celersoft')}
                loading={seedLoading}
                disabled={seedLoading}
              />
              <DashboardCard
                title="🌵 Hays Cactus Farm"
                description="Agricultural/Retail Business template"
                icon="seed"
                color="green"
                onClick={() => handleSeedOperation('additive', 'hayscactusfarm')}
                loading={seedLoading}
                disabled={seedLoading}
              />
              <DashboardCard
                title="🔄 Reset Templates"
                description="Choose a template for complete database reset"
                icon="reset"
                color="orange"
                onClick={() => {
                  const template = prompt('Enter template (kendevco, celersoft, hayscactusfarm):')
                  if (template) handleSeedOperation('reset', template)
                }}
                loading={seedLoading}
                disabled={seedLoading}
              />
            </div>
          )}
        </DashboardSection>
      )}

      {/* Tenant Management Tools - Available to Tenant Admins and above */}
      {(isSuper || isPlatformAdmin || isTenantAdmin) && (
        <DashboardSection
          title="Tenant Management"
          description="Business administration, revenue tracking, and partnership management"
          className="dashboard-section--tenant"
        >
          <div className="dashboard-grid">
            {(isSuper || isPlatformAdmin) && (
              <DashboardCard
                title="Tenant Control Panel"
                description="Provision and manage tenant configurations"
                href="/tenant-control"
                icon="control"
                color="blue"
              />
            )}
            <DashboardCard
              title="Revenue Dashboard"
              description="Track partnership revenue, commissions, and analytics"
              href="/api/revenue-analytics"
              icon="revenue"
              color="green"
            />
            <DashboardCard
              title="Business Agent"
              description="AI-powered business automation and content generation"
              href="/api/business-agent"
              icon="robot"
              color="purple"
            />
            <DashboardCard
              title="Partnership Settings"
              description="Manage revenue sharing rates and referral programs"
              href="/admin/collections/tenants"
              icon="partnership"
              color="orange"
            />
          </div>
        </DashboardSection>
      )}

      {/* AI & Automation Tools - Shell for Future Implementation */}
      {(isSuper || isPlatformAdmin || isTenantAdmin) && (
        <DashboardSection
          title="AI & Automation"
          description="Social media bots and automated customer engagement (Collections Only)"
          className="dashboard-section--ai"
        >
          <div className="dashboard-grid">
            <DashboardCard
              title="Social Media Bots"
              description="AI bots configuration and management"
              href="/admin/collections/social-media-bots"
              icon="social"
              color="cyan"
            />
            <DashboardCard
              title="Web Chat Sessions"
              description="Monitor live chat sessions and analytics"
              href="/admin/collections/web-chat-sessions"
              icon="chat"
              color="teal"
            />
            {/* Shells for future implementation */}
            <DashboardCard
              title="AI Generation Queue"
              description="Background AI task processing"
              href="/admin/collections/ai-generation-queue"
              icon="robot"
              color="purple"
            />
          </div>
        </DashboardSection>
      )}

      {/* Integration Hub - Available to all admins */}
      {(isSuper || isPlatformAdmin || isTenantAdmin) && (
        <DashboardSection
          title="Integration Hub"
          description="Connect integrations and manage organizations"
          className="dashboard-section--integrations"
        >
          <div className="dashboard-grid">
            <DashboardCard
              title="🔗 Integration Hub"
              description="Connect third-party services and APIs"
              href="/integrations"
              icon="hub"
              color="blue"
            />
            <DashboardCard
              title="Organizations"
              description="Manage multi-location organizations"
              href="/admin/collections/organizations"
              icon="building"
              color="purple"
            />
            <DashboardCard
              title="Venues"
              description="Individual location management"
              href="/admin/collections/venues"
              icon="globe"
              color="teal"
            />
            <DashboardCard
              title="Workflows"
              description="Business process automation"
              href="/admin/collections/workflows"
              icon="settings"
              color="indigo"
            />
          </div>
        </DashboardSection>
      )}

      {/* Documentation Center - Available to all admins */}
      {(isSuper || isPlatformAdmin || isTenantAdmin) && (
        <DashboardSection
          title="Documentation & Resources"
          description="Platform documentation, guides, and resources"
          className="dashboard-section--docs"
        >
          <div className="dashboard-grid">
            <DashboardCard
              title="📚 Documentation Center"
              description="Browse, search, and view all platform documentation with integrated markdown viewer"
              href="/docs"
              icon="docs"
              color="slate"
            />
          </div>
        </DashboardSection>
      )}

      {/* Platform Management - Super Admin Only */}
      {isSuper && (
        <DashboardSection
          title="Platform Management"
          description="Core platform administration and tenant management"
          className="dashboard-section--platform"
        >
          <div className="dashboard-grid">
            <DashboardCard
              title="Tenants"
              description="Multi-tenant organizations and configurations"
              href="/admin/collections/tenants"
              icon="building"
              color="blue"
            />
          </div>
        </DashboardSection>
      )}

      {/* User Management */}
      {(isSuper || isPlatformAdmin || isTenantAdmin) && (
        <DashboardSection
          title="User Management"
          description="Users, memberships, and access control"
          className="dashboard-section--users"
        >
          <div className="dashboard-grid">
            <DashboardCard
              title="Users"
              description="Platform users with professional profiles"
              href="/admin/collections/users"
              icon="users"
              color="green"
            />
            <DashboardCard
              title="Tenant Memberships"
              description="User roles and permissions within tenants"
              href="/admin/collections/tenant-memberships"
              icon="shield"
              color="green"
            />
            <DashboardCard
              title="Space Memberships"
              description="User participation in collaboration spaces"
              href="/admin/collections/space-memberships"
              icon="team"
              color="green"
            />
          </div>
        </DashboardSection>
      )}

      {/* Collaboration */}
      <DashboardSection
        title="Collaboration"
        description="Spaces, messaging, and real-time communication"
        className="dashboard-section--collaboration"
      >
        <div className="dashboard-grid">
          <DashboardCard
            title="Spaces"
            description="Business collaboration spaces with monetization"
            href="/admin/collections/spaces"
            icon="space"
            color="purple"
          />
          <DashboardCard
            title="Messages"
            description="Real-time messaging with threading and reactions"
            href="/admin/collections/messages"
            icon="message"
            color="purple"
          />
        </div>
      </DashboardSection>



      {/* Business Operations */}
      <DashboardSection
        title="Business Operations"
        description="CRM, appointments, and customer management"
        className="dashboard-section--business"
      >
        <div className="dashboard-grid">
          <DashboardCard
            title="CRM Contacts"
            description="Lead management and sales pipeline"
            href="/admin/collections/contacts"
            icon="contact"
            color="orange"
          />
          <DashboardCard
            title="Appointments"
            description="Booking system with payments and recurrence"
            href="/admin/collections/appointments"
            icon="calendar"
            color="orange"
          />
          <DashboardCard
            title="Channel Management"
            description="Configure chat channels and routing rules"
            href="/admin/collections/channel-management"
            icon="settings"
            color="cyan"
          />
          <DashboardCard
            title="Documents"
            description="File and document management"
            href="/admin/collections/documents"
            icon="document"
            color="indigo"
          />
        </div>
      </DashboardSection>

      {/* Commerce */}
      <DashboardSection
        title="Commerce"
        description="Products, orders, and e-commerce functionality"
        className="dashboard-section--commerce"
      >
        <div className="dashboard-grid">
          <DashboardCard
            title="Products"
            description="Product catalog with variants and inventory"
            href="/admin/collections/products"
            icon="package"
            color="teal"
          />
          <DashboardCard
            title="Orders"
            description="Order management and fulfillment"
            href="/admin/collections/orders"
            icon="shopping-cart"
            color="teal"
          />
          <DashboardCard
            title="Categories"
            description="Product categorization and organization"
            href="/admin/collections/categories"
            icon="tag"
            color="teal"
          />
        </div>
      </DashboardSection>

      {/* Content Management */}
      <DashboardSection
        title="Content Management"
        description="Pages, posts, and media assets"
        className="dashboard-section--content"
      >
        <div className="dashboard-grid">
          <DashboardCard
            title="Pages"
            description="Website pages with flexible layouts"
            href="/admin/collections/pages"
            icon="document"
            color="indigo"
          />
          <DashboardCard
            title="Posts"
            description="Blog posts and articles"
            href="/admin/collections/posts"
            icon="edit"
            color="indigo"
          />
          <DashboardCard
            title="Media"
            description="Images and file assets"
            href="/admin/collections/media"
            icon="image"
            color="indigo"
          />
        </div>
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection
        title="Quick Actions"
        description="Common tasks and shortcuts"
        className="dashboard-section--actions"
      >
        <div className="dashboard-grid dashboard-grid--actions">
          <DashboardCard
            title="Create Space"
            description="Set up a new collaboration space"
            href="/admin/collections/spaces/create"
            icon="plus"
            color="green"
          />
          <DashboardCard
            title="Add User"
            description="Invite a new user to the platform"
            href="/admin/collections/users/create"
            icon="user-plus"
            color="blue"
          />
          <DashboardCard
            title="New Product"
            description="Add a product to the catalog"
            href="/admin/collections/products/create"
            icon="package-plus"
            color="teal"
          />
          <DashboardCard
            title="Schedule Appointment"
            description="Book a new appointment"
            href="/admin/collections/appointments/create"
            icon="calendar-plus"
            color="orange"
          />
        </div>
      </DashboardSection>

      {/* System Info */}
      <div className="admin-dashboard__footer">
        <div className="system-info">
          <h3>System Information</h3>
          <div className="system-info__grid">
            <div className="system-info__item">
              <strong>Platform Version:</strong> 1.0.0
            </div>
            <div className="system-info__item">
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </div>
            <div className="system-info__item">
              <strong>Your Role:</strong> {user?.globalRole || user?.role}
            </div>
            {user?.tenant && (
              <div className="system-info__item">
                <strong>Tenant:</strong> {typeof user.tenant === 'object' ? user.tenant.name : 'Unknown'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
