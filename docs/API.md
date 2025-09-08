# PayNoti API Documentation

## Overview

PayNoti provides a comprehensive API for managing payment notifications, subscriptions, and financial analytics for Web3 users. The API is designed to work seamlessly with Base blockchain and Farcaster Frame Actions.

## Base URL

```
Production: https://api.paynoti.app
Development: http://localhost:3001
```

## Authentication

All API requests require authentication using wallet signatures or API keys.

### Headers

```
Content-Type: application/json
Authorization: Bearer <wallet_signature>
X-Wallet-Address: <user_wallet_address>
```

## Core Services

### 1. Base Wallet Integration Service

#### Get Transaction History
```http
GET /api/wallet/transactions/{walletAddress}
```

**Parameters:**
- `walletAddress` (string): The wallet address to fetch transactions for
- `limit` (number, optional): Number of transactions to fetch (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "hash": "0x...",
        "from": "0x...",
        "to": "0x...",
        "value": "1000.50",
        "timestamp": "2024-09-08T14:55:58Z",
        "gasUsed": 21000,
        "status": "success",
        "description": "Payment to Netflix"
      }
    ],
    "total": 150,
    "hasMore": true
  }
}
```

#### Get Wallet Balance
```http
GET /api/wallet/balance/{walletAddress}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 2.425,
    "currency": "ETH",
    "usdValue": 6234.50
  }
}
```

### 2. Farcaster Frame Actions Service

#### Process Frame Action
```http
POST /api/frame/actions
```

**Request Body:**
```json
{
  "frameData": {
    "fid": 12345,
    "messageHash": "0x...",
    "network": 1,
    "timestamp": 1694188558
  },
  "action": "payment_reminder",
  "data": {
    "paymentId": "payment_123",
    "reminderType": "due_soon"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "frameUrl": "https://frames.paynoti.app/reminder/payment_123",
    "message": "Reminder set successfully"
  }
}
```

#### Create Payment Reminder Frame
```http
POST /api/frame/reminder
```

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "reminder": {
    "serviceName": "Netflix",
    "amount": 15.99,
    "dueDate": "2024-09-15T00:00:00Z",
    "reminderDays": [1, 3, 7]
  }
}
```

### 3. Push Notification Service

#### Register Device
```http
POST /api/notifications/register
```

**Request Body:**
```json
{
  "token": "device_push_token",
  "walletAddress": "0x...",
  "platform": "web"
}
```

#### Send Payment Reminder
```http
POST /api/notifications/reminder
```

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "reminder": {
    "serviceName": "Adobe Creative Cloud",
    "amount": 52.99,
    "dueDate": "2024-09-10T00:00:00Z"
  },
  "type": "due_soon"
}
```

#### Update Notification Preferences
```http
PUT /api/notifications/preferences/{walletAddress}
```

**Request Body:**
```json
{
  "email": true,
  "push": true,
  "frame": false,
  "advanceDays": [1, 3, 7],
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
```

### 4. Payment Aggregation Service

#### Aggregate Payments
```http
GET /api/payments/aggregate/{walletAddress}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "subscriptions": [...],
    "upcomingPayments": [...],
    "totalBalance": 2.425,
    "monthlyRecurring": 125.97,
    "lastUpdated": "2024-09-08T14:55:58Z"
  }
}
```

#### Get Subscriptions
```http
GET /api/subscriptions/{walletAddress}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_123",
      "serviceName": "Netflix",
      "amount": 15.99,
      "billingCycle": "monthly",
      "nextBillingDate": "2024-09-15T00:00:00Z",
      "status": "active",
      "usageScore": 85,
      "category": "entertainment"
    }
  ]
}
```

#### Get Upcoming Payments
```http
GET /api/payments/upcoming/{walletAddress}
```

**Query Parameters:**
- `days` (number, optional): Number of days to look ahead (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payment_123",
      "serviceName": "Adobe Creative Cloud",
      "amount": 52.99,
      "dueDate": "2024-09-10T00:00:00Z",
      "category": "software",
      "status": "upcoming",
      "reminderSet": true
    }
  ]
}
```

### 5. Anomaly Detection Service

#### Detect Anomalies
```http
POST /api/anomalies/detect
```

**Request Body:**
```json
{
  "transactions": [
    {
      "hash": "0x...",
      "value": "1000.50",
      "timestamp": "2024-09-08T14:55:58Z",
      "description": "Payment to Netflix"
    }
  ],
  "options": {
    "sensitivity": "medium",
    "lookbackDays": 90
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "anomaly_123",
      "type": "duplicate_charge",
      "description": "Duplicate charge detected at Netflix",
      "amount": 15.99,
      "date": "2024-09-08T14:55:58Z",
      "severity": "medium",
      "confidence": 0.85,
      "transactions": [...]
    }
  ]
}
```

