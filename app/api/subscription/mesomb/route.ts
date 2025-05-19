import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';
import { processMeSombPayment } from '@/lib/payments/mesomb';
import { z } from 'zod';

const mesombPaymentSchema = z.object({
  phoneNumber: z.string().min(9).max(12),
  service: z.enum(['MTN', 'ORANGE', 'AIRTEL']).default('MTN'),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = mesombPaymentSchema.parse(body);
    
    // Process the payment
    const result = await processMeSombPayment({
      userId: session.user.id,
      phoneNumber: validatedData.phoneNumber,
      service: validatedData.service,
      customerEmail: session.user.email || '',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing MeSomb payment:', error);
      if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
    
}
