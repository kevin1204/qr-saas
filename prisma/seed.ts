import { PrismaClient, StaffRole, ModifierType, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      slug: 'demo-restaurant',
      name: 'Demo Restaurant',
      address: '123 Main St, City, State 12345',
      currency: 'USD',
      timezone: 'America/New_York',
      serviceType: 'TABLE',
      taxRateBps: 875, // 8.75%
      defaultTipBps: 1800, // 18%
      // Demo Stripe account (test mode)
      stripeAccountId: 'acct_demo_1234567890',
      chargesEnabled: true,
      payoutsEnabled: true,
      // Demo billing customer
      billingCustomerId: 'cus_demo_1234567890',
      billingSubscriptionId: 'sub_demo_1234567890',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  console.log(`✅ Created restaurant: ${restaurant.name}`);

  // Create demo staff user
  const staffUser = await prisma.staffUser.create({
    data: {
      restaurantId: restaurant.id,
      clerkUserId: 'demo_clerk_user_123',
      role: StaffRole.OWNER,
    },
  });

  console.log(`✅ Created staff user: ${staffUser.role}`);

  // Create tables
  const tables = await Promise.all([
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Table 1',
        code: 'T1',
      },
    }),
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Table 2',
        code: 'T2',
      },
    }),
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Table 3',
        code: 'T3',
      },
    }),
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Table 4',
        code: 'T4',
      },
    }),
    prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        label: 'Table 5',
        code: 'T5',
      },
    }),
  ]);

  console.log(`✅ Created ${tables.length} tables`);

  // Create menu categories
  const appetizers = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Appetizers',
      sortOrder: 1,
    },
  });

  const mains = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Main Courses',
      sortOrder: 2,
    },
  });

  const desserts = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Desserts',
      sortOrder: 3,
    },
  });

  const beverages = await prisma.menuCategory.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Beverages',
      sortOrder: 4,
    },
  });

  console.log(`✅ Created 4 menu categories`);

  // Create menu items
  const menuItems = await Promise.all([
    // Appetizers
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: appetizers.id,
        name: 'Buffalo Wings',
        priceCents: 1299,
        description: 'Crispy wings tossed in our signature buffalo sauce',
        imageUrl: 'https://images.unsplash.com/photo-1567620832904-9fe5cf23db13?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: appetizers.id,
        name: 'Loaded Nachos',
        priceCents: 1199,
        description: 'Tortilla chips loaded with cheese, jalapeños, and sour cream',
        imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: appetizers.id,
        name: 'Caesar Salad',
        priceCents: 899,
        description: 'Fresh romaine lettuce with parmesan cheese and croutons',
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 3,
      },
    }),

    // Main Courses
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: mains.id,
        name: 'Grilled Salmon',
        priceCents: 2499,
        description: 'Fresh Atlantic salmon grilled to perfection with lemon herb butter',
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: mains.id,
        name: 'Ribeye Steak',
        priceCents: 3299,
        description: '12oz ribeye steak cooked to your preference',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: mains.id,
        name: 'Chicken Parmesan',
        priceCents: 1999,
        description: 'Breaded chicken breast with marinara sauce and mozzarella',
        imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 3,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: mains.id,
        name: 'Vegetarian Pasta',
        priceCents: 1699,
        description: 'Penne pasta with seasonal vegetables in garlic olive oil',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 4,
      },
    }),

    // Desserts
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: desserts.id,
        name: 'Chocolate Lava Cake',
        priceCents: 899,
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: desserts.id,
        name: 'Tiramisu',
        priceCents: 799,
        description: 'Classic Italian dessert with coffee-soaked ladyfingers',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 2,
      },
    }),

    // Beverages
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: beverages.id,
        name: 'Craft Beer',
        priceCents: 699,
        description: 'Selection of local craft beers',
        imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 1,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: beverages.id,
        name: 'House Wine',
        priceCents: 899,
        description: 'Red or white wine by the glass',
        imageUrl: 'https://images.unsplash.com/photo-1506377247375-2616b612b786?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 2,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        categoryId: beverages.id,
        name: 'Fresh Lemonade',
        priceCents: 399,
        description: 'Freshly squeezed lemonade with mint',
        imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
        isAvailable: true,
        sortOrder: 3,
      },
    }),
  ]);

  console.log(`✅ Created ${menuItems.length} menu items`);

  // Create modifiers for some items
  const salmon = menuItems.find(item => item.name === 'Grilled Salmon');
  const steak = menuItems.find(item => item.name === 'Ribeye Steak');
  const pasta = menuItems.find(item => item.name === 'Vegetarian Pasta');

  if (salmon) {
    await prisma.modifier.createMany({
      data: [
        {
          menuItemId: salmon.id,
          name: 'Cooking Temperature',
          type: ModifierType.SINGLE,
          priceDeltaCents: 0,
          isRequired: true,
        },
        {
          menuItemId: salmon.id,
          name: 'Extra Sauce',
          type: ModifierType.SINGLE,
          priceDeltaCents: 200,
          isRequired: false,
        },
      ],
    });
  }

  if (steak) {
    await prisma.modifier.createMany({
      data: [
        {
          menuItemId: steak.id,
          name: 'Cooking Temperature',
          type: ModifierType.SINGLE,
          priceDeltaCents: 0,
          isRequired: true,
        },
        {
          menuItemId: steak.id,
          name: 'Add Shrimp',
          type: ModifierType.SINGLE,
          priceDeltaCents: 800,
          isRequired: false,
        },
        {
          menuItemId: steak.id,
          name: 'Side Options',
          type: ModifierType.MULTI,
          priceDeltaCents: 0,
          isRequired: false,
        },
      ],
    });
  }

  if (pasta) {
    await prisma.modifier.createMany({
      data: [
        {
          menuItemId: pasta.id,
          name: 'Extra Vegetables',
          type: ModifierType.SINGLE,
          priceDeltaCents: 300,
          isRequired: false,
        },
        {
          menuItemId: pasta.id,
          name: 'Add Protein',
          type: ModifierType.SINGLE,
          priceDeltaCents: 500,
          isRequired: false,
        },
      ],
    });
  }

  console.log(`✅ Created modifiers for menu items`);

  // Create some sample orders
  const order1 = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: tables[0].id,
      code: 'ORD-001',
      status: OrderStatus.PAID,
      totalCents: 3798, // $37.98
      stripeSessionId: 'cs_test_demo_001',
      notes: 'Extra napkins please',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: tables[1].id,
      code: 'ORD-002',
      status: OrderStatus.IN_PROGRESS,
      totalCents: 2499, // $24.99
      stripeSessionId: 'cs_test_demo_002',
    },
  });

  const order3 = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: tables[2].id,
      code: 'ORD-003',
      status: OrderStatus.READY,
      totalCents: 1699, // $16.99
      stripeSessionId: 'cs_test_demo_003',
    },
  });

  console.log(`✅ Created 3 sample orders`);

  // Create order items
  const salmonItem = menuItems.find(item => item.name === 'Grilled Salmon');
  const wingsItem = menuItems.find(item => item.name === 'Buffalo Wings');
  const pastaItem = menuItems.find(item => item.name === 'Vegetarian Pasta');

  if (salmonItem && order1) {
    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        menuItemId: salmonItem.id,
        qty: 1,
        unitPriceCents: salmonItem.priceCents,
        notes: 'Medium rare',
        modifiers: JSON.stringify([
          { name: 'Cooking Temperature', value: 'Medium Rare' },
          { name: 'Extra Sauce', value: 'Yes' },
        ]),
      },
    });
  }

  if (wingsItem && order2) {
    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        menuItemId: wingsItem.id,
        qty: 2,
        unitPriceCents: wingsItem.priceCents,
        notes: 'Extra spicy',
      },
    });
  }

  if (pastaItem && order3) {
    await prisma.orderItem.create({
      data: {
        orderId: order3.id,
        menuItemId: pastaItem.id,
        qty: 1,
        unitPriceCents: pastaItem.priceCents,
        notes: 'No onions',
        modifiers: JSON.stringify([
          { name: 'Extra Vegetables', value: 'Yes' },
        ]),
      },
    });
  }

  console.log(`✅ Created order items`);

  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log(`   • Restaurant: ${restaurant.name} (${restaurant.slug})`);
  console.log(`   • Tables: ${tables.length}`);
  console.log(`   • Menu Categories: 4`);
  console.log(`   • Menu Items: ${menuItems.length}`);
  console.log(`   • Sample Orders: 3`);
  console.log('');
  console.log('🔗 Test URLs:');
  console.log(`   • Customer Menu: http://localhost:3000/r/${restaurant.slug}/t/T1`);
  console.log(`   • Admin Dashboard: http://localhost:3000/dashboard`);
  console.log(`   • Admin Settings: http://localhost:3000/admin/settings`);
  console.log(`   • Admin Billing: http://localhost:3000/admin/billing`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });