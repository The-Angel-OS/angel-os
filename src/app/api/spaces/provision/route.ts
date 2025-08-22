import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  createSpaceFromTemplate,
  addChannelToSpace,
  provisionKenDevCoSpace,
  getAvailableTemplates,
  createChannelTemplate,
  SPACE_TEMPLATES
} from '@/utilities/spaceProvisioning'

/**
 * Space and Channel Provisioning API
 *
 * Allows conversational interfaces to create spaces and channels
 * using predefined templates or custom configurations.
 */

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    const payload = await getPayload({ config: configPromise })

    switch (action) {
      case 'create-space': {
        const { templateKey, tenantId, ownerId, customizations } = data

        if (!templateKey || !tenantId || !ownerId) {
          return NextResponse.json({
            error: 'templateKey, tenantId, and ownerId are required'
          }, { status: 400 })
        }

        const space = await createSpaceFromTemplate(
          payload,
          templateKey,
          tenantId,
          ownerId,
          customizations
        )

        return NextResponse.json({
          success: true,
          message: `Space "${space.name}" created successfully`,
          space,
          templateUsed: templateKey,
          channelsCreated: 0 // Channels are managed separately, not embedded in Space
        })
      }

      case 'create-kendev-space': {
        const { tenantId, ownerId } = data

        if (!tenantId || !ownerId) {
          return NextResponse.json({
            error: 'tenantId and ownerId are required'
          }, { status: 400 })
        }

        const space = await provisionKenDevCoSpace(payload, tenantId, ownerId)

        return NextResponse.json({
          success: true,
          message: 'KenDev.Co space created successfully',
          space,
          templateUsed: 'kendev-co',
          features: [
            'Full-stack development workflows',
            'Client project management',
            'Code review processes',
            'Portfolio showcase',
            'Technical consulting'
          ]
        })
      }

      case 'add-channel': {
        const { spaceId, channelName, channelType, description, isPublic, businessMetadata } = data

        if (!spaceId || !channelName || !channelType) {
          return NextResponse.json({
            error: 'spaceId, channelName, and channelType are required'
          }, { status: 400 })
        }

        const channelTemplate = createChannelTemplate(
          channelName,
          channelType,
          {
            description,
            isPublic: isPublic ?? true,
            businessMetadata: businessMetadata || {
              department: 'general',
              priority: 'normal'
            }
          }
        )

        const updatedSpace = await addChannelToSpace(payload, spaceId, channelTemplate)

        return NextResponse.json({
          success: true,
          message: `Channel "#${channelName}" added to space`,
          space: updatedSpace,
          newChannel: channelTemplate
        })
      }

      default:
        return NextResponse.json({
          error: 'Invalid action',
          availableActions: ['create-space', 'create-kendev-space', 'add-channel']
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Space provisioning error:', error)
    return NextResponse.json({
      error: 'Failed to provision space/channel',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get Available Templates and Provisioning Options
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'templates': {
        const templates = getAvailableTemplates()
        return NextResponse.json({
          success: true,
          templates,
          usage: {
            createSpace: 'POST /api/spaces/provision with action: "create-space"',
            addChannel: 'POST /api/spaces/provision with action: "add-channel"',
            kendevSpace: 'POST /api/spaces/provision with action: "create-kendev-space"'
          }
        })
      }

      case 'channel-types': {
        return NextResponse.json({
          success: true,
          channelTypes: [
            {
              type: 'text',
              description: 'Text-based discussion channel',
              useCase: 'General chat, announcements, project coordination'
            },
            {
              type: 'voice',
              description: 'Voice communication channel',
              useCase: 'Meetings, consultations, team calls'
            },
            {
              type: 'video',
              description: 'Video streaming and conferencing',
              useCase: 'Live streams, video meetings, webinars'
            },
            {
              type: 'announcement',
              description: 'One-way announcement channel',
              useCase: 'Important updates, company news, broadcasts'
            }
          ],
          businessMetadata: {
            departments: ['all', 'leadership', 'operations', 'development', 'marketing', 'customer-service', 'content', 'monetization'],
            priorities: ['low', 'normal', 'high', 'urgent'],
            workflows: ['collaboration', 'communication', 'project-management', 'meetings', 'content-creation', 'client-management']
          }
        })
      }

      default: {
        return NextResponse.json({
          success: true,
          message: 'Space and Channel Provisioning API',
          endpoints: {
            createSpace: 'POST /api/spaces/provision with action: "create-space"',
            addChannel: 'POST /api/spaces/provision with action: "add-channel"',
            kendevSpace: 'POST /api/spaces/provision with action: "create-kendev-space"',
            getTemplates: 'GET /api/spaces/provision?action=templates',
            getChannelTypes: 'GET /api/spaces/provision?action=channel-types'
          },
          examples: {
            createSpace: {
              action: 'create-space',
              data: {
                templateKey: 'business-general',
                tenantId: 'tenant-id',
                ownerId: 'user-id',
                customizations: {
                  name: 'Custom Space Name',
                  description: 'Custom description'
                }
              }
            },
            addChannel: {
              action: 'add-channel',
              data: {
                spaceId: 'space-id',
                channelName: 'new-channel',
                channelType: 'text',
                description: 'Channel description',
                isPublic: true,
                businessMetadata: {
                  department: 'development',
                  priority: 'high',
                  workflow: 'project-management'
                }
              }
            }
          }
        })
      }
    }

  } catch (error) {
    console.error('Provisioning API error:', error)
    return NextResponse.json({
      error: 'Failed to get provisioning information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
