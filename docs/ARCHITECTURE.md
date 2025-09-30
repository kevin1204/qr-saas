# QR Orders - Technical Architecture

## Overview

QR Orders is a multi-tenant SaaS application that enables restaurants to provide contactless ordering through QR codes. The system handles the complete ordering flow from customer scanning to payment processing and real-time order management.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │   Restaurant    │    │   Staff         │
│   Mobile App    │    │   Dashboard     │    │   Dashboard     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 15 Application                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Public    │  │   Admin     │  │     API Routes          │ │
│  │   Routes    │  │   Routes    │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Clerk Auth    │    │   Stripe        │    │   Supabase      │
│   (Staff)       │    │   Connect       │    │   Realtime      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                          │
│                    (via Prisma ORM)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Next.js 15 App Router)

#### Public Routes
- **Landing Page** (`/`) - Marketing and demo
- **About Page** (`/about`) - Company information
- **Pricing Page** (`/pricing`) - Subscription plans
- **Contact Page** (`/contact`) - Support information
- **Demo Ordering** (`/r/[slug]/t/[tableCode]`) - Customer ordering interface

#### Admin Routes
- **Dashboard** (`/dashboard`) - Real-time order management (Kanban board)
- **Menu Management** (`/admin/menu`) - CRUD operations for menu items
- **QR Generator** (`/admin/qr`) - Generate and download QR codes
- **Settings** (`/admin/settings`) - Restaurant configuration and Stripe setup
- **Billing** (`/admin/billing`) - Subscription management

#### Authentication Routes
- **Signup** (`/signup`) - Restaurant registration
- **Onboarding** (`/onboarding`) - Multi-step setup process

### 2. API Layer

#### Authentication & Authorization
- **Clerk Integration** - Staff authentication
- **Role-based Access** - OWNER, MANAGER, STAFF roles
- **Restaurant Scoping** - All data isolated by restaurant

#### Core API Endpoints

**Restaurant Management**
- `POST /api/admin/restaurant` - Create restaurant
- `GET /api/admin/restaurant` - Get restaurant details
- `PATCH /api/admin/restaurant` - Update restaurant settings

**Menu Management**
- `GET /api/menu` - Fetch menu with categories and items
- `PATCH /api/menu/items/availability` - Toggle item availability

**Order Management**
- `GET /api/orders` - Fetch orders for restaurant
- `PATCH /api/orders/status` - Update order status
- `POST /api/checkout` - Create Stripe checkout session

**Table Management**
- `GET /api/tables` - Fetch restaurant tables
- `POST /api/onboarding/tables` - Create tables during onboarding

**Stripe Integration**
- `POST /api/connect/create-account` - Create Stripe Connect account
- `POST /api/connect/account-link` - Generate account onboarding link
- `POST /api/billing/start-trial` - Start 14-day trial
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### 3. Database Schema (PostgreSQL + Prisma)

#### Core Entities

**Restaurant**
- Primary entity for multi-tenancy
- Contains Stripe Connect and billing information
- Stores restaurant settings (currency, timezone, tax rates)

**StaffUser**
- Links Clerk users to restaurants
- Role-based permissions (OWNER, MANAGER, STAFF)
- Cascade delete with restaurant

**Table**
- Restaurant table management
- Unique code per restaurant for QR generation
- Links to orders for tracking

**Menu System**
- **MenuCategory** - Organize menu items
- **MenuItem** - Individual food/drink items with pricing
- **Modifier** - Customization options (single/multi select)

**Order System**
- **Order** - Customer orders with status tracking
- **OrderItem** - Individual items in an order with modifiers

#### Key Relationships
- Restaurant → StaffUser (1:many)
- Restaurant → Table (1:many)
- Restaurant → MenuCategory (1:many)
- MenuCategory → MenuItem (1:many)
- MenuItem → Modifier (1:many)
- Restaurant → Order (1:many)
- Order → OrderItem (1:many)

### 4. Payment Integration (Stripe)

#### Stripe Connect Standard
- **Direct Charges** - Payments go directly to restaurant accounts
- **Account Onboarding** - Automated Stripe account setup
- **Webhook Handling** - Real-time payment status updates

