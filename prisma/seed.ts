import { PrismaClient, StaffRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create superadmin user
  const superadmin = await prisma.staffUser.upsert({
    where: { clerkUserId: 'superadmin' },
    update: {},
    create: {
      clerkUserId: 'superadmin',
      role: StaffRole.SUPERADMIN,
      restaurantId: 'temp-restaurant-id' // This will be updated when we create a restaurant
    }
  })

  console.log('✅ Superadmin user created')

  // Create a sample restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-restaurant' },
    update: {},
    create: {
      slug: 'demo-restaurant',
      name: 'Demo Restaurant',
      address: '123 Main St, Demo City, DC 12345',
      currency: 'USD',
      timezone: 'America/New_York',
      serviceType: 'RESTAURANT',
      taxRateBps: 875, // 8.75%
      defaultTipBps: 1800, // 18%
      chargesEnabled: true,
      stripeAccountId: 'acct_demo',
    }
  })

  // Update superadmin with restaurant ID
  await prisma.staffUser.update({
    where: { id: superadmin.id },
    data: { restaurantId: restaurant.id }
  })

  // Create sample tables
  const tables = await Promise.all([
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Table 1',
        code: 'T1'
      }
    }),
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Table 2',
        code: 'T2'
      }
    }),
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Bar 1',
        code: 'B1'
      }
    })
  ])

  console.log('✅ Sample tables created')

  // Create menu categories
  const appetizers = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Appetizers',
      sortOrder: 1
    }
  })

  const mains = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Main Courses',
      sortOrder: 2
    }
  })

  const drinks = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Beverages',
      sortOrder: 3
    }
  })

  // Create sample menu items
  const caesarSalad = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: appetizers.id,
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce, parmesan cheese, croutons, and our house caesar dressing',
      priceCents: 1299,
      isAvailable: true,
      sortOrder: 1
    }
  })

  const chickenWings = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: appetizers.id,
      name: 'Buffalo Wings',
      description: 'Crispy chicken wings tossed in buffalo sauce, served with celery and blue cheese',
      priceCents: 1599,
      isAvailable: true,
      sortOrder: 2
    }
  })

  const burger = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: mains.id,
      name: 'Classic Burger',
      description: 'Beef patty, lettuce, tomato, onion, pickles, and our special sauce on a brioche bun',
      priceCents: 1899,
      isAvailable: true,
      sortOrder: 1
    }
  })

  const pasta = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: mains.id,
      name: 'Spaghetti Carbonara',
      description: 'Pasta with eggs, cheese, pancetta, and black pepper',
      priceCents: 2199,
      isAvailable: true,
      sortOrder: 2
    }
  })

  const coke = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: drinks.id,
      name: 'Coca-Cola',
      description: 'Classic Coca-Cola',
      priceCents: 299,
      isAvailable: true,
      sortOrder: 1
    }
  })

  const coffee = await prisma.menuItem.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: drinks.id,
      name: 'House Coffee',
      description: 'Freshly brewed coffee',
      priceCents: 399,
      isAvailable: true,
      sortOrder: 2
    }
  })

  // Create modifiers for burger
  await prisma.modifier.createMany({
    data: [
      {
        menuItemId: burger.id,
        name: 'Cheese',
        type: 'SINGLE',
        priceDeltaCents: 200,
        isRequired: false
      },
      {
        menuItemId: burger.id,
        name: 'Bacon',
        type: 'SINGLE',
        priceDeltaCents: 300,
        isRequired: false
      },
      {
        menuItemId: burger.id,
        name: 'Extra Patty',
        type: 'SINGLE',
        priceDeltaCents: 500,
        isRequired: false
      }
    ]
  })

  // Create modifiers for wings
  await prisma.modifier.createMany({
    data: [
      {
        menuItemId: chickenWings.id,
        name: 'Spice Level',
        type: 'SINGLE',
        priceDeltaCents: 0,
        isRequired: true
      },
      {
        menuItemId: chickenWings.id,
        name: 'Extra Sauce',
        type: 'SINGLE',
        priceDeltaCents: 100,
        isRequired: false
      }
    ]
  })

  console.log('✅ Sample menu created')

  // Create a sample order
  const order = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: tables[0].id,
      code: 'ORD-001',
      status: 'NEW',
      subtotalCents: 1899,
      taxCents: 166,
      tipCents: 342,
      totalCents: 2407,
      customerName: 'John Doe',
      customerEmail: 'john@example.com'
    }
  })

  // Create order items
  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      menuItemId: burger.id,
      qty: 1,
      unitPriceCents: 1899,
      notes: 'No pickles',
      modifiers: [
        { name: 'Cheese', priceDeltaCents: 200 },
        { name: 'Bacon', priceDeltaCents: 300 }
      ]
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      menuItemId: coke.id,
      qty: 2,
      unitPriceCents: 299,
      notes: null,
      modifiers: []
    }
  })

  console.log('✅ Sample order created')

  console.log('🎉 Database seeded successfully!')
  console.log(`
📊 Summary:
- 1 Superadmin user
- 1 Restaurant (${restaurant.name})
- ${tables.length} Tables
- 3 Menu Categories
- 6 Menu Items
- 1 Sample Order

🔗 Test URLs:
- Restaurant ordering: http://localhost:3000/r/${restaurant.slug}/t/T1
- Superadmin dashboard: http://localhost:3000/superadmin
- Staff dashboard: http://localhost:3000/dashboard
  `)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })