"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { CalendarView, getEventColor } from "@/components/ui/calendar-view"
import { UniversalModal, eventModalFields } from "@/components/ui/universal-modal"
import { usePayloadCollection } from "@/hooks/usePayloadCollection"
import { TrendingUp, Eye, Edit, Trash2, Calendar, Clock, Users, MapPin, Star, CheckCircle, AlertTriangle, Play, List, CalendarDays, Plus } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

// Event type interface based on Payload schema
interface Event {
  id: string
  title: string
  description?: string
  eventType: 'conference' | 'workshop' | 'webinar' | 'meetup' | 'seminar' | 'networking' | 'training' | 'other'
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'postponed'
  scheduling: {
    startDateTime: string
    endDateTime: string
    timezone: string
    isAllDay: boolean
    isRecurring: boolean
    recurrencePattern?: string
  }
  location: {
    type: 'in_person' | 'virtual' | 'hybrid'
    venue?: string
    address?: {
      street?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }
    virtualDetails?: {
      platform: string
      meetingUrl?: string
      streamingUrl?: string
    }
    capacity?: number
  }
  attendeeStats: {
    expectedAttendees?: number
    actualAttendees?: number
    noShows?: number
    waitlistSize?: number
  }
  registration: {
    isRequired: boolean
    isPublic: boolean
    registrationDeadline?: string
    maxAttendees?: number
    waitlistEnabled: boolean
    approvalRequired: boolean
  }
  pricing: {
    isFree: boolean
    ticketPrice?: number
    currency?: string
    earlyBirdPrice?: number
    earlyBirdDeadline?: string
  }
  organizer: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  relatedProduct?: {
    id: string
    title: string
  }
  relatedOrders?: Array<{
    id: string
    orderNumber: string
  }>
  tags?: Array<{ tag: string }>
  isPublic: boolean
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

// Hook for events
const useEvents = (options?: any) => {
  return usePayloadCollection<Event>({
    collection: 'events',
    limit: 20,
    sort: 'scheduling.startDateTime',
    ...options,
  })
}

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    document.title = "Angel OS: Events Management"
  }, [])

  const { data: events, loading, error, refresh } = useEvents()

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowEditModal(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        if (response.ok) {
          refresh()
        }
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  const handleDuplicateEvent = async (event: Event) => {
    const duplicateData = {
      ...event,
      title: `${event.title} (Copy)`,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    }
    
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(duplicateData),
      })
      if (response.ok) {
        refresh()
      }
    } catch (error) {
      console.error('Failed to duplicate event:', error)
    }
  }

  const columns = [
    {
      accessorKey: 'title',
      header: 'Event',
      cell: (value: string, row: Event) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <Link href={`/dashboard/events/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            <p className="text-sm text-muted-foreground capitalize">
              {row.eventType.replace('_', ' ')}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'scheduling.startDateTime',
      header: 'Date & Time',
      cell: (value: string, row: Event) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {new Date(value).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {row.scheduling.isAllDay ? 'All Day' : (
                <>
                  {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(row.scheduling.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </span>
          </div>
        </div>
      ),
    },
    createColumn.badge('status', 'Status', {
      planned: { variant: 'secondary', label: 'Planned' },
      active: { variant: 'default', label: 'Live' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      postponed: { variant: 'secondary', label: 'Postponed' },
    }),
    createColumn.badge('eventType', 'Type', {
      conference: { variant: 'outline', label: 'Conference' },
      workshop: { variant: 'outline', label: 'Workshop' },
      webinar: { variant: 'outline', label: 'Webinar' },
      meetup: { variant: 'outline', label: 'Meetup' },
      seminar: { variant: 'outline', label: 'Seminar' },
      networking: { variant: 'outline', label: 'Networking' },
      training: { variant: 'outline', label: 'Training' },
      other: { variant: 'outline', label: 'Other' },
    }),
    {
      accessorKey: 'location.type',
      header: 'Location',
      cell: (value: string, row: Event) => {
        const icons = {
          in_person: MapPin,
          virtual: Play,
          hybrid: MapPin,
        }
        const Icon = icons[value as keyof typeof icons] || MapPin
        
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="text-sm capitalize">{value.replace('_', ' ')}</span>
              {row.location.venue && (
                <p className="text-xs text-muted-foreground">{row.location.venue}</p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'attendeeStats',
      header: 'Attendance',
      cell: (value: Event['attendeeStats']) => (
        <div className="text-center">
          <div className="text-sm font-medium">
            {value.actualAttendees || 0} / {value.expectedAttendees || 0}
          </div>
          <div className="text-xs text-muted-foreground">
            {value.waitlistSize ? `${value.waitlistSize} waiting` : 'No waitlist'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'pricing.isFree',
      header: 'Price',
      cell: (value: boolean, row: Event) => (
        <div className="text-sm">
          {value ? (
            <Badge variant="secondary">Free</Badge>
          ) : (
            <span className="font-medium">
              ${row.pricing.ticketPrice?.toFixed(2) || '0.00'}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'registration.isPublic',
      header: 'Visibility',
      cell: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Public' : 'Private'}
        </Badge>
      ),
    },
  ]

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (event: Event) => {
        window.location.href = `/dashboard/events/${event.id}`
      },
    },
    {
      label: 'Join Event',
      icon: <Play className="h-4 w-4" />,
      condition: (event: Event) => 
        Boolean(event.location.type === 'virtual' && 
        event.location.virtualDetails?.meetingUrl &&
        event.status === 'active'),
      onClick: (event: Event) => {
        if (event.location.virtualDetails?.meetingUrl) {
          window.open(event.location.virtualDetails.meetingUrl, '_blank')
        }
      },
    },
    {
      label: 'Edit Event',
      icon: <Edit className="h-4 w-4" />,
      onClick: (event: Event) => handleEditEvent(event),
    },
    {
      label: 'Duplicate Event',
      icon: <Plus className="h-4 w-4" />,
      onClick: (event: Event) => handleDuplicateEvent(event),
    },
    {
      label: 'Start Event',
      icon: <Play className="h-4 w-4" />,
      condition: (event: Event) => event.status === 'planned',
      onClick: (event: Event) => {
        // TODO: Implement start event functionality
        console.log('Start event:', event.id)
      },
    },
    {
      label: 'View Public Page',
      icon: <Eye className="h-4 w-4" />,
      condition: (event: Event) => Boolean(event.isPublic),
      onClick: (event: Event) => {
        window.open(`/events/${event.id}`, '_blank')
      },
    },
    {
      label: 'Delete Event',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (event: Event) => handleDeleteEvent(event.id),
      variant: 'destructive' as const,
    },
    {
      label: 'Manage Attendees',
      icon: <Users className="h-4 w-4" />,
      onClick: (event: Event) => {
        window.location.href = `/dashboard/events/${event.id}/attendees`
      },
    },
    {
      label: 'Edit Event',
      icon: <Edit className="h-4 w-4" />,
      onClick: (event: Event) => {
        window.location.href = `/dashboard/events/${event.id}/edit`
      },
    },
    {
      label: 'Cancel Event',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      condition: (event: Event) => !['completed', 'cancelled'].includes(event.status),
      onClick: (event: Event) => {
        if (confirm(`Are you sure you want to cancel "${event.title}"?`)) {
          // TODO: Implement cancel functionality
          console.log('Cancel event:', event.id)
        }
      },
    },
  ]

  // Calculate metrics
  const totalEvents = events.length
  const upcomingEvents = events.filter(e => {
    const now = new Date()
    return new Date(e.scheduling.startDateTime) > now && e.status !== 'cancelled'
  }).length
  const activeEvents = events.filter(e => e.status === 'active').length
  const completedEvents = events.filter(e => e.status === 'completed').length
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendeeStats.actualAttendees || 0), 0)
  const totalExpected = events.reduce((sum, event) => sum + (event.attendeeStats.expectedAttendees || 0), 0)

  // Convert events to calendar events
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    startDateTime: event.scheduling.startDateTime,
    endDateTime: event.scheduling.endDateTime,
    type: event.eventType,
    status: event.status,
    location: event.location,
    attendees: event.attendeeStats.expectedAttendees || 0,
    color: getEventColor(event.eventType, event.status)
  }))

  const handleEventClick = (event: any) => {
    window.location.href = `/dashboard/events/${event.id}`
  }

  const handleDateClick = (date: Date) => {
    // Pre-fill the modal with the selected date
    setShowCreateModal(true)
    // TODO: Pre-fill startDateTime with selected date
  }

  const handleCreateEvent = async (data: any) => {
    console.log('Creating event:', data)
    // TODO: Submit to API
    // await createEvent(data)
    refresh()
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Manage your events and track attendance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="mr-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                All events
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Future events
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Events</CardTitle>
              <Play className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEvents}</div>
              <div className="flex items-center text-xs text-red-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Currently active
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendees}</div>
              <div className="flex items-center text-xs text-purple-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                {totalExpected > 0 ? `${((totalAttendees / totalExpected) * 100).toFixed(1)}% attendance` : 'No data'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">New Event</h3>
                  <p className="text-sm text-muted-foreground">Create event</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Virtual Event</h3>
                  <p className="text-sm text-muted-foreground">Online event</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Attendee Reports</h3>
                  <p className="text-sm text-muted-foreground">View analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Event Templates</h3>
                  <p className="text-sm text-muted-foreground">Quick setup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* View Content */}
      {viewMode === 'list' ? (
        <DataTable
          data={events}
          columns={columns}
          actions={actions}
          loading={loading}
          error={error || undefined}
          onRefresh={refresh}
          searchPlaceholder="Search events..."
          addButton={{
            label: "Create Event",
            href: "/dashboard/events/add"
          }}
          exportButton={true}
          className="mt-6"
        />
      ) : (
        <CalendarView
          events={calendarEvents}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          className="mt-6"
        />
      )}

      {/* Create Event Modal */}
      <UniversalModal
        title="Create New Event"
        description="Plan and organize a new event"
        fields={eventModalFields}
        onSubmit={handleCreateEvent}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        submitLabel="Create Event"
        size="lg"
      />

      <UniversalModal
        title="Edit Event"
        description="Update event details and settings"
        fields={eventModalFields}
        onSubmit={async (data) => {
          if (selectedEvent) {
            try {
              const response = await fetch(`/api/events/${selectedEvent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
              })
              if (response.ok) {
                refresh()
                setShowEditModal(false)
                setSelectedEvent(null)
              }
            } catch (error) {
              console.error('Failed to update event:', error)
            }
          }
        }}
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open)
          if (!open) setSelectedEvent(null)
        }}
        submitLabel="Update Event"
        size="lg"
        initialData={selectedEvent || undefined}
      />
    </div>
  )
}
