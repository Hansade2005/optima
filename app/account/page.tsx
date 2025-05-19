'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/toast';
import { format } from 'date-fns';
import { AlertCircle, Check, CreditCard, Phone, RefreshCcw, ShieldCheck, X } from 'lucide-react';

interface SubscriptionData {
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  paymentProvider?: string;
  subscriptionPeriodStart?: string;
  subscriptionPeriodEnd?: string;
  type?: string;
  isActive?: boolean;
  isPremium?: boolean;
}

export default function AccountPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentService, setPaymentService] = useState<'MTN' | 'ORANGE' | 'AIRTEL'>('MTN');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });

  // Get status parameter from URL
  const status = searchParams.get('status');
  
  // Show status notifications
  useEffect(() => {
    if (status === 'success') {
      toast({ type: 'success', description: 'Payment succeeded! Your subscription is now active.' });
    } else if (status === 'canceled') {
      toast({ type: 'error', description: 'Payment canceled.' });
    }
  }, [status]);

  // Load subscription data
  useEffect(() => {
    async function fetchSubscription() {
      try {
        setLoading(true);
        const response = await fetch('/api/subscription/status');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription status');
        }
        
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({ type: 'error', description: 'Failed to load subscription details' });
      } finally {
        setLoading(false);
      }
    }
    
    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  // Handle Stripe checkout
  const handleStripeCheckout = async () => {
    try {
      const response = await fetch('/api/subscription/stripe', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({ type: 'error', description: 'Failed to start checkout process' });
    }
  };
  
  // Handle MeSomb payment
  const handleMeSombPayment = async () => {
    try {
      setProcessingPayment(true);
      
      if (!phoneNumber || phoneNumber.length < 9) {
        toast({ type: 'error', description: 'Please enter a valid phone number' });
        return;
      }
      
      const response = await fetch('/api/subscription/mesomb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          service: paymentService,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({ type: 'success', description: 'Payment successful! Your subscription is now active.' });
        // Reload session and subscription data
        updateSession();
        router.refresh();
        
        // Reload subscription data
        const statusResponse = await fetch('/api/subscription/status');
        if (statusResponse.ok) {
          setSubscription(await statusResponse.json());
        }
      } else {
        toast({ type: 'error', description: result.error || 'Payment failed' });
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({ type: 'error', description: error.message || 'Failed to process payment' });
    } finally {
      setProcessingPayment(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will have access until the end of the current billing period.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({ type: 'success', description: 'Your subscription has been canceled' });
        // Reload session and subscription data
        updateSession();
        router.refresh();
        
        // Reload subscription data
        const statusResponse = await fetch('/api/subscription/status');
        if (statusResponse.ok) {
          setSubscription(await statusResponse.json());
        }
      } else {
        toast({ type: 'error', description: 'Failed to cancel subscription' });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({ type: 'error', description: 'An error occurred while canceling subscription' });
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (newPassword !== confirmPassword) {
      toast({ type: 'error', description: 'New passwords do not match' });
      return;
    }
    
    // For now, just show a toast
    toast({ type: 'success', description: 'Password updated successfully' });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    // TODO: Implement actual password change API call
  };
  
  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { newEmail, password } = emailForm;
    
    if (!newEmail || !password) {
      toast({ type: 'error', description: 'Please fill all fields' });
      return;
    }
    
    // For now, just show a toast
    toast({ type: 'success', description: 'Email updated successfully' });
    setEmailForm({ newEmail: '', password: '' });
    
    // TODO: Implement actual email change API call
  };
  
  // Not authenticated
  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access your account</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')} className="w-full">Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Display loading state
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Account Management</h1>
        <Tabs defaultValue="subscription">
        <TabsList className="mb-6">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription">
          <div className="grid gap-6">
            {/* Current Subscription */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your current subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {subscription?.subscriptionPlan === 'premium' ? 'Premium Plan' : 'Free Plan'}
                    </h3>
                    {subscription?.subscriptionPlan === 'premium' && (
                      <p className="text-sm text-muted-foreground">
                        {subscription.paymentProvider === 'stripe' ? 'Via Credit Card' : 'Via Mobile Payment'}
                      </p>
                    )}
                  </div>
                  <Badge variant={subscription?.subscriptionPlan === 'premium' ? 'default' : 'outline'}>
                    {subscription?.subscriptionStatus || 'Free'}
                  </Badge>
                </div>
                
                {subscription?.subscriptionPlan === 'premium' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium flex items-center gap-1">
                        {subscription.subscriptionStatus === 'active' ? (
                          <>Active <Check className="h-4 w-4 text-green-500" /></>
                        ) : (
                          <>{subscription.subscriptionStatus} <AlertCircle className="h-4 w-4 text-amber-500" /></>
                        )}
                      </span>
                    </div>
                    
                    {subscription.subscriptionPeriodEnd && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {subscription.subscriptionStatus === 'canceled' ? 'Access until:' : 'Renews on:'}
                        </span>
                        <span className="font-medium">
                          {format(new Date(subscription.subscriptionPeriodEnd), 'PPP')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {subscription?.subscriptionPlan === 'premium' ? (
                  <>
                    {subscription.subscriptionStatus === 'active' && (
                      <Button variant="outline" onClick={handleCancelSubscription}>
                        Cancel Subscription
                      </Button>
                    )}
                    {subscription.subscriptionStatus === 'canceled' && (
                      <Button onClick={handleStripeCheckout}>
                        Renew Subscription
                      </Button>
                    )}
                  </>
                ) : (
                  <Button onClick={handleStripeCheckout}>
                    Upgrade to Premium
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Premium Features */}
            <Card>
              <CardHeader>
                <CardTitle>Premium Benefits</CardTitle>
                <CardDescription>What you get with a premium subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Access to all premium AI models, including Gemini Pro, Mistral Large, and more.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>500 messages per day (versus 100 for free users)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col w-full gap-2">
                  <p className="text-sm font-medium">Choose payment method:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <Button 
                      onClick={handleStripeCheckout} 
                      className="flex items-center justify-center gap-2"
                      disabled={processingPayment}
                    >
                      <CreditCard className="h-4 w-4" />
                      Card Payment ($20.46)
                    </Button>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex gap-2">
                        <Input 
                          type="tel" 
                          placeholder="Phone number" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          disabled={processingPayment}
                        />
                        <select 
                          className="h-10 rounded-md border border-input bg-background px-3"
                          value={paymentService}
                          onChange={(e) => setPaymentService(e.target.value as any)}
                          disabled={processingPayment}
                        >
                          <option value="MTN">MTN</option>
                          <option value="ORANGE">Orange</option>
                          <option value="AIRTEL">Airtel</option>
                        </select>
                      </div>
                      <Button 
                        onClick={handleMeSombPayment} 
                        variant="outline" 
                        className="flex items-center justify-center gap-2"
                        disabled={processingPayment}
                      >
                        <Phone className="h-4 w-4" />
                        Mobile Payment (12,000 XAF)
                        {processingPayment && <RefreshCcw className="ml-2 h-4 w-4 animate-spin" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid gap-6">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">Update Password</Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Email Change */}
            <Card>
              <CardHeader>
                <CardTitle>Change Email</CardTitle>
                <CardDescription>Update your account email</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="new-email">New Email</Label>
                    <Input 
                      id="new-email" 
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password">Confirm with Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">Update Email</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
