import { Platform } from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import { permissionsService } from './permissions';

export interface CalendarLeave {
    id?: string;
    title: string;
    date: string; // ISO date string
    time: string; // HH:MM format
    location?: string;
    reason?: string;
    notes?: string;
    enableReminder?: boolean;
}

class CalendarService {
    /**
     * Add leave to calendar
     * Web: Downloads ICS file
     * Native: Adds event to device calendar
     */
    async addToCalendar(leave: CalendarLeave): Promise<boolean> {
        // Check calendar permission first
        const permission = await permissionsService.checkCalendarPermission();
        if (permission !== 'granted') {
            return false;
        }

        if (Platform.OS === 'web') {
            console.warn('Calendar service is not supported on web. Use AddToCalendarButton component.');
            return false;
        } else {
            return this.addToCalendarNative(leave);
        }
    }

    /**
     * Native implementation - Add to device calendar
     */
    private async addToCalendarNative(leave: CalendarLeave): Promise<boolean> {
        try {
            // Parse date and time
            const startDate = this.parseDateTime(leave.date, leave.time);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

            const eventConfig: any = {
                title: leave.title,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                location: leave.location || '',
                notes: this.buildNotes(leave),
            };

            // Add reminder if enabled
            if (leave.enableReminder) {
                eventConfig.alarms = [{
                    date: -60, // 60 minutes before (negative value for minutes before)
                }];
            }

            // Create the event
            const eventId = await RNCalendarEvents.saveEvent(leave.title, eventConfig);

            return !!eventId;
        } catch (error) {
            console.error('Error adding to native calendar:', error);
            return false;
        }
    }

    /**
     * Generate ICS file content
     */
    private generateICS(leave: CalendarLeave): string {
        const startDate = this.parseDateTime(leave.date, leave.time);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

        // Format dates for ICS (YYYYMMDDTHHmmssZ)
        const formatICSDate = (date: Date): string => {
            const pad = (n: number) => n.toString().padStart(2, '0');
            return date.getUTCFullYear() +
                pad(date.getUTCMonth() + 1) +
                pad(date.getUTCDate()) +
                'T' +
                pad(date.getUTCHours()) +
                pad(date.getUTCMinutes()) +
                pad(date.getUTCSeconds()) +
                'Z';
        };

        const now = new Date();
        const uid = `leave-${leave.id || Date.now()}@rhmanagement.app`;

        let ics = 'BEGIN:VCALENDAR\r\n';
        ics += 'VERSION:2.0\r\n';
        ics += 'PRODID:-//RH Management//EN\r\n';
        ics += 'CALSCALE:GREGORIAN\r\n';
        ics += 'METHOD:PUBLISH\r\n';
        ics += 'BEGIN:VEVENT\r\n';
        ics += `UID:${uid}\r\n`;
        ics += `DTSTAMP:${formatICSDate(now)}\r\n`;
        ics += `DTSTART:${formatICSDate(startDate)}\r\n`;
        ics += `DTEND:${formatICSDate(endDate)}\r\n`;
        ics += `SUMMARY:${this.escapeICS(leave.title)}\r\n`;

        if (leave.location) {
            ics += `LOCATION:${this.escapeICS(leave.location)}\r\n`;
        }

        const notes = this.buildNotes(leave);
        if (notes) {
            ics += `DESCRIPTION:${this.escapeICS(notes)}\r\n`;
        }

        ics += 'STATUS:CONFIRMED\r\n';

        // Add reminder if enabled
        if (leave.enableReminder) {
            ics += 'BEGIN:VALARM\r\n';
            ics += 'ACTION:DISPLAY\r\n';
            ics += 'DESCRIPTION:Leave Reminder\r\n';
            ics += 'TRIGGER:-PT1H\r\n'; // 1 hour before
            ics += 'END:VALARM\r\n';
        }

        ics += 'END:VEVENT\r\n';
        ics += 'END:VCALENDAR\r\n';

        return ics;
    }

    /**
     * Parse date and time strings into Date object
     */
    private parseDateTime(dateStr: string, timeStr: string): Date {
        // dateStr format: YYYY-MM-DD
        // timeStr format: HH:MM
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);

        return new Date(year, month - 1, day, hours, minutes);
    }

    /**
     * Build notes/description from leave details
     */
    private buildNotes(leave: CalendarLeave): string {
        let notes = '';

        if (leave.reason) {
            notes += `Reason: ${leave.reason}\n`;
        }

        if (leave.notes) {
            notes += leave.notes;
        }

        return notes.trim();
    }

    /**
     * Escape special characters for ICS format
     */
    private escapeICS(text: string): string {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n');
    }
}

export const calendarService = new CalendarService();
