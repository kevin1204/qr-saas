'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function QRTestPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Use network IP instead of localhost for mobile scanning
      const networkUrl = 'http://192.168.127.125:3000/r/reset/t/T1'
      const qrCodeDataURL = await QRCode.toDataURL(networkUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(qrCodeDataURL)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = 'reset-restaurant-qr-code.png'
      link.href = qrCodeUrl
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">QR Code Test</h1>
          <p className="text-lg text-gray-600 mb-6">
            Generate a QR code to test the mobile scanning experience
          </p>
          <Badge variant="outline" className="text-sm">
            Table T1 - Reset Restaurant
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Generation */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📱 QR Code Generator
              </CardTitle>
              <CardDescription>
                Generate a QR code that customers can scan with their phones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateQRCode} 
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </Button>
              
              {qrCodeUrl && (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your phone camera
                    </p>
                    <Button 
                      onClick={downloadQRCode}
                      variant="outline"
                      size="sm"
                    >
                      Download QR Code
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Testing Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to test the complete flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Generate QR Code</p>
                    <p className="text-sm text-gray-600">Click the button to create a QR code</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Scan with Phone</p>
                    <p className="text-sm text-gray-600">Use your phone's camera to scan the QR code</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Test Mobile Experience</p>
                    <p className="text-sm text-gray-600">Browse menu, add items to cart, test the flow</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Network Required:</strong> Your phone and computer must be on the same WiFi network. 
                  The QR code points to <code className="bg-blue-100 px-1 rounded">192.168.127.125:3000</code> 
                  which is your computer's local network address.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Direct Link for Testing */}
        <div className="mt-8 text-center">
          <Card className="inline-block shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Or test directly on your phone:</p>
              <Button asChild variant="outline">
                <a 
                  href="http://192.168.127.125:3000/r/reset/t/T1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Open Menu on Mobile
                </a>
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Network URL: http://192.168.127.125:3000/r/reset/t/T1
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
