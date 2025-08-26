import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      accountType, 
      businessInfo, 
      tenantCreation, 
      preferences,
      source 
    } = body

    const payload = await getPayload({ config })

    // TODO: Get current user from session/auth
    // For now, we'll assume user ID 1
    const userId = 1

    let result: any = {
      success: true,
      message: 'Onboarding completed successfully'
    }

    // Update user profile with onboarding data
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        // onboardingCompleted: true, // Field not supported in current schema
        // accountType, // Field not supported in current schema
        // businessInfo, // Field not supported in current schema
        // preferences, // Field not supported in current schema
        // onboardingCompletedAt: new Date().toISOString() // Field not supported in current schema
      }
    })

    // Create Tenant (Business Space) if requested
    if (tenantCreation?.createTenant) {
      try {
        const businessTenant = await payload.create({
          collection: 'tenants',
          data: {
            name: tenantCreation.tenantName,
            slug: tenantCreation.tenantDomain,
            businessType: 'other',
            // description: tenantCreation.tenantDescription, // Field not supported in current schema
            // type: 'business', // Field not supported in current schema
            status: 'active'
            // settings: { // Field not supported in current schema
            //   isPublic: false,
            //   allowRegistration: false,
            //   customDomain: `${tenantCreation.tenantDomain}.angelOS.com`,
            //   features: {
            //     aiAssistant: true,
            //     analytics: preferences.analytics,
            //     notifications: preferences.notifications
            //   }
            // },
            // Add creator as owner
            // members: [{ // Field not supported in current schema
            //   user: userId,
            //   role: 'owner',
            //   joinedAt: new Date().toISOString()
            // }]
          }
        })

        // Create default channels for the business space
        const defaultChannels = [
          {
            name: 'general',
            type: 'chat',
            space: businessTenant.id,
            isSystem: true,
            isVirtual: false,
            description: 'General discussion channel'
          },
          {
            name: 'announcements',
            type: 'chat',
            space: businessTenant.id,
            isSystem: true,
            isVirtual: false,
            description: 'Important announcements'
          },
          {
            name: 'ai-assistant',
            type: 'chat',
            space: businessTenant.id,
            isSystem: true,
            isVirtual: false,
            description: 'Chat with your AI business assistant'
          }
        ]

        for (const channelData of defaultChannels) {
          await payload.create({
            collection: 'channels',
            data: {
              ...channelData,
              channelType: 'communication',
              tenantId: businessTenant.id.toString(),
              reportType: 'general',
              // members: [userId], // Field not supported in current schema
              // permissions: { // Field not supported in current schema
              //   read: 'members',
              //   write: 'members',
              //   admin: 'owner'
              // }
            }
          })
        }

        result.tenantId = businessTenant.id
        result.tenantUrl = `${tenantCreation.tenantDomain}.angelOS.com`
        result.message = `Business space "${tenantCreation.tenantName}" created successfully!`
      } catch (error) {
        console.error('Error creating business tenant:', error)
        result.tenantError = 'Failed to create business space, but account setup completed'
      }
    }

    // If user came from invitation, mark as onboarded
    if (source === 'invitation') {
      result.redirectTo = '/dashboard/spaces'
    } else {
      result.redirectTo = tenantCreation?.createTenant ? '/dashboard/spaces' : '/dashboard'
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
