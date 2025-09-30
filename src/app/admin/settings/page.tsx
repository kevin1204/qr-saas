'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CreditCard, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  currency: string;
  timezone: string;
  serviceType: 'TABLE' | 'PICKUP';
  taxRateBps: number;
  defaultTipBps: number;
  stripeAccountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  billingCustomerId?: string;
  billingSubscriptionId?: string;
  trialEndsAt?: string;
}

interface StripeAccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: any;
}

export default function AdminSettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch('/api/admin/restaurant');
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data.restaurant);
        
        if (data.restaurant.stripeAccountId) {
          fetchStripeStatus(data.restaurant.stripeAccountId);
        }
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStripeStatus = async (accountId: string) => {
    try {
      const response = await fetch(`/api/connect/account-status?accountId=${accountId}`);
      if (response.ok) {
        const status = await response.json();
        setStripeStatus(status);
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    try {
      const response = await fetch('/api/connect/create-account', {
        method: 'POST',
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to connect Stripe');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      alert('Failed to connect Stripe');
    } finally {
      setIsConnectingStripe(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    if (!restaurant?.stripeAccountId) return;
    
    try {
      const response = await fetch('/api/connect/login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: restaurant.stripeAccountId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.open(url, '_blank');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to open Stripe dashboard');
      }
    } catch (error) {
      console.error('Error opening Stripe dashboard:', error);
      alert('Failed to open Stripe dashboard');
    }
  };

  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name'),
        address: formData.get('address'),
        taxRateBps: parseInt(formData.get('taxRateBps') as string),
        defaultTipBps: parseInt(formData.get('defaultTipBps') as string),
      };

      const response = await fetch('/api/admin/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updated = await response.json();
        setRestaurant(updated.restaurant);
        alert('Restaurant updated successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update restaurant');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Failed to update restaurant');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Not Found</h2>
        <p className="text-gray-600">Please complete the onboarding process first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
        <Badge variant="outline" className="text-sm">
          {restaurant.serviceType === 'TABLE' ? 'Table Service' : 'Pickup Only'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateRestaurant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name
                </label>
                <Input
                  name="name"
                  defaultValue={restaurant.name}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Textarea
                  name="address"
                  defaultValue={restaurant.address || ''}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (basis points)
                  </label>
                  <Input
                    name="taxRateBps"
                    type="number"
                    defaultValue={restaurant.taxRateBps}
                    min="0"
                    max="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Tip (basis points)
                  </label>
                  <Input
                    name="defaultTipBps"
                    type="number"
                    defaultValue={restaurant.defaultTipBps}
                    min="0"
                    max="10000"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Information'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!restaurant.stripeAccountId ? (
              <div className="text-center py-6">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Connect Stripe Account
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect your Stripe account to receive payments directly from customers.
                </p>
                <Button 
                  onClick={handleConnectStripe}
                  disabled={isConnectingStripe}
                  className="w-full"
                >
                  {isConnectingStripe ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Stripe Account'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Status</span>
                  <div className="flex items-center space-x-2">
                    {restaurant.chargesEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${restaurant.chargesEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {restaurant.chargesEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payouts</span>
                  <div className="flex items-center space-x-2">
                    {restaurant.payoutsEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${restaurant.payoutsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {restaurant.payoutsEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {stripeStatus?.requirements?.currently_due?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      Action Required
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Complete your Stripe account setup to enable payments.
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleOpenStripeDashboard}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Stripe Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status */}
      {restaurant.billingSubscriptionId && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-gray-600">MVP Standard</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {restaurant.trialEndsAt && new Date(restaurant.trialEndsAt) > new Date() 
                    ? 'Free Trial' 
                    : 'Active'
                  }
                </p>
                {restaurant.trialEndsAt && (
                  <p className="text-sm text-gray-600">
                    Trial ends {new Date(restaurant.trialEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}