import { createLocalReq, getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import config from '@payload-config'

export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(): Promise<Response> {
  try {
    const payload = await getPayload({ config })

    // Create a system request (no authentication required for seeding)
    const payloadReq = await createLocalReq({}, payload)

    await seed({ payload, req: payloadReq })

    return Response.json({ 
      success: true, 
      message: '🎉 Angel OS Instance 0 initialized successfully!' 
    })
  } catch (error) {
    console.error('❌ Seed failed:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
