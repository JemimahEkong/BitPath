-- AlterTable
ALTER TABLE "rewards" ADD COLUMN     "claimed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "claimedAt" TIMESTAMP(3),
ADD COLUMN     "satoshi" INTEGER NOT NULL DEFAULT 0;
