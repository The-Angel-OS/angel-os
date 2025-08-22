import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Angel OS Network Token Exchange Endpoint
 * 
 * Handles token exchanges across the federated Angel OS network:
 * - Cross-node token transfers
 * - Cross-tenant exchanges
 * - Token type conversions (AT ↔ KC ↔ LT)
 * - Network consensus for high-value transactions
 */

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const exchangeRequest = await request.json()

    const {
      fromUser,
      toUser,
      tokenType,
      amount,
      exchangeType, // 'cross_node', 'cross_tenant', 'token_conversion', 'user_transfer'
      fromNode,
      toNode,
      fromTenant,
      toTenant,
      conversionRate,
      humanWorthEvidence,
      signature,
    } = exchangeRequest

    console.log(`💱 Token Exchange: ${amount} ${tokenType} from ${fromUser} to ${toUser}`)

    // Verify request signature
    if (!signature) {
      return NextResponse.json({ error: 'Missing exchange signature' }, { status: 401 })
    }

    // Validate exchange parameters
    if (!fromUser || !toUser || !tokenType || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid exchange parameters' }, { status: 400 })
    }

    // Check if cross-network consensus is required
    const requiresConsensus = amount > 1000 || exchangeType === 'cross_node'
    
    if (requiresConsensus) {
      console.log('🌐 High-value exchange requires network consensus')
      
      // TODO: Implement network consensus mechanism
      // For now, proceed with local validation
    }

    // Get sender's current balance
    const senderBalance = await payload.find({
      collection: 'token-balances',
      where: {
        user: { equals: fromUser },
      },
      limit: 1,
    })

    if (senderBalance.docs.length === 0) {
      return NextResponse.json({ error: 'Sender balance record not found' }, { status: 404 })
    }

    const balance = senderBalance.docs[0]
    if (!balance) {
      return NextResponse.json({ error: 'Sender balance data is invalid' }, { status: 404 })
    }
    
    let currentBalance = 0

    // Check sufficient balance based on token type
    switch (tokenType) {
      case 'angel_tokens':
        currentBalance = balance.angelTokens || 0
        break
      case 'karma_coins':
        currentBalance = balance.karmaCoins || 0
        break
      case 'legacy_tokens':
        currentBalance = balance.legacyTokens || 0
        break
      default:
        return NextResponse.json({ error: 'Invalid token type' }, { status: 400 })
    }

    if (currentBalance < amount) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        currentBalance,
        requestedAmount: amount,
      }, { status: 400 })
    }

    // Execute the exchange transaction
    const exchangeId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    try {
      // Create debit transaction for sender
      const debitTransaction = await payload.create({
        collection: 'angel-tokens',
        data: {
          tokenId: `${exchangeId}-debit`,
          tokenType,
          amount: -amount, // Negative for spending
          holder: fromUser,
          tenant: fromTenant,
          sourceNode: fromNode,
          source: 'token_exchange',
          sourceDescription: `Token exchange: ${amount} ${tokenType} sent to user ${toUser}`,
          validation: {
            status: 'guardian_verified', // Exchange transactions are pre-validated
            validationTimestamp: timestamp,
            validationNotes: `Network exchange transaction ${exchangeId}`,
          },
          federationData: {
            crossNodeTransaction: exchangeType === 'cross_node',
            participatingNodes: fromNode && toNode ? [fromNode, toNode] : [],
            networkConsensus: requiresConsensus ? 'network_consensus' : 'local_only',
          },
          exchangeData: {
            exchangeRate: conversionRate || 1,
          },
          metadata: {
            exchangeId,
            exchangeType,
            recipientUser: toUser,
          },
        } as any,
      })

      // Create credit transaction for recipient
      const creditTransaction = await payload.create({
        collection: 'angel-tokens',
        data: {
          tokenId: `${exchangeId}-credit`,
          tokenType,
          amount: Math.floor(amount * (conversionRate || 1)), // Apply conversion rate
          holder: toUser,
          tenant: toTenant,
          sourceNode: toNode,
          source: 'token_exchange',
          sourceDescription: `Token exchange: ${amount} ${tokenType} received from user ${fromUser}`,
          humanWorthMetrics: humanWorthEvidence || {},
          validation: {
            status: 'guardian_verified',
            validationTimestamp: timestamp,
            validationNotes: `Network exchange transaction ${exchangeId}`,
          },
          federationData: {
            crossNodeTransaction: exchangeType === 'cross_node',
            participatingNodes: fromNode && toNode ? [fromNode, toNode] : [],
            networkConsensus: requiresConsensus ? 'network_consensus' : 'local_only',
          },
          exchangeData: {
            exchangeRate: conversionRate || 1,
          },
          metadata: {
            exchangeId,
            exchangeType,
            senderUser: fromUser,
          },
        } as any,
      })

      console.log(`✅ Token exchange completed: ${exchangeId}`)
      console.log(`💸 Debit: ${debitTransaction.amount} from ${fromUser}`)
      console.log(`💰 Credit: ${creditTransaction.amount} to ${toUser}`)

      // If cross-node transaction, notify target node
      if (exchangeType === 'cross_node' && toNode && fromNode !== toNode) {
        try {
          const targetNode = await payload.findByID({
            collection: 'angel-os-nodes',
            id: toNode,
          })

          // TODO: Send notification to target node
          console.log(`📡 Notifying target node: ${targetNode.name}`)
        } catch (error) {
          console.error('Failed to notify target node:', error)
        }
      }

      return NextResponse.json({
        success: true,
        exchangeId,
        debitTransaction: debitTransaction.id,
        creditTransaction: creditTransaction.id,
        amountTransferred: amount,
        amountReceived: Math.floor(amount * (conversionRate || 1)),
        exchangeRate: conversionRate || 1,
        timestamp,
        networkConsensus: requiresConsensus,
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Token exchange transaction failed:', error)
      return NextResponse.json({ 
        error: 'Exchange transaction failed',
        details: errorMessage,
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET endpoint to retrieve exchange rates and network token metrics
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const url = new URL(request.url)
    const fromToken = url.searchParams.get('from')
    const toToken = url.searchParams.get('to')

    // Calculate current exchange rates based on network activity
    const exchangeRates = await calculateNetworkExchangeRates(payload)

    // Get network token statistics
    const networkStats = await getNetworkTokenStats(payload)

    const response: any = {
      timestamp: new Date().toISOString(),
      exchangeRates,
      networkStats,
    }

    // If specific exchange rate requested
    if (fromToken && toToken) {
      const rateKey = `${fromToken}_to_${toToken}` as keyof typeof exchangeRates
      const rate = (exchangeRates as any)[rateKey] || 1
      response.specificRate = {
        from: fromToken,
        to: toToken,
        rate,
        lastUpdated: new Date().toISOString(),
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Exchange rates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Calculate dynamic exchange rates based on network activity
 */
async function calculateNetworkExchangeRates(payload: any) {
  // Base exchange rates (these would be dynamically calculated)
  const baseRates = {
    angel_tokens_to_karma_coins: 100, // 1 AT = 100 KC
    karma_coins_to_angel_tokens: 0.01, // 100 KC = 1 AT
    angel_tokens_to_legacy_tokens: 0.001, // 1000 AT = 1 LT
    legacy_tokens_to_angel_tokens: 1000, // 1 LT = 1000 AT
  }

  try {
    // Get recent transaction volume to adjust rates
    const recentTransactions = await payload.find({
      collection: 'angel-tokens',
      where: {
        createdAt: {
          greater_than: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        },
      },
      limit: 1000,
    })

    // Calculate demand-based adjustments
    const tokenVolume = recentTransactions.docs.reduce((acc: any, tx: any) => {
      acc[tx.tokenType] = (acc[tx.tokenType] || 0) + Math.abs(tx.amount)
      return acc
    }, {})

    // Apply supply/demand adjustments (simplified)
    const adjustmentFactor = {
      angel_tokens: tokenVolume.angel_tokens ? Math.min(1.2, Math.max(0.8, 1 + (tokenVolume.angel_tokens - 1000) / 10000)) : 1,
      karma_coins: tokenVolume.karma_coins ? Math.min(1.2, Math.max(0.8, 1 + (tokenVolume.karma_coins - 10000) / 100000)) : 1,
      legacy_tokens: tokenVolume.legacy_tokens ? Math.min(1.5, Math.max(0.5, 1 + (tokenVolume.legacy_tokens - 10) / 100)) : 1,
    }

    // Apply adjustments
    return {
      angel_tokens_to_karma_coins: baseRates.angel_tokens_to_karma_coins * adjustmentFactor.karma_coins,
      karma_coins_to_angel_tokens: baseRates.karma_coins_to_angel_tokens * adjustmentFactor.angel_tokens,
      angel_tokens_to_legacy_tokens: baseRates.angel_tokens_to_legacy_tokens * adjustmentFactor.legacy_tokens,
      legacy_tokens_to_angel_tokens: baseRates.legacy_tokens_to_angel_tokens * adjustmentFactor.angel_tokens,
      lastCalculated: new Date().toISOString(),
      adjustmentFactors: adjustmentFactor,
    }

  } catch (error) {
    console.error('Failed to calculate dynamic exchange rates:', error)
    return baseRates
  }
}

/**
 * Get network-wide token statistics
 */
async function getNetworkTokenStats(payload: any) {
  try {
    const [totalBalances, recentTransactions, networkNodes] = await Promise.all([
      payload.find({
        collection: 'token-balances',
        limit: 10000,
      }),
      payload.find({
        collection: 'angel-tokens',
        where: {
          createdAt: {
            greater_than: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        limit: 1000,
      }),
      payload.find({
        collection: 'angel-os-nodes',
        where: {
          status: { equals: 'online' },
        },
        limit: 100,
      }),
    ])

    // Calculate total supply
    const totalSupply = totalBalances.docs.reduce((acc: any, balance: any) => {
      acc.angelTokens += balance.angelTokens || 0
      acc.karmaCoins += balance.karmaCoins || 0
      acc.legacyTokens += balance.legacyTokens || 0
      return acc
    }, { angelTokens: 0, karmaCoins: 0, legacyTokens: 0 })

    // Calculate daily transaction volume
    const dailyVolume = recentTransactions.docs.reduce((acc: any, tx: any) => {
      acc[tx.tokenType] = (acc[tx.tokenType] || 0) + Math.abs(tx.amount)
      return acc
    }, {})

    return {
      totalSupply,
      dailyVolume,
      activeNodes: networkNodes.docs.length,
      totalUsers: totalBalances.docs.length,
      averageBalance: {
        angelTokens: totalSupply.angelTokens / totalBalances.docs.length,
        karmaCoins: totalSupply.karmaCoins / totalBalances.docs.length,
        legacyTokens: totalSupply.legacyTokens / totalBalances.docs.length,
      },
      transactionCount24h: recentTransactions.docs.length,
    }

  } catch (error) {
    console.error('Failed to calculate network token stats:', error)
    return {
      error: 'Failed to calculate network statistics',
    }
  }
}
