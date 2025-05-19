-- Add subscription fields to the User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "type" varchar NOT NULL DEFAULT 'regular';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionId" varchar(128);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionStatus" varchar;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionPlan" varchar NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionPeriodStart" timestamp;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "subscriptionPeriodEnd" timestamp;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentProvider" varchar;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" timestamp NOT NULL DEFAULT now();
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" timestamp NOT NULL DEFAULT now();

-- Add constraint for type field
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_type_check";
ALTER TABLE "User" ADD CONSTRAINT "User_type_check" 
    CHECK ("type" IN ('guest', 'regular', 'premium'));

-- Add constraint for subscription status
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_subscriptionStatus_check";
ALTER TABLE "User" ADD CONSTRAINT "User_subscriptionStatus_check" 
    CHECK ("subscriptionStatus" IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'));

-- Add constraint for subscription plan
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_subscriptionPlan_check";
ALTER TABLE "User" ADD CONSTRAINT "User_subscriptionPlan_check" 
    CHECK ("subscriptionPlan" IN ('free', 'premium'));

-- Add constraint for payment provider
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_paymentProvider_check";
ALTER TABLE "User" ADD CONSTRAINT "User_paymentProvider_check" 
    CHECK ("paymentProvider" IN ('stripe', 'mesomb'));
