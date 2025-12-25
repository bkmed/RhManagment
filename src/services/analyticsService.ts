import { payrollDb } from '../database/payrollDb';
import { leavesDb } from '../database/leavesDb';
import { illnessesDb } from '../database/illnessesDb';

export interface AnalyticsData {
    totalPayroll: number; // total items
    upcomingLeaves: number;
    expiringIllness: number;
    payrollAdherence: number; // Percentage
    weeklyPayroll: { day: string; count: number }[];
}

export const analyticsService = {
    // Get overall analytics
    getAnalytics: async (): Promise<AnalyticsData> => {
        try {
            const [payroll, leaves, illnesses] = await Promise.all([
                payrollDb.getAll(),
                leavesDb.getUpcoming(),
                illnessesDb.getExpiringSoon(),
            ]);

            // Calculate weekly payroll distribution
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weeklyPayroll = daysOfWeek.map((day, index) => ({
                day,
                count: payroll.length, // Simplified or adjust logic as needed
            }));

            // Calculate adherence from real history
            const history = await payrollDb.getAllHistory();
            const totalHistory = history.length;
            const paidCount = history.filter((h) => h.status === 'paid').length;
            const payrollAdherence = totalHistory > 0 ? Math.round((paidCount / totalHistory) * 100) : 0;

            return {
                totalPayroll: payroll.length,
                upcomingLeaves: leaves.length,
                expiringIllness: illnesses.length,
                payrollAdherence,
                weeklyPayroll,
            };
        } catch (error) {
            console.error('Error getting analytics:', error);
            return {
                totalPayroll: 0,
                upcomingLeaves: 0,
                expiringIllness: 0,
                payrollAdherence: 0,
                weeklyPayroll: [],
            };
        }
    },

    // Get payroll adherence for last 7 days
    getPayrollAdherence: async (): Promise<{ labels: string[]; data: number[] }> => {
        const history = await payrollDb.getAllHistory();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                dateStr: date.toISOString().split('T')[0],
            };
        });

        const adherenceData = last7Days.map((day) => {
            const dayHistory = history.filter((h) => h.paidAt.startsWith(day.dateStr));
            if (dayHistory.length === 0) return 0;
            const paid = dayHistory.filter((h) => h.status === 'paid').length;
            return Math.round((paid / dayHistory.length) * 100);
        });

        return {
            labels: last7Days.map((d) => d.label),
            data: adherenceData,
        };
    },

    // Get upcoming leaves count by week
    getUpcomingLeavesChart: async (): Promise<{ labels: string[]; data: number[] }> => {
        const leaves = await leavesDb.getUpcoming();

        // Group by next 4 weeks
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const data = [0, 0, 0, 0];

        leaves.forEach((leave) => {
            const leaveDate = new Date(leave.dateTime);
            const now = new Date();
            const diffDays = Math.floor((leaveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const weekIndex = Math.floor(diffDays / 7);

            if (weekIndex >= 0 && weekIndex < 4) {
                data[weekIndex]++;
            }
        });

        return { labels: weeks, data };
    },
};
