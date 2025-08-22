import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  // Clear the payload token
  cookieStore.delete('payload-token')
  
  return NextResponse.json({ success: true })
}

export async function GET() {
  const cookieStore = await cookies()
  
  // Clear the payload token
  cookieStore.delete('payload-token')
  
  // Redirect to login
  return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'))
}
















