import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Angel OS Network Heartbeat Endpoint
 * 
 * This endpoint is called by other Angel OS nodes to:
 * 1. Announce their presence in the network
 * 2. Exchange network topology information
 * 3. Share health and capacity metrics
 * 4. Coordinate tenant migrations
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const heartbeatData = await request.json()

    const {
      nodeId,
      nodeName,
      endpoint,
      region,
      status,
      capabilities,
      resources,
      health,
      connectedNodes,
      tenantCount,
      signature, // For authentication
    } = heartbeatData

    // Verify node signature (TODO: implement proper cryptographic verification)
    if (!signature) {
      return NextResponse.json({ error: 'Missing node signature' }, { status: 401 })
    }

    // Find or create node in registry
    let node
    try {
      const existingNodes = await payload.find({
        collection: 'angel-os-nodes',
        where: {
          nodeId: {
            equals: nodeId,
          },
        },
        limit: 1,
      })

      if (existingNodes.docs.length > 0 && existingNodes.docs[0]?.id) {
        // Update existing node
        node = await payload.update({
          collection: 'angel-os-nodes',
          id: existingNodes.docs[0].id,
          data: {
            name: nodeName,
            endpoint,
            region,
            status,
            capabilities,
            resources: {
              ...resources,
              currentTenants: tenantCount,
            },
            health: {
              ...health,
              lastSeen: new Date().toISOString(),
            },
            connectedNodes,
            scalingModel: 'vercel_serverless',
          },
        })
        console.log(`💓 Network heartbeat: Updated node "${nodeName}" (${nodeId})`)
      } else {
        // Create new node
        node = await payload.create({
          collection: 'angel-os-nodes',
          data: {
            name: nodeName,
            nodeId,
            endpoint,
            apiEndpoint: `${endpoint}/api/federation`,
            region,
            status,
            capabilities,
            resources: {
              ...resources,
              currentTenants: tenantCount,
            },
            health: {
              ...health,
              lastSeen: new Date().toISOString(),
            },
            connectedNodes,
            nodeType: 'production_cluster',
            scalingModel: 'vercel_serverless',
          },
        })
        console.log(`🌟 Network discovery: New node "${nodeName}" joined the federation`)
      }
    } catch (error) {
      console.error('Failed to update node registry:', error)
      return NextResponse.json({ error: 'Failed to update node registry' }, { status: 500 })
    }

    // Get current network topology to send back
    const networkNodes = await payload.find({
      collection: 'angel-os-nodes',
      where: {
        status: {
          in: ['online', 'degraded'],
        },
      },
      limit: 100,
    })

    // Calculate network metrics
    const networkMetrics = {
      totalNodes: networkNodes.docs.length,
      totalTenants: networkNodes.docs.reduce((sum, n) => sum + (n.resources?.currentTenants || 0), 0),
      averageLoad: networkNodes.docs.reduce((sum, n) => sum + (n.health?.loadScore || 0), 0) / networkNodes.docs.length,
      healthyNodes: networkNodes.docs.filter(n => n.status === 'online').length,
    }

    // Check if any tenant migrations are needed based on this heartbeat
    const migrationRecommendations = await checkMigrationOpportunities(payload, node, networkNodes.docs)

    return NextResponse.json({
      success: true,
      message: 'Heartbeat received',
      nodeId: node.nodeId,
      networkTopology: networkNodes.docs.map(n => ({
        nodeId: n.nodeId,
        name: n.name,
        endpoint: n.endpoint,
        region: n.region,
        status: n.status,
        capabilities: n.capabilities,
        loadScore: n.health?.loadScore || 0,
      })),
      networkMetrics,
      migrationRecommendations,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Federation heartbeat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET endpoint to retrieve current network status
 */
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    const networkNodes = await payload.find({
      collection: 'angel-os-nodes',
      limit: 100,
    })

    const networkMetrics = {
      totalNodes: networkNodes.docs.length,
      onlineNodes: networkNodes.docs.filter(n => n.status === 'online').length,
      totalTenants: networkNodes.docs.reduce((sum, n) => sum + (n.resources?.currentTenants || 0), 0),
      regions: [...new Set(networkNodes.docs.map(n => n.region))],
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      networkMetrics,
      nodes: networkNodes.docs.map(n => ({
        nodeId: n.nodeId,
        name: n.name,
        region: n.region,
        status: n.status,
        lastSeen: n.health?.lastSeen,
        tenantCount: n.resources?.currentTenants || 0,
      })),
    })

  } catch (error) {
    console.error('Network status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * AI-driven migration opportunity detection
 */
async function checkMigrationOpportunities(payload: any, currentNode: any, allNodes: any[]) {
  const recommendations = []

  try {
    // Get tenant distribution data
    const distributions = await payload.find({
      collection: 'tenant-distribution',
      where: {
        currentNode: {
          equals: currentNode.id,
        },
        migrationStatus: {
          equals: 'stable',
        },
      },
      limit: 100,
    })

    for (const distribution of distributions.docs) {
      // Check for load balancing opportunities
      const currentLoad = currentNode.health?.loadScore || 0
      const lighterNodes = allNodes.filter(n => 
        n.id !== currentNode.id && 
        n.status === 'online' && 
        (n.health?.loadScore || 0) < currentLoad - 20
      )

      if (lighterNodes.length > 0 && currentLoad > 80) {
        recommendations.push({
          type: 'load_balancing',
          tenantId: distribution.tenant,
          currentNode: currentNode.nodeId,
          recommendedNode: lighterNodes[0].nodeId,
          reason: `Current node load: ${currentLoad}%, recommended node load: ${lighterNodes[0].health?.loadScore || 0}%`,
          priority: currentLoad > 95 ? 'high' : 'normal',
        })
      }

      // Check for geographic optimization
      if (distribution.networkAffinity?.primaryUserRegions?.length > 0) {
        const primaryRegion = distribution.networkAffinity.primaryUserRegions[0]
        const regionalNodes = allNodes.filter(n => 
          n.region === primaryRegion && 
          n.id !== currentNode.id && 
          n.status === 'online'
        )

        if (regionalNodes.length > 0 && currentNode.region !== primaryRegion) {
          recommendations.push({
            type: 'geographic_optimization',
            tenantId: distribution.tenant,
            currentNode: currentNode.nodeId,
            recommendedNode: regionalNodes[0].nodeId,
            reason: `Tenant users primarily in ${primaryRegion}, current node in ${currentNode.region}`,
            priority: 'low',
          })
        }
      }
    }

  } catch (error) {
    console.error('Migration opportunity check failed:', error)
  }

  return recommendations
}
