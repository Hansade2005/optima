import { updateUserSubscription } from '../subscription';

// MeSomb API details
const MESOMB_API_URL = 'https://mesomb.hachther.com/api/v1.0/payment/online/';
const MESOMB_APP_KEY = process.env.MESOMB_APP_KEY || '3736570a06a2ef60113fa69bb7d5b378fe3ffd89';

/**
 * Processes a payment using MeSomb
 */
export async function processMeSombPayment({
  userId,
  phoneNumber,
  amount = 12000, // 12,000 XAF by default
  service = 'MTN',
  customerEmail,
}: {
  userId: string;
  phoneNumber: string;
  amount?: number;
  service?: 'MTN' | 'ORANGE' | 'AIRTEL';
  customerEmail: string;
}) {
  try {
    // Prepare the request
    const data = {
      amount: amount,
      payer: phoneNumber,
      fees: true,
      service: service,
      currency: 'XAF',
      message: `Premium subscription for ${customerEmail}`,
      country: 'CM'
    };

    // Call the MeSomb API
    const response = await fetch(MESOMB_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla',
        'X-MeSomb-Application': MESOMB_APP_KEY
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    // Check if the payment was successful
    if (result.success) {
      // Calculate subscription period (1 month from now)
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(now.getMonth() + 1);

      // Update user subscription
      await updateUserSubscription({
        userId,
        subscriptionId: result.transaction.reference,
        subscriptionStatus: 'active',
        subscriptionPlan: 'premium',
        paymentProvider: 'mesomb',
        subscriptionPeriodStart: now,
        subscriptionPeriodEnd: endDate,
      });

      return {
        success: true,
        transactionId: result.transaction.reference,
        message: 'Payment successful'
      };
    } else {
      return {
        success: false,
        error: result.message || 'Payment failed'
      };
    }
  } catch (error) {
    console.error('Error processing MeSomb payment:', error);
    return {
      success: false,
      error: 'Failed to process payment'
    };
  }
}

/**
 * Verifies a MeSomb payment status
 */
export async function verifyMeSombPayment(transactionId: string) {
  try {
    const response = await fetch(`https://mesomb.hachther.com/api/v1.0/payment/status/${transactionId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-MeSomb-Application': MESOMB_APP_KEY
      }
    });

    const result = await response.json();
    
    return {
      success: response.ok,
      status: result.status,
      data: result
    };
  } catch (error) {
    console.error('Error verifying MeSomb payment:', error);
    return {
      success: false,
      error: 'Failed to verify payment'
    };
  }
}
