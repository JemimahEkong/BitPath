-- CreateEnum
CREATE TYPE "LightningPaymentDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "LightningPaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "lightning_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "externalPaymentId" TEXT,
    "paymentRequest" TEXT,
    "paymentHash" TEXT,
    "idempotencyKey" TEXT,
    "direction" "LightningPaymentDirection" NOT NULL,
    "status" "LightningPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountSats" BIGINT,
    "feeSats" BIGINT NOT NULL DEFAULT 0,
    "description" TEXT,
    "reason" TEXT,
    "sdkPayment" JSONB,
    "expiresAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lightning_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lightning_payments_externalPaymentId_key" ON "lightning_payments"("externalPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "lightning_payments_paymentHash_key" ON "lightning_payments"("paymentHash");

-- CreateIndex
CREATE UNIQUE INDEX "lightning_payments_idempotencyKey_key" ON "lightning_payments"("idempotencyKey");

-- CreateIndex
CREATE INDEX "lightning_payments_userId_idx" ON "lightning_payments"("userId");
CREATE INDEX "lightning_payments_conversationId_idx" ON "lightning_payments"("conversationId");
CREATE INDEX "lightning_payments_status_idx" ON "lightning_payments"("status");
CREATE INDEX "lightning_payments_direction_idx" ON "lightning_payments"("direction");

-- AddForeignKey
ALTER TABLE "lightning_payments" ADD CONSTRAINT "lightning_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lightning_payments" ADD CONSTRAINT "lightning_payments_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
