"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { UniversalModal, FormField } from "@/components/ui/universal-modal"
import { usePayloadCollection } from "@/hooks/usePayloadCollection"
import { Users, TrendingUp, DollarSign, Clock, Plus, Phone, Mail, Calendar, Star, Eye } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Lead interface (extends Contact with lead-specific fields)
interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  crm: {
    status: 'lead' | 'qualified' | 'opportunity' | 'customer' | 'lost'
    leadScore: number
    source: string
    assignedTo?: {
      id: string
      email: string
      firstName?: string
      lastName?: string
    }
    lastContact?: string
    nextFollowUp?: string
    notes?: string
    tags?: Array<{ tag: string }>
    estimatedValue?: number
    probability?: number
  }
  createdAt: string
  updatedAt: string
}

// Hook for fetching leads (contacts with lead status)
function useLeads(options?: any) {
  return usePayloadCollection<Lead>({
    collection: 'contacts',
    where: {
      'crm.status': {
        in: ['lead', 'qualified', 'opportunity']
      }
    },
    sort: '-crm.leadScore',
    ...options,
  })
}

export default function LeadsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    document.title = "Angel OS: Leads"
  }, [])

  const { data: leads, loading, error, refresh } = useLeads()

  const leadModalFields: FormField[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'John'
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Doe'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'john@company.com'
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'text',
      placeholder: '+1 (555) 123-4567'
    },
    {
      name: 'company',
      label: 'Company',
      type: 'text',
      placeholder: 'Acme Corp'
    },
    {
      name: 'crm.source',
      label: 'Lead Source',
      type: 'select',
      required: true,
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Social Media', value: 'social' },
        { label: 'Referral', value: 'referral' },
        { label: 'Cold Outreach', value: 'cold_outreach' },
        { label: 'Event', value: 'event' },
        { label: 'Advertisement', value: 'advertisement' },
        { label: 'Other', value: 'other' }
      ]
    },
    {
      name: 'crm.estimatedValue',
      label: 'Estimated Deal Value',
      type: 'number',
      min: 0,
      placeholder: '5000'
    },
    {
      name: 'crm.notes',
      label: 'Initial Notes',
      type: 'textarea',
      placeholder: 'Initial conversation notes, requirements, etc.'
    }
  ]

  const handleCreateLead = async (data: any) => {
    // Process nested field names
    const processedData: any = { ...data }
    Object.keys(data).forEach(key => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.')
        if (parent && child) {
          if (!processedData[parent]) processedData[parent] = {}
          processedData[parent][child] = data[key]
          delete processedData[key]
        }
      }
    })

    // Set lead-specific defaults
    const leadData = {
      ...processedData,
      crm: {
        ...processedData.crm,
        status: 'lead',
        leadScore: 50, // Default lead score
        probability: 25, // Default probability for new leads
      }
    }

    console.log('Creating lead:', leadData)
    // TODO: Submit to API
    // await createContact(leadData)
    refresh()
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Lead',
      cell: (value: any, row: Lead) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {row.firstName?.[0]}{row.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link 
              href={`/dashboard/contacts/${row.id}`}
              className="font-medium hover:text-blue-600"
            >
              {row.firstName} {row.lastName}
            </Link>
            <p className="text-sm text-muted-foreground">{row.company}</p>
          </div>
        </div>
      ),
    },
    createColumn.badge('crm.status', 'Status', {
      lead: { variant: 'secondary', label: 'Lead' },
      qualified: { variant: 'default', label: 'Qualified' },
      opportunity: { variant: 'default', label: 'Opportunity' },
    }),
            {
          accessorKey: 'crm.leadScore',
          header: 'Score',
          cell: (value: number) => (
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor((value || 0) / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{value || 0}</span>
            </div>
          ),
        },
    createColumn.text('crm.source', 'Source', { 
      className: 'capitalize text-sm',
      cell: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value?.replace('_', ' ')}
        </Badge>
      )
    }),
        {
          accessorKey: 'crm.estimatedValue',
          header: 'Est. Value',
          cell: (value: number) => (
            <span className="font-medium">
              {value ? `$${value.toLocaleString()}` : '-'}
            </span>
          ),
        },
        {
          accessorKey: 'crm.assignedTo',
          header: 'Assigned To',
          cell: (value: any) => (
            <div className="flex items-center space-x-2">
              {value ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {value.firstName?.[0] || value.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {value.firstName && value.lastName
                      ? `${value.firstName} ${value.lastName}`
                      : value.email}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </div>
          ),
        },
    createColumn.date('crm.nextFollowUp', 'Next Follow-up'),
  ]

  const actions = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Lead) => {
        window.location.href = `/dashboard/contacts/${row.id}`
      },
    },
    {
      label: "Call Lead",
      icon: <Phone className="h-4 w-4" />,
      condition: (row: Lead) => Boolean(row.phone),
      onClick: (row: Lead) => {
        if (row.phone) {
          window.open(`tel:${row.phone}`)
        }
      },
    },
    {
      label: "Send Email",
      icon: <Mail className="h-4 w-4" />,
      onClick: (row: Lead) => {
        window.open(`mailto:${row.email}`)
      },
    },
    {
      label: "Schedule Follow-up",
      icon: <Calendar className="h-4 w-4" />,
      onClick: (row: Lead) => {
        console.log('Schedule follow-up for:', row.firstName, row.lastName)
        // TODO: Open appointment scheduling modal
      },
    },
  ]

  // Calculate metrics
  const totalLeads = leads.length
  const qualifiedLeads = leads.filter(l => l.crm.status === 'qualified').length
  const opportunities = leads.filter(l => l.crm.status === 'opportunity').length
  const totalValue = leads.reduce((sum, lead) => sum + (lead.crm.estimatedValue || 0), 0)
  const avgLeadScore = leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.crm.leadScore, 0) / leads.length) : 0

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
          <p className="text-muted-foreground">
            Manage and nurture your sales leads
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                Active prospects in pipeline
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qualifiedLeads}</div>
              <p className="text-xs text-muted-foreground">
                {totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0}% qualification rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{opportunities}</div>
              <p className="text-xs text-muted-foreground">
                Active sales opportunities
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg score: {avgLeadScore}/100
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Leads DataTable */}
      <DataTable
        data={leads}
        columns={columns}
        actions={actions}
        loading={loading}
        error={error || undefined}
        onRefresh={refresh}
        searchPlaceholder="Search leads..."
        exportButton={true}
        className="mt-6"
      />

      {/* Create Lead Modal */}
      <UniversalModal
        title="Add New Lead"
        description="Create a new lead in your sales pipeline"
        fields={leadModalFields}
        onSubmit={handleCreateLead}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        submitLabel="Add Lead"
        size="lg"
      />
    </div>
  )
}
