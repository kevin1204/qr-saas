# QR Orders - API Documentation

## Overview

The QR Orders API provides endpoints for restaurant management, order processing, menu management, and payment integration. All API endpoints are built using Next.js API routes and follow RESTful conventions.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most API endpoints require authentication via Clerk. The system uses JWT tokens for session management.

### Headers

```http
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

## API Endpoints

### Restaurant Management

#### Create Restaurant
```http
POST /api/admin/restaurant
```

**Description**: Creates a new restaurant during onboarding.

**Request Body**:
```json
{
  "name": "Bella Vista Restaurant",
  "slug": "bella-vista",
  "address": "123 Main St, City, State 12345",
  "currency": "USD",
  "timezone": "America/New_York",
  "serviceType": "TABLE",
  "taxRateBps": 875,
  "defaultTipBps": 1800
}
```

**Response**:
```json
{
  "success": true,
  "restaurant": {
    "id": "cm1234567890",
    "name": "Bella Vista Restaurant",
    "slug": "bella-vista",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Restaurant Details
```http
GET /api/admin/restaurant
```

**Description**: Retrieves current restaurant information.

**Response**:
```json
{
  "id": "cm1234567890",
  "name": "Bella Vista Restaurant",
  "slug": "bella-vista",
  "address": "123 Main St, City, State 12345",
  "currency": "USD",
  "timezone": "America/New_York",
  "serviceType": "TABLE",
  "taxRateBps": 875,
  "defaultTipBps": 1800,
  "stripeAccountId": "acct_1234567890",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "billingCustomerId": "cus_1234567890",
  "trialEndsAt": "2024-01-15T00:00:00.000Z"
}
```

### Menu Management

#### Get Menu
```http
GET /api/menu?restaurantId={restaurantId}
```

**Description**: Retrieves complete menu with categories and items.

**Query Parameters**:
- `restaurantId` (string, required): Restaurant identifier

**Response**:
```json
[
  {
    "id": "cat_1234567890",
    "name": "Appetizers",
    "sortOrder": 0,
    "menuItems": [
      {
        "id": "item_1234567890",
        "name": "Caesar Salad",
        "priceCents": 1299,
        "description": "Fresh romaine lettuce with caesar dressing",
        "imageUrl": "https://example.com/salad.jpg",
        "isAvailable": true,
        "sortOrder": 0,
        "modifiers": [
          {
            "id": "mod_1234567890",
            "name": "Extra Dressing",
            "type": "SINGLE",
            "priceDeltaCents": 200,
            "isRequired": false
          }
        ]
      }
    ]
  }
]
```

#### Toggle Item Availability
```http
PATCH /api/menu/items/availability
```

**Description**: Toggles the availability of a menu item.

**Request Body**:
```json
{
  "itemId": "item_1234567890",
  "isAvailable": false
}
```

**Response**:
```json
{
  "success": true,
  "item": {
    "id": "item_1234567890",
    "isAvailable": false
  }
}
```

### Order Management

#### Get Orders
```http
GET /api/orders?restaurantId={restaurantId}
```

**Description**: Retrieves orders for a restaurant with optional filtering.

**Query Parameters**:
- `restaurantId` (string, required): Restaurant identifier
- `status` (string, optional): Filter by order status
- `limit` (number, optional): Number of orders to return (default: 50)

**Response**:
```json
[
  {
    "id": "order_1234567890",
    "restaurantId": "cm1234567890",
    "tableId": "table_1234567890",
    "code": "ORD-001",
    "status": "PAID",
    "totalCents": 2599,
    "stripeSessionId": "cs_1234567890",
    "notes": "Extra spicy",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z",
    "table": {
      "id": "table_1234567890",
      "label": "Table 1",
      "code": "T1"
    },
    "orderItems": [
      {
        "id": "oi_1234567890",
        "menuItemId": "item_1234567890",
        "qty": 2,
        "unitPriceCents": 1299,
        "notes": "No onions",
        "modifiers": [
          {
            "name": "Extra Dressing",
            "priceDeltaCents": 200
          }
        ],
        "menuItem": {
          "id": "item_1234567890",
          "name": "Caesar Salad",
          "priceCents": 1299
        }
      }
    ]
  }
]
```

#### Update Order Status
```http
PATCH /api/orders/status
```

**Description**: Updates the status of an order.

**Request Body**:
```json
{
  "orderId": "order_1234567890",
  "status": "IN_PROGRESS"
}
```

**Valid Status Values**:
- `NEW` - Order created, awaiting payment
- `PAID` - Payment completed
- `IN_PROGRESS` - Order being prepared
- `READY` - Order ready for pickup/delivery
- `DELIVERED` - Order completed
- `CANCELED` - Order canceled

**Response**:
```json
{
  "id": "order_1234567890",
  "status": "IN_PROGRESS",
  "updatedAt": "2024-01-01T12:10:00.000Z"
}
```

### Table Management

#### Get Tables
```http
GET /api/tables?restaurantId={restaurantId}
```

**Description**: Retrieves all tables for a restaurant.

**Query Parameters**:
- `restaurantId` (string, required): Restaurant identifier

**Response**:
```json
[
  {
    "id": "table_1234567890",
    "restaurantId": "cm1234567890",
    "label": "Table 1",
    "code": "T1",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Create Tables
```http
POST /api/onboarding/tables
```

**Description**: Creates tables during restaurant onboarding.

**Request Body**:
```json
{
  "tableLabels": ["Table 1", "Table 2", "Table 3", "Bar 1", "Bar 2"]
}
```

**Response**:
```json
{
  "success": true,
  "tables": [
    {
      "id": "table_1234567890",
      "restaurantId": "cm1234567890",
      "label": "Table 1",
      "code": "Table 1",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Payment Integration

#### Create Checkout Session
```http
POST /api/checkout
```

**Description**: Creates a Stripe checkout session for order payment.

**Request Body**:
```json
{
  "restaurantId": "cm1234567890",
  "tableId": "table_1234567890",
  "items": [
    {
      "menuItemId": "item_1234567890",
      "qty": 2,
      "unitPriceCents": 1299,
      "notes": "Extra spicy",
      "modifiers": [
        {
          "name": "Extra Dressing",
          "priceDeltaCents": 200
        }
      ]
    }
  ],
  "customerEmail": "customer@example.com",
  "notes": "Table 1 - Extra spicy"
}
```

**Response**:
```json
{
  "success": true,
  "sessionId": "cs_1234567890",
  "url": "https://checkout.stripe.com/pay/cs_1234567890"
}
```

### Stripe Connect Integration

#### Create Connected Account
```http
POST /api/connect/create-account?email={email}
```

**Description**: Creates a Stripe Connect account for the restaurant.

**Query Parameters**:
- `email` (string, required): Restaurant owner email

**Response**:
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/c/acct_1234567890"
}
```

#### Create Account Link
```http
POST /api/connect/account-link
```

**Description**: Generates a new account link for Stripe onboarding.

**Response**:
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/c/acct_1234567890"
}
```

#### Check Account Status
```http
GET /api/connect/account-status
```

**Description**: Checks the status of the Stripe Connect account.

**Response**:
```json
{
  "accountId": "acct_1234567890",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "detailsSubmitted": true,
  "requirements": {
    "currentlyDue": [],
    "eventuallyDue": [],
    "pastDue": []
  }
}
```

### Billing Management

#### Start Trial
```http
POST /api/billing/start-trial
```

**Description**: Starts a 14-day free trial for the restaurant.

**Response**:
```json
{
  "success": true,
  "trialEndsAt": "2024-01-15T00:00:00.000Z"
}
```

#### Create Billing Portal Session
```http
POST /api/billing/portal
```

**Description**: Creates a Stripe billing portal session for subscription management.

**Request Body**:
```json
{
  "returnUrl": "https://your-domain.com/admin/billing"
}
```

**Response**:
```json
{
  "success": true,
  "url": "https://billing.stripe.com/session/1234567890"
}
```

### Webhook Endpoints

#### Stripe Webhook
```http
POST /api/stripe/webhook
```

**Description**: Handles Stripe webhook events for payments and subscriptions.

**Headers**:
```http
Stripe-Signature: t=1234567890,v1=signature
Content-Type: application/json
```

**Supported Events**:
- `checkout.session.completed` - Payment successful
- `checkout.session.expired` - Payment session expired
- `customer.subscription.created` - Subscription started
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled
- `account.updated` - Connect account updated

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `STRIPE_ERROR` | 400 | Payment processing error |
| `INTERNAL_ERROR` | 500 | Server error |

### Example Error Responses

#### Authentication Error
```json
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

#### Validation Error
```json
{
  "error": "Invalid data",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

#### Stripe Error
```json
{
  "error": "Payment processing failed",
  "details": "Your card was declined",
  "code": "STRIPE_ERROR"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per minute per IP
- **Payment endpoints**: 20 requests per minute per IP
- **Webhook endpoints**: 1000 requests per minute per IP

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:

### Query Parameters
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

### Response Format
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks

### Order Status Updates

When order status changes, a webhook is sent to configured endpoints:

```json
{
  "event": "order.status.updated",
  "data": {
    "orderId": "order_1234567890",
    "restaurantId": "cm1234567890",
    "status": "IN_PROGRESS",
    "updatedAt": "2024-01-01T12:10:00.000Z"
  }
}
```

### New Order Notifications

When a new order is created:

```json
{
  "event": "order.created",
  "data": {
    "orderId": "order_1234567890",
    "restaurantId": "cm1234567890",
    "tableId": "table_1234567890",
    "totalCents": 2599,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
// Create a new order
const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    restaurantId: 'cm1234567890',
    tableId: 'table_1234567890',
    items: [
      {
        menuItemId: 'item_1234567890',
        qty: 2,
        unitPriceCents: 1299
      }
    ]
  })
});

const data = await response.json();
```

### Python

```python
import requests

# Update order status
response = requests.patch(
    'https://your-domain.com/api/orders/status',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    },
    json={
        'orderId': 'order_1234567890',
        'status': 'IN_PROGRESS'
    }
)

data = response.json()
```

## Testing

### Test Cards

Use these Stripe test card numbers for testing:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Declined payment |
| `4000 0025 0000 3155` | 3D Secure authentication required |

### Test Webhooks

Use Stripe CLI to forward webhooks to localhost:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Restaurant management endpoints
- Menu management system
- Order processing with Stripe Connect
- Real-time updates via Supabase
- Multi-tenant architecture
