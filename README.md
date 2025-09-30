# QR Orders - Complete SaaS Platform

A fully functional multi-tenant QR ordering system for restaurants, cafés, and bars with Stripe Connect Standard, Direct Charges, and Stripe Billing integration.

## 🚀 Features

### For Restaurants
- **Complete Onboarding**: Business setup → Stripe Connect → 14-day trial → Tables → QR codes → Menu
- **Direct Payments**: All payments go directly to restaurant's Stripe account (no platform fees by default)
- **Real-time Management**: Live order tracking with Supabase Realtime
- **QR Code Generation**: Printable QR codes for each table
- **Menu Management**: Full CRUD for categories, items, and modifiers
- **Multi-tenant Architecture**: Complete data isolation per restaurant
- **Staff Management**: Role-based access control (Owner, Manager, Staff)

### For Customers
- **Mobile-First**: Scan QR → Browse menu → Add to cart → Checkout
- **Apple Pay & Google Pay**: Native payment methods via Stripe Checkout
- **Real-time Updates**: Live order status tracking
- **Modifiers & Notes**: Customize items with special instructions
- **Tipping Support**: Built-in tipping functionality

### For Superadmins
- **Restaurant Management**: Invite and manage restaurant accounts
- **Platform Overview**: Monitor all restaurants and orders
- **Invitation System**: Private beta with invitation-only signup
- **Analytics Dashboard**: Platform-wide statistics and insights

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Clerk
- **Payments**: Stripe Connect Standard + Stripe Billing
- **Real-time**: Supabase Realtime
- **QR Codes**: qrcode library
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

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/qr_orders"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# App
APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed
```

### 4. Start Development

```bash
npm run dev
```

## 🏗 Architecture

### Multi-Tenant Design
- Each restaurant is a separate tenant with isolated data
- Staff users are scoped to their restaurant
- Superadmin can manage all restaurants

### User Roles
- **Superadmin**: Platform management, restaurant invitations
- **Owner**: Full restaurant control, billing, staff management
- **Manager**: Operations management, menu, orders
- **Staff**: Order management only

### Payment Flow
1. Customer places order
2. Stripe Checkout with Direct Charges
3. Payment goes directly to restaurant's Stripe account
4. Platform can optionally take a fee

## 📱 User Flows

### Restaurant Onboarding
1. Superadmin sends invitation
2. Restaurant owner accepts invitation
3. Complete business profile setup
4. Connect Stripe account
5. Create tables and generate QR codes
6. Set up menu items and categories
7. Start accepting orders

### Customer Ordering
1. Scan QR code at table
2. Browse menu and add items to cart
3. Customize items with modifiers
4. Add special instructions
5. Proceed to checkout
6. Pay with Stripe (cards, Apple Pay, Google Pay)
7. Track order status in real-time

### Staff Management
1. View incoming orders on dashboard
2. Update order status (New → In Progress → Ready → Delivered)
3. Manage menu availability
4. Generate new QR codes as needed

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/restaurants/[slug]` - Get restaurant info and menu
- `POST /api/checkout` - Create checkout session
- `GET /api/orders/[id]` - Get order details

### Admin Endpoints
- `GET /api/orders` - List restaurant orders
- `POST /api/orders/status` - Update order status
- `GET /api/menu` - Get menu items
- `POST /api/menu/items/availability` - Toggle item availability
- `GET /api/tables` - List tables
- `POST /api/tables` - Create table
- `POST /api/qr/generate` - Generate QR code

### Superadmin Endpoints
- `POST /api/superadmin/invite` - Send restaurant invitation
- `GET /api/invitations/[token]` - Get invitation details
- `POST /api/invitations/[token]/accept` - Accept invitation

## 🎨 Components

### Core Components
- `MenuGrid` - Display menu items by category
- `CartBar` - Shopping cart with checkout
- `ItemDrawer` - Item customization modal
- `OrderTracker` - Real-time order status
- `QRGenerator` - QR code management
- `Navigation` - Role-based navigation

### UI Components
- Button, Card, Input, Label, Select
- Badge, Toast, Modal
- Responsive design with Tailwind CSS

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
APP_URL="https://your-domain.com"
```

## 🔒 Security

- Multi-tenant data isolation
- Role-based access control
- Stripe webhook signature verification
- Input validation with Zod
- SQL injection prevention with Prisma

## 📊 Monitoring

- Real-time order tracking
- Order status updates
- Payment confirmation
- Error logging and handling

## 🧪 Testing

### Test the Complete Flow
1. **Superadmin**: Visit `/superadmin` to invite a restaurant
2. **Restaurant**: Accept invitation and complete setup
3. **Customer**: Scan QR code and place an order
4. **Staff**: Update order status in dashboard

### Sample Data
The seed script creates:
- 1 Superadmin user
- 1 Demo restaurant with sample menu
- 3 Tables with QR codes
- 1 Sample order

## 🎯 Next Steps

### Phase 1: Private Beta (Current)
- Invitation-only restaurant signup
- Basic order management
- Stripe Connect integration

### Phase 2: Public Launch
- Public restaurant signup
- Stripe Billing for subscriptions
- Advanced analytics
- Mobile app

### Phase 3: Scale
- Multi-language support
- Advanced reporting
- API for third-party integrations
- White-label solutions

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email support@qroders.com or create an issue in the repository.

---

**QR Orders** - Modernizing restaurant ordering, one QR code at a time. 🍽️📱