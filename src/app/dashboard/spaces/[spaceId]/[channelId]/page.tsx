import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { User as PayloadUser } from '@/payload-types'
import { DynamicChannelLoader } from '@/components/spaces/DynamicChannelLoader'

interface ChannelPageProps {
  params: Promise<{
    spaceId: string
    channelId: string
  }>
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { spaceId, channelId } = await params
  const payload = await getPayload({ config })
  const cookieStore = await cookies()

  // Get current user from session
  let currentUser: PayloadUser | null = null

  try {
    const token = cookieStore.get('payload-token')?.value
    if (token) {
      const headers = new Headers()
      headers.set('Authorization', `Bearer ${token}`)
      
      const { user } = await payload.auth({ headers })
      currentUser = user as PayloadUser
    }
  } catch (error) {
    console.error('Failed to authenticate user:', error)
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    redirect('/auth/login?redirect=/spaces')
  }

  // Use dynamic channel loader for any channel ID
  return (
    <DynamicChannelLoader
      spaceId={spaceId}
      channelId={channelId}
      currentUser={currentUser}
    />
  )
}

export async function generateMetadata({ params }: ChannelPageProps) {
  const { spaceId, channelId } = await params
  
  return {
    title: `#${channelId} - ${spaceId} | Angel OS Spaces`,
    description: `${channelId} channel in ${spaceId} workspace`,
  }
}