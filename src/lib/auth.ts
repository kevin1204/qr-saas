import { auth } from '@clerk/nextjs/server';
import { db } from './db';
import { StaffRole } from '@prisma/client';

export async function getCurrentStaffUser() {
  // Check if Clerk is configured
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_placeholder' ||
      !process.env.CLERK_SECRET_KEY || 
      process.env.CLERK_SECRET_KEY === 'sk_test_placeholder') {
    return null;
  }

  try {
    const { userId } = await auth();
    if (!userId) return null;

    const staffUser = await db.staffUser.findFirst({
      where: { clerkUserId: userId },
      include: { 
        restaurant: {
          include: {
            staffUsers: true,
          }
        }
      },
    });

    return staffUser;
  } catch (error) {
    console.error('Error getting current staff user:', error);
    return null;
  }
}

export async function requireStaffUser() {
  const staffUser = await getCurrentStaffUser();
  if (!staffUser) {
    throw new Error('Unauthorized');
  }
  return staffUser;
}

export async function requireOwner() {
  const staffUser = await requireStaffUser();
  if (staffUser.role !== StaffRole.OWNER) {
    throw new Error('Owner access required');
  }
  return staffUser;
}

export async function requireManagerOrOwner() {
  const staffUser = await requireStaffUser();
  if (staffUser.role !== StaffRole.OWNER && staffUser.role !== StaffRole.MANAGER) {
    throw new Error('Manager or Owner access required');
  }
  return staffUser;
}

export async function getCurrentRestaurant() {
  const staffUser = await getCurrentStaffUser();
  return staffUser?.restaurant || null;
}

export async function requireRestaurant() {
  const restaurant = await getCurrentRestaurant();
  if (!restaurant) {
    throw new Error('No restaurant found');
  }
  return restaurant;
}

export async function hasRestaurantAccess(restaurantId: string) {
  const staffUser = await getCurrentStaffUser();
  return staffUser?.restaurantId === restaurantId;
}

export async function requireRestaurantAccess(restaurantId: string) {
  const hasAccess = await hasRestaurantAccess(restaurantId);
  if (!hasAccess) {
    throw new Error('Access denied to this restaurant');
  }
  return true;
}

export async function getCurrentUser() {
  // Check if Clerk is configured
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_placeholder' ||
      !process.env.CLERK_SECRET_KEY || 
      process.env.CLERK_SECRET_KEY === 'sk_test_placeholder') {
    return null;
  }

  try {
    const { userId } = await auth();
    if (!userId) return null;

    // Check if user is superadmin
    const superadminUser = await db.staffUser.findFirst({
      where: { 
        clerkUserId: userId,
        role: 'SUPERADMIN'
      },
    });

    if (superadminUser) {
      return { ...superadminUser, isSuperadmin: true };
    }

    // Check if user is regular staff
    const staffUser = await db.staffUser.findFirst({
      where: { clerkUserId: userId },
      include: { 
        restaurant: {
          include: {
            staffUsers: true,
          }
        }
      },
    });

    return staffUser ? { ...staffUser, isSuperadmin: false } : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireSuperadmin() {
  const user = await getCurrentUser();
  if (!user || !user.isSuperadmin) {
    throw new Error('Superadmin access required');
  }
  return user;
}

export async function requireRole(requiredRole: StaffRole) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  // Superadmin can do anything
  if (user.role === 'SUPERADMIN') {
    return user;
  }

  const roleHierarchy = {
    STAFF: 1,
    MANAGER: 2,
    OWNER: 3
  };
  
  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}