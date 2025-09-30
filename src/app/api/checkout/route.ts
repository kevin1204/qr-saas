import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCheckoutSession } from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  restaurantId: z.string(),
  tableId: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    qty: z.number().min(1),
    unitPriceCents: z.number(),
    notes: z.string().optional(),
    modifiers: z.array(z.object({
      name: z.string(),
      priceDeltaCents: z.number()
    })).optional(),
  })),
  subtotalCents: z.number(),
  taxCents: z.number(),
  tipCents: z.number(),
  totalCents: z.number(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      restaurantId, 
      tableId, 
      items, 
      subtotalCents, 
      taxCents, 
      tipCents, 
      totalCents, 
      customerName, 
      customerEmail 
    } = checkoutSchema.parse(body);

    // Get restaurant
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
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

    // Get table if provided
    let table = null;
    if (tableId) {
      table = await db.table.findUnique({
        where: { id: tableId },
      });
    }

    // Get menu items for validation
    const menuItems = await db.menuItem.findMany({
      where: { 
        restaurantId: restaurant.id,
        id: { in: items.map(item => item.menuItemId) }
      },
    });

    // Validate items are available
    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return NextResponse.json({ error: 'Item not available' }, { status: 400 });
      }
    }

    // Create line items for Stripe
    const lineItems = [];
    
    // Add individual items
    for (const item of items) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      const itemTotal = item.unitPriceCents * item.qty;
      const modifierTotal = (item.modifiers || []).reduce((sum, mod) => sum + mod.priceDeltaCents, 0) * item.qty;
      const totalItemPrice = itemTotal + modifierTotal;

      lineItems.push({
        price_data: {
          currency: restaurant.currency.toLowerCase(),
          product_data: {
            name: menuItem?.name || 'Menu Item',
            description: item.notes || undefined,
          },
          unit_amount: totalItemPrice / item.qty,
        },
        quantity: item.qty,
      });
    }

    // Add tax if applicable
    if (taxCents > 0) {
      lineItems.push({
        price_data: {
          currency: restaurant.currency.toLowerCase(),
          product_data: {
            name: 'Tax',
          },
          unit_amount: taxCents,
        },
        quantity: 1,
      });
    }

    // Add tip if applicable
    if (tipCents > 0) {
      lineItems.push({
        price_data: {
          currency: restaurant.currency.toLowerCase(),
          product_data: {
            name: 'Tip',
          },
          unit_amount: tipCents,
        },
        quantity: 1,
      });
    }

    // Create order
    const order = await db.order.create({
      data: {
        restaurantId: restaurant.id,
        tableId: table?.id,
        code: `ORD-${Date.now()}`,
        subtotalCents,
        taxCents,
        tipCents,
        totalCents,
        customerName,
        customerEmail,
        status: 'NEW',
      },
    });

    // Create order items
    for (const item of items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          menuItemId: item.menuItemId,
          qty: item.qty,
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
      cancelUrl: table ? 
        `${process.env.APP_URL}/r/${restaurant.slug}/t/${table.code}?canceled=1` :
        `${process.env.APP_URL}/r/${restaurant.slug}?canceled=1`,
      customerEmail,
      metadata: {
        orderId: order.id,
        restaurantId: restaurant.id,
        tableCode: table?.code || 'pickup',
      },
    });

    // Update order with session ID
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ 
      success: true,
      orderId: order.id,
      url: session.url 
    });
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