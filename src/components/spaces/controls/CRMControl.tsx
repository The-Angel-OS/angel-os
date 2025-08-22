'use client'

import React, { useState } from 'react'
import type { Space, User as PayloadUser } from '@/payload-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  TrendingUp,
  Filter
} from 'lucide-react'

interface Channel {
  id: string
  name: string
  type: string
  description?: string
}

interface CRMControlProps {
  space: Space | null
  channel: Channel
  currentUser: PayloadUser
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'lead' | 'prospect' | 'customer' | 'inactive'
  value: number
  lastContact: string
  source: string
}

export function CRMControl({
  space,
  channel,
  currentUser
}: CRMControlProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  
  // Mock CRM data
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'RadioActive Car Audio',
      email: 'info@radioactivecaraudio.com',
      phone: '(727) 555-0123',
      company: 'RadioActive Car Audio',
      status: 'customer',
      value: 15000,
      lastContact: '2024-01-15',
      source: 'referral'
    },
    {
      id: '2',
      name: 'Beauty Salon Tampa',
      email: 'contact@beautysalontampa.com',
      phone: '(813) 555-0456',
      company: 'Beauty Salon Tampa',
      status: 'prospect',
      value: 8500,
      lastContact: '2024-01-10',
      source: 'website'
    },
    {
      id: '3',
      name: 'Downtown Barber Shop',
      email: 'hello@downtownbarber.com',
      phone: '(727) 555-0789',
      company: 'Downtown Barber Shop',
      status: 'lead',
      value: 5000,
      lastContact: '2024-01-08',
      source: 'social_media'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-blue-100 text-blue-800'
      case 'prospect': return 'bg-yellow-100 text-yellow-800'
      case 'customer': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || contact.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalValue = contacts.reduce((sum, contact) => sum + contact.value, 0)
  const customerCount = contacts.filter(c => c.status === 'customer').length
  const prospectCount = contacts.filter(c => c.status === 'prospect').length
  const leadCount = contacts.filter(c => c.status === 'lead').length

  return (
    <div className="flex flex-col h-full">
      {/* CRM Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{channel.name}</h1>
              {channel.description && (
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              )}
            </div>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* CRM Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Pipeline View */}
          <TabsContent value="pipeline" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerCount}</div>
                  <p className="text-xs text-muted-foreground">Active customers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prospects</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{prospectCount}</div>
                  <p className="text-xs text-muted-foreground">In negotiation</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leadCount}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Stages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Leads</CardTitle>
                  <CardDescription>New potential customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contacts.filter(c => c.status === 'lead').map(contact => (
                    <div key={contact.id} className="p-2 border rounded">
                      <div className="font-medium text-sm">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">${contact.value.toLocaleString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Prospects</CardTitle>
                  <CardDescription>In negotiation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contacts.filter(c => c.status === 'prospect').map(contact => (
                    <div key={contact.id} className="p-2 border rounded">
                      <div className="font-medium text-sm">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">${contact.value.toLocaleString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Customers</CardTitle>
                  <CardDescription>Active customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contacts.filter(c => c.status === 'customer').map(contact => (
                    <div key={contact.id} className="p-2 border rounded">
                      <div className="font-medium text-sm">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">${contact.value.toLocaleString()}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts View */}
          <TabsContent value="contacts" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>

            {/* Contacts List */}
            <div className="space-y-2">
              {filteredContacts.map(contact => (
                <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{contact.company}</div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{contact.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{contact.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={getStatusColor(contact.status)}>
                          {contact.status}
                        </Badge>
                        <div className="text-sm font-medium mt-1">
                          ${contact.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last contact: {contact.lastContact}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics View */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Advanced analytics and reporting features coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

















