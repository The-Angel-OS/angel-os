"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Mail, Phone, Building, MapPin, Calendar, Star, MessageCircle, User, Tag, Clock, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useParams } from "next/navigation"
import { usePayloadDocument } from "@/hooks/usePayloadCollection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Contact {
  id: string
  displayName: string
  email: string
  phone?: string
  company?: string
  type: 'customer' | 'lead' | 'vendor' | 'partner' | 'employee' | 'other'
  crm: {
    status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'nurturing'
    source: 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_outreach' | 'event' | 'other'
    score?: number
    lastContactDate?: string
    nextFollowUp?: string
    assignedTo?: { id: string; email: string; firstName?: string; lastName?: string }
    notes?: string
    dealValue?: number
    probability?: number
  }
  demographics?: {
    dateOfBirth?: string
    gender?: string
    location?: {
      city?: string
      state?: string
      country?: string
    }
  }
  preferences?: {
    communicationMethod?: 'email' | 'phone' | 'sms' | 'mail'
    marketingOptIn?: boolean
    language?: string
    timezone?: string
  }
  socialProfiles?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  tags?: Array<{ tag: string }>
  notes?: string
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function ContactDetailPage() {
  const params = useParams()
  const contactId = params.id as string
  
  // Use Payload's native API via our hook
  const { data: contact, loading, error, refresh } = usePayloadDocument<Contact>(
    'contacts',
    contactId,
    { depth: 2 } // Need depth=2 for assigned user details
  )
  
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-8 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contact Not Found</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard/contacts">Return to Contacts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No contact found
  if (!contact) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contact Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested contact could not be found.</p>
            <Button asChild>
              <Link href="/dashboard/contacts">Return to Contacts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get status color and configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New Lead' },
      qualified: { color: 'bg-green-100 text-green-800', label: 'Qualified' },
      proposal: { color: 'bg-yellow-100 text-yellow-800', label: 'Proposal Sent' },
      negotiation: { color: 'bg-orange-100 text-orange-800', label: 'In Negotiation' },
      closed_won: { color: 'bg-green-100 text-green-800', label: 'Closed Won' },
      closed_lost: { color: 'bg-red-100 text-red-800', label: 'Closed Lost' },
      nurturing: { color: 'bg-purple-100 text-purple-800', label: 'Nurturing' },
    }
    return configs[status as keyof typeof configs] || configs.new
  }

  const statusConfig = getStatusConfig(contact.crm.status)

  const handleStatusUpdate = async (newStatus: string) => {
    setStatusUpdateLoading(true)
    try {
      // TODO: Implement status update API call
      console.log('Updating contact status to:', newStatus)
      // This would trigger workflow hooks in Payload
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Get lead score color
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/contacts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg">
                {contact.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{contact.displayName}</h2>
              <p className="text-muted-foreground">{contact.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <motion.div
          className="md:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Contact Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Contact Overview</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={statusConfig.color}>
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {contact.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold capitalize">{contact.crm.status.replace('_', ' ')}</div>
                  <div className="text-sm text-muted-foreground">CRM Status</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold capitalize">{contact.crm.source.replace('_', ' ')}</div>
                  <div className="text-sm text-muted-foreground">Lead Source</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className={`text-lg font-bold ${getScoreColor(contact.crm.score)}`}>
                    {contact.crm.score || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Lead Score</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">
                    {contact.crm.dealValue ? `$${contact.crm.dealValue.toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Deal Value</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Button size="sm" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </Button>
                {contact.phone && (
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Start Chat</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </Button>
              </div>

              {/* Status Update Actions */}
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {contact.crm.status === 'new' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('qualified')} disabled={statusUpdateLoading}>
                    Mark as Qualified
                  </Button>
                )}
                {contact.crm.status === 'qualified' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('proposal')} disabled={statusUpdateLoading}>
                    Send Proposal
                  </Button>
                )}
                {contact.crm.status === 'proposal' && (
                  <Button size="sm" onClick={() => handleStatusUpdate('negotiation')} disabled={statusUpdateLoading}>
                    Start Negotiation
                  </Button>
                )}
                {['negotiation', 'proposal'].includes(contact.crm.status) && (
                  <>
                    <Button size="sm" onClick={() => handleStatusUpdate('closed_won')} disabled={statusUpdateLoading}>
                      Mark as Won
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('closed_lost')} disabled={statusUpdateLoading}>
                      Mark as Lost
                    </Button>
                  </>
                )}
                {!['closed_won', 'closed_lost'].includes(contact.crm.status) && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate('nurturing')} disabled={statusUpdateLoading}>
                    Move to Nurturing
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  </div>

                  {contact.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href={`tel:${contact.phone}`} className="text-sm text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Company</p>
                        <p className="text-sm text-muted-foreground">{contact.company}</p>
                      </div>
                    </div>
                  )}

                  {contact.demographics?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {[
                            contact.demographics.location.city,
                            contact.demographics.location.state,
                            contact.demographics.location.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {contact.preferences?.communicationMethod && (
                    <div>
                      <p className="font-medium mb-1">Preferred Communication</p>
                      <Badge variant="outline" className="capitalize">
                        {contact.preferences.communicationMethod}
                      </Badge>
                    </div>
                  )}

                  {contact.preferences?.language && (
                    <div>
                      <p className="font-medium mb-1">Language</p>
                      <p className="text-sm text-muted-foreground capitalize">{contact.preferences.language}</p>
                    </div>
                  )}

                  {contact.preferences?.timezone && (
                    <div>
                      <p className="font-medium mb-1">Timezone</p>
                      <p className="text-sm text-muted-foreground">{contact.preferences.timezone}</p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium mb-1">Marketing Opt-in</p>
                    <Badge variant={contact.preferences?.marketingOptIn ? 'default' : 'secondary'}>
                      {contact.preferences?.marketingOptIn ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag.tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(contact.notes || contact.crm.notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {contact.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">General Notes:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}
                {contact.crm.notes && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">CRM Notes:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.crm.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* CRM Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>CRM Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contact.crm.assignedTo && (
                  <div>
                    <p className="font-medium text-sm mb-1">Assigned To</p>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {contact.crm.assignedTo.firstName?.[0] || contact.crm.assignedTo.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {contact.crm.assignedTo.firstName && contact.crm.assignedTo.lastName
                          ? `${contact.crm.assignedTo.firstName} ${contact.crm.assignedTo.lastName}`
                          : contact.crm.assignedTo.email}
                      </span>
                    </div>
                  </div>
                )}

                {contact.crm.lastContactDate && (
                  <div>
                    <p className="font-medium text-sm mb-1">Last Contact</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(contact.crm.lastContactDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {contact.crm.nextFollowUp && (
                  <div>
                    <p className="font-medium text-sm mb-1">Next Follow-up</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(contact.crm.nextFollowUp).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {contact.crm.probability && (
                  <div>
                    <p className="font-medium text-sm mb-1">Win Probability</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                                              <div
                        className={`bg-green-500 h-2 rounded-full`}
                        style={{ width: `${contact.crm.probability}%` }}
                      />
                      </div>
                      <span className="text-sm font-medium">{contact.crm.probability}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Contact created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Last updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contact.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* TODO: Add more activity items from related records */}
              </div>
            </CardContent>
          </Card>

          {/* Social Profiles */}
          {contact.socialProfiles && Object.values(contact.socialProfiles).some(Boolean) && (
            <Card>
              <CardHeader>
                <CardTitle>Social Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contact.socialProfiles.linkedin && (
                    <a
                      href={contact.socialProfiles.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                    >
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {contact.socialProfiles.twitter && (
                    <a
                      href={contact.socialProfiles.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                    >
                      <span>Twitter</span>
                    </a>
                  )}
                  {contact.socialProfiles.facebook && (
                    <a
                      href={contact.socialProfiles.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                    >
                      <span>Facebook</span>
                    </a>
                  )}
                  {contact.socialProfiles.instagram && (
                    <a
                      href={contact.socialProfiles.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                    >
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
