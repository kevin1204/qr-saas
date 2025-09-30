import { redirect } from 'next/navigation'
import { getCurrentStaffUser } from '@/lib/auth'
import { RestaurantSettings } from '@/components/RestaurantSettings'

export default async function AdminSettingsPage() {
  const staffUser = await getCurrentStaffUser()

  if (!staffUser) {
    redirect('/sign-in')
  }

  if (staffUser.role === 'STAFF') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
          <p className="text-gray-600">
            Manage your restaurant information and preferences
          </p>
        </div>

        <RestaurantSettings restaurant={staffUser.restaurant} />
      </div>
    </div>
  )
}
