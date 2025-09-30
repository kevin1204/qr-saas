import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCheckoutSession } from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  restaurantSlug: z.string(),
  tableCode: z.string(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    modifiers: z.array(z.string()).optional(),
    notes: z.string().optional(),
  })),
  tip: z.number().min(0).default(0),
  email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantSlug, tableCode, items, tip, email } = checkoutSchema.parse(body);

    // Get restaurant and table
    const restaurant = await db.restaurant.findUnique({
      where: { slug: restaurantSlug },
      include: { tables: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Check if restaurant has Stripe Connect enabled
    if (!restaurant.stripeAccountId || !restaurant.chargesEnabled) {
      return NextResponse.json({ 
        error: 'Restaurant payment setup incomplete. Please contact the restaurant.' 
      }, { status: 400 });
    }

    const table = restaurant.tables.find(t => t.code === tableCode);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Get menu items and validate
    const menuItems = await db.menuItem.findMany({
      where: { 
        restaurantId: restaurant.id,
        id: { in: items.map(item => item.menuItemId) }
      },
      include: { modifiers: true },
    });

    // Calculate total
    let subtotal = 0;
    const lineItems = [];
    const orderItems = [];

    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return NextResponse.json({ error: 'Item not available' }, { status: 400 });
      }

      let itemTotal = menuItem.priceCents * item.quantity;
      let modifierData = null;
      
      // Add modifier costs
      if (item.modifiers && item.modifiers.length > 0) {
        modifierData = [];
        for (const modifierId of item.modifiers) {
          const modifier = menuItem.modifiers.find(m => m.id === modifierId);
          if (modifier) {
            itemTotal += modifier.priceDeltaCents * item.quantity;
            modifierData.push({
              id: modifier.id,
              name: modifier.name,
              priceDeltaCents: modifier.priceDeltaCents,
            });
          }
        }
      }

      subtotal += itemTotal;

      lineItems.push({
        price_data: {
          currency: restaurant.currency.toLowerCase(),
          product_data: {
            name: menuItem.name,
            description: menuItem.description,
            images: menuItem.imageUrl ? [menuItem.imageUrl] : undefined,
          },
          unit_amount: itemTotal / item.quantity,
        },
        quantity: item.quantity,
      });

      orderItems.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPriceCents: menuItem.priceCents,
        notes: item.notes,
        modifiers: modifierData,
      });
    }

    // Add tip
    if (tip > 0) {
      lineItems.push({
        price_data: {
          currency: restaurant.currency.toLowerCase(),
          product_data: {
            name: 'Tip',
          },
          unit_amount: tip,
        },
        quantity: 1,
      });
    }

    const total = subtotal + tip;

    // Create order
    const order = await db.order.create({
      data: {
        restaurantId: restaurant.id,
        tableId: table.id,
        code: `ORD-${Date.now()}`,
        totalCents: total,
        status: 'NEW',
      },
    });

    // Create order items
    for (const item of orderItems) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.menuItemId,
          qty: item.quantity,
          unitPriceCents: item.unitPriceCents,
          notes: item.notes,
          modifiers: item.modifiers,
        },
      });
    }

    // Create Stripe checkout session with Direct Charges
    const session = await createCheckoutSession({
      restaurantId: restaurant.id,
      stripeAccountId: restaurant.stripeAccountId!,
      lineItems,
      successUrl: `${process.env.APP_URL}/order/${order.id}?success=1`,
      cancelUrl: `${process.env.APP_URL}/r/${restaurant.slug}/t/${table.code}?canceled=1`,
      customerEmail: email,
      metadata: {
        orderId: order.id,
        restaurantId: restaurant.id,
        tableCode: table.code,
      },
    });

    // Update order with session ID
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}