#### Stripe Billing
- **SaaS Subscriptions** - Monthly recurring billing
- **14-day Trials** - Free trial period for new restaurants
- **Billing Portal** - Self-service subscription management

#### Payment Flow
1. Customer adds items to cart
2. Checkout creates Stripe session on restaurant's connected account
3. Payment processes directly to restaurant
4. Webhook updates order status to PAID
5. Real-time update broadcasts to staff dashboard

### 5. Real-time Features (Supabase)

#### Realtime Subscriptions
- **Order Updates** - Live status changes
- **New Orders** - Instant notification of new orders
- **Menu Changes** - Real-time menu availability updates

#### Implementation
- PostgreSQL triggers for database changes
- Supabase Realtime channels for broadcasting
- Client-side subscriptions for live updates

## Security Architecture

### Authentication
- **Clerk** - Handles all staff authentication
- **JWT Tokens** - Secure session management
- **Role-based Access** - Granular permissions

### Authorization
- **Restaurant Scoping** - All queries filtered by restaurantId
- **API Middleware** - Server-side permission checks
- **Data Isolation** - Complete separation between restaurants

### Payment Security
- **Stripe PCI Compliance** - No card data stored locally
- **Webhook Verification** - Signature validation
- **HTTPS Only** - All communication encrypted

## Performance Considerations

### Database Optimization
- **Indexed Queries** - Optimized for restaurant scoping
- **Connection Pooling** - Prisma connection management
- **Query Optimization** - Efficient data fetching

### Caching Strategy
- **Static Generation** - Public pages pre-rendered
- **API Caching** - Response caching for menu data
- **CDN Integration** - Vercel Edge Network

### Real-time Optimization
- **Selective Subscriptions** - Only subscribe to relevant data
- **Connection Management** - Efficient WebSocket usage
- **Update Batching** - Group related updates

## Scalability Design

### Multi-tenancy
- **Database Level** - All queries scoped by restaurantId
- **Application Level** - Middleware enforces isolation
- **Resource Limits** - Per-restaurant quotas

### Horizontal Scaling
- **Stateless Design** - No server-side sessions
- **Database Scaling** - Read replicas for queries
- **CDN Distribution** - Global content delivery

### Monitoring & Observability
- **Error Tracking** - Vercel Analytics
- **Performance Monitoring** - Core Web Vitals
- **Database Monitoring** - Supabase metrics
- **Payment Monitoring** - Stripe Dashboard

## Development Workflow

### Local Development
1. **Environment Setup** - Copy env.example to .env.local
2. **Database Setup** - Prisma migrations and seeding
3. **External Services** - Stripe, Clerk, Supabase configuration
4. **Development Server** - `npm run dev`

### Testing Strategy
- **Unit Tests** - Component and utility testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user flow testing
- **Payment Testing** - Stripe test mode

### Deployment Pipeline
1. **Code Push** - GitHub repository
2. **Automatic Build** - Vercel deployment
3. **Environment Variables** - Secure configuration
4. **Database Migration** - Production schema updates
5. **Health Checks** - Automated monitoring

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database abstraction
- **Zod** - Runtime type validation

### Database
- **PostgreSQL** - Primary database
- **Supabase** - Database hosting and realtime

### Authentication
- **Clerk** - User management and authentication

### Payments
- **Stripe Connect** - Multi-party payments
- **Stripe Billing** - Subscription management

### Deployment
- **Vercel** - Hosting and CI/CD
- **GitHub** - Version control

## Future Considerations

### Planned Features
- **Mobile App** - Native iOS/Android apps
- **POS Integration** - Third-party system connections
- **Advanced Analytics** - Detailed reporting and insights
- **Multi-location** - Support for restaurant chains
- **API Access** - Third-party integrations

### Technical Debt
- **QR Code Library** - Replace external API with local generation
- **Error Handling** - Comprehensive error boundaries
- **Testing Coverage** - Increase test coverage
- **Performance** - Optimize bundle size and loading times
