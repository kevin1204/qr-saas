'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Loader2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export default function AdminBillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingTrial, setIsStartingTrial] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      const response = await fetch('/api/billing/start-trial', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        alert('Free trial started successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Failed to start trial');
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Free Trial</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        {subscription && (
          <div className="flex items-center space-x-2">
            {getStatusBadge(subscription.status)}
          </div>
        )}
      </div>

      {!subscription ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Start Your Free Trial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Started with QR Orders
              </h3>
              <p className="text-gray-600 mb-6">
                Start your 14-day free trial. No credit card required.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What's Included in Your Trial:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Unlimited QR codes and tables
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Real-time order management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Customer analytics and insights
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Stripe payment processing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                  24/7 customer support
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleStartTrial}
              disabled={isStartingTrial}
              size="lg"
              className="w-full"
            >
              {isStartingTrial ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Trial...
                </>
              ) : (
                'Start 14-Day Free Trial'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              No credit card required. Cancel anytime during your trial.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">MVP Standard</span>
                <span className="text-2xl font-bold">$29/month</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Status</span>
                  {getStatusBadge(subscription.status)}
                </div>

                {subscription.trialEndsAt && subscription.status === 'trialing' && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Trial ends</span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(subscription.trialEndsAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subscription.currentPeriodEnd && subscription.status === 'active' && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Next billing</span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subscription.cancelAtPeriodEnd && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Cancelation</span>
                    <span className="text-orange-600">At period end</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Management */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage your subscription, update payment methods, and view billing history.
              </p>

              <Button 
                onClick={handleOpenBillingPortal}
                disabled={isOpeningPortal}
                className="w-full"
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Billing
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500">
                <p>• Update payment methods</p>
                <p>• Download invoices</p>
                <p>• Change subscription</p>
                <p>• Cancel subscription</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">QR Codes</h4>
              <p className="text-2xl font-bold text-blue-600">Unlimited</p>
              <p className="text-sm text-gray-600">Generate as many as you need</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Orders</h4>
              <p className="text-2xl font-bold text-blue-600">Unlimited</p>
              <p className="text-sm text-gray-600">No monthly limits</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
              <p className="text-2xl font-bold text-blue-600">24/7</p>
              <p className="text-sm text-gray-600">Email and chat support</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
