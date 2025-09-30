# QR Orders - Database Schema Documentation

## Overview

The QR Orders application uses PostgreSQL as the primary database with Prisma ORM for type-safe database operations. The schema is designed for multi-tenancy with complete data isolation between restaurants.

## Database Configuration

### Prisma Schema Location
- **File**: `prisma/schema.prisma`
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma Client

### Connection String
```env
DATABASE_URL="postgresql://username:password@localhost:5432/qr_orders"
```

## Core Entities

### Restaurant

The central entity that represents a restaurant business and enables multi-tenancy.

```sql
model Restaurant {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  address   String?
  currency  String   @default("USD")
  timezone  String   @default("America/New_York")
  serviceType String @default("TABLE") // TABLE, PICKUP
  taxRateBps Int     @default(0) // basis points (0.00%)
  defaultTipBps Int  @default(0) // basis points (0.00%)
  
  // Stripe Connect
  stripeAccountId    String?  @unique
  chargesEnabled     Boolean  @default(false)
  payoutsEnabled     Boolean  @default(false)
  
  // Stripe Billing
  billingCustomerId     String?
  billingSubscriptionId String?
  trialEndsAt           DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  tables        Table[]
  menuCategories MenuCategory[]
  menuItems     MenuItem[]
  orders        Order[]
  staffUsers    StaffUser[]

  @@map("restaurants")
}
```

**Key Fields**:
- `id`: Unique identifier (CUID)
- `slug`: URL-friendly identifier for public routes
- `name`: Restaurant business name
- `currency`: ISO currency code (USD, EUR, etc.)
- `timezone`: IANA timezone identifier
- `serviceType`: Service model (TABLE for dine-in, PICKUP for takeout)
- `taxRateBps`: Tax rate in basis points (875 = 8.75%)
- `defaultTipBps`: Default tip percentage in basis points

**Stripe Integration**:
- `stripeAccountId`: Connected Stripe account ID
- `chargesEnabled`: Whether payments are enabled
- `payoutsEnabled`: Whether payouts are enabled
- `billingCustomerId`: Stripe customer ID for billing
- `billingSubscriptionId`: Active subscription ID
- `trialEndsAt`: End of 14-day trial period

### StaffUser

Links Clerk authentication users to restaurants with role-based access.

```sql
model StaffUser {
  id           String     @id @default(cuid())
  restaurantId String
  clerkUserId  String     @unique
  role         StaffRole  @default(STAFF) // OWNER, MANAGER, STAFF
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@map("staff_users")
}
```

**Roles**:
- `OWNER`: Full access to all restaurant features
- `MANAGER`: Access to orders, menu, and settings (no billing)
- `STAFF`: Access to orders and basic menu management

**Security**: All queries must be scoped by `restaurantId` to ensure data isolation.

### Table

Represents restaurant tables for QR code generation and order tracking.

```sql
model Table {
  id           String     @id @default(cuid())
  restaurantId String
  label        String
  code         String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  orders     Order[]

  @@unique([restaurantId, code])
  @@map("tables")
}
```

**Key Fields**:
- `label`: Display name (e.g., "Table 1", "Bar 2")
- `code`: Unique identifier within restaurant (e.g., "T1", "B2")
- `restaurantId`: Foreign key to Restaurant

**Constraints**:
- Unique constraint on `[restaurantId, code]` ensures no duplicate codes per restaurant
- Cascade delete when restaurant is deleted

## Menu System

### MenuCategory

Organizes menu items into logical groups.

```sql
model MenuCategory {
  id           String     @id @default(cuid())
  restaurantId String
  name         String
  sortOrder    Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  menuItems  MenuItem[]

  @@map("menu_categories")
}
```

**Features**:
- `sortOrder`: Controls display order (ascending)
- Hierarchical organization of menu items
- Restaurant-scoped for multi-tenancy

### MenuItem

Individual food and beverage items with pricing and customization options.

```sql
model MenuItem {
  id           String     @id @default(cuid())
  restaurantId String
  categoryId   String
  name         String
  priceCents   Int
  description  String?
  imageUrl     String?
  isAvailable  Boolean    @default(true)
  sortOrder    Int        @default(0)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Relations
  restaurant  Restaurant   @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  category    MenuCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  modifiers   Modifier[]
  orderItems  OrderItem[]

  @@map("menu_items")
}
```

