"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, Video } from "lucide-react"
import { motion } from "framer-motion"

interface CalendarEvent {
  id: string
  title: string
  startDateTime: string
  endDateTime: string
  type?: string
  status?: string
  location?: {
    type: string
    venue?: string
  }
  attendees?: number
  color?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  className?: string
}

export function CalendarView({ events, onEventClick, onDateClick, className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  // Get calendar grid for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const days = []
    const current = new Date(startDate)
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime)
      return eventDate.toDateString() === dateStr
    })
  }

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const calendarDays = getCalendarDays()
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{monthYear}</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDate(date)
                const isCurrentDay = isToday(date)
                const isCurrentMonthDay = isCurrentMonth(date)
                
                return (
                  <motion.div
                    key={index}
                    className={`
                      min-h-[100px] p-1 border rounded-lg cursor-pointer transition-colors
                      ${isCurrentDay ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                      ${!isCurrentMonthDay ? 'opacity-50' : ''}
                    `}
                    onClick={() => onDateClick?.(date)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <motion.div
                          key={event.id}
                          className={`
                            text-xs p-1 rounded cursor-pointer truncate
                            ${event.color || 'bg-blue-100 text-blue-800 hover:bg-blue-200'}
                          `}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(event)
                          }}
                          whileHover={{ scale: 1.05 }}
                          title={`${event.title} - ${formatTime(event.startDateTime)}`}
                        >
                          <div className="flex items-center space-x-1">
                            {event.location?.type === 'virtual' ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <MapPin className="h-3 w-3" />
                            )}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </motion.div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground p-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {view === 'week' && (
            <div className="text-center py-8 text-muted-foreground">
              Week view coming soon...
            </div>
          )}

          {view === 'day' && (
            <div className="text-center py-8 text-muted-foreground">
              Day view coming soon...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Event color helper
export const getEventColor = (type?: string, status?: string) => {
  if (status === 'cancelled') return 'bg-red-100 text-red-800'
  if (status === 'completed') return 'bg-green-100 text-green-800'
  
  switch (type) {
    case 'meeting':
    case 'consultation':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case 'conference':
    case 'workshop':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    case 'webinar':
    case 'virtual':
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    case 'networking':
    case 'meetup':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    default:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  }
}
