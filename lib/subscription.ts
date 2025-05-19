import 'server-only';
import { user } from './db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create PostgreSQL client and Drizzle instance
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

/**
 * Updates a user's subscription status and related information
 */
export async function updateUserSubscription({
  userId,
  subscriptionId,
  subscriptionStatus,
  subscriptionPlan,
  paymentProvider,
  subscriptionPeriodStart,
  subscriptionPeriodEnd
}: {
  userId: string;
  subscriptionId: string;
  subscriptionStatus: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  subscriptionPlan: 'free' | 'premium';
  paymentProvider: 'stripe' | 'mesomb';
  subscriptionPeriodStart: Date;
  subscriptionPeriodEnd: Date;
}) {
  const type = subscriptionPlan === 'premium' && subscriptionStatus === 'active' ? 'premium' : 'regular';
  
  try {
    await db.update(user)
      .set({
        type,
        subscriptionId,
        subscriptionStatus,
        subscriptionPlan,
        paymentProvider,
        subscriptionPeriodStart,
        subscriptionPeriodEnd,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return { success: false, error };
  }
}

/**
 * Cancels a user's subscription but retains access until the end of the billing period
 */
export async function cancelSubscription({
  userId,
  subscriptionId,
}: {
  userId: string;
  subscriptionId: string;
}) {
  try {
    await db.update(user)
      .set({
        subscriptionStatus: 'canceled',
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));
    
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    return { success: false, error };
  }
}

/**
 * Checks if a user's subscription has expired and updates their status accordingly
 */
export async function checkSubscriptionExpiry(userId: string) {
  try {
    const users = await db.select()
      .from(user)
      .where(eq(user.id, userId));
    
    if (users.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const currentUser = users[0];
    const now = new Date();

    // If subscription has expired, downgrade to regular
    if (
      currentUser.type === 'premium' &&
      currentUser.subscriptionPeriodEnd &&
      currentUser.subscriptionPeriodEnd < now
    ) {
      await db.update(user)
        .set({
          type: 'regular',
          subscriptionStatus: 'canceled',
          updatedAt: new Date()
        })
        .where(eq(user.id, userId));

      return { success: true, status: 'downgraded' };
    }

    return { success: true, status: 'active' };
  } catch (error) {
    console.error('Failed to check subscription expiry:', error);
    return { success: false, error };
  }
}

/**
 * Gets subscription details for a user
 */
export async function getSubscriptionDetails(userId: string) {
  try {
    const users = await db.select().from(user).where(eq(user.id, userId));
    
    if (users.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const {
      subscriptionId,
      subscriptionStatus,
      subscriptionPlan,
      paymentProvider,
      subscriptionPeriodStart,
      subscriptionPeriodEnd,
      type
    } = users[0];

    return {
      success: true,
      data: {
        subscriptionId,
        subscriptionStatus,
        subscriptionPlan,
        paymentProvider,
        subscriptionPeriodStart,
        subscriptionPeriodEnd,
        type,
        isActive: subscriptionStatus === 'active',
        isPremium: type === 'premium'
      }
    };
  } catch (error) {
    console.error('Failed to get subscription details:', error);
    return { success: false, error };
  }
}
