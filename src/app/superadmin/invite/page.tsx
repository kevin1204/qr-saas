'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function InviteRestaurantPage() {
  const [formData, setFormData] = useState({
    email: '',
    role: 'OWNER',
    restaurantName: '',
    restaurantAddress: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [invitationLink, setInvitationLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/superadmin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setInvitationLink(data.invitationLink)
        toast.success('Invitation sent successfully!')
      } else {
        toast.error(data.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/superadmin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Invite Restaurant</h1>
          <p className="text-gray-600">Send an invitation to a new restaurant to join the platform</p>
        </div>

        {!invitationLink ? (
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Invitation</CardTitle>
              <CardDescription>
                Create an invitation link for a new restaurant to join the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="restaurant@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNER">Owner</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    placeholder="Bella Vista Restaurant"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="restaurantAddress">Restaurant Address</Label>
                  <Input
                    id="restaurantAddress"
                    value={formData.restaurantAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantAddress: e.target.value }))}
                    placeholder="123 Main St, City, State 12345"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Welcome to QR Orders! We're excited to help you modernize your restaurant..."
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Invitation Created!</CardTitle>
              <CardDescription>
                The invitation has been sent to {formData.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invitationLink">Invitation Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="invitationLink"
                      value={invitationLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share this link with the restaurant owner</li>
                    <li>• They will create their account and complete setup</li>
                    <li>• You can track their progress in the dashboard</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button asChild className="flex-1">
                    <Link href="/superadmin">
                      Back to Dashboard
                    </Link>
                  </Button>
                  <Button
                    onClick={() => {
                      setInvitationLink('')
                      setFormData({
                        email: '',
                        role: 'OWNER',
                        restaurantName: '',
                        restaurantAddress: '',
                        message: ''
                      })
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Send Another Invitation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
