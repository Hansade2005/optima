import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';
import { getSubscriptionDetails, checkSubscriptionExpiry } from '@/lib/subscription';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // First check if the subscription has expired
    await checkSubscriptionExpiry(session.user.id);
    
    // Now get the updated subscription details
    const result = await getSubscriptionDetails(session.user.id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to retrieve subscription details' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
