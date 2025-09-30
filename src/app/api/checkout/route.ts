import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderCode } from '@/lib/utils'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { restaurantSlug, tableCode, items } = await request.json()

    if (!restaurantSlug || !tableCode || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get restaurant and table
    const restaurant = await db.restaurant.findUnique({
      where: { slug: restaurantSlug }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const table = await db.table.findFirst({
      where: {
        restaurantId: restaurant.id,
        code: tableCode
      }
    })

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      )
    }

    // Validate items against database
    const menuItems = await db.menuItem.findMany({
      where: {
        id: { in: items.map((item: any) => item.menuItemId) },
        restaurantId: restaurant.id,
        isAvailable: true
      }
    })

    if (menuItems.length !== items.length) {
      return NextResponse.json(
        { error: 'Some items are no longer available' },
        { status: 400 }
      )
    }

    // Calculate total and validate prices
    let totalCents = 0
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId)
      if (!menuItem) continue

      const modifierTotal = item.modifiers.reduce((sum: number, mod: any) => sum + mod.priceDeltaCents, 0)
      const unitPrice = menuItem.priceCents + modifierTotal
      const itemTotal = unitPrice * item.quantity

      totalCents += itemTotal

      // Create line item description
      let description = menuItem.name
      if (item.modifiers.length > 0) {
        description += ` (${item.modifiers.map((m: any) => m.name).join(', ')})`
      }
      if (item.notes) {
        description += ` - ${item.notes}`
      }

      lineItems.push({
        price_data: {
          currency: restaurant.currency.toLowerCase(),
          product_data: {
            name: menuItem.name,
            description: description.length > 500 ? description.substring(0, 500) : description,
          },
          unit_amount: unitPrice,
        },
        quantity: item.quantity,
      })
    }

    // Create order in database
    const orderCode = generateOrderCode()
    const order = await db.order.create({
      data: {
        restaurantId: restaurant.id,
        tableId: table.id,
        code: orderCode,
        status: 'NEW',
        totalCents,
        notes: items.map((item: any) => 
          item.notes ? `${item.name}: ${item.notes}` : null
        ).filter(Boolean).join('; ') || null,
      }
    })

    // Create order items
    await db.orderItem.createMany({
      data: items.map((item: any) => ({
        orderId: order.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPriceCents: menuItems.find(mi => mi.id === item.menuItemId)!.priceCents + 
          item.modifiers.reduce((sum: number, mod: any) => sum + mod.priceDeltaCents, 0),
        notes: item.notes || null,
        modifiers: item.modifiers,
      }))
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.APP_URL}/order/${order.id}?success=true`,
      cancel_url: `${process.env.APP_URL}/r/${restaurantSlug}/t/${tableCode}?canceled=true`,
      metadata: {
        orderId: order.id,
        restaurantId: restaurant.id,
        tableCode: table.code,
      },
    })

    // Update order with Stripe session ID
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id }
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
