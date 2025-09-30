import { auth } from '@clerk/nextjs/server'
import { db } from './db'

export async function getCurrentStaffUser() {
  // Check if Clerk is configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
    return null
  }

  const { userId } = auth()
  
  if (!userId) {
    return null
  }

  const staffUser = await db.staffUser.findUnique({
    where: { clerkUserId: userId },
    include: { restaurant: true }
  })

  return staffUser
}

export async function requireStaffUser() {
  const staffUser = await getCurrentStaffUser()
  
  if (!staffUser) {
    throw new Error('Unauthorized: Staff user required')
  }

  return staffUser
}

export async function requireRestaurantAccess(restaurantId: string) {
  const staffUser = await requireStaffUser()
  
  if (staffUser.restaurantId !== restaurantId) {
    throw new Error('Unauthorized: Access denied to this restaurant')
  }

  return staffUser
}