**Key Fields**:
- `priceCents`: Price in cents (1299 = $12.99)
- `description`: Optional item description
- `imageUrl`: Optional image URL
- `isAvailable`: Controls visibility to customers
- `sortOrder`: Display order within category

### Modifier

Customization options for menu items (e.g., "Extra Cheese", "No Onions").

```sql
model Modifier {
  id              String       @id @default(cuid())
  menuItemId      String
  name            String
  type            ModifierType @default(SINGLE) // SINGLE, MULTI
  priceDeltaCents Int          @default(0)
  isRequired      Boolean      @default(false)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  menuItem MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  @@map("modifiers")
}
```

**Types**:
- `SINGLE`: Radio button selection (e.g., size: Small, Medium, Large)
- `MULTI`: Checkbox selection (e.g., toppings: Cheese, Bacon, Onions)

**Pricing**:
- `priceDeltaCents`: Additional cost in cents (can be negative for discounts)
- `isRequired`: Whether customer must make a selection

## Order System

### Order

Represents customer orders with status tracking and payment information.

```sql
model Order {
  id              String      @id @default(cuid())
  restaurantId    String
  tableId         String?
  code            String
  status          OrderStatus @default(NEW) // NEW, PAID, IN_PROGRESS, READY, DELIVERED, CANCELED
  totalCents      Int
  stripeSessionId String?
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  restaurant Restaurant   @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  table      Table?       @relation(fields: [tableId], references: [id], onDelete: SetNull)
  orderItems OrderItem[]

  @@map("orders")
}
```

**Status Flow**:
1. `NEW` - Order created, awaiting payment
2. `PAID` - Payment completed via Stripe
3. `IN_PROGRESS` - Order being prepared by kitchen
4. `READY` - Order ready for pickup/delivery
5. `DELIVERED` - Order completed
6. `CANCELED` - Order canceled

**Key Fields**:
- `code`: Human-readable order identifier (e.g., "ORD-001")
- `totalCents`: Total order amount in cents
- `stripeSessionId`: Stripe checkout session ID
- `notes`: Special instructions from customer
- `tableId`: Optional table reference (null for pickup orders)

### OrderItem

Individual items within an order with quantity and customization details.

```sql
model OrderItem {
  id              String     @id @default(cuid())
  orderId         String
  menuItemId      String
  qty             Int
  unitPriceCents  Int
  notes           String?
  modifiers       Json?      // JSON for modifiers
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  // Relations
  order    Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  @@map("order_items")
}
```

**Key Fields**:
- `qty`: Quantity ordered
- `unitPriceCents`: Price per unit at time of order
- `notes`: Special instructions for this item
- `modifiers`: JSON array of selected modifiers

**Modifiers JSON Structure**:
```json
[
  {
    "id": "mod_1234567890",
    "name": "Extra Cheese",
    "priceDeltaCents": 200
  },
  {
    "id": "mod_0987654321",
    "name": "No Onions",
    "priceDeltaCents": 0
  }
]
```

## Enums

### OrderStatus

```sql
enum OrderStatus {
  NEW
  PAID
  IN_PROGRESS
  READY
  DELIVERED
  CANCELED
}
```

### StaffRole

```sql
enum StaffRole {
  OWNER
  MANAGER
  STAFF
}
```

### ModifierType

```sql
enum ModifierType {
  SINGLE
  MULTI
}
```

## Indexes and Constraints

### Primary Keys
All tables use CUID (Collision-resistant Unique Identifier) as primary keys for better performance and security.

### Foreign Key Constraints
- All foreign keys have proper cascade or set null behavior
- Restaurant deletion cascades to all related data
- Menu item deletion cascades to modifiers and order items

### Unique Constraints
- `Restaurant.slug` - Unique across all restaurants
- `Restaurant.stripeAccountId` - Unique Stripe account per restaurant
- `StaffUser.clerkUserId` - One Clerk user per staff record
- `Table[restaurantId, code]` - Unique table codes per restaurant

### Indexes
```sql
-- Restaurant lookups
CREATE INDEX idx_restaurant_slug ON restaurants(slug);
CREATE INDEX idx_restaurant_stripe_account ON restaurants(stripe_account_id);

-- Staff user lookups
CREATE INDEX idx_staff_user_clerk_id ON staff_users(clerk_user_id);
CREATE INDEX idx_staff_user_restaurant ON staff_users(restaurant_id);

-- Order queries
CREATE INDEX idx_order_restaurant ON orders(restaurant_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_created_at ON orders(created_at);
CREATE INDEX idx_order_stripe_session ON orders(stripe_session_id);

-- Menu queries
CREATE INDEX idx_menu_item_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_item_category ON menu_items(category_id);
CREATE INDEX idx_menu_item_available ON menu_items(is_available);

-- Table queries
CREATE INDEX idx_table_restaurant ON tables(restaurant_id);
```

