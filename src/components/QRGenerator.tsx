'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, QrCode, Printer } from 'lucide-react'

interface Table {
  id: string
  label: string
  code: string
}

interface Restaurant {
  id: string
  name: string
  slug: string
}

interface QRGeneratorProps {
  restaurant: Restaurant
}

export function QRGenerator({ restaurant }: QRGeneratorProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTables()
  }, [restaurant.id])

  const fetchTables = async () => {
    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurant.id}`)
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = (tableCode: string) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${restaurant.slug}/t/${tableCode}`
    
    // Simple QR code generation using a QR code API
    // In production, you'd want to use a proper QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    
    return qrUrl
  }

  const downloadQRCode = (tableCode: string) => {
    const qrUrl = generateQRCode(tableCode)
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `qr-${restaurant.slug}-${tableCode}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQRSheet = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrCodes = tables.map(table => {
      const qrUrl = generateQRCode(table.code)
      const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/r/${restaurant.slug}/t/${table.code}`
      
      return `
        <div style="
          width: 300px;
          height: 200px;
          border: 1px solid #ccc;
          margin: 10px;
          padding: 20px;
          display: inline-block;
          text-align: center;
          page-break-inside: avoid;
        ">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">${restaurant.name}</h3>
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Table ${table.label}</p>
          <img src="${qrUrl}" alt="QR Code" style="width: 120px; height: 120px;" />
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
            Scan to order
          </p>
        </div>
      `
    }).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - ${restaurant.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 30px;">${restaurant.name} - Table QR Codes</h1>
          <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            ${qrCodes}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            QR Code Actions
          </CardTitle>
          <CardDescription>
            Generate and download QR codes for all your tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button onClick={printQRSheet} className="flex items-center">
              <Printer className="w-4 h-4 mr-2" />
              Print All QR Codes
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print This Page
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{restaurant.name}</CardTitle>
              <CardDescription>Table {table.label}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-4">
                <img
                  src={generateQRCode(table.code)}
                  alt={`QR Code for Table ${table.label}`}
                  className="mx-auto border rounded"
                  style={{ width: '150px', height: '150px' }}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Scan to order
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadQRCode(table.code)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tables found</h3>
            <p className="text-gray-600">
              Create some tables first to generate QR codes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
