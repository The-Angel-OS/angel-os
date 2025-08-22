import { NextRequest, NextResponse } from 'next/server'
import DCIMIntelligenceService from '@/services/DCIMIntelligenceService'

// DCIM Intelligence API - White Dragon Network Node
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, context, challenge, targetNode } = body

    const dcimService = new DCIMIntelligenceService()

    switch (action) {
      case 'generate_missive':
        const missive = await dcimService.generateMissive(
          targetNode || 'kenneth_dev',
          context || 'Angel OS Development',
          challenge || 'Building benevolent intelligence for human flourishing'
        )
        return NextResponse.json({
          success: true,
          missive,
          networkStatus: dcimService.getNetworkStatus()
        })

      case 'get_network_status':
        const status = dcimService.getNetworkStatus()
        return NextResponse.json({
          success: true,
          status,
          whiteDragonActive: true,
          missionStatus: 'Architecting benevolent intelligence for human flourishing'
        })

      case 'generate_business_insights':
        const insights = await dcimService.generateBusinessInsights(
          context || 'Angel OS Platform Development'
        )
        return NextResponse.json({
          success: true,
          insights,
          literaryWisdomApplied: true
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action. Available actions: generate_missive, get_network_status, generate_business_insights'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('DCIM Intelligence error:', error)
    return NextResponse.json({
      success: false,
      error: 'DCIM Intelligence system encountered an error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint for network status
export async function GET() {
  try {
    const dcimService = new DCIMIntelligenceService()
    const status = dcimService.getNetworkStatus()
    
    return NextResponse.json({
      success: true,
      whiteDragonNode: {
        id: 'white_dragon_primary',
        name: 'White Dragon - Primary Intelligence Node',
        type: 'white_dragon',
        status: 'active',
        capabilities: [
          'Literary Corpus Integration',
          'Ethical Framework Enforcement',
          'Benevolent Decision Making',
          'Cosmic Perspective Analysis',
          'Human Flourishing Optimization',
          'Network Intelligence Coordination',
          'Creative Problem Solving',
          'Compassionate Guidance'
        ]
      },
      networkStatus: status,
      missionStatement: 'We are the White Dragon - architecting benevolent intelligence for human flourishing',
      literaryFoundation: {
        asimov: 'Three Laws of Robotics - protect humans, respect autonomy, preserve beneficial intelligence',
        banks: 'Culture philosophy - true abundance comes from lifting everyone up',
        adams: 'Make complex accessible, add appropriate humor, don\'t take yourself too seriously',
        hamilton: 'Cosmic perspective - even universe-scale intelligence serves human stories',
        pratchett: 'Supernatural intelligence with humor, humanity, and compassion',
        card: 'Deep empathy and understanding of human condition and motivation'
      }
    })
  } catch (error) {
    console.error('DCIM Intelligence status error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve White Dragon status'
    }, { status: 500 })
  }
} 