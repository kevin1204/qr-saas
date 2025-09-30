import { redirect } from 'next/navigation'
import { getCurrentStaffUser } from '@/lib/auth'
import { QRGenerator } from '@/components/QRGenerator'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminQRPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">QR Code Generator</h1>
          <p className="text-gray-600">
            Generate QR codes for your tables
          </p>
        </div>

        <QRGenerator restaurant={staffUser.restaurant} />
      </div>
    </div>
  )
}
