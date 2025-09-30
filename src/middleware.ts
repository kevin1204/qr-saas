import { NextResponse } from 'next/server'

export default function middleware(req: any) {
  // If Clerk is not configured, allow all routes for demo mode
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const clerkSecretKey = process.env.CLERK_SECRET_KEY
  
  if (!clerkPublishableKey || !clerkSecretKey || 
      clerkPublishableKey.includes('placeholder') || 
      clerkSecretKey.includes('placeholder')) {
    return NextResponse.next()
  }

  // Only import and use Clerk middleware if keys are properly configured
  const { clerkMiddleware, createRouteMatcher } = require('@clerk/nextjs/server')
  
  const isPublicRoute = createRouteMatcher([
    '/',
    '/r/(.*)',
    '/order/(.*)',
    '/api/stripe/webhook',
  ])

  return clerkMiddleware((auth: any) => {
    if (!isPublicRoute(req)) {
      auth().protect()
    }
  })(req)
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
