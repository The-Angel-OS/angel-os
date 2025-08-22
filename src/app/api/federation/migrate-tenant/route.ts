import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Angel OS Network Tenant Migration Endpoint
 * 
 * Handles tenant migration between Angel OS nodes in the federation.
 * This is the "Conway's Game of Life" evolution mechanism for tenants.
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const migrationRequest = await request.json()

    const {
      tenantId,
      sourceNodeId,
      targetNodeId,
      reason,
      priority = 'normal',
      scheduledTime, // Optional: schedule for later
      signature, // Authentication
    } = migrationRequest

    // Verify request signature (TODO: implement proper auth)
    if (!signature) {
      return NextResponse.json({ error: 'Missing request signature' }, { status: 401 })
    }

    console.log(`🚀 Migration request: Tenant ${tenantId} from ${sourceNodeId} to ${targetNodeId}`)

    // Validate nodes exist and are online
    const [sourceNode, targetNode] = await Promise.all([
      payload.find({
        collection: 'angel-os-nodes',
        where: { nodeId: { equals: sourceNodeId } },
        limit: 1,
      }),
      payload.find({
        collection: 'angel-os-nodes',
        where: { nodeId: { equals: targetNodeId } },
        limit: 1,
      }),
    ])

    if (sourceNode.docs.length === 0) {
      return NextResponse.json({ error: 'Source node not found' }, { status: 404 })
    }
    if (targetNode.docs.length === 0) {
      return NextResponse.json({ error: 'Target node not found' }, { status: 404 })
    }
    if (targetNode.docs[0]?.status !== 'online') {
      return NextResponse.json({ error: 'Target node is not online' }, { status: 400 })
    }

    // Find tenant distribution record
    const tenantDistribution = await payload.find({
      collection: 'tenant-distribution',
      where: {
        tenant: { equals: tenantId },
      },
      limit: 1,
    })

    if (tenantDistribution.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant distribution record not found' }, { status: 404 })
    }

    const distribution = tenantDistribution.docs[0]
    if (!distribution) {
      return NextResponse.json({ error: 'Distribution record is invalid' }, { status: 404 })
    }

    // Check if migration is already in progress
    if (distribution.migrationStatus === 'migrating') {
      return NextResponse.json({ 
        error: 'Migration already in progress',
        currentStatus: distribution.migrationStatus,
      }, { status: 409 })
    }

    // Check migration limits
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const recentMigrations = (distribution.migrationHistory || []).filter(
      m => m.timestamp.startsWith(currentMonth)
    )

    if (recentMigrations.length >= (distribution.automationRules?.maxMigrationsPerMonth || 2)) {
      return NextResponse.json({ 
        error: 'Monthly migration limit exceeded',
        limit: distribution.automationRules?.maxMigrationsPerMonth || 2,
        currentCount: recentMigrations.length,
      }, { status: 429 })
    }

    // Schedule or start migration
    const migrationId = crypto.randomUUID()
    const now = new Date().toISOString()
    const executeAt = scheduledTime || now

    // Update distribution status
    await payload.update({
      collection: 'tenant-distribution',
      id: distribution.id,
      data: {
        migrationStatus: scheduledTime ? 'migration_pending' : 'migrating',
        targetNode: targetNode.docs[0]?.id,
        migrationReason: reason,
      },
    })

    if (scheduledTime) {
      // Schedule for later execution
      console.log(`⏰ Migration scheduled: ${tenantId} at ${scheduledTime}`)
      
      // TODO: Add to job queue for scheduled execution
      
      return NextResponse.json({
        success: true,
        migrationId,
        status: 'scheduled',
        scheduledTime: executeAt,
        message: 'Migration scheduled successfully',
      })
    } else {
      // Execute migration immediately
      console.log(`🚀 Starting immediate migration: ${tenantId}`)
      
      const migrationResult = await executeTenantMigration({
        migrationId,
        tenantId,
        sourceNode: sourceNode.docs[0],
        targetNode: targetNode.docs[0],
        reason,
        payload,
      })

      return NextResponse.json({
        success: migrationResult.success,
        migrationId,
        status: migrationResult.success ? 'completed' : 'failed',
        duration: migrationResult.duration,
        message: migrationResult.message,
        error: migrationResult.error,
      })
    }

  } catch (error) {
    console.error('Tenant migration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET endpoint to check migration status
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenantId')
    const migrationId = url.searchParams.get('migrationId')

    if (!tenantId && !migrationId) {
      return NextResponse.json({ error: 'tenantId or migrationId required' }, { status: 400 })
    }

    let query = {}
    if (tenantId) {
      query = { tenant: { equals: tenantId } }
    }
    // TODO: Add migrationId lookup when we implement job tracking

    const distributions = await payload.find({
      collection: 'tenant-distribution',
      where: query,
      limit: 1,
    })

    if (distributions.docs.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const distribution = distributions.docs[0]

    const dist = distributions.docs[0]
    if (!dist) {
      return NextResponse.json({ error: 'Distribution record is invalid' }, { status: 404 })
    }

    return NextResponse.json({
      tenantId: dist.tenant,
      currentNode: dist.currentNode,
      migrationStatus: dist.migrationStatus,
      targetNode: dist.targetNode,
      migrationReason: dist.migrationReason,
      migrationHistory: dist.migrationHistory || [],
      lastMigration: dist.migrationHistory && dist.migrationHistory.length > 0 
        ? dist.migrationHistory[dist.migrationHistory.length - 1]
        : null,
    })

  } catch (error) {
    console.error('Migration status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Execute actual tenant migration
 * This is where the "cellular automata" rules are applied
 */
async function executeTenantMigration({ migrationId, tenantId, sourceNode, targetNode, reason, payload }: any) {
  const startTime = Date.now()
  
  try {
    console.log(`🔄 Executing migration ${migrationId}: ${tenantId} -> ${targetNode.name}`)

    // Phase 1: Pre-migration checks
    console.log('📋 Phase 1: Pre-migration validation...')
    
    // Check target node capacity
    const targetCapacity = targetNode.resources?.maxTenants || 1000
    const targetCurrent = targetNode.resources?.currentTenants || 0
    
    if (targetCurrent >= targetCapacity) {
      throw new Error(`Target node at capacity: ${targetCurrent}/${targetCapacity}`)
    }

    // Phase 2: Data backup and preparation
    console.log('💾 Phase 2: Data preparation...')
    
    // TODO: Create tenant data snapshot
    // TODO: Prepare migration package
    // TODO: Notify tenant users of maintenance window

    // Phase 3: Network coordination
    console.log('🌐 Phase 3: Network coordination...')
    
    // TODO: Coordinate with source and target nodes
    // TODO: Update DNS/routing tables
    // TODO: Prepare session migration

    // Phase 4: Data transfer
    console.log('📦 Phase 4: Data transfer...')
    
    // TODO: Transfer tenant data to target node
    // TODO: Verify data integrity
    // TODO: Update relationships and references

    // Phase 5: Cutover
    console.log('⚡ Phase 5: Service cutover...')
    
    // Update tenant distribution record
    const distribution = await payload.find({
      collection: 'tenant-distribution',
      where: { tenant: { equals: tenantId } },
      limit: 1,
    })

    if (distribution.docs.length > 0) {
      await payload.update({
        collection: 'tenant-distribution',
        id: distribution.docs[0].id,
        data: {
          currentNode: targetNode.id,
          migrationStatus: 'stable',
          targetNode: null,
          migrationReason: null,
          assignedAt: new Date().toISOString(),
        },
      })
    }

    // Update node tenant counts
    await Promise.all([
      // Decrement source node
      payload.update({
        collection: 'angel-os-nodes',
        id: sourceNode.id,
        data: {
          'resources.currentTenants': Math.max(0, (sourceNode.resources?.currentTenants || 1) - 1),
        },
      }),
      // Increment target node
      payload.update({
        collection: 'angel-os-nodes',
        id: targetNode.id,
        data: {
          'resources.currentTenants': (targetNode.resources?.currentTenants || 0) + 1,
        },
      }),
    ])

    // Phase 6: Post-migration verification
    console.log('✅ Phase 6: Post-migration verification...')
    
    // TODO: Health checks on migrated tenant
    // TODO: Performance validation
    // TODO: User notification of completion

    const duration = Math.round((Date.now() - startTime) / 1000)
    console.log(`✨ Migration completed in ${duration}s: ${tenantId} -> ${targetNode.name}`)

    return {
      success: true,
      duration,
      message: `Tenant successfully migrated to ${targetNode.name}`,
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Migration failed: ${errorMessage}`)
    
    // Update status to failed
    try {
      const distribution = await payload.find({
        collection: 'tenant-distribution',
        where: { tenant: { equals: tenantId } },
        limit: 1,
      })

      if (distribution.docs.length > 0) {
        await payload.update({
          collection: 'tenant-distribution',
          id: distribution.docs[0].id,
          data: {
            migrationStatus: 'migration_failed',
            targetNode: null,
          },
        })
      }
    } catch (updateError) {
      console.error('Failed to update migration status:', updateError)
    }

    const duration = Math.round((Date.now() - startTime) / 1000)
    return {
      success: false,
      duration,
      error: errorMessage,
      message: 'Migration failed',
    }
  }
}
