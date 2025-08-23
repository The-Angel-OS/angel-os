"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, createColumn } from "@/components/ui/data-table"
import { CalendarView, getEventColor } from "@/components/ui/calendar-view"
import { UniversalModal, appointmentModalFields } from "@/components/ui/universal-modal"
import { usePayloadCollection } from "@/hooks/usePayloadCollection"
import { TrendingUp, Eye, Edit, Trash2, Calendar, Clock, User, MapPin, Phone, Mail, CheckCircle, AlertTriangle, Video, List, CalendarDays, Plus } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Appointment type interface based on Payload schema
interface Appointment {
  id: string
  title: string
  description?: string
  appointmentType: 'consultation' | 'meeting' | 'call' | 'demo' | 'interview' | 'support' | 'other'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduling: {
    startDateTime: string
    endDateTime: string
    duration: number
    timezone: string
    isAllDay: boolean
    isRecurring: boolean
    recurrencePattern?: string
  }
  participants: {
    organizer: {
      id: string
      email: string
      firstName?: string
      lastName?: string
    }
    attendees?: Array<{
      id: string
      email: string
      firstName?: string
      lastName?: string
      status: 'pending' | 'accepted' | 'declined' | 'tentative'
    }>
    maxAttendees?: number
    requiresApproval: boolean
  }
  location: {
    type: 'in_person' | 'virtual' | 'phone' | 'hybrid'
    venue?: string
    address?: {
      street?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }
    virtualMeeting?: {
      platform: 'zoom' | 'teams' | 'meet' | 'webex' | 'other'
      meetingUrl?: string
      meetingId?: string
      passcode?: string
    }
    phoneNumber?: string
  }
  booking: {
    bookingSource: 'manual' | 'website' | 'api' | 'calendar_sync' | 'import'
    confirmationRequired: boolean
    reminderSettings: {
      enabled: boolean
      reminderTimes?: Array<number>
    }
    cancellationPolicy?: string
    reschedulePolicy?: string
  }
  customFields?: Array<{
    field: string
    value: string
  }>
  notes?: string
  tenant: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

// Hook for appointments
const useAppointments = (options?: any) => {
  return usePayloadCollection<Appointment>({
    collection: 'appointments',
    limit: 20,
    sort: 'scheduling.startDateTime',
    ...options,
  })
}

export default function AppointmentsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    document.title = "Angel OS: Appointments"
  }, [])

  const { data: appointments, loading, error, refresh } = useAppointments()

  const columns = [
    {
      accessorKey: 'title',
      header: 'Appointment',
      cell: (value: string, row: Appointment) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <Link href={`/dashboard/appointments/${row.id}`} className="font-medium hover:underline">
              {value}
            </Link>
            <p className="text-sm text-muted-foreground capitalize">
              {row.appointmentType.replace('_', ' ')}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'scheduling.startDateTime',
      header: 'Date & Time',
      cell: (value: string, row: Appointment) => (
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
              {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(row.scheduling.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'participants.organizer',
      header: 'Organizer',
      cell: (value: Appointment['participants']['organizer']) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {value.firstName?.[0] || value.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {value.firstName && value.lastName 
                ? `${value.firstName} ${value.lastName}` 
                : value.email}
            </p>
            <p className="text-xs text-muted-foreground">{value.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'participants.attendees',
      header: 'Attendees',
      cell: (value: Appointment['participants']['attendees']) => (
        <div className="flex items-center space-x-1">
          {value && value.length > 0 ? (
            <>
              <div className="flex -space-x-2">
                {value.slice(0, 3).map((attendee, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs">
                      {attendee.firstName?.[0] || attendee.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {value.length > 3 && (
                <span className="text-xs text-muted-foreground">+{value.length - 3}</span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">No attendees</span>
          )}
        </div>
      ),
    },
    createColumn.badge('status', 'Status', {
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      confirmed: { variant: 'default', label: 'Confirmed' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      no_show: { variant: 'destructive', label: 'No Show' },
      rescheduled: { variant: 'secondary', label: 'Rescheduled' },
    }),
    createColumn.badge('priority', 'Priority', {
      low: { variant: 'secondary', label: 'Low' },
      medium: { variant: 'outline', label: 'Medium' },
      high: { variant: 'default', label: 'High' },
      urgent: { variant: 'destructive', label: 'Urgent' },
    }),
    {
      accessorKey: 'location.type',
      header: 'Location',
      cell: (value: string, row: Appointment) => {
        const icons = {
          in_person: MapPin,
          virtual: Video,
          phone: Phone,
          hybrid: MapPin,
        }
        const Icon = icons[value as keyof typeof icons] || MapPin
        
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">{value.replace('_', ' ')}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'scheduling.duration',
      header: 'Duration',
      cell: (value: number) => (
        <span className="text-sm">{value} min</span>
      ),
    },
  ]

  const actions = [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: (appointment: Appointment) => {
        window.location.href = `/dashboard/appointments/${appointment.id}`
      },
    },
    {
      label: 'Join Meeting',
      icon: <Video className="h-4 w-4" />,
      condition: (appointment: Appointment) => 
        Boolean(appointment.location.type === 'virtual' && 
        appointment.location.virtualMeeting?.meetingUrl &&
        appointment.status === 'confirmed'),
      onClick: (appointment: Appointment) => {
        if (appointment.location.virtualMeeting?.meetingUrl) {
          window.open(appointment.location.virtualMeeting.meetingUrl, '_blank')
        }
      },
    },
    {
      label: 'Confirm Appointment',
      icon: <CheckCircle className="h-4 w-4" />,
      condition: (appointment: Appointment) => appointment.status === 'scheduled',
      onClick: (appointment: Appointment) => {
        // TODO: Implement confirmation functionality
        console.log('Confirm appointment:', appointment.id)
      },
    },
    {
      label: 'Reschedule',
      icon: <Calendar className="h-4 w-4" />,
      condition: (appointment: Appointment) => !['completed', 'cancelled'].includes(appointment.status),
      onClick: (appointment: Appointment) => {
        // TODO: Implement reschedule functionality
        console.log('Reschedule appointment:', appointment.id)
      },
    },
    {
      label: 'Edit Appointment',
      icon: <Edit className="h-4 w-4" />,
      onClick: (appointment: Appointment) => {
        window.location.href = `/dashboard/appointments/${appointment.id}/edit`
      },
    },
    {
      label: 'Cancel Appointment',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      condition: (appointment: Appointment) => !['completed', 'cancelled'].includes(appointment.status),
      onClick: (appointment: Appointment) => {
        if (confirm(`Are you sure you want to cancel "${appointment.title}"?`)) {
          // TODO: Implement cancel functionality
          console.log('Cancel appointment:', appointment.id)
        }
      },
    },
  ]

  // Calculate metrics
  const totalAppointments = appointments.length
  const todayAppointments = appointments.filter(a => {
    const today = new Date().toDateString()
    return new Date(a.scheduling.startDateTime).toDateString() === today
  }).length
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length
  const upcomingAppointments = appointments.filter(a => {
    const now = new Date()
    return new Date(a.scheduling.startDateTime) > now && !['cancelled', 'completed'].includes(a.status)
  }).length

  // Convert appointments to calendar events
  const calendarEvents = appointments.map(appointment => ({
    id: appointment.id,
    title: appointment.title,
    startDateTime: appointment.scheduling.startDateTime,
    endDateTime: appointment.scheduling.endDateTime,
    type: appointment.appointmentType,
    status: appointment.status,
    location: appointment.location,
    attendees: appointment.participants.attendees?.length || 0,
    color: getEventColor(appointment.appointmentType, appointment.status)
  }))

  const handleEventClick = (event: any) => {
    window.location.href = `/dashboard/appointments/${event.id}`
  }

  const handleDateClick = (date: Date) => {
    // Pre-fill the modal with the selected date
    setShowCreateModal(true)
    // TODO: Pre-fill startDateTime with selected date
  }

  const handleCreateAppointment = async (data: any) => {
    console.log('Creating appointment:', data)
    // TODO: Submit to API
    // await createAppointment(data)
    refresh()
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Manage your appointments and meetings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="mr-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
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
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                All appointments
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Today's schedule
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedAppointments}</div>
              <div className="flex items-center text-xs text-purple-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Ready to go
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments}</div>
              <div className="flex items-center text-xs text-orange-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                Future appointments
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">New Appointment</h3>
                  <p className="text-sm text-muted-foreground">Schedule meeting</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Video className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Virtual Meeting</h3>
                  <p className="text-sm text-muted-foreground">Online appointment</p>
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
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Client Meeting</h3>
                  <p className="text-sm text-muted-foreground">Schedule with client</p>
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
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">Calendar View</h3>
                  <p className="text-sm text-muted-foreground">View schedule</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* View Content */}
      {viewMode === 'list' ? (
        <DataTable
          data={appointments}
          columns={columns}
          actions={actions}
          loading={loading}
          error={error || undefined}
          onRefresh={refresh}
          searchPlaceholder="Search appointments..."
          addButton={{
            label: "Schedule Appointment",
            href: "/dashboard/appointments/add"
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

      {/* Create Appointment Modal */}
      <UniversalModal
        title="Schedule New Appointment"
        description="Create a new appointment or meeting"
        fields={appointmentModalFields}
        onSubmit={handleCreateAppointment}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        submitLabel="Schedule Appointment"
        size="lg"
      />
    </div>
  )
}
