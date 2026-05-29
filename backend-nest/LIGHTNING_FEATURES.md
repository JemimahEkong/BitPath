# Lightning Wallet Integration - Advanced Features

This document covers the Lightning Address (LUD-16), Analytics & Reporting, and User Wallet Address features added to BitPath.

## Overview

The lightning module now includes:

1. **Lightning Address (LUD-16)** - Enable users to receive payments at a memorable address
2. **Analytics & Reporting** - Track payment volume, success rates, and trends
3. **User Wallet Management** - Store and manage user wallet addresses

## Features

### 1. Lightning Address (LUD-16)

Lightning Address is a human-readable payment identifier (similar to email) following the LUD-16 standard.

#### Endpoints

**Register Lightning Address**
```http
POST /rewards/lightning/address/register
Content-Type: application/json

{
  "userId": "user-123",
  "username": "alice",
  "description": "My Lightning Address"
}
```

Response:
```json
{
  "lightningAddress": "alice@bitpath.com",
  "walletPublicKey": "02abc..."
}
```

**Get Lightning Address Info**
```http
GET /rewards/lightning/address/{userId}
```

Response:
```json
{
  "id": "user-123",
  "lightningAddress": "alice@bitpath.com",
  "walletPublicKey": "02abc..."
}
```

**Update Lightning Address**
```http
POST /rewards/lightning/address/{userId}/update
Content-Type: application/json

{
  "username": "alice-v2",
  "description": "Updated description"
}
```

**Revoke Lightning Address**
```http
POST /rewards/lightning/address/{userId}/revoke
```

#### Schema Updates

Added to User model:
- `lightningAddress` (unique) - Format: `username@domain.com`
- `walletPublicKey` - Breez SDK wallet public key
- `walletMnemonic` - Encrypted mnemonic backup (optional)

### 2. Analytics & Reporting

Track Lightning payment metrics with daily aggregations and comprehensive reporting.

#### Endpoints

**Query Analytics**
```http
POST /rewards/lightning/analytics/query
Content-Type: application/json

{
  "userId": "user-123",
  "startDate": "2026-05-20",
  "endDate": "2026-05-26",
  "period": "daily"
}
```

Response:
```json
{
  "period": {
    "startDate": "2026-05-20",
    "endDate": "2026-05-26"
  },
  "data": [
    {
      "date": "2026-05-20",
      "incomingCount": 5,
      "incomingVolumeSats": "5000",
      "incomingFeeSats": "50",
      "outgoingCount": 2,
      "outgoingVolumeSats": "2000",
      "outgoingFeeSats": "20",
      "successRate": 85.7,
      "failedCount": 1,
      "averageFeeSats": "10"
    }
  ],
  "summary": {
    "totalIncomingCount": 5,
    "totalIncomingVolumeSats": "5000",
    "totalOutgoingCount": 2,
    "totalOutgoingVolumeSats": "2000",
    "totalFailures": 1,
    "averageSuccessRate": "85.70"
  }
}
```

**Get Payment Summary**
```http
GET /rewards/lightning/analytics/summary/{userId}
```

Response:
```json
{
  "totalPayments": 20,
  "succeededCount": 19,
  "failedCount": 1,
  "pendingCount": 0,
  "incoming": {
    "count": 12,
    "totalSats": "12000"
  },
  "outgoing": {
    "count": 8,
    "totalSats": "8000"
  },
  "fees": {
    "totalSats": "120",
    "averageSats": "6"
  },
  "successRate": "95.00"
}
```

**Record Daily Analytics**
```http
POST /rewards/lightning/analytics/record-daily/{userId}
```

Response:
```json
{
  "userId": "user-123",
  "date": "2026-05-26",
  "incomingCount": 3,
  "incomingVolumeSats": "3000",
  "incomingFeeSats": "30",
  "outgoingCount": 1,
  "outgoingVolumeSats": "1000",
  "outgoingFeeSats": "10",
  "successRate": 100,
  "failedCount": 0,
  "averageFeeSats": "10"
}
```

#### Schema

New `LightningAnalytics` model:
- **Id**: Unique identifier
- **UserId**: Foreign key to User
- **Date**: Daily aggregation date (YYYY-MM-DD)
- **Incoming Metrics**: Count, volume, fees
- **Outgoing Metrics**: Count, volume, fees
- **Success Stats**: Success rate %, failed count
- **Unique Constraint**: One record per user per day

### 3. User Wallet Management

Users can store and manage their Lightning wallet information.

#### Fields

Added to User model:
- `lightningAddress` - User's Lightning Address (e.g., alice@bitpath.com)
- `walletPublicKey` - Public key from Breez SDK wallet
- `walletMnemonic` - Encrypted backup of mnemonic (optional)

#### Usage

The wallet fields are automatically populated when:
1. Creating an invoice (gets wallet public key from SDK)
2. Registering a Lightning Address (fetches wallet info from SDK)
3. Explicitly provided during user setup

## Configuration

Add these environment variables:

```env
# Lightning Domain for LUD-16 addresses
LIGHTNING_ADDRESS_DOMAIN=bitpath.com

# Reward conversion rate
REWARD_SATS_PER_XP=1
```

## Testing

Unit tests are included in:
- `src/rewards/lightning.service.spec.ts` - Service tests
- `src/rewards/rewards.controller.spec.ts` - E2E controller tests

Run tests:
```bash
npm run test
npm run test:e2e
```

## Database Migration

Apply the migration:
```bash
npx prisma migrate deploy
```

This will:
1. Add wallet fields to users table
2. Create lightning_analytics table
3. Add necessary indexes

## Implementation Notes

### BigInt Handling

All satoshi amounts use BigInt for precision:
```typescript
amountSats: BigInt(1000) // More precise than numbers
```

JSON serialization converts BigInt → string:
```json
{
  "amountSats": "1000"
}
```

### Analytics Aggregation

Daily analytics are computed from Lightning payments:
```typescript
// Automatic when recording daily analytics
const summary = await lightningService.recordDailyAnalytics(userId);

// Or query historical data
const analytics = await lightningService.getAnalytics({
  userId,
  startDate: '2026-05-01',
  endDate: '2026-05-31'
});
```

### Lightning Address Uniqueness

Lightning addresses are globally unique and follow the pattern:
```
{username}@{LIGHTNING_ADDRESS_DOMAIN}
```

Usernames can contain:
- Lowercase letters (a-z)
- Numbers (0-9)
- Dots (.)
- Underscores (_)
- Hyphens (-)

Example: `alice-v2@bitpath.com`

## Future Enhancements

- [ ] LUD-06 PayerData support (optional payer info)
- [ ] LUD-11 Comments support
- [ ] LUD-12 Pay comments response
- [ ] Rate limiting for analytics queries
- [ ] Custom analytics dashboards
- [ ] Export analytics to CSV/PDF
- [ ] Webhook notifications for payment milestones
- [ ] Multi-currency analytics (BTC/USD conversion)
