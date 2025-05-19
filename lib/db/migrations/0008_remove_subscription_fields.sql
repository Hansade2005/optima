-- Drop subscription-related constraints
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_type_check";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_subscriptionStatus_check";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_subscriptionPlan_check";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_paymentProvider_check";

-- Add new constraint for type field (only guest and regular)
ALTER TABLE "User" ADD CONSTRAINT "User_type_check" 
    CHECK ("type" IN ('guest', 'regular'));

-- Drop subscription-related columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionStatus";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionPlan";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionPeriodStart";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionPeriodEnd";
ALTER TABLE "User" DROP COLUMN IF EXISTS "paymentProvider";

-- Update any existing premium users to regular
UPDATE "User" SET "type" = 'regular' WHERE "type" = 'premium';