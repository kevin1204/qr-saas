import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Reset restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'reset' },
    update: {},
    create: {
      slug: 'reset',
      name: 'Reset',
      currency: 'CAD',
      timezone: 'America/Toronto',
      contactEmail: 'hello@reset.com',
    },
  })

  console.log('✅ Created restaurant:', restaurant.name)

  // Create tables T1-T8
  const tables = []
  for (let i = 1; i <= 8; i++) {
    const table = await prisma.table.upsert({
      where: { 
        restaurantId_code: {
          restaurantId: restaurant.id,
          code: `T${i}`
        }
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        label: `Table ${i}`,
        code: `T${i}`,
      },
    })
    tables.push(table)
  }

  console.log('✅ Created tables:', tables.length)

  // Create menu categories
  const categories = []
  
  // Check if categories already exist
  const existingCategories = await prisma.menuCategory.findMany({
    where: { restaurantId: restaurant.id }
  })
  
  if (existingCategories.length === 0) {
    categories.push(
      await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Coffee',
          sortOrder: 1,
        },
      }),
      await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Tea',
          sortOrder: 2,
        },
      }),
      await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Pastries',
          sortOrder: 3,
        },
      })
    )
  } else {
    categories.push(...existingCategories)
  }

  console.log('✅ Created categories:', categories.length)

  // Create menu items
  const existingItems = await prisma.menuItem.findMany({
    where: { restaurantId: restaurant.id }
  })
  
  let menuItems = []
  
  if (existingItems.length === 0) {
    menuItems = await Promise.all([
      // Coffee items
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[0].id,
          name: 'Espresso',
          priceCents: 350,
          description: 'Rich and bold single shot',
          isAvailable: true,
          sortOrder: 1,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[0].id,
          name: 'Americano',
          priceCents: 425,
          description: 'Espresso with hot water',
          isAvailable: true,
          sortOrder: 2,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[0].id,
          name: 'Cappuccino',
          priceCents: 475,
          description: 'Espresso with steamed milk and foam',
          isAvailable: true,
          sortOrder: 3,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[0].id,
          name: 'Latte',
          priceCents: 525,
          description: 'Espresso with steamed milk',
          isAvailable: true,
          sortOrder: 4,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[0].id,
          name: 'Cold Brew',
          priceCents: 450,
          description: 'Smooth cold-brewed coffee',
          isAvailable: true,
          sortOrder: 5,
        },
      }),

      // Tea items
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[1].id,
          name: 'Green Tea',
          priceCents: 375,
          description: 'Fresh green tea leaves',
          isAvailable: true,
          sortOrder: 1,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[1].id,
          name: 'Earl Grey',
          priceCents: 375,
          description: 'Classic bergamot black tea',
          isAvailable: true,
          sortOrder: 2,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[1].id,
          name: 'Chai Latte',
          priceCents: 525,
          description: 'Spiced tea with steamed milk',
          isAvailable: true,
          sortOrder: 3,
        },
      }),

      // Pastry items
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[2].id,
          name: 'Croissant',
          priceCents: 425,
          description: 'Buttery, flaky pastry',
          isAvailable: true,
          sortOrder: 1,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[2].id,
          name: 'Muffin',
          priceCents: 375,
          description: 'Fresh baked muffin (blueberry or chocolate)',
          isAvailable: true,
          sortOrder: 2,
        },
      }),
      prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: categories[2].id,
          name: 'Danish',
          priceCents: 450,
          description: 'Sweet pastry with fruit filling',
          isAvailable: true,
          sortOrder: 3,
        },
      }),
    ])
  } else {
    menuItems = existingItems
  }

  console.log('✅ Created menu items:', menuItems.length)

  // Create some modifiers for coffee items
  const coffeeItems = menuItems.filter(item => 
    item.name === 'Espresso' || item.name === 'Americano' || 
    item.name === 'Cappuccino' || item.name === 'Latte'
  )

  const existingModifiers = await prisma.modifier.findMany({
    where: { menuItemId: { in: coffeeItems.map(item => item.id) } }
  })

  if (existingModifiers.length === 0) {
    for (const item of coffeeItems) {
      await prisma.modifier.create({
        data: {
          menuItemId: item.id,
          name: 'Size',
          type: 'SINGLE',
          priceDeltaCents: 0,
          isRequired: true,
        },
      })

      await prisma.modifier.create({
        data: {
          menuItemId: item.id,
          name: 'Extra Shot',
          type: 'SINGLE',
          priceDeltaCents: 75,
          isRequired: false,
        },
      })
    }
  }

  console.log('✅ Created modifiers for coffee items')

  // Create a demo staff user (will need to be linked to Clerk user after first login)
  const existingStaffUser = await prisma.staffUser.findFirst({
    where: { clerkUserId: 'demo-user' }
  })

  let staffUser
  if (!existingStaffUser) {
    staffUser = await prisma.staffUser.create({
      data: {
        restaurantId: restaurant.id,
        clerkUserId: 'demo-user', // This will be replaced with actual Clerk user ID
        role: 'OWNER',
      },
    })
  } else {
    staffUser = existingStaffUser
  }

  console.log('✅ Created demo staff user')

  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Set up your Clerk account and get the user ID')
  console.log('2. Update the demo staff user with your actual Clerk user ID:')
  console.log(`   UPDATE staff_users SET clerk_user_id = 'your-clerk-user-id' WHERE clerk_user_id = 'demo-user';`)
  console.log('3. Visit http://localhost:3000/r/reset/t/T1 to see the menu')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
