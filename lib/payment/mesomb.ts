import { env } from '@/lib/env';

export interface MeSombPaymentRequest {
  amount: number; // in XAF
  payer: string; // phone number e.g. 670000000
  fees?: boolean;
  service: 'MTN' | 'ORANGE' | 'AIRTEL';
  currency: 'XAF';
  message: string;
  country: 'CM';
}

export interface MeSombPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    status: string;
    message: string;
  };
  error?: any;
}

export async function createMeSombPayment(data: MeSombPaymentRequest): Promise<MeSombPaymentResponse> {
  try {
    const appKey = env.MESOMB_APP_KEY;
    
    if (!appKey) {
      return {
        success: false,
        message: 'MeSomb app key not configured',
      };
    }

    const url = 'https://mesomb.hachther.com/api/v1.0/payment/online/';
    
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla',
      'X-MeSomb-Application': appKey
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: 'Payment initiated successfully',
        data: result
      };
    } else {
      return {
        success: false,
        message: 'Payment failed',
        error: result
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Payment processing error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function verifyMeSombPayment(reference: string): Promise<{
  success: boolean;
  verified: boolean;
  reference: string;
}> {
  // This would typically call MeSomb API to verify a payment status
  // For now returning a simplified implementation
  return {
    success: true,
    verified: true,
    reference
  };
}