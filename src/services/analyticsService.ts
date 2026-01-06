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
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);

            const [allPayroll, allLeaves, allIllnesses] = await Promise.all([
                payrollDb.getAll(),
                leavesDb.getUpcoming(),
                illnessesDb.getExpiringSoon(),
            ]);

            // Filter for current week
            const weeklyLeaves = allLeaves.filter(leave => {
                if (!leave.dateTime) return false;
                const d = new Date(leave.dateTime);
                return d >= now && d <= nextWeek;
            });

            const weeklyIllnesses = allIllnesses.filter(illness => {
                if (!illness.expiryDate) return false;
                const d = new Date(illness.expiryDate);
                return d >= now && d <= nextWeek;
            });

            // Count unique employees for upcoming leaves
            const uniqueEmployeesWithLeaves = new Set(weeklyLeaves.map(l => l.employeeId)).size;

            // Calculate weekly payroll distribution (last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString('en-US', { weekday: 'short' });
            });

            const weeklyPayroll = last7Days.map(day => ({
                day,
                count: allPayroll.filter(p => p.createdAt && new Date(p.createdAt).toLocaleDateString('en-US', { weekday: 'short' }) === day).length
            }));

            // Calculate adherence from real history
            const history = await payrollDb.getAllHistory();
            const totalHistory = history.length;
            const paidCount = history.filter((h) => h.status === 'paid').length;
            const payrollAdherence = totalHistory > 0 ? Math.round((paidCount / totalHistory) * 100) : 0;

            return {
                totalPayroll: allPayroll.length,
                upcomingLeaves: uniqueEmployeesWithLeaves,
                expiringIllness: weeklyIllnesses.length,
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
            const dayHistory = history.filter((h) => h.paidAt && h.paidAt.startsWith(day.dateStr));
            if (dayHistory.length === 0) return 0;
            const paid = dayHistory.filter((h) => h.status === 'paid').length;
            return Math.round((paid / dayHistory.length) * 100);
        });

        return {
            labels: last7Days.map((d) => d.label),
            data: adherenceData,
        };
    },

    // Get upcoming leaves count by unique employees per week
    getUpcomingLeavesChart: async (): Promise<{ labels: string[]; data: number[] }> => {
        const leaves = await leavesDb.getUpcoming();

        // Group by next 4 weeks
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const employeeSets = [new Set(), new Set(), new Set(), new Set()];

        leaves.forEach((leave) => {
            const leaveDate = new Date(leave.dateTime);
            const now = new Date();
            const diffDays = Math.floor((leaveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const weekIndex = Math.floor(diffDays / 7);

            if (weekIndex >= 0 && weekIndex < 4) {
                employeeSets[weekIndex].add(leave.employeeId);
            }
        });

        return { labels: weeks, data: employeeSets.map(set => set.size) };
    },
};
