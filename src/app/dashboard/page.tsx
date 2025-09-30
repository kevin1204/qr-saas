import { redirect } from 'next/navigation'
import { getCurrentStaffUser } from '@/lib/auth'
import { Kanban } from '@/components/Kanban'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const staffUser = await getCurrentStaffUser()

  // Check if Clerk is configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const isClerkConfigured = clerkPublishableKey && !clerkPublishableKey.includes('placeholder')

  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Demo Mode</CardTitle>
            <CardDescription>
              Staff authentication is not configured yet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              To access the staff dashboard, you need to set up Clerk authentication.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/r/reset/t/T1">
                  Try Customer Experience
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!staffUser) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            {staffUser.restaurant.name} - Manage your orders
          </p>
        </div>

        <Kanban restaurantId={staffUser.restaurantId} />
      </div>
    </div>
  )
}
