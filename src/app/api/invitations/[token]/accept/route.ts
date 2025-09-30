import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const {
      firstName,
      lastName,
      password,
      restaurantName,
      restaurantAddress,
      phone,
      timezone,
      currency
    } = await request.json()

    // Validate invitation
    const invitation = await db.invitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 400 }
      )
    }

    // Generate restaurant slug
    const slug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug is unique
    let finalSlug = slug
    let counter = 1
    while (await db.restaurant.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    // Create restaurant and staff user in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          slug: finalSlug,
          name: restaurantName,
          address: restaurantAddress,
          currency,
          timezone,
        },
      })

      // Create a temporary clerk user ID (in real implementation, this would be created by Clerk)
      const tempClerkUserId = `temp_${randomBytes(16).toString('hex')}`

      // Create staff user
      const staffUser = await tx.staffUser.create({
        data: {
          restaurantId: restaurant.id,
          clerkUserId: tempClerkUserId,
          role: invitation.role as any,
        },
      })

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      })

      return { restaurant, staffUser }
    })

    // TODO: Create actual Clerk user account
    // For now, we'll return success and the user will need to sign up with Clerk

    return NextResponse.json({
      success: true,
      restaurant: result.restaurant,
      staffUser: result.staffUser,
      message: 'Account created successfully. Please sign in to continue.'
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
