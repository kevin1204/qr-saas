# QR Orders - Deployment & Setup Documentation

## Overview

This document provides comprehensive instructions for deploying and setting up the QR Orders application in development, staging, and production environments.

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **PostgreSQL**: 13.0 or higher (or Supabase)
- **Git**: For version control

### External Services

- **Stripe Account**: For payment processing
- **Clerk Account**: For authentication
- **Supabase Account**: For database and real-time features
- **Vercel Account**: For deployment (recommended)

## Development Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd qr-orders
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp env.example .env.local
```

Configure the following environment variables:

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

### 4. Database Setup

Generate Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Seed the database with sample data:

```bash
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## External Service Setup

### Stripe Configuration

#### 1. Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Enable Stripe Connect in your dashboard
4. Get your API keys from the Developers section

#### 2. Set Up Webhooks

Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
# Download from https://github.com/stripe/stripe-cli/releases
```

Login to Stripe:

```bash
stripe login
```

Forward webhooks to localhost:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret to your `.env.local`.

#### 3. Create Billing Product

1. Go to Stripe Dashboard → Products
2. Create a new product: "QR Orders MVP Standard"
3. Add a recurring price: $29/month
4. Copy the price ID to `STRIPE_PRICE_ID_MVP_STANDARD`

#### 4. Configure Connect Settings

1. Go to Connect → Settings
2. Set return URLs:
   - Development: `http://localhost:3000/admin/settings`
   - Production: `https://your-domain.com/admin/settings`
3. Enable required capabilities:
   - Direct charges
   - Express accounts (optional)

### Clerk Configuration

#### 1. Create Clerk Application

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Choose "Next.js" as the framework
4. Copy the API keys to your `.env.local`

#### 2. Configure Authentication

1. Go to User & Authentication → Email, Phone, Username
2. Enable email/password authentication
3. Go to User & Authentication → Social Connections
4. Enable Google OAuth (optional)
5. Configure allowed redirect URLs:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

#### 3. Set Up Webhooks (Optional)

1. Go to Webhooks → Add Endpoint
2. Add endpoint URL: `https://your-domain.com/api/clerk/webhook`
3. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`

### Supabase Configuration

#### 1. Create Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Choose a region close to your users
4. Set a strong database password

#### 2. Get Connection Details

1. Go to Settings → API
2. Copy the Project URL to `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the anon public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 3. Enable Realtime

1. Go to Database → Replication
2. Enable realtime for the `orders` table
3. Configure row-level security policies

#### 4. Set Up Row-Level Security

```sql
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for restaurant isolation
CREATE POLICY "Restaurant isolation" ON orders
  FOR ALL USING (restaurant_id = current_setting('app.current_restaurant_id')::uuid);
```

## Production Deployment

### Vercel Deployment (Recommended)

#### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Choose the `qr-orders` folder as the root directory
4. Select "Next.js" as the framework

#### 2. Configure Environment Variables

In the Vercel dashboard, add all production environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Connect
STRIPE_CONNECT_RETURN_URL="https://your-domain.com/admin/settings"
STRIPE_CONNECT_REFRESH_URL="https://your-domain.com/admin/settings"

# Stripe Billing
STRIPE_PRICE_ID_MVP_STANDARD="price_xxx"
STRIPE_BILLING_PORTAL_RETURN_URL="https://your-domain.com/admin/billing"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."

# App
APP_URL="https://your-domain.com"
```

#### 3. Configure Build Settings

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 4. Deploy

1. Push changes to your main branch
2. Vercel will automatically build and deploy
3. Monitor the deployment in the Vercel dashboard

### Alternative Deployment Options

#### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t qr-orders .
docker run -p 3000:3000 qr-orders
```

#### AWS Deployment

1. **Elastic Beanstalk**:
   - Upload application bundle
   - Configure environment variables
   - Set up load balancer

2. **ECS with Fargate**:
   - Create ECS cluster
   - Define task definition
   - Set up service with load balancer

3. **Lambda with Serverless**:
   - Use `@vercel/ncc` to bundle
   - Deploy with Serverless Framework
   - Configure API Gateway

## Database Migration

### Production Migration

```bash
# Set production database URL
export DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres"

# Run production migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Migration Best Practices

1. **Test migrations** on staging environment first
2. **Backup database** before major migrations
3. **Use transactions** for complex changes
4. **Monitor migration progress** in production
5. **Have rollback plan** ready

## Monitoring and Observability

### Application Monitoring

#### Vercel Analytics

1. Enable Vercel Analytics in dashboard
2. Monitor Core Web Vitals
3. Track performance metrics
4. Set up alerts for errors

#### Error Tracking

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const { withSentry } = require('@sentry/nextjs')

module.exports = withSentry({
  // Your existing config
})
```

