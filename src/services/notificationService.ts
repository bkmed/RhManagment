import { Platform } from 'react-native';
import notifee, { TimestampTrigger, TriggerType, AndroidImportance, RepeatFrequency } from '@notifee/react-native';
import { Medication } from '../database/schema';

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
            id: 'medications',
            name: 'Medication Reminders',
            importance: AndroidImportance.HIGH,
            sound: 'default',
        });

        await notifee.createChannel({
            id: 'appointments',
            name: 'Appointment Reminders',
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

    // Schedule medication reminders
    scheduleMedicationReminders: async (medication: Medication) => {
        if (Platform.OS === 'web') return;
        if (!medication.reminderEnabled || !medication.id) return;

        // Cancel existing notifications for this medication
        await notificationService.cancelMedicationReminders(medication.id);

        try {
            const times = JSON.parse(medication.times) as string[];
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
                    repeatFrequency: medication.frequency.toLowerCase().includes('daily')
                        ? RepeatFrequency.DAILY
                        : undefined,
                };

                await notifee.createTriggerNotification(
                    {
                        id: `med-${medication.id}-${time}`,
                        title: 'Medication Reminder',
                        body: `Time to take ${medication.name} (${medication.dosage})`,
                        android: {
                            channelId: 'medications',
                            pressAction: {
                                id: 'default',
                                launchActivity: 'default',
                            },
                            actions: [
                                {
                                    title: 'Mark as Taken',
                                    pressAction: {
                                        id: 'mark-taken',
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
                            type: 'medication',
                            medicationId: medication.id.toString(),
                            time,
                        },
                    },
                    trigger
                );
            }

            console.log(`Scheduled ${times.length} reminder(s) for ${medication.name}`);
        } catch (error) {
            console.error('Error scheduling medication reminders:', error);
        }
    },

    // Cancel medication reminders
    cancelMedicationReminders: async (medicationId: number) => {
        if (Platform.OS === 'web') return;
        const notifications = await notifee.getTriggerNotifications();

        for (const notification of notifications) {
            if (notification.notification.id?.startsWith(`med-${medicationId}-`)) {
                await notifee.cancelNotification(notification.notification.id);
            }
        }
    },

    // Schedule appointment reminder
    scheduleAppointmentReminder: async (
        appointmentId: number,
        title: string,
        dateTime: string
    ) => {
        if (Platform.OS === 'web') return;
        const appointmentDate = new Date(dateTime);

        // Schedule 1 hour before
        const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);

        if (reminderTime < new Date()) {
            console.log('Appointment time has passed, skipping reminder');
            return;
        }

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: reminderTime.getTime(),
        };

        await notifee.createTriggerNotification(
            {
                id: `appt-${appointmentId}`,
                title: 'Upcoming Appointment',
                body: `${title} in 1 hour`,
                android: {
                    channelId: 'appointments',
                    pressAction: {
                        id: 'default',
                        launchActivity: 'default',
                    },
                },
                data: {
                    type: 'appointment',
                    appointmentId: appointmentId.toString(),
                },
            },
            trigger
        );
    },

    // Cancel appointment reminder
    cancelAppointmentReminder: async (appointmentId: number) => {
        if (Platform.OS === 'web') return;
        await notifee.cancelNotification(`appt-${appointmentId}`);
    },

    // Schedule prescription expiry reminder
    schedulePrescriptionExpiryReminder: async (
        prescriptionId: number,
        medicationName: string,
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
                id: `rx-${prescriptionId}`,
                title: 'Prescription Expiring Soon',
                body: `Your prescription for ${medicationName} expires on ${expiry.toLocaleDateString()}`,
                android: {
                    channelId: 'medications',
                    pressAction: {
                        id: 'default',
                        launchActivity: 'default',
                    },
                },
                data: {
                    type: 'prescription',
                    prescriptionId: prescriptionId.toString(),
                },
            },
            trigger
        );
    },

    // Cancel prescription reminder
    cancelPrescriptionReminder: async (prescriptionId: number) => {
        if (Platform.OS === 'web') return;
        await notifee.cancelNotification(`rx-${prescriptionId}`);
    },

    // Handle notification press (called from App.tsx)
    handleNotificationPress: async (notificationId: string, data: any) => {
        console.log('Notification pressed:', notificationId, data);
        // This will be handled in App.tsx with navigation
    },
};
