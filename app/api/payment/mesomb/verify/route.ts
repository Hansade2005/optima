import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { verifyMeSombPayment } from '@/lib/payment/mesomb';
import { updateUserSubscription } from '@/lib/subscription';
import { z } from 'zod';

const verifySchema = z.object({
  reference: z.string(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { reference } = verifySchema.parse(body);
    
    const verification = await verifyMeSombPayment(reference);
    
    if (verification.success && verification.verified) {
      // Set subscription period for 30 days
      const subscriptionPeriodStart = new Date();
      const subscriptionPeriodEnd = new Date();
      subscriptionPeriodEnd.setDate(subscriptionPeriodEnd.getDate() + 30);
      
      await updateUserSubscription(session.user.id, {
        subscriptionStatus: 'active',
        type: 'premium',
        subscriptionPlan: 'premium',
        subscriptionPeriodStart,
        subscriptionPeriodEnd,
      });
      
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Payment verification successful',
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error) {
    console.error('MeSomb verification error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}