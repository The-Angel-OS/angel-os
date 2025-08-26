"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building, Mail, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Invitation {
  id: string
  email: string
  spaceId: string
  spaceName?: string
  role: string
  type: 'space_invitation' | 'account_creation'
  status: 'pending' | 'accepted' | 'expired'
  invitedBy: {
    firstName: string
    lastName: string
    email: string
  }
  expiresAt: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  
  // Form data for account creation
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (token) {
      loadInvitation()
    }
  }, [token])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invitations/${token}`)
      
      if (response.ok) {
        const data = await response.json()
        setInvitation(data)
        
        // Pre-fill email if available
        if (data.email) {
          setFormData(prev => ({ ...prev, email: data.email }))
        }
      } else if (response.status === 404) {
        setError('Invitation not found or has expired')
      } else {
        setError('Failed to load invitation')
      }
    } catch (error) {
      console.error('Error loading invitation:', error)
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    try {
      setAccepting(true)
      setError(null)

      if (invitation.type === 'account_creation') {
        // Validate form data
        if (!formData.firstName || !formData.lastName || !formData.password) {
          setError('Please fill in all required fields')
          return
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }

        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long')
          return
        }

        // Create account and accept invitation
        const response = await fetch(`/api/invitations/${token}/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'account_creation',
            userData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: invitation.email,
              password: formData.password
            }
          })
        })

        if (response.ok) {
          // Redirect to onboarding
          router.push('/onboarding?source=invitation')
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to create account')
        }
      } else {
        // Just accept space invitation
        const response = await fetch(`/api/invitations/${token}/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'space_invitation'
          })
        })

        if (response.ok) {
          // Redirect to login or dashboard
          router.push('/dashboard/spaces')
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to accept invitation')
        }
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) return null

  const isExpired = new Date(invitation.expiresAt) < new Date()
  const isAccepted = invitation.status === 'accepted'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {invitation.type === 'account_creation' ? (
              <UserPlus className="w-8 h-8 text-primary" />
            ) : (
              <Building className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {invitation.type === 'account_creation' 
              ? 'Join Angel OS' 
              : `Join ${invitation.spaceName || 'Space'}`
            }
          </CardTitle>
          <CardDescription>
            You've been invited by {invitation.invitedBy.firstName} {invitation.invitedBy.lastName}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Messages */}
          {isExpired && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This invitation has expired. Please request a new invitation.
              </AlertDescription>
            </Alert>
          )}

          {isAccepted && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation has already been accepted.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Invitation Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{invitation.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Role</p>
                <p className="text-sm text-muted-foreground capitalize">{invitation.role}</p>
              </div>
            </div>
          </div>

          {/* Account Creation Form */}
          {invitation.type === 'account_creation' && !isExpired && !isAccepted && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password (min 8 characters)"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isExpired && !isAccepted && (
              <Button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="flex-1"
              >
                {accepting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {invitation.type === 'account_creation' ? 'Creating Account...' : 'Accepting...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {invitation.type === 'account_creation' ? 'Create Account & Join' : 'Accept Invitation'}
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Go to Home
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Invitation expires on {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

