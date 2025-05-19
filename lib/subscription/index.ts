import { db } from '@/lib/db';
import { user, type User } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type SubscriptionPlan = 'free' | 'premium';
export type PaymentProvider = 'stripe' | 'mesomb';
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
export type UserType = 'guest' | 'regular' | 'premium';

export interface SubscriptionDetails {
  id: string;
  email: string;
  type: UserType;
  plan: SubscriptionPlan;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  paymentProvider?: PaymentProvider;
  isActive: boolean;
  isSubscribed: boolean;
}

export async function getUserSubscription(userId: string): Promise<SubscriptionDetails | null> {
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId));

  if (!userData) return null;

  const now = new Date();
  const isActive = userData.subscriptionStatus === 'active' && 
    (userData.subscriptionPeriodEnd ? userData.subscriptionPeriodEnd > now : false);

  return {
    id: userData.id,
    email: userData.email,
    type: userData.type as UserType,
    plan: userData.subscriptionPlan as SubscriptionPlan,
    status: userData.subscriptionStatus as SubscriptionStatus | undefined,
    currentPeriodEnd: userData.subscriptionPeriodEnd || undefined,
    paymentProvider: userData.paymentProvider as PaymentProvider | undefined,
    isActive,
    isSubscribed: userData.subscriptionPlan === 'premium',
  };
}

export async function updateUserSubscription(
  userId: string,
  data: {
    subscriptionId?: string;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionPlan?: SubscriptionPlan;
    subscriptionPeriodStart?: Date;
    subscriptionPeriodEnd?: Date;
    paymentProvider?: PaymentProvider;
    type?: UserType;
  }
): Promise<void> {
  await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}

export async function cancelUserSubscription(userId: string): Promise<void> {
  await db
    .update(user)
    .set({
      subscriptionStatus: 'canceled',
      subscriptionPlan: 'free',
      type: 'regular',
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}