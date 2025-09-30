# QR Orders - Multi-tenant Restaurant Ordering System

A production-ready MVP for a multi-tenant QR ordering SaaS for restaurants, cafés, and bars. Customers scan QR codes to order directly from their phones with real-time order tracking.

## 🚀 Features

### Customer Experience
- **QR Code Ordering**: Scan table QR codes to access restaurant menus
- **Mobile-First Design**: Optimized for mobile devices
- **Real-time Order Tracking**: Live status updates from order to delivery
- **Secure Payments**: Integrated Stripe Checkout
- **Customizable Items**: Support for modifiers, notes, and special instructions

### Staff Management
- **Real-time Dashboard**: Kanban board for order management
- **Live Updates**: Orders appear instantly with real-time status changes
- **Order Details**: Full order information with customer notes
- **Status Management**: Drag & drop or click to advance order status

### Admin Features
- **Menu Management**: CRUD operations for categories, items, and modifiers
- **QR Code Generation**: Generate printable QR codes for all tables
- **Restaurant Settings**: Manage basic restaurant information
- **Multi-tenant Architecture**: Complete data isolation between restaurants

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Authentication**: Clerk (staff/admin)
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **Realtime**: Supabase Realtime
- **Payments**: Stripe Checkout
- **State Management**: Server Actions + minimal client state
- **UI Components**: Custom component library with TailwindCSS

## 📋 Prerequisites

Before running this project, make sure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL database** (local or hosted)
3. **Supabase account** (for database and realtime)
4. **Clerk account** (for authentication)
5. **Stripe account** (for payments)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd qr-orders
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/qr_orders"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# App
APP_URL="http://localhost:3000"
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

Seed the database with demo data:

```bash
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🎯 Demo Flow

### Customer Experience
1. Visit `http://localhost:3000/r/reset/t/T1` to see the demo menu
2. Add items to cart with customizations
3. Proceed to checkout (test mode)
4. Track your order at the redirect URL

### Staff Experience
1. Visit `http://localhost:3000/dashboard` (requires Clerk login)
2. View real-time order updates
3. Manage order status with drag & drop
4. Access admin features at `/admin/*`

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/           # Public customer routes
│   │   ├── r/[slug]/t/[tableCode]/  # Menu pages
│   │   └── order/[orderId]/         # Order tracking
│   ├── dashboard/          # Staff dashboard
│   ├── admin/              # Admin management
│   │   ├── menu/           # Menu management
│   │   ├── qr/             # QR code generation
│   │   └── settings/       # Restaurant settings
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── MenuGrid.tsx        # Menu display
│   ├── CartBar.tsx         # Shopping cart
│   ├── OrderTracker.tsx    # Order tracking
│   ├── Kanban.tsx          # Staff dashboard
│   └── ...                 # Other components
├── lib/
│   ├── db.ts              # Prisma client
│   ├── supabase.ts        # Supabase client
│   ├── auth.ts            # Auth helpers
│   └── utils.ts           # Utility functions
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Database seeding
```

## 🔧 Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Database
npm run db:migrate         # Run database migrations
npm run db:seed            # Seed database with demo data
npm run db:studio          # Open Prisma Studio
npm run db:generate        # Generate Prisma client
```

## 🗄 Database Schema

The application uses a multi-tenant architecture with the following key entities:

- **Restaurant**: Restaurant information and settings
- **Table**: Restaurant tables with unique codes
- **MenuCategory**: Menu organization
- **MenuItem**: Individual menu items with pricing
- **Modifier**: Item customizations (size, extras, etc.)
- **Order**: Customer orders with status tracking
- **OrderItem**: Individual items within orders
- **StaffUser**: Restaurant staff with role-based access

## 🔐 Security Features

- **Multi-tenant Isolation**: All data is scoped by restaurant ID
- **Role-based Access**: Owner, Manager, and Staff roles
- **Server-side Validation**: All inputs validated with Zod
- **Secure Payments**: Stripe handles all payment processing
- **Protected Routes**: Clerk authentication for staff areas

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these in your production environment:

```env
DATABASE_URL="your-production-database-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
APP_URL="https://your-domain.com"
```

### Database Migration

```bash
npm run db:migrate
npm run db:seed
```

### Build and Deploy

```bash
npm run build
npm run start
```

## 🧪 Testing the Application

### 1. Customer Flow Test
1. Visit the demo menu: `http://localhost:3000/r/reset/t/T1`
2. Add items to cart with customizations
3. Complete checkout with Stripe test card: `4242 4242 4242 4242`
4. Track the order on the success page

### 2. Staff Flow Test
1. Set up Clerk authentication
2. Create a staff user and link to restaurant
3. Visit dashboard to see orders
4. Test real-time updates by placing orders

### 3. Admin Flow Test
1. Access admin pages with owner/manager role
2. Toggle menu item availability
3. Generate QR codes for tables
4. Update restaurant settings

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Supabase Realtime**: Check that realtime is enabled in Supabase dashboard
3. **Stripe Webhooks**: Ensure webhook endpoint is configured in Stripe dashboard
4. **Clerk Authentication**: Verify Clerk keys are correct and user is created

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📝 Next Steps

This MVP includes the core functionality. Future enhancements could include:

- [ ] Multi-restaurant staff access
- [ ] Advanced analytics and reporting
- [ ] Mobile app for staff
- [ ] Inventory management
- [ ] Tax calculation
- [ ] Multi-language support
- [ ] Custom branding per restaurant

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Ordering! 🍕☕🍰**