## Data Relationships

### Entity Relationship Diagram

```
Restaurant (1) ──→ (N) StaffUser
    │
    ├── (1) ──→ (N) Table
    │
    ├── (1) ──→ (N) MenuCategory
    │              │
    │              └── (1) ──→ (N) MenuItem
    │                              │
    │                              └── (1) ──→ (N) Modifier
    │
    └── (1) ──→ (N) Order
                    │
                    ├── (1) ──→ (N) OrderItem
                    │              │
                    │              └── (N) ──→ (1) MenuItem
                    │
                    └── (N) ──→ (1) Table
```

### Key Relationships

1. **Restaurant → StaffUser**: One-to-many (restaurant can have multiple staff)
2. **Restaurant → Table**: One-to-many (restaurant can have multiple tables)
3. **Restaurant → MenuCategory**: One-to-many (restaurant can have multiple categories)
4. **MenuCategory → MenuItem**: One-to-many (category can have multiple items)
5. **MenuItem → Modifier**: One-to-many (item can have multiple modifiers)
6. **Restaurant → Order**: One-to-many (restaurant can have multiple orders)
7. **Order → OrderItem**: One-to-many (order can have multiple items)
8. **Order → Table**: Many-to-one (order can belong to a table)
9. **OrderItem → MenuItem**: Many-to-one (order item references menu item)

## Multi-tenancy Implementation

### Data Isolation
All queries are scoped by `restaurantId` to ensure complete data isolation:

```typescript
// Correct: Scoped query
const orders = await db.order.findMany({
  where: { restaurantId: userRestaurantId }
})

// Incorrect: Unscoped query (security risk)
const orders = await db.order.findMany()
```

### Middleware Enforcement
The application middleware ensures all API routes are properly scoped:

```typescript
// Example middleware check
const staffUser = await getCurrentStaffUser()
if (!staffUser || staffUser.restaurantId !== requestedRestaurantId) {
  throw new Error('Unauthorized')
}
```

## Database Migrations

### Prisma Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Migration Best Practices

1. **Always test migrations** on a copy of production data
2. **Use transactions** for complex schema changes
3. **Add indexes** after data migration for large tables
4. **Backup data** before destructive operations
5. **Use descriptive names** for migration files

## Performance Optimization

### Query Optimization

1. **Use select** to limit returned fields:
```typescript
const orders = await db.order.findMany({
  select: {
    id: true,
    status: true,
    totalCents: true,
    createdAt: true
  }
})
```

2. **Use include** for related data:
```typescript
const order = await db.order.findUnique({
  where: { id: orderId },
  include: {
    orderItems: {
      include: {
        menuItem: true
      }
    },
    table: true
  }
})
```

3. **Use pagination** for large datasets:
```typescript
const orders = await db.order.findMany({
  where: { restaurantId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
})
```

### Connection Pooling

Prisma automatically manages connection pooling. For high-traffic applications, consider:

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling parameters
}
```

## Backup and Recovery

### Automated Backups

Supabase provides automated daily backups. For additional safety:

1. **Export data** using Prisma:
```bash
npx prisma db pull
```

2. **Database dumps**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

3. **Point-in-time recovery** (Supabase Pro):
- Available for up to 7 days
- Restore to any point in time

### Disaster Recovery Plan

1. **Identify critical data**: Orders, payments, customer information
2. **Backup frequency**: Daily automated + manual before major changes
3. **Recovery time objective**: < 4 hours
4. **Recovery point objective**: < 1 hour data loss
5. **Testing**: Monthly recovery drills

## Security Considerations

### Data Protection

1. **Encryption at rest**: Supabase provides AES-256 encryption
2. **Encryption in transit**: All connections use TLS 1.2+
3. **Access control**: Row-level security via restaurant scoping
4. **Audit logging**: Track all data modifications

### Compliance

1. **PCI DSS**: Stripe handles payment data compliance
2. **GDPR**: Data export and deletion capabilities
3. **SOC 2**: Supabase provides compliance documentation

This database documentation provides a comprehensive guide to the QR Orders database schema, helping developers understand the data model, relationships, and best practices for working with the database.
