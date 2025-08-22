import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { seed } from '@/endpoints/seed'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    // Check if user is authenticated and has admin permissions
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin permissions (simplified role check)
    const userWithRoles = user as any
    if (!userWithRoles.globalRole || (userWithRoles.globalRole !== 'super_admin' && userWithRoles.globalRole !== 'platform_admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const {
      mode = 'additive',  // 'additive', 'reset', 'clean'
      tenant = 'kendevco',
      force = false
    } = body

    // Safety check for production
    if (process.env.NODE_ENV === 'production' && (mode === 'reset' || mode === 'clean') && !force) {
      return NextResponse.json({
        error: 'Database reset in production requires force flag',
        message: 'Use { "force": true } to reset database in production'
      }, { status: 400 })
    }

    payload.logger.info(`🔄 ${mode.toUpperCase()} operation requested by ${user.email}`)
    payload.logger.info(`   Mode: ${mode}`)
    payload.logger.info(`   Tenant: ${tenant}`)
    payload.logger.info(`   Environment: ${process.env.NODE_ENV}`)

    // Set environment variables for the seed function based on mode
    const originalSeedClean = process.env.SEED_CLEAN
    const originalSeedTenant = process.env.SEED_TENANT

    // Configure operation mode
    if (mode === 'reset' || mode === 'clean') {
      process.env.SEED_CLEAN = 'true'
    } else {
      // Additive mode - don't clean
      delete process.env.SEED_CLEAN
    }

    process.env.SEED_TENANT = tenant

    try {
      let operationDescription = ''

      switch (mode) {
        case 'additive':
          operationDescription = 'Added new content preserving existing data'
          payload.logger.info('🌱 Running ADDITIVE seed - preserving existing data')
          break
        case 'reset':
          operationDescription = 'Complete database reset with fresh tenant data'
          payload.logger.info('🗑️ Running DATABASE RESET - removing all tenant data')
          break
        case 'clean':
          operationDescription = 'Clean reseed with fresh data'
          payload.logger.info('🧹 Running CLEAN reseed - removing existing tenant data')
          break
        default:
          throw new Error(`Invalid mode: ${mode}. Use 'additive', 'reset', or 'clean'`)
      }

      // Run the seed function
      await seed({
        payload,
        req: {
          user,
          payload,
          t: (key: string) => key,
          locale: 'en',
        } as any
      })

      payload.logger.info(`✅ ${mode.toUpperCase()} operation completed successfully`)

      return NextResponse.json({
        success: true,
        mode,
        message: operationDescription,
        tenant,
        timestamp: new Date().toISOString(),
        user: user.email,
        environment: process.env.NODE_ENV,
        details: {
          operation: mode,
          preservedExistingData: mode === 'additive',
          tenantTemplate: tenant,
          isProduction: process.env.NODE_ENV === 'production'
        }
      })

    } finally {
      // Restore original environment variables
      if (originalSeedClean !== undefined) {
        process.env.SEED_CLEAN = originalSeedClean
      } else {
        delete process.env.SEED_CLEAN
      }

      if (originalSeedTenant !== undefined) {
        process.env.SEED_TENANT = originalSeedTenant
      } else {
        delete process.env.SEED_TENANT
      }
    }

  } catch (error) {
    console.error('Database operation error:', error)

    return NextResponse.json({
      error: 'Database operation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database Operations API',
    description: 'Supports both additive seeding and database reset operations',
    modes: {
      additive: {
        description: 'Add new content without removing existing data',
        usage: 'Iterative development, adding new features',
        safe: true
      },
      reset: {
        description: 'Complete database wipe and rebuild',
        usage: 'Major schema changes, onboarding iterations',
        destructive: true
      },
      clean: {
        description: 'Clean existing tenant data and reseed',
        usage: 'Refresh specific tenant content',
        destructive: true
      }
    },
    usage: {
      method: 'POST',
      body: {
        mode: 'string - operation mode: "additive", "reset", or "clean"',
        tenant: 'string - tenant template to use (default: kendevco)',
        force: 'boolean - required for destructive operations in production'
      },
      examples: {
        additive: '{ "mode": "additive", "tenant": "kendevco" }',
        reset: '{ "mode": "reset", "tenant": "kendevco" }',
        production_reset: '{ "mode": "reset", "tenant": "celersoft", "force": true }'
      }
    },
    ai_integration: {
      note: 'These tenant templates form the foundation for AI-powered client onboarding through the Spaces platform',
      templates: ['kendevco', 'celersoft', 'hayscactusfarm'],
      future_use: 'AI will use these templates to automatically onboard new clients with appropriate business context'
    }
  })
}
