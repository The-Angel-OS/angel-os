import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil' as any,
})

const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET!

/**
 * Stripe Connect Webhook Handler
 *
 * Essential webhooks for marketplace operations:
 * - account.updated: Connected account status changes
 * - payment_intent.succeeded: Successful marketplace payments
 * - transfer.created: Revenue transfers to creators
 * - payout.paid: Creator payouts completed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Handle the event
    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account, payload)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, payload)
        break

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer, payload)
        break

      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout, payload)
        break

      case 'account.application.deauthorized':
        await handleAccountDeauthorized(event.data.object as any, payload)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Handle connected account updates
 */
async function handleAccountUpdated(account: Stripe.Account, payload: any) {
  try {
    // Find user with this connected account
    const users = await payload.find({
      collection: 'users',
      where: {
        'stripeConnect.stripeConnectAccountId': {
          equals: account.id,
        },
      },
    })

    if (users.docs.length === 0) {
      console.log(`No user found for account ${account.id}`)
      return
    }

    const user = users.docs[0]

    // Update account status
    const accountStatus = account.charges_enabled ? 'active' :
                         account.details_submitted ? 'pending_verification' : 'created'

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        stripeAccountStatus: accountStatus,
        stripeAccountData: {
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          requirements: account.requirements,
          capabilities: account.capabilities,
          country: account.country,
          default_currency: account.default_currency
        }
      }
    })

    // Update associated spaces if account is now active
    if (account.charges_enabled) {
      const spaces = await payload.find({
        collection: 'spaces',
        where: {
          tenant: {
            equals: user.id,
          },
        },
      })

      for (const space of spaces.docs) {
        if (space.monetization?.enabled && !space.monetization?.merchantAccount) {
          await payload.update({
            collection: 'spaces',
            id: space.id,
            data: {
              'monetization.merchantAccount': account.id,
              'monetization.status': 'active'
            }
          })
        }
      }
    }

    console.log(`Updated account ${account.id} status to ${accountStatus}`)

  } catch (error) {
    console.error('Error handling account update:', error)
  }
}

/**
 * Handle successful marketplace payments
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, payload: any) {
  try {
    const { spaceId, userId } = paymentIntent.metadata

    if (!spaceId || !userId) {
      console.log('Missing metadata in payment intent')
      return
    }

    // Update subscription status
    const subscriptions = await payload.find({
      collection: 'subscriptions',
      where: {
        paymentIntentId: {
          equals: paymentIntent.id,
        },
      },
    })

    if (subscriptions.docs.length > 0) {
      const subscription = subscriptions.docs[0]

      await payload.update({
        collection: 'subscriptions',
        id: subscription.id,
        data: {
          status: 'active',
          paidAt: new Date().toISOString(),
          paymentMethod: paymentIntent.payment_method_types[0] || 'card'
        }
      })

      // Update space member count
      const space = await payload.findByID({
        collection: 'spaces',
        id: spaceId,
      })

      if (space) {
        await payload.update({
          collection: 'spaces',
          id: spaceId,
          data: {
            'stats.memberCount': (space.stats?.memberCount || 0) + 1,
            'stats.lastActivity': new Date().toISOString()
          }
        })
      }
    }

    console.log(`Payment succeeded for space ${spaceId}, user ${userId}`)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

/**
 * Handle revenue transfers to creators
 */
async function handleTransferCreated(transfer: Stripe.Transfer, payload: any) {
  try {
    // Log the transfer for revenue tracking
    await payload.create({
      collection: 'revenue-transfers',
      data: {
        stripeTransferId: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        destination: transfer.destination,
        created: new Date(transfer.created * 1000).toISOString(),
        metadata: transfer.metadata
      }
    })

    console.log(`Transfer created: ${transfer.amount} ${transfer.currency} to ${transfer.destination}`)

  } catch (error) {
    console.error('Error handling transfer creation:', error)
  }
}

/**
 * Handle completed payouts to creators
 */
async function handlePayoutPaid(payout: Stripe.Payout, payload: any) {
  try {
    // Update payout status for creator dashboard
    console.log(`Payout paid: ${payout.amount} ${payout.currency} to account ${payout.destination}`)

  } catch (error) {
    console.error('Error handling payout:', error)
  }
}

/**
 * Handle account deauthorization
 */
async function handleAccountDeauthorized(deauth: any, payload: any) {
  try {
    // Update user to remove connected account
    const users = await payload.find({
      collection: 'users',
      where: {
        'stripeConnect.stripeConnectAccountId': {
          equals: deauth.account,
        },
      },
    })

    if (users.docs.length > 0) {
      const user = users.docs[0]

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          'stripeConnect.stripeConnectAccountId': null,
          stripeAccountStatus: 'deauthorized'
        }
      })

      // Disable monetization on associated spaces
      const spaces = await payload.find({
        collection: 'spaces',
        where: {
          tenant: {
            equals: user.id,
          },
        },
      })

      for (const space of spaces.docs) {
        if (space.monetization?.merchantAccount === deauth.account) {
          await payload.update({
            collection: 'spaces',
            id: space.id,
            data: {
              'monetization.status': 'disabled',
              'monetization.merchantAccount': null
            }
          })
        }
      }
    }

    console.log(`Account deauthorized: ${deauth.account}`)

  } catch (error) {
    console.error('Error handling account deauthorization:', error)
  }
}
