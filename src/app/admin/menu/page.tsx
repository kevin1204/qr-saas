import { redirect } from 'next/navigation'
import { getCurrentStaffUser } from '@/lib/auth'
import { MenuManagement } from '@/components/MenuManagement'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminMenuPage() {
  const staffUser = await getCurrentStaffUser()

  if (!staffUser) {
    redirect('/sign-in')
  }

  if (staffUser.role === 'STAFF') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">
            Manage your menu items, categories, and modifiers
          </p>
        </div>

        <MenuManagement restaurantId={staffUser.restaurantId} />
      </div>
    </div>
  )
}
