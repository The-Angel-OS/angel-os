'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

import './index.scss'

const SuccessMessage: React.FC<{ mode: string; tenant: string }> = ({ mode, tenant }) => (
  <div>
    {mode === 'additive' ? 'New content added' : 'Database reset'} successfully for {tenant}! You can now{' '}
    <button
      type="button"
      onClick={() => window.open('/', '_blank')}
      style={{
        textDecoration: 'underline',
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: 'pointer'
      }}
    >
      visit your website
    </button>
  </div>
)

export const SeedButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [showOptions, setShowOptions] = useState(false)

  const handleOperation = useCallback(
    async (mode: 'additive' | 'reset' | 'clean', tenant: string = 'kendevco') => {
      if (loading) {
        toast.info('Operation already in progress.')
        return
      }

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

      setLoading(true)
      setError(null)

      const endpoint = '/api/reseed'

      try {
        const response = await fetch(endpoint, {
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
          setSeeded(true)
          toast.success(<SuccessMessage mode={mode} tenant={tenant} />)
          console.log('Database operation result:', result)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to ${mode} database`)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(errorMessage)
        toast.error(`Database operation failed: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    },
    [loading]
  )

  const handleAdditive = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      handleOperation('additive', 'kendevco')
    },
    [handleOperation]
  )

  const handleReset = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      handleOperation('reset', 'kendevco')
    },
    [handleOperation]
  )

  const handleTenantOperation = useCallback(
    (mode: 'additive' | 'reset', tenant: string) => {
      handleOperation(mode, tenant)
      setShowOptions(false)
    },
    [handleOperation]
  )

  let message = ''
  if (loading) message = ' (processing...)'
  if (seeded) message = ' (done!)'
  if (error) message = ` (error: ${error})`

  return (
    <Fragment>
      <div className="seedButton-container">
        <button
          className="seedButton seedButton--additive"
          onClick={handleAdditive}
          disabled={loading}
          title="Add new content without removing existing data - safe for iterative development"
        >
          {seeded ? '✅ Add Content' : '🌱 Add Content'}
        </button>

        <button
          className="seedButton seedButton--reset"
          onClick={handleReset}
          disabled={loading}
          title="⚠️ Complete database wipe and rebuild - for major changes"
        >
          🗑️ Reset Database
        </button>

        <button
          className="seedButton seedButton--options"
          onClick={() => setShowOptions(!showOptions)}
          disabled={loading}
          title="Show tenant templates and advanced options"
        >
          ⚙️ Templates
        </button>
      </div>

      {showOptions && (
        <div className="seedButton-options">
          <div className="seedButton-section">
            <h6>🏢 Tenant Templates (AI Onboarding Foundation):</h6>
            <p className="seedButton-ai-note">
              <strong>Note:</strong> These templates will power your AI-driven client onboarding through the Spaces platform.
            </p>
            <div className="seedButton-tenant-grid">
              <div className="seedButton-tenant-card">
                <h6>🏢 KenDev.Co</h6>
                <small>AI Automation & Implementation Agency</small>
                <div className="seedButton-tenant-actions">
                  <button
                    onClick={() => handleTenantOperation('additive', 'kendevco')}
                    disabled={loading}
                    className="seedButton-tenant-action seedButton-tenant-action--additive"
                    title="Add KenDev.Co content"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => handleTenantOperation('reset', 'kendevco')}
                    disabled={loading}
                    className="seedButton-tenant-action seedButton-tenant-action--reset"
                    title="Reset with KenDev.Co template"
                  >
                    🗑️ Reset
                  </button>
                </div>
              </div>

              <div className="seedButton-tenant-card">
                <h6>💼 Celersoft</h6>
                <small>Enterprise Software Development</small>
                <div className="seedButton-tenant-actions">
                  <button
                    onClick={() => handleTenantOperation('additive', 'celersoft')}
                    disabled={loading}
                    className="seedButton-tenant-action seedButton-tenant-action--additive"
                    title="Add Celersoft content"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => handleTenantOperation('reset', 'celersoft')}
                    disabled={loading}
                    className="seedButton-tenant-action seedButton-tenant-action--reset"
                    title="Reset with Celersoft template"
                  >
                    🗑️ Reset
                  </button>
                </div>
              </div>

              <div className="seedButton-tenant-card">
                <h6>🌵 Hays Cactus Farm</h6>
                <small>Agricultural/Retail Business</small>
                <div className="seedButton-tenant-actions">
                  <button
                    onClick={() => handleTenantOperation('additive', 'hayscactusfarm')}
                    disabled={loading}
                    className="seedButton-tenant-action seedButton-tenant-action--additive"
                    title="Add Hays Cactus Farm content"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => handleTenantOperation('reset', 'hayscactusfarm')}
                    disabled={loading}
                    className="seedButton-tenant-action seedButton-tenant-action--reset"
                    title="Reset with Hays Cactus Farm template"
                  >
                    🗑️ Reset
      </button>
                </div>
              </div>
            </div>
          </div>

          <div className="seedButton-section">
            <h6>🤖 AI Integration Context:</h6>
            <div className="seedButton-ai-context">
              <p><strong>Spaces Platform AI:</strong> These tenant templates form the foundation for your AI-powered client onboarding system.</p>
              <ul>
                <li><strong>Additive Operations:</strong> Perfect for iterative development and adding new Spaces features</li>
                <li><strong>Reset Operations:</strong> Essential for testing complete onboarding flows and major schema changes</li>
                <li><strong>Template System:</strong> Each template includes business-specific services, content, and branding that the AI will use for automatic client setup</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {message && <span className="seedButton-message">{message}</span>}
    </Fragment>
  )
}
