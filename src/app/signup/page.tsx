'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Building, MapPin, Phone, Mail } from "lucide-react";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Restaurant Details
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    description: '',
    
    // Step 3: Plan Selection
    plan: 'starter',
    
    // Step 4: Table Setup
    tableCount: 5,
    tableNames: [] as string[]
  });

  const steps = [
    { id: 1, title: 'Account Setup', description: 'Create your account' },
    { id: 2, title: 'Restaurant Info', description: 'Tell us about your business' },
    { id: 3, title: 'Choose Plan', description: 'Select your pricing plan' },
    { id: 4, title: 'Table Setup', description: 'Configure your tables' },
    { id: 5, title: 'Complete', description: 'You\'re all set!' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Account created successfully! Redirecting to dashboard...');
    // In a real app, this would redirect to the restaurant dashboard
    window.location.href = '/restaurant';
  };

  const generateTableNames = () => {
    const names = [];
    for (let i = 1; i <= formData.tableCount; i++) {
      names.push(`Table ${i}`);
    }
    setFormData({
      ...formData,
      tableNames: names
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              QR Orders
            </Link>
            <div className="flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {currentStep === 1 && 'Create Your Account'}
                  {currentStep === 2 && 'Restaurant Information'}
                  {currentStep === 3 && 'Choose Your Plan'}
                  {currentStep === 4 && 'Table Configuration'}
                  {currentStep === 5 && 'Welcome to QR Orders!'}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Let\'s get started with your account details'}
                  {currentStep === 2 && 'Tell us about your restaurant'}
                  {currentStep === 3 && 'Select the plan that fits your needs'}
                  {currentStep === 4 && 'Set up your tables for QR code generation'}
                  {currentStep === 5 && 'Your account is ready to use'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Account Setup */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                          Restaurant Name *
                        </label>
                        <Input
                          id="restaurantName"
                          name="restaurantName"
                          type="text"
                          required
                          value={formData.restaurantName}
                          onChange={handleInputChange}
                          placeholder="Your Restaurant Name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Create a password"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Restaurant Information */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="123 Main Street"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            required
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="San Francisco"
                          />
                        </div>
                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          <Input
                            id="state"
                            name="state"
                            type="text"
                            required
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="CA"
                          />
                        </div>
                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code *
                          </label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            type="text"
                            required
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            placeholder="94105"
                          />
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div>
                          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                          </label>
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://yourrestaurant.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                          Restaurant Description
                        </label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Tell us about your restaurant..."
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Plan Selection */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { id: 'starter', name: 'Starter', price: '$29', features: ['Up to 5 tables', 'Basic analytics', 'Email support'] },
                          { id: 'professional', name: 'Professional', price: '$79', features: ['Up to 25 tables', 'Advanced analytics', 'Priority support', 'Custom branding'] },
                          { id: 'enterprise', name: 'Enterprise', price: '$199', features: ['Unlimited tables', 'Advanced analytics', '24/7 support', 'API access'] }
                        ].map((plan) => (
                          <div
                            key={plan.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              formData.plan === plan.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData({ ...formData, plan: plan.id })}
                          >
                            <div className="text-center">
                              <h3 className="font-semibold text-lg">{plan.name}</h3>
                              <div className="text-2xl font-bold text-blue-600 my-2">{plan.price}</div>
                              <div className="text-sm text-gray-600">per month</div>
                              <ul className="mt-4 space-y-2 text-sm">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-center">
                                    <Check className="w-4 h-4 text-green-600 mr-2" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Table Setup */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="tableCount" className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Tables *
                        </label>
                        <Input
                          id="tableCount"
                          name="tableCount"
                          type="number"
                          min="1"
                          max="100"
                          required
                          value={formData.tableCount}
                          onChange={handleInputChange}
                          placeholder="5"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          How many tables do you have in your restaurant?
                        </p>
                      </div>
                      
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={generateTableNames}
                          className="w-full"
                        >
                          Generate Table Names
                        </Button>
                      </div>
                      
                      {formData.tableNames.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Your Tables:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {formData.tableNames.map((name, index) => (
                              <Badge key={index} variant="outline" className="p-2">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Complete */}
                  {currentStep === 5 && (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Welcome to QR Orders!
                        </h3>
                        <p className="text-gray-600">
                          Your account has been created successfully. You can now start setting up your menu and generating QR codes.
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Set up your menu items and prices</li>
                          <li>• Generate QR codes for your tables</li>
                          <li>• Print and place QR codes on tables</li>
                          <li>• Start accepting orders!</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    {currentStep < 5 ? (
                      <Button type="button" onClick={handleNext}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Complete Setup
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Why Choose QR Orders?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-sm">Easy Setup</h4>
                    <p className="text-xs text-gray-600">Get started in minutes, not hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-sm">Mobile-First</h4>
                    <p className="text-xs text-gray-600">Optimized for mobile ordering</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-sm">24/7 Support</h4>
                    <p className="text-xs text-gray-600">We're here when you need us</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-sm">Real-time Updates</h4>
                    <p className="text-xs text-gray-600">Live order tracking and management</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Our team is here to help you get started. Contact us if you have any questions.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
