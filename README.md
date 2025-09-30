# QR Orders - Multi-Tenant Restaurant Ordering SaaS

A comprehensive QR ordering system for restaurants, cafés, and bars with Stripe Connect Standard, Direct Charges, and Stripe Billing integration.

## 🚀 Features

### For Restaurants
- **Complete Onboarding**: Business setup → Stripe Connect → 14-day trial → Tables → QR codes → Menu
- **Direct Payments**: All payments go directly to restaurant's Stripe account (no platform fees by default)
- **Real-time Management**: Live order tracking with Supabase Realtime
- **QR Code Generation**: Printable QR codes for each table
- **Menu Management**: Full CRUD for categories, items, and modifiers
- **Analytics Dashboard**: Order insights and customer data
- **Multi-tenant Architecture**: Complete data isolation per restaurant

### For Customers
- **Mobile-First**: Scan QR → Browse menu → Add to cart → Checkout
- **Apple Pay & Google Pay**: Native payment methods via Stripe Checkout
- **Real-time Updates**: Live order status tracking
- **Modifiers & Notes**: Customize items with special instructions

### Technical Features
- **Stripe Connect Standard**: Direct charges to restaurant accounts
- **Stripe Billing**: SaaS subscription management with 14-day trials
- **Supabase Realtime**: Live updates across all clients
- **Clerk Authentication**: Secure staff and admin access
- **PostgreSQL**: Robust data storage with Prisma ORM
- **TypeScript**: Full type safety throughout
- **Mobile-First UI**: Responsive design with Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Clerk
- **Payments**: Stripe Connect Standard + Stripe Billing
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Stripe account with Connect enabled
- Clerk account for authentication

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd qr-orders
npm install
```

### 2. Environment Setup

Copy the environment template and fill in your values:

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

# Stripe Connect
STRIPE_CONNECT_RETURN_URL="http://localhost:3000/admin/settings"
STRIPE_CONNECT_REFRESH_URL="http://localhost:3000/admin/settings"

# Stripe Billing
STRIPE_PRICE_ID_MVP_STANDARD="price_xxx"
STRIPE_BILLING_PORTAL_RETURN_URL="http://localhost:3000/admin/billing"

# Platform Fees (optional)
PLATFORM_FEE_BPS=0
PLATFORM_FEE_FIXED_CENTS=0

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# App
APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔧 Detailed Setup

### Stripe Configuration

#### 1. Create Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Enable Stripe Connect in your dashboard
- Get your API keys from the Developers section

#### 2. Set Up Webhooks
```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret to your `.env.local`.

#### 3. Create Billing Product
1. Go to Stripe Dashboard → Products
2. Create a new product: "QR Orders MVP Standard"
3. Add a recurring price: $29/month
4. Copy the price ID to `STRIPE_PRICE_ID_MVP_STANDARD`

### Clerk Configuration

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Enable Google OAuth (optional)
4. Copy the API keys to your `.env.local`

### Supabase Configuration

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy the URL and anon key to your `.env.local`
4. Enable Realtime for the `orders` table

## 🧪 Testing the Complete Flow

### 1. Restaurant Onboarding

1. Visit `http://localhost:3000/onboarding`
2. Complete the business profile
3. Connect Stripe account (use test mode)
4. Start 14-day trial
5. Create tables
6. Generate QR codes
7. Set up menu

### 2. Customer Ordering

1. Scan a QR code or visit `/r/[slug]/t/[tableCode]`
2. Browse menu and add items to cart
3. Proceed to checkout
4. Complete payment with test card: `4242 4242 4242 4242`
5. View order status in real-time

### 3. Staff Management

1. Visit `/dashboard` to see the Kanban board
2. Update order status by dragging cards
3. View order details by clicking cards
4. Manage menu at `/admin/menu`
5. Generate QR codes at `/admin/qr`

## 📱 Test Cards

Use these Stripe test cards for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- **Apple Pay**: Use Safari on iOS/macOS
- **Google Pay**: Use Chrome on Android

## 🏗 Architecture

### Database Schema

```sql
-- Core entities
Restaurant (id, slug, name, stripeAccountId, billingCustomerId, ...)
StaffUser (id, restaurantId, clerkUserId, role)
Table (id, restaurantId, label, code)
MenuCategory (id, restaurantId, name, sortOrder)
MenuItem (id, restaurantId, categoryId, name, priceCents, ...)
Modifier (id, menuItemId, name, type, priceDeltaCents, ...)
Order (id, restaurantId, tableId, code, status, totalCents, ...)
OrderItem (id, orderId, menuItemId, qty, unitPriceCents, ...)
```

### Payment Flow

1. **Customer** scans QR → browses menu → adds to cart
2. **Checkout** creates Stripe Checkout session on restaurant's connected account
3. **Payment** processes directly to restaurant's Stripe account
4. **Webhook** marks order as PAID and broadcasts via Supabase Realtime
5. **Dashboard** updates in real-time for staff

### Multi-tenancy

- All queries scoped by `restaurantId`
- Middleware enforces restaurant access
- Staff users linked to specific restaurants
- Complete data isolation between restaurants

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production

```env
# Update URLs for production
APP_URL="https://your-domain.com"
STRIPE_CONNECT_RETURN_URL="https://your-domain.com/admin/settings"
STRIPE_CONNECT_REFRESH_URL="https://your-domain.com/admin/settings"
STRIPE_BILLING_PORTAL_RETURN_URL="https://your-domain.com/admin/billing"
```

### Database Migration

```bash
# Run production migration
npx prisma migrate deploy
```

## 🔒 Security

- **Authentication**: Clerk handles all auth flows
- **Authorization**: Server-side role checks and restaurant scoping
- **Payments**: Stripe handles all payment processing
- **Data**: PostgreSQL with proper indexing and constraints
- **API**: Input validation with Zod schemas

## 📊 Monitoring

- **Stripe Dashboard**: Monitor payments and subscriptions
- **Supabase Dashboard**: Monitor database and realtime
- **Vercel Analytics**: Monitor performance and errors
- **Clerk Dashboard**: Monitor user authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Clerk Support**: [clerk.com/support](https://clerk.com/support)

## 🎯 Roadmap

- [ ] Advanced analytics and reporting
- [ ] POS system integrations
- [ ] Mobile app for staff
- [ ] Multi-location support
- [ ] Advanced customization options
- [ ] API for third-party integrations

---

**Built with ❤️ for restaurants everywhere**