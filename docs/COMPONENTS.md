# QR Orders - Component Documentation

## Overview

This document provides detailed documentation for all React components in the QR Orders application. Components are organized by functionality and include props, usage examples, and implementation details.

## UI Components

### Button

**Location**: `src/components/ui/button.tsx`

A customizable button component with multiple variants and sizes.

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

**Usage**:
```tsx
import { Button } from '@/components/ui/button'

// Default button
<Button>Click me</Button>

// Button with variant and size
<Button variant="outline" size="lg">Large Outline</Button>

// Button as link
<Button asChild variant="link">
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Card

**Location**: `src/components/ui/card.tsx`

A flexible card component for displaying content.

**Components**:
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Usage**:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Order Details</CardTitle>
    <CardDescription>Order #12345</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Order content goes here</p>
  </CardContent>
</Card>
```

### Badge

**Location**: `src/components/ui/badge.tsx`

A small status indicator component.

**Props**:
```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}
```

**Usage**:
```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="default">Available</Badge>
<Badge variant="secondary">In Progress</Badge>
<Badge variant="destructive">Canceled</Badge>
```

## Core Components

### OrderTracker

**Location**: `src/components/OrderTracker.tsx`

Real-time order status tracking component for customers.

**Props**:
```typescript
interface OrderTrackerProps {
  order: Order
}
```

**Features**:
- Real-time status updates via Supabase
- Visual progress indicator
- Time stamps for each status change
- Connection status indicator

**Usage**:
```tsx
import { OrderTracker } from '@/components/OrderTracker'

<OrderTracker order={order} />
```

**Order Status Flow**:
1. **PAID** - Order confirmed and payment received
2. **IN_PROGRESS** - Order being prepared
3. **READY** - Order ready for pickup/delivery
4. **DELIVERED** - Order completed

### Kanban

**Location**: `src/components/Kanban.tsx`

Real-time order management board for restaurant staff.

**Props**:
```typescript
interface KanbanProps {
  restaurantId: string
}
```

**Features**:
- Drag-and-drop order status updates
- Real-time order synchronization
- Order details modal
- Connection status indicator
- Column-based organization

**Columns**:
- **New Orders** - Recently placed orders
- **Paid** - Payment confirmed orders
- **In Progress** - Orders being prepared
- **Ready** - Orders ready for pickup
- **Delivered** - Completed orders

**Usage**:
```tsx
import { Kanban } from '@/components/Kanban'

<Kanban restaurantId="cm1234567890" />
```

### MenuGrid

**Location**: `src/components/MenuGrid.tsx`

Customer-facing menu display component.

**Props**:
```typescript
interface MenuGridProps {
  restaurantId: string
  onAddToCart: (item: CartItem) => void
}
```

**Features**:
- Category-based organization
- Item availability indicators
- Modifier support
- Add to cart functionality
- Mobile-optimized layout

**Usage**:
```tsx
import { MenuGrid } from '@/components/MenuGrid'

<MenuGrid 
  restaurantId="cm1234567890" 
  onAddToCart={handleAddToCart} 
/>
```

### CartBar

**Location**: `src/components/CartBar.tsx`

Shopping cart component for customers.

**Props**:
```typescript
interface CartBarProps {
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
}
```

**Features**:
- Item quantity management
- Price calculation with modifiers
- Checkout button
- Mobile-friendly design
- Real-time total updates

**Usage**:
```tsx
import { CartBar } from '@/components/CartBar'

<CartBar
  items={cartItems}
  onUpdateQuantity={handleUpdateQuantity}
  onRemoveItem={handleRemoveItem}
  onCheckout={handleCheckout}
/>
```

### ItemDrawer

**Location**: `src/components/ItemDrawer.tsx`

Modal drawer for menu item customization.

**Props**:
```typescript
interface ItemDrawerProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: CartItem) => void
}
```

**Features**:
- Item details display
- Modifier selection
- Quantity selection
- Special instructions
- Add to cart functionality

**Usage**:
```tsx
import { ItemDrawer } from '@/components/ItemDrawer'

<ItemDrawer
  item={selectedItem}
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  onAddToCart={handleAddToCart}
/>
```

## Management Components

### QRGenerator

**Location**: `src/components/QRGenerator.tsx`

QR code generation and management for restaurant tables.

**Props**:
```typescript
interface QRGeneratorProps {
  restaurant: Restaurant
}
```

**Features**:
- Table-based QR code generation
- Bulk QR code printing
- Individual QR code downloads
- Print-friendly layouts
- URL generation for each table

**Usage**:
```tsx
import { QRGenerator } from '@/components/QRGenerator'

<QRGenerator restaurant={restaurant} />
```

**QR Code URL Format**:
```
https://your-domain.com/r/{restaurantSlug}/t/{tableCode}
```

### MenuManagement

**Location**: `src/components/MenuManagement.tsx`

Menu management interface for restaurant staff.

**Props**:
```typescript
interface MenuManagementProps {
  restaurantId: string
}
```

**Features**:
- Category and item management
- Availability toggles
- Modifier management
- Drag-and-drop sorting
- Real-time updates

