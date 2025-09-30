import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await requireSuperadmin()

    const { email, role, restaurantName, restaurantAddress, message } = await request.json()

    if (!email || !role || !restaurantName || !restaurantAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.staffUser.findFirst({
      where: { clerkUserId: email } // Using email as a temporary identifier
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        email,
        role: role as any,
        token,
        expiresAt,
      }
    })

    // Generate invitation link
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'
    const invitationLink = `${baseUrl}/invite/${token}`

    // TODO: Send email notification
    // For now, we'll just return the link
    console.log('Invitation created:', {
      email,
      role,
      restaurantName,
      invitationLink
    })

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
      invitationLink,
      expiresAt: invitation.expiresAt
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}
