import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, tenantId, referrer } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Check if user already exists
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
      limit: 1,
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create the user (Payload will handle password hashing)
    const userData: any = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      globalRole: 'user', // Default role
      // Skip email verification for now as requested
      _verified: true,
    }

    // If tenantId is provided, associate user with specific tenant
    if (tenantId) {
      userData.tenant = parseInt(tenantId)
    }

    // Add referrer information for Angel OS referrals
    if (referrer) {
      userData.referredBy = referrer
      userData.referralSource = 'tenant'
    }

    const newUser = await payload.create({
      collection: 'users',
      data: userData,
    })

    // Log the user in immediately after signup
    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: email.toLowerCase(),
        password,
      },
    })

    if (loginResult.token) {
      // Set the auth cookie
      const response = NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
      })

      // Set the Payload auth cookie
      response.cookies.set('payload-token', loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    } else {
      // User created but login failed - still success
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please log in.',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
        },
      })
    }
  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle specific Payload errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { message: 'User with this email already exists' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { message: 'Invalid input data' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
