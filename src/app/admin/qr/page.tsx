'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, Download, Printer, Plus, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Table {
  id: string
  label: string
  code: string
  qrGenerated?: boolean
}

interface QRCodeData {
  qrUrl: string
  qrCodeDataUrl: string
  table: Table
  restaurant: {
    name: string
    slug: string
  }
}

export default function QRManagementPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [qrCodes, setQrCodes] = useState<Record<string, QRCodeData>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [newTableLabel, setNewTableLabel] = useState('')
  const [isAddingTable, setIsAddingTable] = useState(false)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error)
      toast.error('Failed to load tables')
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (tableId: string) => {
    setGenerating(tableId)
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId }),
      })

      const data = await response.json()

      if (response.ok) {
        setQrCodes(prev => ({
          ...prev,
          [tableId]: data
        }))
        setTables(prev => prev.map(table => 
          table.id === tableId ? { ...table, qrGenerated: true } : table
        ))
        toast.success('QR code generated successfully!')
      } else {
        toast.error(data.error || 'Failed to generate QR code')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setGenerating(null)
    }
  }

  const downloadQRCode = (tableId: string) => {
    const qrData = qrCodes[tableId]
    if (!qrData) return

    const link = document.createElement('a')
    link.href = qrData.qrCodeDataUrl
    link.download = `qr-${qrData.restaurant.slug}-${qrData.table.code}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const printQRCode = (tableId: string) => {
    const qrData = qrCodes[tableId]
    if (!qrData) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${qrData.restaurant.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              text-align: center;
            }
            .qr-container {
              width: 300px;
              margin: 0 auto;
              border: 2px solid #000;
              padding: 20px;
            }
            .restaurant-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .table-label {
              font-size: 18px;
              margin-bottom: 15px;
            }
            .qr-code {
              width: 200px;
              height: 200px;
              margin: 0 auto 15px;
            }
            .instructions {
              font-size: 14px;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="restaurant-name">${qrData.restaurant.name}</div>
            <div class="table-label">Table ${qrData.table.label}</div>
            <img src="${qrData.qrCodeDataUrl}" alt="QR Code" class="qr-code" />
            <div class="instructions">Scan to order</div>
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  const printAllQRCodes = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrCodesHtml = Object.values(qrCodes).map(qrData => `
      <div style="
        width: 300px;
        height: 250px;
        border: 1px solid #ccc;
        margin: 10px;
        padding: 20px;
        display: inline-block;
        text-align: center;
        page-break-inside: avoid;
      ">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">${qrData.restaurant.name}</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">Table ${qrData.table.label}</p>
        <img src="${qrData.qrCodeDataUrl}" alt="QR Code" style="width: 120px; height: 120px;" />
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Scan to order</p>
      </div>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - ${Object.values(qrCodes)[0]?.restaurant.name || 'Restaurant'}</title>
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
          <h1 style="text-align: center; margin-bottom: 30px;">QR Codes - ${Object.values(qrCodes)[0]?.restaurant.name || 'Restaurant'}</h1>
          <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            ${qrCodesHtml}
          </div>
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  const addTable = async () => {
    if (!newTableLabel.trim()) {
      toast.error('Please enter a table label')
      return
    }

    setIsAddingTable(true)
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ label: newTableLabel.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setTables(prev => [...prev, data])
        setNewTableLabel('')
        toast.success('Table added successfully!')
      } else {
        toast.error(data.error || 'Failed to add table')
      }
    } catch (error) {
      console.error('Error adding table:', error)
      toast.error('Failed to add table')
    } finally {
      setIsAddingTable(false)
    }
  }

  const deleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTables(prev => prev.filter(table => table.id !== tableId))
        setQrCodes(prev => {
          const newQrCodes = { ...prev }
          delete newQrCodes[tableId]
          return newQrCodes
        })
        toast.success('Table deleted successfully!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete table')
      }
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error('Failed to delete table')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading QR codes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
          <p className="text-gray-600">Generate and manage QR codes for your tables</p>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Table label (e.g., Table 1, Bar 2)"
                  value={newTableLabel}
                  onChange={(e) => setNewTableLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTable()}
                />
                <Button onClick={addTable} disabled={isAddingTable}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Table
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={printAllQRCodes} variant="outline" disabled={Object.keys(qrCodes).length === 0}>
                <Printer className="w-4 h-4 mr-2" />
                Print All
              </Button>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {tables.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tables yet</h3>
              <p className="text-gray-600 mb-4">Add your first table to start generating QR codes.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">Table {table.label}</CardTitle>
                  <CardDescription>Code: {table.code}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {qrCodes[table.id] ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-32 h-32 relative">
                        <Image
                          src={qrCodes[table.id].qrCodeDataUrl}
                          alt={`QR Code for Table ${table.label}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Scan to order
                        </p>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadQRCode(table.id)}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printQRCode(table.id)}
                            className="flex-1"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(qrCodes[table.id].qrUrl, '_blank')}
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <Button
                          onClick={() => generateQRCode(table.id)}
                          disabled={generating === table.id}
                          className="w-full"
                        >
                          {generating === table.id ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <QrCode className="w-4 h-4 mr-2" />
                              Generate QR
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteTable(table.id)}
                          variant="outline"
                          size="sm"
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}