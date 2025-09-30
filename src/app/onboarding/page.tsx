'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CreditCard, 
  QrCode, 
  Utensils, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

type OnboardingStep = 'business' | 'payments' | 'subscription' | 'tables' | 'qr' | 'menu' | 'complete';

interface BusinessInfo {
  name: string;
  slug: string;
  address: string;
  currency: string;
  timezone: string;
  serviceType: 'TABLE' | 'PICKUP';
  taxRateBps: number;
  defaultTipBps: number;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('business');
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    slug: '',
    address: '',
    currency: 'USD',
    timezone: 'America/New_York',
    serviceType: 'TABLE',
    taxRateBps: 0,
    defaultTipBps: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 'business', title: 'Business Profile', icon: Building2, completed: false },
    { id: 'payments', title: 'Payment Setup', icon: CreditCard, completed: false },
    { id: 'subscription', title: 'Subscription', icon: CheckCircle, completed: false },
    { id: 'tables', title: 'Tables', icon: Utensils, completed: false },
    { id: 'qr', title: 'QR Codes', icon: QrCode, completed: false },
    { id: 'menu', title: 'Menu', icon: Utensils, completed: false },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/onboarding/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessInfo),
      });

      if (response.ok) {
        setCurrentStep('payments');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create restaurant');
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert('Failed to create restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeConnect = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/billing/start-trial', {
        method: 'POST',
      });

      if (response.ok) {
        setCurrentStep('tables');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Failed to start trial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTablesSubmit = async (tableLabels: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/onboarding/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableLabels }),
      });

      if (response.ok) {
        setCurrentStep('qr');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create tables');
      }
    } catch (error) {
      console.error('Error creating tables:', error);
      alert('Failed to create tables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to QR Orders
          </h1>
          <p className="text-gray-600">
            Let's get your restaurant set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                    ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-gray-300 bg-white text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-8 h-0.5 mx-2 transition-all duration-200
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {currentStep === 'business' && 'Business Information'}
                {currentStep === 'payments' && 'Payment Setup'}
                {currentStep === 'subscription' && 'Start Your Free Trial'}
                {currentStep === 'tables' && 'Create Your Tables'}
                {currentStep === 'qr' && 'Generate QR Codes'}
                {currentStep === 'menu' && 'Set Up Your Menu'}
                {currentStep === 'complete' && 'All Set!'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 'business' && (
                <BusinessStep 
                  businessInfo={businessInfo}
                  setBusinessInfo={setBusinessInfo}
                  onSubmit={handleBusinessSubmit}
                  isLoading={isLoading}
                />
              )}
              
              {currentStep === 'payments' && (
                <PaymentsStep 
                  onConnect={handleStripeConnect}
                  isLoading={isLoading}
                />
              )}
              
              {currentStep === 'subscription' && (
                <SubscriptionStep 
                  onStartTrial={handleStartTrial}
                  isLoading={isLoading}
                />
              )}
              
              {currentStep === 'tables' && (
                <TablesStep 
                  onSubmit={handleTablesSubmit}
                  isLoading={isLoading}
                />
              )}
              
              {currentStep === 'qr' && (
                <QRStep 
                  onNext={() => setCurrentStep('menu')}
                />
              )}
              
              {currentStep === 'menu' && (
                <MenuStep 
                  onComplete={handleComplete}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BusinessStep({ 
  businessInfo, 
  setBusinessInfo, 
  onSubmit, 
  isLoading 
}: {
  businessInfo: BusinessInfo;
  setBusinessInfo: (info: BusinessInfo) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant Name *
        </label>
        <Input
          value={businessInfo.name}
          onChange={(e) => {
            const name = e.target.value;
            setBusinessInfo({
              ...businessInfo,
              name,
              slug: generateSlug(name),
            });
          }}
          placeholder="Enter your restaurant name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Slug *
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            qrorders.com/r/
          </span>
          <Input
            value={businessInfo.slug}
            onChange={(e) => setBusinessInfo({ ...businessInfo, slug: e.target.value })}
            placeholder="your-restaurant"
            className="rounded-l-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <Textarea
          value={businessInfo.address}
          onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
          placeholder="Enter your restaurant address"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={businessInfo.currency}
            onChange={(e) => setBusinessInfo({ ...businessInfo, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={businessInfo.timezone}
            onChange={(e) => setBusinessInfo({ ...businessInfo, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="TABLE"
              checked={businessInfo.serviceType === 'TABLE'}
              onChange={(e) => setBusinessInfo({ ...businessInfo, serviceType: e.target.value as 'TABLE' | 'PICKUP' })}
              className="mr-2"
            />
            Table Service
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="PICKUP"
              checked={businessInfo.serviceType === 'PICKUP'}
              onChange={(e) => setBusinessInfo({ ...businessInfo, serviceType: e.target.value as 'TABLE' | 'PICKUP' })}
              className="mr-2"
            />
            Pickup Only
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (basis points)
          </label>
          <Input
            type="number"
            value={businessInfo.taxRateBps}
            onChange={(e) => setBusinessInfo({ ...businessInfo, taxRateBps: parseInt(e.target.value) || 0 })}
            placeholder="875 (8.75%)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Tip (basis points)
          </label>
          <Input
            type="number"
            value={businessInfo.defaultTipBps}
            onChange={(e) => setBusinessInfo({ ...businessInfo, defaultTipBps: parseInt(e.target.value) || 0 })}
            placeholder="1800 (18%)"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Continue'}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </form>
  );
}

function PaymentsStep({ onConnect, isLoading }: { onConnect: () => void; isLoading: boolean }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <CreditCard className="w-8 h-8 text-blue-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Stripe Account
        </h3>
        <p className="text-gray-600">
          Connect your Stripe account to receive payments directly. 
          No platform fees - all money goes straight to your account.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Why Stripe Connect?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Direct payments to your account</li>
          <li>• Support for Apple Pay & Google Pay</li>
          <li>• Automatic tax calculation</li>
          <li>• Secure PCI compliance</li>
        </ul>
      </div>

      <Button onClick={onConnect} disabled={isLoading} className="w-full">
        {isLoading ? 'Connecting...' : 'Connect Stripe Account'}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}

function SubscriptionStep({ onStartTrial, isLoading }: { onStartTrial: () => void; isLoading: boolean }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Start Your Free Trial
        </h3>
        <p className="text-gray-600">
          Get 14 days free to try all features. No credit card required.
        </p>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">What's Included:</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Unlimited QR codes</li>
          <li>• Real-time order management</li>
          <li>• Customer analytics</li>
          <li>• 24/7 support</li>
        </ul>
      </div>

      <Button onClick={onStartTrial} disabled={isLoading} className="w-full">
        {isLoading ? 'Starting Trial...' : 'Start Free Trial'}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}

function TablesStep({ onSubmit, isLoading }: { onSubmit: (labels: string[]) => void; isLoading: boolean }) {
  const [tableLabels, setTableLabels] = useState<string[]>(['T1', 'T2', 'T3', 'T4']);

  const addTable = () => {
    const nextNumber = tableLabels.length + 1;
    setTableLabels([...tableLabels, `T${nextNumber}`]);
  };

  const removeTable = (index: number) => {
    if (tableLabels.length > 1) {
      setTableLabels(tableLabels.filter((_, i) => i !== index));
    }
  };

  const updateTable = (index: number, value: string) => {
    const newLabels = [...tableLabels];
    newLabels[index] = value;
    setTableLabels(newLabels);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Create Your Tables
        </h3>
        <p className="text-gray-600">
          Add table labels that will appear on your QR codes
        </p>
      </div>

      <div className="space-y-3">
        {tableLabels.map((label, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={label}
              onChange={(e) => updateTable(index, e.target.value)}
              placeholder="Table label"
              className="flex-1"
            />
            {tableLabels.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeTable(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addTable}
        className="w-full"
      >
        Add Table
      </Button>

      <Button 
        onClick={() => onSubmit(tableLabels)} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Creating Tables...' : 'Continue'}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}

function QRStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
        <QrCode className="w-8 h-8 text-purple-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          QR Codes Generated!
        </h3>
        <p className="text-gray-600">
          Your QR codes have been created. You can download and print them from the admin panel.
        </p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-2">Next Steps:</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Print QR codes for each table</li>
          <li>• Place them on tables or display stands</li>
          <li>• Test by scanning with your phone</li>
        </ul>
      </div>

      <Button onClick={onNext} className="w-full">
        Continue to Menu Setup
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}

function MenuStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
        <Utensils className="w-8 h-8 text-orange-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Menu Setup Complete
        </h3>
        <p className="text-gray-600">
          You can add and edit menu items from the admin panel anytime.
        </p>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <h4 className="font-medium text-orange-900 mb-2">You're All Set!</h4>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Restaurant profile created</li>
          <li>• Stripe payments connected</li>
          <li>• Free trial started</li>
          <li>• Tables and QR codes ready</li>
        </ul>
      </div>

      <Button onClick={onComplete} className="w-full">
        Go to Dashboard
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}
