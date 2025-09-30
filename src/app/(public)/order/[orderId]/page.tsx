import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { OrderTracker } from '@/components/OrderTracker'

interface PageProps {
  params: {
    orderId: string
  }
}

async function getOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      restaurant: true,
      table: true,
      orderItems: {
        include: {
          menuItem: true
        }
      }
    }
  })

  return order
}

export default async function OrderTrackerPage({ params }: PageProps) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OrderTracker order={order} />
    </div>
  )
}
