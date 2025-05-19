'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/toast';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  email: string;
  type: 'guest' | 'regular' | 'premium';
  plan: 'free' | 'premium';
  status?: string;
  currentPeriodEnd?: Date;
  paymentProvider?: 'stripe' | 'mesomb';
  isActive: boolean;
  isSubscribed: boolean;
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileProvider, setMobileProvider] = useState<'MTN' | 'ORANGE' | 'AIRTEL'>('MTN');
  
  // Check if coming back from a successful payment
  const success = searchParams?.get('success');
  const canceled = searchParams?.get('canceled');
  
  useEffect(() => {
    if (success) {
      toast({ 
        type: 'success', 
        description: 'Your subscription has been activated successfully!' 
      });
    } else if (canceled) {
      toast({ 
        type: 'error', 
        description: 'Your payment was canceled' 
      });
    }
  }, [success, canceled]);

  // Get user subscription status
  useEffect(() => {
    async function getSubscription() {
      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) throw new Error('Failed to fetch subscription');
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({ 
          type: 'error', 
          description: 'Failed to load subscription information' 
        });
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      getSubscription();
    }
  }, [session]);

  // Handle Stripe checkout
  const handleStripeCheckout = async () => {
    if (!session?.user) return;
    
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/payment/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to create checkout session');
      
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({ 
        type: 'error', 
        description: 'Failed to start checkout process' 
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle MeSomb checkout
  const handleMeSombCheckout = async () => {
    if (!session?.user || !phoneNumber) {
      toast({ 
        type: 'error', 
        description: 'Please enter your phone number' 
      });
      return;
    }
    
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/payment/mesomb/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          service: mobileProvider,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create payment');
      
      const result = await response.json();
      
      if (result.success) {
        toast({ 
          type: 'success', 
          description: 'Payment initiated! Please check your mobile phone to complete the transaction.' 
        });
        
        // After 5 seconds, try to verify the payment
        setTimeout(async () => {
          await verifyMeSombPayment(result.reference);
        }, 5000);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error creating MeSomb payment:', error);
      toast({ 
        type: 'error', 
        description: 'Payment failed. Please try again.' 
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Verify MeSomb payment
  const verifyMeSombPayment = async (reference: string) => {
    try {
      const response = await fetch('/api/payment/mesomb/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });
      
      if (!response.ok) throw new Error('Verification failed');
      
      const result = await response.json();
      
      if (result.success && result.verified) {
        toast({ 
          type: 'success', 
          description: 'Your payment was successful! Your premium subscription is now active.' 
        });
        
        // Refresh subscription data and session
        updateSession();
        
        // Fetch updated subscription
        const subscriptionResponse = await fetch('/api/subscription');
        if (subscriptionResponse.ok) {
          const data = await subscriptionResponse.json();
          setSubscription(data);
        }
      } else {
        toast({ 
          type: 'warning', 
          description: 'Payment is being processed. Please check back later.' 
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  // Handle subscription management
  const handleManageSubscription = async () => {
    if (!subscription) return;
    
    setPaymentLoading(true);
    try {
      if (subscription.paymentProvider === 'stripe') {
        // For Stripe, redirect to billing portal
        const response = await fetch('/api/payment/stripe/billing-portal', {
          method: 'POST',
        });
        
        if (!response.ok) throw new Error('Failed to create billing portal session');
        
        const { url } = await response.json();
        router.push(url);
      } else {
        // For MeSomb or others, handle cancellation directly
        const response = await fetch('/api/subscription/cancel', {
          method: 'POST',
        });
        
        if (!response.ok) throw new Error('Failed to cancel subscription');
        
        toast({ 
          type: 'success', 
          description: 'Your subscription has been canceled' 
        });
        
        // Refresh session and subscription data
        updateSession();
        
        // Fetch updated subscription
        const subscriptionResponse = await fetch('/api/subscription');
        if (subscriptionResponse.ok) {
          const data = await subscriptionResponse.json();
          setSubscription(data);
        }
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast({ 
        type: 'error', 
        description: 'Failed to manage subscription' 
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            Please sign in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Plan */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Your Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.plan === 'premium' ? 'Premium' : 'Free'}
                        </p>
                      </div>
                      <div>
                        {subscription.isSubscribed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                            Free
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {subscription.currentPeriodEnd && (
                      <div>
                        <p className="font-medium">Renewal Date</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(subscription.currentPeriodEnd), 'PPP')}
                        </p>
                      </div>
                    )}
                    
                    {subscription.paymentProvider && (
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.paymentProvider === 'stripe' ? 'Credit Card' : 'Mobile Money'}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium">Features</p>
                      <ul className="mt-2 space-y-2">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>
                            {subscription.plan === 'premium' ? '500 messages/day' : '100 messages/day'}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>
                            {subscription.plan === 'premium' ? 'All AI models' : 'Basic AI models only'}
                          </span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Live chat history</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    {subscription.isSubscribed ? (
                      <Button 
                        onClick={handleManageSubscription} 
                        disabled={paymentLoading}
                        variant="outline"
                      >
                        {paymentLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Manage Subscription
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Could not load subscription information. Please try again.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {/* Upgrade Plans */}
            {!subscription?.isSubscribed && !loading && (
              <Card>
                <CardHeader>
                  <CardTitle>Upgrade to Premium</CardTitle>
                  <CardDescription>
                    Unlock all features and premium AI models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
                      <div className="font-bold text-lg mb-1">Premium Plan</div>
                      <div className="text-2xl font-bold mb-2">
                        12,000 XAF <span className="text-sm font-normal text-muted-foreground">/ month</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">or $20.46 USD</div>
                      
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>500 messages/day</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Access to all AI models</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Priority support</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Tabs defaultValue="cameroon" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cameroon">Cameroon</TabsTrigger>
                        <TabsTrigger value="international">International</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="cameroon" className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="phone">Mobile Money Number</Label>
                          <Input
                            id="phone"
                            placeholder="e.g. 670000000"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Provider</Label>
                          <RadioGroup 
                            value={mobileProvider} 
                            onValueChange={(value) => setMobileProvider(value as 'MTN' | 'ORANGE' | 'AIRTEL')}
                            className="flex space-x-4 mt-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="MTN" id="MTN" />
                              <Label htmlFor="MTN">MTN</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ORANGE" id="ORANGE" />
                              <Label htmlFor="ORANGE">Orange</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="AIRTEL" id="AIRTEL" />
                              <Label htmlFor="AIRTEL">Airtel</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <Button 
                          onClick={handleMeSombCheckout} 
                          disabled={paymentLoading || !phoneNumber}
                          className="w-full"
                        >
                          {paymentLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Pay with Mobile Money
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="international" className="space-y-4 mt-4">
                        <Button 
                          onClick={handleStripeCheckout} 
                          disabled={paymentLoading}
                          className="w-full"
                        >
                          {paymentLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="mr-2 h-4 w-4" />
                          )}
                          Pay with Credit Card
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and update your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                </div>
                <div>
                  <p className="font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground">
                    {loading 
                      ? 'Loading...' 
                      : subscription?.type === 'premium' 
                        ? 'Premium' 
                        : subscription?.type === 'regular' 
                          ? 'Regular' 
                          : 'Guest'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}