'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function QRDisplayPage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const networkUrl = 'http://192.168.127.125:3000/r/reset/t/T1'

  useEffect(() => {
    generateQRCode()
  }, [])

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      const qrCodeDataURL = await QRCode.toDataURL(networkUrl, {
        width: 400,
        margin: 3,
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
      link.download = 'reset-restaurant-table-qr.png'
      link.href = qrCodeUrl
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Table QR Code</h1>
          <p className="text-lg text-gray-600 mb-6">
            Print this QR code and place it on your table for customers to scan
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="text-sm px-4 py-2">
              Table T1
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">
              Reset Restaurant
            </Badge>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Large QR Code for Printing */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Scan to Order</CardTitle>
              <CardDescription>
                Customers can scan this QR code with their phone camera
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {qrCodeUrl ? (
                <div className="p-6 bg-white rounded-2xl shadow-inner">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for Table T1" 
                    className="w-80 h-80"
                  />
                </div>
              ) : (
                <div className="w-80 h-80 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-gray-500">Generating QR Code...</div>
                </div>
              )}
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  Point your phone camera at this QR code
                </p>
                <Button 
                  onClick={downloadQRCode}
                  disabled={!qrCodeUrl}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions and Info */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Setup Instructions</CardTitle>
              <CardDescription>
                Follow these steps to set up your table QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Download QR Code</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Click the download button to save the QR code image
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Print & Display</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Print the QR code and place it on your table
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Test the Flow</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Scan with your phone to test the ordering experience
                    </p>
                  </div>
                </div>
              </div>

              {/* Network Info */}
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Network Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">URL:</span>
                    <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                      {networkUrl}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Status:</span>
                    <span className="text-green-600 font-medium">Ready for scanning</span>
                  </div>
                </div>
              </div>

              {/* Quick Test */}
              <div className="mt-6">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full"
                >
                  <a 
                    href={networkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Test on Mobile Device
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Make sure your phone and computer are on the same WiFi network for the QR code to work
          </p>
        </div>
      </div>
    </div>
  )
}
