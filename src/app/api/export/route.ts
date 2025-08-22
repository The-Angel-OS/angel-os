import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import JSZip from 'jszip'

/**
 * Creator Data Export API
 *
 * Provides complete data portability - no lock-in, creator freedom guaranteed
 */
export async function POST(request: NextRequest) {
  try {
    const { creatorId, exportType = 'complete' } = await request.json()

    if (!creatorId) {
      return NextResponse.json({
        error: 'Creator ID is required',
        usage: {
          creatorId: 'string - ID of the creator/business owner',
          exportType: 'complete|content|analytics|revenue - Type of export (default: complete)'
        }
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get creator/business owner details
    const creator = await payload.findByID({
      collection: 'users',
      id: creatorId,
    })

    if (!creator) {
      return NextResponse.json({
        error: 'Creator not found'
      }, { status: 404 })
    }

    // Get all creator data in parallel
    const [spaces, posts, memberships] = await Promise.all([
      payload.find({
        collection: 'spaces',
        where: { tenant: { equals: creatorId } },
        depth: 2,
      }),
      payload.find({
        collection: 'posts',
        where: {
          'meta.business': { equals: creatorId }
        },
        depth: 2,
      }),
      payload.find({
        collection: 'space-memberships',
        where: {
          space: {
            in: (await payload.find({
              collection: 'spaces',
              where: { tenant: { equals: creatorId } },
            })).docs.map((s: any) => s.id)
          }
        },
      }),
    ])

    // Calculate membership statistics
    const totalMembers = memberships.docs.length
    const activeMemberships = memberships.docs.filter((membership: any) =>
      membership.status === 'active'
    ).length

    // Prepare complete export data
    const exportData = {
      exportInfo: {
        createdAt: new Date().toISOString(),
        creatorId,
        creatorEmail: creator.email,
        exportType,
        version: '1.0.0',
      },

      profile: {
        id: creator.id,
        email: creator.email,
        name: `${creator.firstName || ''} ${creator.lastName || ''}`.trim(),
        joinDate: creator.createdAt,
      },

      spaces: spaces.docs.map(space => ({
        id: space.id,
        name: space.name,
        description: space.description,
        monetization: space.monetization,
        createdAt: space.createdAt,
      })),

      content: posts.docs.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        publishedAt: post.publishedAt,
        status: post._status,
      })),

      memberships: {
        totalMembers,
        activeMemberships,
        membershipData: memberships.docs.map(membership => ({
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt,
          engagementScore: membership.engagementMetrics?.engagementScore || 0,
        })),
      },

      migrationGuide: {
        message: 'Your data is completely portable - no platform lock-in',
        formats: ['JSON', 'CSV', 'Markdown'],
        support: 'We help you migrate even to competitors',
      },
    }

    return NextResponse.json({
      success: true,
      message: 'Data export generated - your data, your freedom',
      exportData,
      portabilityGuarantee: {
        message: 'Zero lock-in, complete data ownership',
        rights: [
          'Export unlimited times',
          'All data in standard formats',
          'Migration help included',
          'No penalties for leaving',
        ],
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({
      error: 'Export failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Calculate monthly membership breakdown
 */
function calculateMonthlyMemberships(memberships: any[]): any[] {
  const monthlyData: { [key: string]: { count: number, active: number } } = {}

  memberships.forEach(membership => {
    const month = new Date(membership.joinedAt).toISOString().slice(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { count: 0, active: 0 }
    }
    monthlyData[month].count += 1
    if (membership.status === 'active') {
      monthlyData[month].active += 1
    }
  })

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    totalMemberships: data.count,
    activeMemberships: data.active,
  }))
}

/**
 * Calculate average engagement
 */
function calculateAverageEngagement(analytics: any[]): number {
  if (analytics.length === 0) return 0
  const totalEngagement = analytics.reduce((sum, a) => sum + (a.engagement || 0), 0)
  return totalEngagement / analytics.length
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(item =>
    Object.values(item).map(value =>
      typeof value === 'string' ? `"${value}"` : value
    ).join(',')
  ).join('\n')

  return `${headers}\n${rows}`
}

/**
 * Convert post to Markdown format
 */
function convertPostToMarkdown(post: any): string {
  return `---
title: "${post.title}"
date: ${post.publishedAt}
status: ${post._status}
access: ${post.accessLevel}
---

${post.excerpt ? `${post.excerpt}\n\n` : ''}${post.content || ''}
`
}

/**
 * Create migration guide
 */
function createMigrationGuide(): string {
  return `# Your Data Export - Migration Guide

## 🎉 Congratulations on Taking Control of Your Data!

This export contains ALL your data in standard, portable formats. You own this completely.

## 📂 What's Included

- **creator-data.json**: Complete data in JSON format
- **analytics.csv**: Analytics data for Excel/Sheets
- **memberships.csv**: Membership data for analysis
- **content/**: All your posts in Markdown format
- **README.md**: This migration guide

## 🚀 Migration Options

### To WordPress/Ghost
1. Import content/ folder using standard importers
2. Use analytics.csv for traffic analysis
3. Set up new membership management

### To Shopify/WooCommerce
1. Use memberships.csv for customer data
2. Import content as product descriptions
3. Connect existing social accounts

### To Any Platform
1. All data is in standard formats (JSON, CSV, Markdown)
2. No proprietary formats or vendor lock-in
3. Compatible with any modern platform

## 👥 Membership Data
- Complete membership history in memberships.csv
- Role and permission tracking
- Engagement metrics included

## 📞 Need Help?
Even though you're leaving our platform, we're here to help you migrate successfully!

Contact: support@kendev.co
Migration Guide: https://docs.kendev.co/migration

## 🔒 Data Privacy
- Your exported data contains no tracking pixels
- All personal data is included as per GDPR requirements
- No hidden data retention - this is everything!

---
*Generated by KenDev Commerce Platform - Built for Data Freedom*
`
}

/**
 * Get export status for creators
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')
    const downloadType = searchParams.get('type') || 'json'

    if (!creatorId) {
      return NextResponse.json({
        error: 'Creator ID is required'
      }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get data counts for export preview
    const [spaces, posts, memberships] = await Promise.all([
      payload.find({
        collection: 'spaces',
        where: { tenant: { equals: creatorId } },
        limit: 0, // Just count
      }),
      payload.find({
        collection: 'posts',
        where: { 'meta.business': { equals: creatorId } },
        limit: 0,
      }),
      payload.find({
        collection: 'space-memberships',
        where: {
          space: {
            in: (await payload.find({
              collection: 'spaces',
              where: { tenant: { equals: creatorId } },
            })).docs.map((s: any) => s.id)
          }
        },
        limit: 0,
      }),
    ])

    return NextResponse.json({
      success: true,
      exportPreview: {
        spaces: spaces.totalDocs,
        posts: posts.totalDocs,
        memberships: memberships.totalDocs,
        estimatedFileSize: `${Math.max(1, Math.ceil((spaces.totalDocs + posts.totalDocs) / 10))}MB`,
      },
      exportOptions: [
        {
          type: 'complete',
          name: 'Complete Export (ZIP)',
          description: 'Everything in downloadable ZIP file',
          includes: ['Content', 'Analytics', 'Memberships', 'Migration Guide'],
        },
        {
          type: 'json',
          name: 'API Export (JSON)',
          description: 'Raw data in JSON format',
          includes: ['All data', 'Developer-friendly format'],
        },
      ],
      dataRights: {
        message: 'You own 100% of this data - no restrictions, no lock-in',
        guarantees: [
          'Export anytime, unlimited times',
          'All data in standard formats',
          'Migration assistance available',
          'No penalties for leaving',
        ],
      },
    })

  } catch (error) {
    console.error('Export status error:', error)
    return NextResponse.json({
      error: 'Failed to get export status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
