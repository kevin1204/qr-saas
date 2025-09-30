import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, Clock, Shield, Smartphone, BarChart3 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
              QR Orders
            </Link>
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Home</Link>
              <Link href="/about" className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">About</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Contact</Link>
              <Button asChild variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About QR Orders
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We're revolutionizing the restaurant industry with contactless ordering technology 
            that enhances customer experience while streamlining operations.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To empower restaurants with cutting-edge technology that creates seamless, 
                contactless dining experiences while reducing operational costs and increasing efficiency.
              </p>
              <p className="text-lg text-gray-600">
                We believe that technology should enhance human connection, not replace it. 
                Our platform brings restaurants and customers closer together through 
                intuitive, mobile-first solutions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-sm text-gray-600">Orders Daily</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">4.9★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                  <Shield className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                </div>
                <CardTitle className="group-hover:text-blue-600 transition-colors duration-300">Security First</CardTitle>
                <CardDescription>
                  We prioritize data security and privacy, ensuring your customer information 
                  is always protected with enterprise-grade encryption.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300">
                  <Clock className="w-8 h-8 text-green-600 group-hover:text-green-700" />
                </div>
                <CardTitle className="group-hover:text-green-600 transition-colors duration-300">Always Available</CardTitle>
                <CardDescription>
                  Our platform is designed for 24/7 reliability, ensuring your customers 
                  can always place orders when they need to.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-8 h-8 text-purple-600 group-hover:text-purple-700" />
                </div>
                <CardTitle className="group-hover:text-purple-600 transition-colors duration-300">Customer Focused</CardTitle>
                <CardDescription>
                  Every feature we build is designed with both restaurant owners and 
                  their customers in mind for the best possible experience.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center hover:transform hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                <QrCode className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4 group-hover:text-blue-600 transition-colors duration-300">1. Generate QR Codes</h3>
              <p className="text-gray-600">
                Create unique QR codes for each table in your restaurant. 
                Print and place them on tables for easy customer access.
              </p>
            </div>
            
            <div className="text-center hover:transform hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300">
                <Smartphone className="w-8 h-8 text-green-600 group-hover:text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4 group-hover:text-green-600 transition-colors duration-300">2. Customers Order</h3>
              <p className="text-gray-600">
                Customers scan the QR code with their phone, browse your menu, 
                customize items, and place orders directly from their device.
              </p>
            </div>
            
            <div className="text-center hover:transform hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="w-8 h-8 text-purple-600 group-hover:text-purple-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4 group-hover:text-purple-600 transition-colors duration-300">3. Manage Orders</h3>
              <p className="text-gray-600">
                Use our real-time dashboard to manage orders, track status, 
                and provide updates to customers automatically.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of restaurants already using QR Orders to enhance their customer experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-lg">
              <Link href="/signup" className="text-blue-600 font-semibold">Start Free Trial</Link>
            </Button>
            <Button asChild size="lg" className="bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-lg">
              <Link href="/contact" className="text-blue-600 font-semibold">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