## Subscription Management

### Create Subscription
```http
POST /api/subscriptions
```

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "serviceName": "Spotify Premium",
  "amount": 9.99,
  "billingCycle": "monthly",
  "nextBillingDate": "2024-09-15T00:00:00Z",
  "category": "entertainment"
}
```

### Update Subscription
```http
PUT /api/subscriptions/{subscriptionId}
```

### Delete Subscription
```http
DELETE /api/subscriptions/{subscriptionId}
```

## Payment Reminders

### Create Reminder
```http
POST /api/reminders
```

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "paymentId": "payment_123",
  "reminderDays": [1, 3, 7],
  "channels": ["push", "email"],
  "isActive": true
}
```

### List Reminders
```http
GET /api/reminders/{walletAddress}
```

### Update Reminder
```http
PUT /api/reminders/{reminderId}
```

### Delete Reminder
```http
DELETE /api/reminders/{reminderId}
```

## Analytics

### Get Analytics Data
```http
GET /api/analytics/{walletAddress}
```

**Query Parameters:**
- `timeRange` (string): Time range for analytics (7d, 30d, 90d, 1y)
- `category` (string, optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSpent": 1250.75,
    "avgDailySpend": 41.69,
    "transactionCount": 45,
    "spendingChange": 12.5,
    "categoryBreakdown": [
      {
        "name": "Entertainment",
        "amount": 125.97,
        "percentage": 10.1,
        "count": 8
      }
    ],
    "spendingTrends": [
      {
        "date": "2024-09-01",
        "amount": 45.99
      }
    ],
    "anomalies": [...]
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_WALLET_ADDRESS",
    "message": "The provided wallet address is invalid",
    "details": {
      "field": "walletAddress",
      "value": "invalid_address"
    }
  }
}
```

### Common Error Codes

- `INVALID_WALLET_ADDRESS`: Invalid or malformed wallet address
- `INSUFFICIENT_PERMISSIONS`: User doesn't have required permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests in a short period
- `PAYMENT_NOT_FOUND`: Requested payment doesn't exist
- `SUBSCRIPTION_NOT_FOUND`: Requested subscription doesn't exist
- `ANOMALY_DETECTION_FAILED`: Failed to process anomaly detection
- `NOTIFICATION_SEND_FAILED`: Failed to send notification

## Rate Limiting

API requests are rate-limited per wallet address:

- **Free Tier**: 100 requests per hour
- **Premium Tier**: 1000 requests per hour

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1694192158
```

## Webhooks

PayNoti supports webhooks for real-time notifications:

### Webhook Events

- `payment.due_soon`: Payment is due within configured reminder period
- `payment.overdue`: Payment is past due date
- `anomaly.detected`: Spending anomaly detected
- `subscription.renewed`: Subscription automatically renewed
- `subscription.failed`: Subscription payment failed

### Webhook Payload

```json
{
  "event": "payment.due_soon",
  "timestamp": "2024-09-08T14:55:58Z",
  "data": {
    "walletAddress": "0x...",
    "payment": {
      "id": "payment_123",
      "serviceName": "Netflix",
      "amount": 15.99,
      "dueDate": "2024-09-10T00:00:00Z"
    }
  }
}
```

## SDK Integration

### JavaScript/TypeScript SDK

```bash
npm install @paynoti/sdk
```

```javascript
import { PayNotiSDK } from '@paynoti/sdk';

const paynoti = new PayNotiSDK({
  apiKey: 'your_api_key',
  walletAddress: '0x...'
});

// Get upcoming payments
const payments = await paynoti.payments.getUpcoming();

// Create reminder
const reminder = await paynoti.reminders.create({
  paymentId: 'payment_123',
  reminderDays: [1, 3, 7]
});
```

## Testing

### Test Environment

```
Base URL: https://api-test.paynoti.app
```

### Mock Data

The test environment provides mock data for development and testing purposes. All API endpoints work with realistic mock data that simulates real blockchain transactions and payment scenarios.

### Test Wallet Addresses

Use these test wallet addresses for development:

- `0x1234567890123456789012345678901234567890` - User with active subscriptions
- `0x0987654321098765432109876543210987654321` - User with payment anomalies
- `0xabcdefabcdefabcdefabcdefabcdefabcdefabcd` - Premium user with full features

## Support

For API support and questions:

- Documentation: https://docs.paynoti.app
- Discord: https://discord.gg/paynoti
- Email: api-support@paynoti.app

## Changelog

### v1.0.0 (2024-09-08)
- Initial API release
- Base wallet integration
- Farcaster Frame Actions support
- Push notifications
- Payment aggregation
- Anomaly detection
- Subscription management
- Analytics dashboard
