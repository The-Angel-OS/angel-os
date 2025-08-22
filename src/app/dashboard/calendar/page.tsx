"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from "lucide-react"
import { AppointmentMessageService, type AppointmentEvent } from "@/utilities/AppointmentMessageService"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  color: string
  category: string
}

const eventCategories = [
  { value: "meeting", label: "Meeting", color: "bg-blue-500" },
  { value: "personal", label: "Personal", color: "bg-green-500" },
  { value: "work", label: "Work", color: "bg-purple-500" },
  { value: "deadline", label: "Deadline", color: "bg-red-500" },
  { value: "conference", label: "Conference", color: "bg-orange-500" },
  { value: "social", label: "Social", color: "bg-pink-500" },
]

const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Marketing Strategy Meeting",
    description: "Discuss marketing plans for Q2",
    startDate: "2025-03-03",
    endDate: "2025-03-03",
    startTime: "09:00",
    endTime: "10:00",
    color: "bg-purple-500",
    category: "meeting",
  },
  {
    id: "2",
    title: "Team Meeting",
    description: "Weekly team sync",
    startDate: "2025-03-04",
    endDate: "2025-03-04",
    startTime: "10:00",
    endTime: "11:00",
    color: "bg-orange-500",
    category: "meeting",
  },
  {
    id: "3",
    title: "Product Brainstorming",
    description: "Brainstorm new product ideas",
    startDate: "2025-03-05",
    endDate: "2025-03-05",
    startTime: "11:00",
    endTime: "12:00",
    color: "bg-green-500",
    category: "work",
  },
  {
    id: "4",
    title: "Lunch with Investor",
    description: "Meeting with potential investor",
    startDate: "2025-03-06",
    endDate: "2025-03-06",
    startTime: "12:30",
    endTime: "14:00",
    color: "bg-red-500",
    category: "meeting",
  },
  {
    id: "5",
    title: "Client Presentation",
    description: "Present project proposal to client",
    startDate: "2025-03-07",
    endDate: "2025-03-07",
    startTime: "14:00",
    endTime: "15:00",
    color: "bg-purple-500",
    category: "work",
  },
  {
    id: "6",
    title: "Project Deadline",
    description: "Final submission deadline",
    startDate: "2025-03-08",
    endDate: "2025-03-08",
    startTime: "16:00",
    endTime: "17:00",
    color: "bg-red-500",
    category: "deadline",
  },
  {
    id: "7",
    title: "Tech Conference",
    description: "Annual tech conference",
    startDate: "2025-03-09",
    endDate: "2025-03-09",
    startTime: "09:00",
    endTime: "17:00",
    color: "bg-green-500",
    category: "conference",
  },
  {
    id: "8",
    title: "Quarterly Sales Review",
    description: "Review quarterly sales performance",
    startDate: "2025-03-10",
    endDate: "2025-03-10",
    startTime: "10:30",
    endTime: "12:00",
    color: "bg-orange-500",
    category: "meeting",
  },
  {
    id: "9",
    title: "Team Building Activity",
    description: "Team building and networking",
    startDate: "2025-03-11",
    endDate: "2025-03-11",
    startTime: "14:00",
    endTime: "17:00",
    color: "bg-pink-500",
    category: "social",
  },
  {
    id: "10",
    title: "Networking Event",
    description: "Industry networking event",
    startDate: "2025-03-12",
    endDate: "2025-03-12",
    startTime: "18:00",
    endTime: "20:00",
    color: "bg-blue-500",
    category: "social",
  },
]

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)) // August 2025
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "bg-blue-500",
    category: "meeting",
  })

  // Load events from message system on component mount
  useEffect(() => {
    loadEventsFromMessages()
  }, [])

  const loadEventsFromMessages = async () => {
    try {
      setIsLoading(true)
      // Load appointments from the Appointments collection
      const appointments = await AppointmentMessageService.loadAppointments(1, 1) // Space ID 1, Tenant ID 1
      
      // Convert appointments to calendar events for display
      const appointmentEvents = appointments.map(appointment => 
        AppointmentMessageService.appointmentToCalendarEvent(appointment)
      )
      
      setEvents([...initialEvents, ...appointmentEvents]) // Combine demo events with real appointments
    } catch (error) {
      console.error('Failed to load calendar events:', error)
      setEvents(initialEvents) // Fallback to demo events
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return (events || []).filter((event) => event.startDate === dateStr)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleSaveEvent = async () => {
    if (newEvent.title && newEvent.startDate) {
      setIsLoading(true)
      try {
        const eventToSave: CalendarEvent = {
          id: isEditMode ? selectedEvent!.id : Date.now().toString(),
          title: newEvent.title!,
          description: newEvent.description || "",
          startDate: newEvent.startDate!,
          endDate: newEvent.endDate || newEvent.startDate!,
          startTime: newEvent.startTime!,
          endTime: newEvent.endTime!,
          color: newEvent.color!,
          category: newEvent.category!,
        }

        if (isEditMode) {
          // Update existing appointment
          const appointmentData = {
            title: eventToSave.title,
            description: eventToSave.description,
            startTime: new Date(`${eventToSave.startDate}T${eventToSave.startTime}`).toISOString(),
            endTime: new Date(`${eventToSave.endDate}T${eventToSave.endTime}`).toISOString(),
            appointmentType: eventToSave.category,
            status: 'scheduled'
          }
          await AppointmentMessageService.updateAppointment(selectedEvent!.id, appointmentData)
          setEvents((prev) => prev.map((e) => (e.id === selectedEvent!.id ? eventToSave : e)))
        } else {
          // Create new appointment
          const appointmentData = {
            title: eventToSave.title,
            description: eventToSave.description,
            startTime: new Date(`${eventToSave.startDate}T${eventToSave.startTime}`).toISOString(),
            endTime: new Date(`${eventToSave.endDate}T${eventToSave.endTime}`).toISOString(),
            appointmentType: eventToSave.category,
            meetingType: 'video_call',
            status: 'scheduled',
            organizer: 1, // Current user ID - should come from auth
            space: 1, // Current space ID
            tenant: 1 // Current tenant ID
          }
          const appointmentId = await AppointmentMessageService.saveAppointment(appointmentData)
          eventToSave.id = appointmentId
          setEvents((prev) => [...prev, eventToSave])
        }

        setIsEventDialogOpen(false)
        setIsEditMode(false)
        setNewEvent({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
          startTime: "09:00",
          endTime: "10:00",
          color: "bg-blue-500",
          category: "meeting",
        })
      } catch (error) {
        console.error('Failed to save event:', error)
        alert('Failed to save event. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setNewEvent(event)
    setIsEditMode(true)
    setIsEventDialogOpen(true)
  }

  const upcomingEvents = (events || [])
    .filter((event) => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 15)

  const days = getDaysInMonth(currentDate)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditMode(false)
                setNewEvent({
                  title: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                  startTime: "09:00",
                  endTime: "10:00",
                  color: "bg-blue-500",
                  category: "meeting",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Event" : "Add New Event"}</DialogTitle>
              <DialogDescription>
                {isEditMode ? "Update event details" : "Create a new calendar event"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ""}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newEvent.startDate || ""}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newEvent.endDate || newEvent.startDate || ""}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime || "09:00"}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime || "10:00"}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newEvent.category || "meeting"}
                  onValueChange={(value) => {
                    const category = eventCategories.find((c) => c.value === value)
                    setNewEvent((prev) => ({
                      ...prev,
                      category: value,
                      color: category?.color || "bg-blue-500",
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent}>{isEditMode ? "Update" : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upcoming Events Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
                <Badge variant="secondary" className="ml-auto">
                  {upcomingEvents.length} Events
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 p-4 pt-0">
                  {upcomingEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleEditEvent(event)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full ${event.color} mt-1 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            {event.startTime}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {eventCategories.find((c) => c.value === event.category)?.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day, index) => (
                  <div key={`day-name-${index}-${day}`} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-24 p-1" />
                  }

                  const dayEvents = getEventsForDate(day)
                  const isToday =
                    new Date().toDateString() ===
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

                  return (
                    <motion.div
                      key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
                      whileHover={{ scale: 1.02 }}
                      className={`h-24 p-1 border rounded-lg cursor-pointer transition-colors ${
                        isToday ? "bg-primary/10 border-primary/20" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{day}</div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map((event) => (
                            <motion.div
                              key={event.id}
                              whileHover={{ scale: 1.05 }}
                              className={`text-xs p-1 rounded text-white truncate ${event.color} cursor-pointer`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditEvent(event)
                              }}
                            >
                              {event.title}
                            </motion.div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