### Database Monitoring

#### Supabase Dashboard

1. Monitor database performance
2. Track query execution times
3. Set up alerts for high CPU usage
4. Monitor connection pool usage

#### Custom Monitoring

```typescript
// Add to API routes
console.log('API call:', {
  endpoint: req.url,
  method: req.method,
  timestamp: new Date().toISOString(),
  duration: Date.now() - startTime
})
```

### Payment Monitoring

#### Stripe Dashboard

1. Monitor payment success rates
2. Track failed payments
3. Set up webhook failure alerts
4. Monitor Connect account status

#### Custom Payment Alerts

```typescript
// Add to webhook handler
if (event.type === 'checkout.session.completed') {
  // Send success notification
  await sendSlackNotification(`Payment successful: ${session.id}`)
}
```

## Security Configuration

### SSL/TLS

Vercel automatically provides SSL certificates. For other deployments:

1. **Let's Encrypt**: Free SSL certificates
2. **Cloudflare**: SSL + CDN
3. **AWS Certificate Manager**: For AWS deployments

### Environment Security

1. **Never commit** `.env` files
2. **Use different keys** for each environment
3. **Rotate keys** regularly
4. **Monitor key usage** in service dashboards

### Database Security

1. **Enable SSL** for database connections
2. **Use connection pooling** to limit connections
3. **Implement row-level security** (RLS)
4. **Regular security audits**

## Backup and Recovery

### Database Backups

#### Supabase Backups

1. **Automated daily backups** (included)
2. **Point-in-time recovery** (Pro plan)
3. **Manual backups** via dashboard

#### Custom Backup Strategy

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### Application Backups

1. **Code repository** (Git)
2. **Environment variables** (encrypted storage)
3. **Static assets** (CDN backup)
4. **Configuration files** (version controlled)

### Disaster Recovery Plan

1. **Recovery Time Objective (RTO)**: < 4 hours
2. **Recovery Point Objective (RPO)**: < 1 hour
3. **Backup frequency**: Daily automated + manual before major changes
4. **Testing schedule**: Monthly recovery drills

## Performance Optimization

### Frontend Optimization

1. **Image optimization**:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif']
  }
}
```

2. **Code splitting**:
```typescript
// Lazy load components
const QRGenerator = dynamic(() => import('@/components/QRGenerator'), {
  loading: () => <div>Loading...</div>
})
```

3. **Caching strategy**:
```typescript
// API route caching
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

### Backend Optimization

1. **Database indexing**:
```sql
CREATE INDEX CONCURRENTLY idx_orders_restaurant_status 
ON orders(restaurant_id, status);
```

2. **Connection pooling**:
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling
}
```

3. **API response caching**:
```typescript
// Cache menu data
const menuCache = new Map()

export async function GET() {
  const cacheKey = `menu-${restaurantId}`
  if (menuCache.has(cacheKey)) {
    return NextResponse.json(menuCache.get(cacheKey))
  }
  
  const menu = await fetchMenu(restaurantId)
  menuCache.set(cacheKey, menu)
  return NextResponse.json(menu)
}
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connection
npx prisma db pull

# Reset database (development only)
npx prisma migrate reset
```

#### Stripe Webhook Issues

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Check webhook logs
stripe logs tail
```

#### Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Debug Mode

Enable debug logging:

```env
DEBUG=prisma:*
NODE_ENV=development
```

### Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`
    
    // Check external services
    const stripe = await stripe.accounts.retrieve()
    
    return NextResponse.json({ status: 'healthy' })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 500 })
  }
}
```

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Review error logs
   - Check performance metrics
   - Update dependencies

2. **Monthly**:
   - Security updates
   - Database optimization
   - Backup verification

3. **Quarterly**:
   - Security audit
   - Performance review
   - Disaster recovery test

### Updates and Upgrades

1. **Dependencies**:
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update major versions
npm install package@latest
```

2. **Next.js updates**:
```bash
# Update Next.js
npm install next@latest react@latest react-dom@latest
```

3. **Database migrations**:
```bash
# Create migration
npx prisma migrate dev --name update_schema

# Apply to production
npx prisma migrate deploy
```

This deployment documentation provides comprehensive guidance for setting up and maintaining the QR Orders application across different environments.