**Usage**:
```tsx
import { MenuManagement } from '@/components/MenuManagement'

<MenuManagement restaurantId="cm1234567890" />
```

### RestaurantSettings

**Location**: `src/components/RestaurantSettings.tsx`

Restaurant configuration and settings management.

**Props**:
```typescript
interface RestaurantSettingsProps {
  restaurant: Restaurant
  onUpdate: (restaurant: Restaurant) => void
}
```

**Features**:
- Restaurant information editing
- Stripe Connect integration
- Tax and tip configuration
- Currency and timezone settings
- Billing management

**Usage**:
```tsx
import { RestaurantSettings } from '@/components/RestaurantSettings'

<RestaurantSettings 
  restaurant={restaurant} 
  onUpdate={handleRestaurantUpdate} 
/>
```

## Page Components

### HomePage

**Location**: `src/app/page.tsx`

Landing page with marketing content and demo access.

**Features**:
- Hero section with call-to-action
- Feature highlights
- Testimonials
- FAQ section
- Demo access buttons

### AboutPage

**Location**: `src/app/about/page.tsx`

Company information and mission statement.

**Features**:
- Mission and vision
- Team information
- Company values
- Contact information

### PricingPage

**Location**: `src/app/pricing/page.tsx`

Subscription plans and pricing information.

**Features**:
- Plan comparison
- Feature lists
- Pricing tiers
- Trial information

### DashboardPage

**Location**: `src/app/dashboard/page.tsx`

Main staff dashboard with order management.

**Features**:
- Real-time order kanban
- Quick statistics
- Recent activity
- Navigation to other sections

### OnboardingPage

**Location**: `src/app/onboarding/page.tsx`

Multi-step restaurant setup process.

**Steps**:
1. **Business Information** - Restaurant details
2. **Stripe Connect** - Payment setup
3. **Trial Start** - Subscription activation
4. **Table Setup** - QR code generation
5. **Menu Creation** - Initial menu setup

## Utility Components

### Loading States

**Skeleton Loaders**:
```tsx
// Card skeleton
<Card className="animate-pulse">
  <CardHeader>
    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      <div className="h-16 bg-gray-200 rounded"></div>
    </div>
  </CardContent>
</Card>
```

**Spinner Component**:
```tsx
import { Loader2 } from 'lucide-react'

<Loader2 className="w-4 h-4 animate-spin" />
```

### Error Boundaries

**Error Display**:
```tsx
<div className="text-center py-12">
  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
  <p className="text-gray-600 mb-4">Please try again later</p>
  <Button onClick={() => window.location.reload()}>
    Retry
  </Button>
</div>
```

## Styling and Theming

### Tailwind CSS Classes

**Common Patterns**:
```tsx
// Card styling
className="bg-white rounded-lg shadow-sm border border-gray-200"

// Button variants
className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"

// Status indicators
className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs"

// Responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### Color Scheme

**Primary Colors**:
- Blue: `#3B82F6` (Primary actions)
- Green: `#10B981` (Success states)
- Red: `#EF4444` (Error states)
- Yellow: `#F59E0B` (Warning states)
- Gray: `#6B7280` (Neutral text)

**Status Colors**:
- Available: Green
- Unavailable: Gray
- In Progress: Yellow
- Ready: Blue
- Delivered: Green
- Canceled: Red

## Component Patterns

### Data Fetching

**useEffect Pattern**:
```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('/api/endpoint')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [dependency])
```

### Real-time Updates

**Supabase Subscription**:
```tsx
useEffect(() => {
  const channel = supabase
    .channel('table-name')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'table_name',
      filter: `restaurant_id=eq.${restaurantId}`
    }, (payload) => {
      // Handle real-time update
      setData(prev => updateData(prev, payload))
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [restaurantId])
```

### Form Handling

**Controlled Components**:
```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: ''
})

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }))
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  // Submit form data
}
```

## Best Practices

### Component Design

1. **Single Responsibility** - Each component should have one clear purpose
2. **Props Interface** - Always define TypeScript interfaces for props
3. **Default Props** - Provide sensible defaults where appropriate
4. **Error Handling** - Include error states and loading states
5. **Accessibility** - Use semantic HTML and ARIA attributes

### Performance

1. **Memoization** - Use React.memo for expensive components
2. **Lazy Loading** - Load components only when needed
3. **Code Splitting** - Split large components into smaller ones
4. **Optimistic Updates** - Update UI immediately, sync with server

### Testing

1. **Unit Tests** - Test individual component functionality
2. **Integration Tests** - Test component interactions
3. **Accessibility Tests** - Ensure components are accessible
4. **Visual Regression Tests** - Test component appearance

## Component Library

### Installation

```bash
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-toast
npm install lucide-react
npm install clsx
```

### Usage

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@radix-ui/react-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { toast } from '@radix-ui/react-toast'
import { Plus, Edit, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
```

This component documentation provides a comprehensive guide to all components in the QR Orders application, helping developers understand how to use, modify, and extend the component library.
