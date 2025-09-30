import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update order status to PAID
        const order = await db.order.update({
          where: { stripeSessionId: session.id },
          data: { 
            status: 'PAID',
            totalCents: session.amount_total || 0
          },
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

        if (order) {
          // Broadcast realtime update
          await supabase
            .from('orders')
            .insert({
              id: order.id,
              restaurant_id: order.restaurantId,
              table_id: order.tableId,
              code: order.code,
              status: order.status,
              total_cents: order.totalCents,
              created_at: order.createdAt.toISOString(),
              updated_at: order.updatedAt.toISOString()
            })

          console.log(`Order ${order.code} marked as PAID`)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update order status to CANCELED
        await db.order.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: 'CANCELED' }
        })

        console.log(`Order with session ${session.id} expired`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
