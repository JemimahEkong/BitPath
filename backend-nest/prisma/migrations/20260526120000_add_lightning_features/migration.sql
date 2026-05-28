-- Add Lightning Address and Wallet fields to User
ALTER TABLE "users" ADD COLUMN "lightningAddress" TEXT UNIQUE;
ALTER TABLE "users" ADD COLUMN "walletPublicKey" TEXT;
ALTER TABLE "users" ADD COLUMN "walletMnemonic" TEXT;

-- Create LightningAnalytics table for daily aggregation
CREATE TABLE "lightning_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "incomingCount" INTEGER NOT NULL DEFAULT 0,
    "incomingVolumeSats" BIGINT NOT NULL DEFAULT 0,
    "incomingFeeSats" BIGINT NOT NULL DEFAULT 0,
    "outgoingCount" INTEGER NOT NULL DEFAULT 0,
    "outgoingVolumeSats" BIGINT NOT NULL DEFAULT 0,
    "outgoingFeeSats" BIGINT NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "averageFeeSats" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lightning_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
    UNIQUE("userId", "date")
);

-- Create indexes for performance
CREATE INDEX "lightning_analytics_userId_idx" ON "lightning_analytics"("userId");
