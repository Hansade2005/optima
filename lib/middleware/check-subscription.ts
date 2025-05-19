
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '../db/db';
import { user } from '../db/schema';
import { eq } from 'drizzle-orm';
import { isDevelopmentEnvironment } from '../constants';

/**
 * Middleware to check if a user's subscription has expired
 * and update their status accordingly
 */
export async function checkSubscription(request: NextRequest) {
  // Skip subscription checks for auth routes or API routes
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api/auth') || 
      pathname.startsWith('/login') || 
      pathname.startsWith('/register')) {
    return NextResponse.next();
  }

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  // If there's no token or the user is not premium, continue
  if (!token || token.type !== 'premium') {
    return NextResponse.next();
  }

  const subscriptionPeriodEnd = token.subscriptionPeriodEnd as Date | undefined;
  
  // If there's a subscription end date and it has passed
  if (subscriptionPeriodEnd && new Date() > new Date(subscriptionPeriodEnd)) {
    try {
      // Update the user's status in the database
      await db.update(user)
        .set({
          type: 'regular',
          subscriptionStatus: 'canceled',
          updatedAt: new Date()
        })
        .where(eq(user.id, token.id));
      
      // Redirect to account page with expired message
      return NextResponse.redirect(new URL('/account?status=expired', request.url));
    } catch (error) {
      console.error('Failed to update expired subscription:', error);
      // Continue anyway to not block the user
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}
