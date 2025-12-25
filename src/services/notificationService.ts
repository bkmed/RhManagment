import { Platform } from 'react-native';
import notifee, { TimestampTrigger, TriggerType, AndroidImportance, RepeatFrequency } from '@notifee/react-native';
import { Payroll } from '../database/schema';

export const notificationService = {
    // Initialize notifications
    initialize: async () => {
        if (Platform.OS === 'web') {
            console.warn('Notifications not available on web');
            return;
        }

        // Request permission (iOS)
        await notifee.requestPermission();

        // Create notification channel (Android)
        await notifee.createChannel({
            id: 'payroll',
            name: 'Payroll Reminders',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });

        await notifee.createChannel({
            id: 'leaves',
            name: 'Leave Reminders',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });
    },

    checkPermissions: async () => {
        if (Platform.OS === 'web') {
            try {
                // @ts-ignore - navigator.permissions might need polyfill types or specific env setup
                const nav = (window as any).navigator;
                if (nav && nav.permissions && nav.permissions.query) {
                    const status = await nav.permissions.query({ name: 'notifications' });
                    return status.state === 'granted';
                }
            } catch (error) {
                console.warn('Navigator permissions query failed for notifications:', error);
            }
            // Fallback to Notification API
            if (typeof window !== 'undefined' && 'Notification' in window) {
                return Notification.permission === 'granted';
            }
            return false;
        }
        const settings = await notifee.getNotificationSettings();
        return settings.authorizationStatus >= 1; // 1 = Authorized, 2 = Provisional
    },

    requestPermission: async () => {
        if (Platform.OS === 'web') {
            // Simulate granting permission for web UI flow
            return true;
        }
        const settings = await notifee.requestPermission();
        return settings.authorizationStatus >= 1;
    },

    // Schedule payroll reminders
    schedulePayrollReminders: async (payroll: Payroll) => {
        if (Platform.OS === 'web') return;
        if (!payroll.reminderEnabled || !payroll.id) return;

        // Cancel existing notifications for this payroll
        await notificationService.cancelPayrollReminders(payroll.id);

        try {
            const times = JSON.parse(payroll.times) as string[];
            const today = new Date();

            for (const time of times) {
                const [hour, minute] = time.split(':').map(Number);
                const notificationTime = new Date();
                notificationTime.setHours(hour, minute, 0, 0);

                // If the time has passed today, schedule for tomorrow
                if (notificationTime < today) {
                    notificationTime.setDate(notificationTime.getDate() + 1);
                }

                const trigger: TimestampTrigger = {
                    type: TriggerType.TIMESTAMP,
                    timestamp: notificationTime.getTime(),
                    repeatFrequency: payroll.frequency.toLowerCase().includes('daily')
                        ? RepeatFrequency.DAILY
                        : undefined,
                };

                await notifee.createTriggerNotification(
                    {
                        id: `pay-${payroll.id}-${time}`,
                        title: 'Payroll Reminder',
                        body: `Time to process payroll ${payroll.name} (${payroll.amount})`,
                        android: {
                            channelId: 'payroll',
                            pressAction: {
                                id: 'default',
                                launchActivity: 'default',
                            },
                            actions: [
                                {
                                    title: 'Mark as Paid',
                                    pressAction: {
                                        id: 'mark-paid',
                                    },
                                },
                                {
                                    title: 'Snooze',
                                    pressAction: {
                                        id: 'snooze',
                                    },
                                },
                            ],
                        },
                        data: {
                            type: 'payroll',
                            payrollId: payroll.id.toString(),
                            time,
                        },
                    },
                    trigger
                );
            }

            console.log(`Scheduled ${times.length} reminder(s) for ${payroll.name}`);
        } catch (error) {
            console.error('Error scheduling payroll reminders:', error);
        }
    },

    // Cancel payroll reminders
    cancelPayrollReminders: async (payrollId: number) => {
        if (Platform.OS === 'web') return;
        const notifications = await notifee.getTriggerNotifications();

        for (const notification of notifications) {
            if (notification.notification.id?.startsWith(`pay-${payrollId}-`)) {
                await notifee.cancelNotification(notification.notification.id);
            }
        }
    },

    // Schedule leave reminder
    scheduleLeaveReminder: async (
        leaveId: number,
        title: string,
        dateTime: string
    ) => {
        if (Platform.OS === 'web') return;
        const leaveDate = new Date(dateTime);

        // Schedule 1 hour before
        const reminderTime = new Date(leaveDate.getTime() - 60 * 60 * 1000);

        if (reminderTime < new Date()) {
            console.log('Leave time has passed, skipping reminder');
            return;
        }

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: reminderTime.getTime(),
        };

        await notifee.createTriggerNotification(
            {
                id: `leave-${leaveId}`,
                title: 'Upcoming Leave',
                body: `${title} in 1 hour`,
                android: {
                    channelId: 'leaves',
                    pressAction: {
                        id: 'default',
                        launchActivity: 'default',
                    },
                },
                data: {
                    type: 'leave',
                    leaveId: leaveId.toString(),
                },
            },
            trigger
        );
    },

    // Cancel leave reminder
    cancelLeaveReminder: async (leaveId: number) => {
        if (Platform.OS === 'web') return;
        await notifee.cancelNotification(`leave-${leaveId}`);
    },

    // Schedule illness expiry reminder
    scheduleIllnessExpiryReminder: async (
        illnessId: number,
        payrollName: string,
        expiryDate: string
    ) => {
        if (Platform.OS === 'web') return;
        const expiry = new Date(expiryDate);

        // Schedule 7 days before expiry
        const reminderTime = new Date(expiry.getTime() - 7 * 24 * 60 * 60 * 1000);

        // If 7 days before is in the past, try 1 day before
        if (reminderTime < new Date()) {
            reminderTime.setTime(expiry.getTime() - 24 * 60 * 60 * 1000);
        }

        if (reminderTime < new Date()) {
            console.log('Expiry reminder time has passed, skipping');
            return;
        }

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: reminderTime.getTime(),
        };

        await notifee.createTriggerNotification(
            {
                id: `ill-${illnessId}`,
                title: 'Illness Record Expiring Soon',
                body: `Illness record for ${payrollName} expires on ${expiry.toLocaleDateString()}`,
                android: {
                    channelId: 'payroll', // Reuse payroll channel? Or create 'illnesses' channel? Using payroll for now
                    pressAction: {
                        id: 'default',
                        launchActivity: 'default',
                    },
                },
                data: {
                    type: 'illness',
                    illnessId: illnessId.toString(), // Updated Key
                },
            },
            trigger
        );
    },

    // Cancel illness reminder
    cancelIllnessReminder: async (illnessId: number) => {
        if (Platform.OS === 'web') return;
        await notifee.cancelNotification(`ill-${illnessId}`);
    },

    // Handle notification press (called from App.tsx)
    handleNotificationPress: async (notificationId: string, data: any) => {
        console.log('Notification pressed:', notificationId, data);
        // This will be handled in App.tsx with navigation
    },
};
