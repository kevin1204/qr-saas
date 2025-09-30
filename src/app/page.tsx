import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Users, CreditCard, BarChart3 } from "lucide-react";

export default function Home() {
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
              <Link href="/" className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">About</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Pricing</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">Contact</Link>
              <Button asChild variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            QR Orders
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The complete QR ordering system for restaurants, cafés, and bars. 
            Let customers order directly from their phones with real-time updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/r/reset/t/T1">
                Try Demo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">
                Staff Login
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose QR Orders?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to modernize your restaurant and provide an exceptional customer experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                  <QrCode className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-300">QR Code Ordering</CardTitle>
                <CardDescription className="text-base">
                  Customers scan QR codes to access your menu instantly. No app downloads required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300">
                  <Users className="w-8 h-8 text-green-600 group-hover:text-green-700" />
                </div>
                <CardTitle className="text-xl group-hover:text-green-600 transition-colors duration-300">Real-time Updates</CardTitle>
                <CardDescription className="text-base">
                  Live order tracking and status updates keep customers informed throughout their visit.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                  <CreditCard className="w-8 h-8 text-purple-600 group-hover:text-purple-700" />
                </div>
                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors duration-300">Secure Payments</CardTitle>
                <CardDescription className="text-base">
                  Integrated Stripe checkout ensures secure, fast payments with fraud protection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="w-8 h-8 text-orange-600 group-hover:text-orange-700" />
                </div>
                <CardTitle className="text-xl group-hover:text-orange-600 transition-colors duration-300">Staff Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Manage orders with a real-time kanban board designed for restaurant efficiency.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Modern Restaurants</h2>
            <p className="text-xl text-gray-600">
              Everything you need to streamline operations and delight customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Mobile-First Design</h3>
              <p className="text-gray-600">Optimized for mobile devices with intuitive touch interactions</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Orders process in seconds with our optimized infrastructure</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-600">Bank-level encryption and PCI compliance for all transactions</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">Detailed insights into sales, popular items, and customer behavior</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Language</h3>
              <p className="text-gray-600">Support for multiple languages to serve diverse communities</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
              <p className="text-gray-600">Seamlessly integrates with your existing POS and systems</p>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by 500+ Restaurants</h2>
            <p className="text-xl text-gray-600">
              See what restaurant owners are saying about QR Orders
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-6 pt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "QR Orders transformed our restaurant. Orders are 40% faster, customers love the experience, 
                  and our staff can focus on food quality instead of taking orders."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-100">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format" 
                      alt="Sarah Martinez" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Sarah Martinez</p>
                    <p className="text-sm text-gray-600">Owner, Bella Vista Restaurant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-6 pt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "The setup was incredibly easy. We had QR codes on all tables within 30 minutes. 
                  Our customers appreciate the contactless experience, especially post-COVID."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-green-100">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format" 
                      alt="James Chen" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">James Chen</p>
                    <p className="text-sm text-gray-600">Manager, Golden Dragon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-6 pt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "The analytics dashboard gives us insights we never had before. We can see which items 
                  are popular, peak ordering times, and customer preferences. It's a game-changer."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-100">
                    <img 
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format" 
                      alt="Amanda Rodriguez" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Amanda Rodriguez</p>
                    <p className="text-sm text-gray-600">Owner, Café Mornings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Join the Digital Restaurant Revolution</h2>
            <p className="text-xl opacity-90">
              Over 500 restaurants trust QR Orders to serve their customers better
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Restaurants</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-200">Orders Daily</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-200">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-blue-200">Rating</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about QR Orders
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-blue-600 transition-colors duration-300">How quickly can I get started?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can be up and running in under 10 minutes! Simply sign up, create your menu, 
                  generate QR codes, and you're ready to accept orders.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-green-600 transition-colors duration-300">Do customers need to download an app?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No! Customers simply scan the QR code with their phone's camera and access your menu 
                  through their web browser. No app downloads required.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-purple-600 transition-colors duration-300">Is my customer data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! We use enterprise-grade encryption and are PCI compliant. Your customer 
                  data is protected with the same security standards as major banks.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-orange-600 transition-colors duration-300">Can I integrate with my existing POS system?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! We offer integrations with most major POS systems. Contact our sales team to 
                  discuss your specific integration needs.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-indigo-600 transition-colors duration-300">What if I need help setting up my menu?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our customer success team is here to help! We provide free setup assistance, 
                  training materials, and ongoing support to ensure your success.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-pink-600 transition-colors duration-300">Can I customize the ordering experience?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can customize colors, add your logo, create custom categories, and even 
                  add special instructions or promotions to enhance the customer experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try the Demo
            </h2>
            <p className="text-xl text-gray-600">
              Experience the full ordering flow with our demo restaurant
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-gray-600">
                Use your phone to scan the QR code on the table
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse & Order</h3>
              <p className="text-gray-600">
                Browse the menu, customize items, and add to cart
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pay & Track</h3>
              <p className="text-gray-600">
                Pay securely and track your order in real-time
              </p>
            </div>
          </div>
          
          <div className="text-center space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/r/reset/t/T1">
                  Start Demo Order
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link href="/signup">
                  Get Started Free
                </Link>
              </Button>
            </div>
            
            {/* QR Code Testing Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test QR Code Scanning</h3>
              <p className="text-sm text-gray-600 mb-4">
                Generate and test QR codes that work with your phone
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/qr-test">
                    📱 Generate QR Code
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/qr-display">
                    🖨️ Print QR Code
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                QR codes point to: <code className="bg-blue-100 px-1 rounded">192.168.127.125:3000</code>
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Restaurant?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join hundreds of restaurants already using QR Orders to increase efficiency, 
            improve customer experience, and boost sales.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200 text-lg px-8 py-3 shadow-lg">
              <Link href="/signup">
                Start Free Trial
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200 text-lg px-8 py-3 shadow-lg">
              <Link href="/contact">
                Schedule Demo
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm opacity-90">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              14-day free trial
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              No credit card required
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              Setup in 10 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">QR Orders</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                The complete QR ordering system for restaurants, cafés, and bars. 
                Transform your customer experience with contactless ordering.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="/qr-test" className="text-gray-400 hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 QR Orders. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}