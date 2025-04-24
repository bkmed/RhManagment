import { collection, query, where, getDocs, getFirestore } from "firebase/firestore"
import { getLeaveRequestsForCalendar } from "../../leave/src/leave-service"

// Initialize Firestore
const db = getFirestore()

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  type: "leave" | "holiday" | "meeting" | "other"
  employeeId?: string
  employeeName?: string
  color?: string
  description?: string
}

export interface Holiday {
  id: string
  name: string
  date: string
  isRecurring: boolean
}

// Get leave requests as calendar events
export const getLeaveEventsForCalendar = async (start: Date, end: Date): Promise<CalendarEvent[]> => {
  try {
    const leaveRequests = await getLeaveRequestsForCalendar(start, end)

    // Convert leave requests to calendar events
    return Promise.all(
      leaveRequests.map(async (leave) => {
        // Get employee name from employee ID
        let employeeName = "Employee"
        try {
          const employeesRef = collection(db, "employees")
          const q = query(employeesRef, where("userId", "==", leave.employeeId))
          const querySnapshot = await getDocs(q)

          if (!querySnapshot.empty) {
            const employeeData = querySnapshot.docs[0].data()
            employeeName = `${employeeData.firstName} ${employeeData.lastName}`
          }
        } catch (error) {
          console.error("Error getting employee name:", error)
        }

        // Map leave type to color
        const colorMap: Record<string, string> = {
          vacation: "#4299e1", // blue
          sick: "#f56565", // red
          personal: "#9f7aea", // purple
          other: "#a0aec0", // gray
        }

        return {
          id: leave.id,
          title: `${employeeName} - ${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave`,
          start: new Date(leave.startDate),
          end: new Date(leave.endDate),
          allDay: true,
          type: "leave",
          employeeId: leave.employeeId,
          employeeName,
          color: colorMap[leave.type] || "#a0aec0",
          description: leave.reason,
        }
      }),
    )
  } catch (error) {
    console.error("Error getting leave events for calendar:", error)
    throw error
  }
}

// Get holidays
export const getHolidays = async (year: number): Promise<Holiday[]> => {
  try {
    const holidaysRef = collection(db, "holidays")
    const q = query(holidaysRef)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs
      .map((doc) => doc.data() as Holiday)
      .filter((holiday) => {
        // Include recurring holidays or holidays for the specific year
        const holidayDate = new Date(holiday.date)
        return holiday.isRecurring || holidayDate.getFullYear() === year
      })
  } catch (error) {
    console.error("Error getting holidays:", error)
    throw error
  }
}

// Get holiday events for calendar
export const getHolidayEventsForCalendar = async (start: Date, end: Date): Promise<CalendarEvent[]> => {
  try {
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    // Get holidays for all years in the range
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

    const holidaysPromises = years.map((year) => getHolidays(year))
    const holidaysByYear = await Promise.all(holidaysPromises)
    const holidays = holidaysByYear.flat()

    return holidays
      .map((holiday) => {
        const holidayDate = new Date(holiday.date)

        // For recurring holidays, adjust the year to the current year in the range
        if (holiday.isRecurring) {
          // Create events for each year in the range
          return years
            .map((year) => {
              const adjustedDate = new Date(holidayDate)
              adjustedDate.setFullYear(year)

              // Skip if outside the range
              if (adjustedDate < start || adjustedDate > end) {
                return null
              }

              const endDate = new Date(adjustedDate)
              endDate.setDate(endDate.getDate() + 1)

              return {
                id: `${holiday.id}-${year}`,
                title: holiday.name,
                start: adjustedDate,
                end: endDate,
                allDay: true,
                type: "holiday",
                color: "#ed8936", // orange
              }
            })
            .filter(Boolean) as CalendarEvent[]
        } else {
          // Skip if outside the range
          if (holidayDate < start || holidayDate > end) {
            return null
          }

          const endDate = new Date(holidayDate)
          endDate.setDate(endDate.getDate() + 1)

          return {
            id: holiday.id,
            title: holiday.name,
            start: holidayDate,
            end: endDate,
            allDay: true,
            type: "holiday",
            color: "#ed8936", // orange
          }
        }
      })
      .filter(Boolean)
      .flat() as CalendarEvent[]
  } catch (error) {
    console.error("Error getting holiday events for calendar:", error)
    throw error
  }
}

// Get all events for calendar
export const getAllEventsForCalendar = async (start: Date, end: Date): Promise<CalendarEvent[]> => {
  try {
    const [leaveEvents, holidayEvents] = await Promise.all([
      getLeaveEventsForCalendar(start, end),
      getHolidayEventsForCalendar(start, end),
    ])

    return [...leaveEvents, ...holidayEvents]
  } catch (error) {
    console.error("Error getting all events for calendar:", error)
    throw error
  }
}
