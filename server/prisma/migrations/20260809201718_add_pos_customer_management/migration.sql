-- CreateEnum
CREATE TYPE "CustomerSource" AS ENUM ('CUSTOMER_SELF_SIGNUP', 'POS_CREATED');

-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "marketingEmailConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingSmsConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "source" "CustomerSource" NOT NULL DEFAULT 'CUSTOMER_SELF_SIGNUP';
