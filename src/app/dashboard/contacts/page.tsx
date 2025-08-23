"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { useContacts } from "@/hooks/usePayloadCollection"
import { TrendingUp, Users, UserPlus, Eye, Edit, Trash2, Phone, Mail, Building, Star, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Contact type interface based on Payload schema
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
    assignedTo?: { id: string; email: string }
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
  tags?: Array<{ tag: string }>
  notes?: string
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export default function ContactsPage() {
  // Set page title
  useEffect(() => {
    document.title = "Angel OS: Contacts"
  }, [])

  // Fetch contacts data from Payload CMS
  const { data: contacts, loading, error, refresh } = useContacts({
    limit: 20,
    sort: '-updatedAt',
  })

  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: 'displayName',
      header: 'Contact',
      cell: (value: string, row: Contact) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{value.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Link href={`/dashboard/contacts/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              {row.email && (
                <a href={`mailto:${row.email}`} className="text-sm text-muted-foreground hover:text-primary">
                  <Mail className="h-3 w-3 inline mr-1" />
                  {row.email}
                </a>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: (value: string) => (
        value ? (
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{value}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: (value: string) => (
        value ? (
          <a href={`tel:${value}`} className="flex items-center space-x-2 text-sm hover:text-primary">
            <Phone className="h-3 w-3" />
            <span>{value}</span>
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    createColumn.badge('type', 'Type', {
      customer: { variant: 'default', label: 'Customer' },
      lead: { variant: 'secondary', label: 'Lead' },
      vendor: { variant: 'outline', label: 'Vendor' },
      partner: { variant: 'secondary', label: 'Partner' },
      employee: { variant: 'default', label: 'Employee' },
      other: { variant: 'secondary', label: 'Other' },
    }),
    createColumn.badge('crm.status', 'CRM Status', {
      new: { variant: 'secondary', label: 'New' },
      qualified: { variant: 'default', label: 'Qualified' },
      proposal: { variant: 'default', label: 'Proposal' },
      negotiation: { variant: 'default', label: 'Negotiation' },
      closed_won: { variant: 'default', label: 'Won' },
      closed_lost: { variant: 'destructive', label: 'Lost' },
      nurturing: { variant: 'secondary', label: 'Nurturing' },
    }),
    {
      accessorKey: 'crm.score',
      header: 'Lead Score',
      cell: (value: number) => {
        if (!value) return <span className="text-muted-foreground">-</span>
        const color = value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600'
        return (
          <div className="flex items-center space-x-2">
            <Star className={`h-4 w-4 ${color}`} />
            <span className={`font-medium ${color}`}>{value}</span>
          </div>
        )
      },
    },
    createColumn.text('crm.source', 'Source', { 
      className: 'capitalize text-sm',
      cell: (value: string) => value?.replace('_', ' ') || '-'
    }),
    createColumn.date('crm.lastContactDate', 'Last Contact'),
    createColumn.date('updatedAt', 'Updated'),
  ]

  // Define actions for each row
  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (contact: Contact) => {
        window.location.href = `/dashboard/contacts/${contact.id}`
      },
    },
    {
      label: 'Send Email',
      icon: <Mail className="h-4 w-4" />,
      condition: (contact: Contact) => !!contact.email,
      onClick: (contact: Contact) => {
        window.open(`mailto:${contact.email}`, '_blank')
      },
    },
    {
      label: 'Call Contact',
      icon: <Phone className="h-4 w-4" />,
      condition: (contact: Contact) => !!contact.phone,
      onClick: (contact: Contact) => {
        window.open(`tel:${contact.phone}`, '_blank')
      },
    },
    {
      label: 'Start Chat',
      icon: <MessageCircle className="h-4 w-4" />,
      onClick: (contact: Contact) => {
        // TODO: Implement chat functionality
        console.log('Start chat with contact:', contact.id)
      },
    },
    {
      label: 'Edit Contact',
      icon: <Edit className="h-4 w-4" />,
      onClick: (contact: Contact) => {
        window.location.href = `/dashboard/contacts/${contact.id}/edit`
      },
    },
    {
      label: 'Delete Contact',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      onClick: (contact: Contact) => {
        if (confirm(`Are you sure you want to delete "${contact.displayName}"?`)) {
          // TODO: Implement delete functionality
          console.log('Delete contact:', contact.id)
        }
      },
    },
  ]

  // Calculate metrics
  const totalContacts = contacts.length
  const newLeads = contacts.filter(c => c.crm.status === 'new').length
  const qualifiedLeads = contacts.filter(c => c.crm.status === 'qualified').length
  const customers = contacts.filter(c => c.type === 'customer').length
  const highScoreLeads = contacts.filter(c => (c.crm.score || 0) >= 80).length

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground">
            Manage your customer relationships and lead pipeline
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContacts}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                All contacts
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newLeads}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Need attention
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qualifiedLeads}</div>
              <div className="flex items-center text-xs text-yellow-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Ready to convert
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Active customers
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Add Contact</h3>
                  <p className="text-sm text-muted-foreground">Create new contact</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Email Campaign</h3>
                  <p className="text-sm text-muted-foreground">Send bulk emails</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Lead Scoring</h3>
                  <p className="text-sm text-muted-foreground">Update lead scores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Follow-ups</h3>
                  <p className="text-sm text-muted-foreground">Schedule follow-ups</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contacts DataTable */}
      <DataTable
        data={contacts}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search contacts..."
        addButton={{
          label: "Add Contact",
          href: "/dashboard/contacts/add"
        }}
        exportButton={true}
        className="mt-6"
      />
    </div>
  )
}
