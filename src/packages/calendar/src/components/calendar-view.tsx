"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Card } from "../../../core/src/components/ui/card"
import { Button } from "../../../core/src/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native"
import { getAllEventsForCalendar, type CalendarEvent } from "../calendar-service"
import type { AuthUser } from "../../../auth/src/auth-service"
import { hasPermission } from "../../../core/src/types/roles"
import { RequestLeaveModal } from "../../../leave/src/components/request-leave-modal"

interface CalendarViewProps {
  user: AuthUser
  onEventPress?: (event: CalendarEvent) => void
}

export const CalendarView = ({ user, onEventPress }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestType, setRequestType] = useState<"leave" | "authorization" | "illness">("leave")

  const canViewAllEvents = hasPermission(user.role, "canViewAllEmployees")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)

        // Calculate start and end dates based on view mode
        let start: Date, end: Date

        if (viewMode === "month") {
          start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        } else if (viewMode === "week") {
          const day = currentDate.getDay()
          start = new Date(currentDate)
          start.setDate(currentDate.getDate() - day)
          end = new Date(start)
          end.setDate(start.getDate() + 6)
        } else {
          // day view
          start = new Date(currentDate)
          end = new Date(currentDate)
        }

        const fetchedEvents = await getAllEventsForCalendar(start, end)

        // Filter events if user can't view all employees
        const filteredEvents = canViewAllEvents
          ? fetchedEvents
          : fetchedEvents.filter((event) => event.type === "holiday" || event.employeeId === user.uid)

        setEvents(filteredEvents)
      } catch (err: any) {
        setError(err.message || "Failed to load calendar events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentDate, viewMode, user.uid, canViewAllEvents])

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const renderMonthView = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startDate = new Date(monthStart)
    const endDate = new Date(monthEnd)

    // Adjust to start from Sunday or Monday
    const dayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - dayOfWeek)

    // Ensure we have 6 weeks (42 days) for consistency
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const currentDay = new Date(startDate)

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Render day headers
    const dayHeaders = (
      <View style={styles.weekRow}>
        {dayNames.map((day, index) => (
          <View key={`header-${index}`} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>
    )

    // Generate weeks
    const weeks = []
    while (currentDay <= endDate) {
      const week = []

      for (let i = 0; i < 7; i++) {
        const day = new Date(currentDay)
        const isCurrentMonth = day.getMonth() === currentDate.getMonth()
        const isToday = day.toDateString() === new Date().toDateString()

        // Find events for this day
        const dayEvents = events.filter((event) => {
          const eventDate = new Date(event.start)
          return eventDate.toDateString() === day.toDateString()
        })

        week.push(
          <TouchableOpacity
            key={`day-${day.toISOString()}`}
            style={[styles.day, !isCurrentMonth && styles.otherMonthDay, isToday && styles.today]}
            onPress={() => {
              setCurrentDate(day)
              setViewMode("day")
            }}
          >
            <Text style={[styles.dayNumber, !isCurrentMonth && styles.otherMonthDayText, isToday && styles.todayText]}>
              {day.getDate()}
            </Text>

            {dayEvents.slice(0, 3).map((event, index) => (
              <View
                key={`event-${event.id}-${index}`}
                style={[styles.eventDot, { backgroundColor: event.color || "#4299e1" }]}
              />
            ))}

            {dayEvents.length > 3 && <Text style={styles.moreEvents}>+{dayEvents.length - 3}</Text>}
          </TouchableOpacity>,
        )

        currentDay.setDate(currentDay.getDate() + 1)
      }

      weeks.push(
        <View key={`week-${weeks.length}`} style={styles.weekRow}>
          {week}
        </View>,
      )
    }

    return (
      <View style={styles.monthContainer}>
        {dayHeaders}
        {weeks}
      </View>
    )
  }

  const renderWeekView = () => {
    const weekStart = new Date(currentDate)
    const day = currentDate.getDay()
    weekStart.setDate(currentDate.getDate() - day)

    const days = []
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart)
      currentDay.setDate(weekStart.getDate() + i)
      const isToday = currentDay.toDateString() === new Date().toDateString()

      // Find events for this day
      const dayEvents = events.filter((event) => {
        const eventDate = new Date(event.start)
        return eventDate.toDateString() === currentDay.toDateString()
      })

      days.push(
        <View key={`day-${i}`} style={styles.weekViewDay}>
          <TouchableOpacity
            style={[styles.weekViewDayHeader, isToday && styles.today]}
            onPress={() => {
              setCurrentDate(currentDay)
              setViewMode("day")
            }}
          >
            <Text style={[styles.weekViewDayName, isToday && styles.todayText]}>{dayNames[i]}</Text>
            <Text style={[styles.weekViewDayNumber, isToday && styles.todayText]}>{currentDay.getDate()}</Text>
          </TouchableOpacity>

          <ScrollView style={styles.weekViewEvents}>
            {dayEvents.map((event, index) => (
              <TouchableOpacity
                key={`event-${event.id}-${index}`}
                style={[styles.eventItem, { backgroundColor: event.color || "#4299e1" }]}
                onPress={() => onEventPress && onEventPress(event)}
              >
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>,
      )
    }

    return (
      <ScrollView horizontal style={styles.weekViewContainer}>
        <View style={styles.weekViewContent}>{days}</View>
      </ScrollView>
    )
  }

  const renderRequestButtons = () => {
    return (
      <View style={styles.requestButtonsContainer}>
        <Button
          title="Request Leave"
          leftIcon={<Plus size={16} color="#fff" />}
          onPress={() => {
            setRequestType("leave")
            setShowRequestModal(true)
          }}
          style={styles.requestButton}
        />
        <Button
          title="Request Authorization"
          leftIcon={<Plus size={16} color="#fff" />}
          onPress={() => {
            setRequestType("authorization")
            setShowRequestModal(true)
          }}
          style={styles.requestButton}
        />
        <Button
          title="Report Illness"
          leftIcon={<Plus size={16} color="#fff" />}
          onPress={() => {
            setRequestType("illness")
            setShowRequestModal(true)
          }}
          style={styles.requestButton}
          variant="danger"
        />
      </View>
    )
  }

  const renderDayView = () => {
    // Find events for this day
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === currentDate.toDateString()
    })

    const formattedDate = currentDate.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return (
      <View style={styles.dayViewContainer}>
        <Text style={styles.dayViewDate}>{formattedDate}</Text>

        {renderRequestButtons()}

        {dayEvents.length === 0 ? (
          <View style={styles.noEvents}>
            <Text style={styles.noEventsText}>No events scheduled</Text>
          </View>
        ) : (
          <ScrollView style={styles.dayViewEvents}>
            {dayEvents.map((event, index) => (
              <TouchableOpacity
                key={`event-${event.id}`}
                style={[styles.dayViewEventItem, { borderLeftColor: event.color || "#4299e1" }]}
                onPress={() => onEventPress && onEventPress(event)}
              >
                <View style={styles.eventTimeContainer}>
                  <Text style={styles.eventTime}>
                    {event.allDay
                      ? "All day"
                      : `${event.start.getHours()}:${event.start.getMinutes().toString().padStart(2, "0")} - 
                       ${event.end.getHours()}:${event.end.getMinutes().toString().padStart(2, "0")}`}
                  </Text>
                </View>

                <View style={styles.eventDetailsContainer}>
                  <Text style={styles.dayViewEventTitle}>{event.title}</Text>
                  {event.description && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    )
  }

  const renderCalendarHeader = () => {
    let title = ""

    if (viewMode === "month") {
      title = currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    } else if (viewMode === "week") {
      const weekStart = new Date(currentDate)
      const day = currentDate.getDay()
      weekStart.setDate(currentDate.getDate() - day)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      title = `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
    } else {
      title = currentDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    }

    return (
      <View style={styles.calendarHeader}>
        <View style={styles.calendarNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <ChevronLeft size={24} color="#4a5568" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.todayButton} onPress={handleToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <ChevronRight size={24} color="#4a5568" />
          </TouchableOpacity>
        </View>

        <Text style={styles.calendarTitle}>{title}</Text>

        <View style={styles.viewModeButtons}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "month" && styles.activeViewMode]}
            onPress={() => setViewMode("month")}
          >
            <Text style={[styles.viewModeText, viewMode === "month" && styles.activeViewModeText]}>Month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "week" && styles.activeViewMode]}
            onPress={() => setViewMode("week")}
          >
            <Text style={[styles.viewModeText, viewMode === "week" && styles.activeViewModeText]}>Week</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === "day" && styles.activeViewMode]}
            onPress={() => setViewMode("day")}
          >
            <Text style={[styles.viewModeText, viewMode === "day" && styles.activeViewModeText]}>Day</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderEventLegend = () => {
    const legendItems = [
      { label: "Vacation", color: "#4299e1" },
      { label: "Sick Leave", color: "#f56565" },
      { label: "Personal Leave", color: "#9f7aea" },
      { label: "Holiday", color: "#ed8936" },
      { label: "Other", color: "#a0aec0" },
    ]

    return (
      <View style={styles.legendContainer}>
        {legendItems.map((item, index) => (
          <View key={`legend-${index}`} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading calendar...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Card style={styles.calendarCard}>
        {renderCalendarHeader()}

        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}

        {renderEventLegend()}
      </Card>

      <RequestLeaveModal
        isVisible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onRequestSubmitted={() => {
          // Refresh events after submitting a request
          const fetchEvents = async () => {
            try {
              setLoading(true)
              setError(null)

              let start: Date, end: Date

              if (viewMode === "month") {
                start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
              } else if (viewMode === "week") {
                const day = currentDate.getDay()
                start = new Date(currentDate)
                start.setDate(currentDate.getDate() - day)
                end = new Date(start)
                end.setDate(start.getDate() + 6)
              } else {
                start = new Date(currentDate)
                end = new Date(currentDate)
              }

              const fetchedEvents = await getAllEventsForCalendar(start, end)
              const filteredEvents = canViewAllEvents
                ? fetchedEvents
                : fetchedEvents.filter((event) => event.type === "holiday" || event.employeeId === user.uid)

              setEvents(filteredEvents)
            } catch (err: any) {
              setError(err.message || "Failed to load calendar events")
            } finally {
              setLoading(false)
            }
          }

          fetchEvents()
        }}
        employeeId={user.uid}
        date={currentDate}
        requestType={requestType}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  calendarCard: {
    padding: 16,
  },
  calendarHeader: {
    marginBottom: 16,
  },
  calendarNavigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  todayButtonText: {
    color: "#4a5568",
    fontWeight: "500",
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#2d3748",
  },
  viewModeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  activeViewMode: {
    backgroundColor: "#e2e8f0",
  },
  viewModeText: {
    color: "#718096",
  },
  activeViewModeText: {
    color: "#2d3748",
    fontWeight: "500",
  },
  monthContainer: {
    flex: 1,
  },
  weekRow: {
    flexDirection: "row",
    height: 80,
  },
  dayHeader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#f7fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#718096",
  },
  day: {
    flex: 1,
    padding: 4,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  otherMonthDay: {
    backgroundColor: "#f7fafc",
  },
  today: {
    backgroundColor: "#ebf8ff",
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    color: "#2d3748",
  },
  otherMonthDayText: {
    color: "#a0aec0",
  },
  todayText: {
    color: "#3182ce",
    fontWeight: "bold",
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginVertical: 1,
  },
  moreEvents: {
    fontSize: 10,
    color: "#718096",
  },
  weekViewContainer: {
    flex: 1,
  },
  weekViewContent: {
    flexDirection: "row",
    height: 500,
  },
  weekViewDay: {
    width: 150,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  weekViewDayHeader: {
    padding: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  weekViewDayName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#718096",
  },
  weekViewDayNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d3748",
  },
  weekViewEvents: {
    flex: 1,
  },
  eventItem: {
    padding: 4,
    marginVertical: 2,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  eventTitle: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  dayViewContainer: {
    flex: 1,
  },
  dayViewDate: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2d3748",
  },
  dayViewEvents: {
    flex: 1,
  },
  dayViewEventItem: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 4,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTimeContainer: {
    width: 80,
  },
  eventTime: {
    fontSize: 12,
    color: "#718096",
  },
  eventDetailsContainer: {
    flex: 1,
  },
  dayViewEventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    color: "#718096",
  },
  noEvents: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: "#a0aec0",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#718096",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 16,
    textAlign: "center",
  },
  requestButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  requestButton: {
    flex: 1,
    marginHorizontal: 4,
  },
})
