import { medicationsDb } from '../database/medicationsDb';
import { appointmentsDb } from '../database/appointmentsDb';
import { prescriptionsDb } from '../database/prescriptionsDb';

export interface AnalyticsData {
    totalMedications: number;
    upcomingAppointments: number;
    expiringPrescriptions: number;
    medicationAdherence: number; // Percentage
    weeklyMedications: { day: string; count: number }[];
}

export const analyticsService = {
    // Get overall analytics
    getAnalytics: async (): Promise<AnalyticsData> => {
        try {
            const [medications, appointments, prescriptions] = await Promise.all([
                medicationsDb.getAll(),
                appointmentsDb.getUpcoming(),
                prescriptionsDb.getExpiringSoon(),
            ]);

            // Calculate weekly medication distribution
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weeklyMedications = daysOfWeek.map((day, index) => ({
                day,
                count: medications.length, // Simplified: all meds every day
            }));

            // Calculate adherence from real history
            const history = await medicationsDb.getAllHistory();
            const totalHistory = history.length;
            const takenCount = history.filter((h) => h.status === 'taken').length;
            const medicationAdherence = totalHistory > 0 ? Math.round((takenCount / totalHistory) * 100) : 0;

            return {
                totalMedications: medications.length,
                upcomingAppointments: appointments.length,
                expiringPrescriptions: prescriptions.length,
                medicationAdherence,
                weeklyMedications,
            };
        } catch (error) {
            console.error('Error getting analytics:', error);
            return {
                totalMedications: 0,
                upcomingAppointments: 0,
                expiringPrescriptions: 0,
                medicationAdherence: 0,
                weeklyMedications: [],
            };
        }
    },

    // Get medication adherence for last 7 days
    getMedicationAdherence: async (): Promise<{ labels: string[]; data: number[] }> => {
        const history = await medicationsDb.getAllHistory();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dateStr: date.toISOString().split('T')[0],
            };
        });

        const adherenceData = last7Days.map((day) => {
            const dayHistory = history.filter((h) => h.takenAt.startsWith(day.dateStr));
            if (dayHistory.length === 0) return 0;
            const taken = dayHistory.filter((h) => h.status === 'taken').length;
            return Math.round((taken / dayHistory.length) * 100);
        });

        return {
            labels: last7Days.map((d) => d.label),
            data: adherenceData,
        };
    },

    // Get upcoming appointments count by week
    getUpcomingAppointmentsChart: async (): Promise<{ labels: string[]; data: number[] }> => {
        const appointments = await appointmentsDb.getUpcoming();

        // Group by next 4 weeks
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const data = [0, 0, 0, 0];

        appointments.forEach((appt) => {
            const apptDate = new Date(appt.dateTime);
            const now = new Date();
            const diffDays = Math.floor((apptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const weekIndex = Math.floor(diffDays / 7);

            if (weekIndex >= 0 && weekIndex < 4) {
                data[weekIndex]++;
            }
        });

        return { labels: weeks, data };
    },
};
