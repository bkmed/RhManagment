import { Linking, Platform } from 'react-native';
import { notificationService } from './notificationService';

export const emailService = {
  /**
   * Opens the default mail app with a pre-filled draft.
   * On simulators/emulators, this might not work if no mail app is configured.
   */
  sendEmail: async (to: string, subject: string, body: string) => {
    const url = `mailto:${to}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn('Cannot handle mailto URL');
        if (Platform.OS !== 'web') {
          notificationService.showAlert(
            'Error',
            'No email client found. Please configure an email account on your device.',
          );
        }
      }
    } catch (err) {
      console.error('An error occurred', err);
    }
  },

  /**
   * Generates a leave request email draft for HR.
   */
  sendLeaveRequestEmail: async (
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason: string,
  ) => {
    const subject = `Leave Request: ${employeeName} - ${leaveType}`;
    const body = `Dear HR,

I would like to request leave.

Details:
- Employee: ${employeeName}
- Type: ${leaveType}
- Start Date: ${startDate}
- End Date: ${endDate}
- Reason: ${reason}

Please review my request in the RH Management App.

Best regards,
${employeeName}`;

    // Replace with actual HR email if available, or leave blank for user to fill
    await emailService.sendEmail('', subject, body);
  },

  /**
   * Generates a status update email draft for the employee.
   */
  sendStatusUpdateEmail: async (
    employeeEmail: string,
    status: 'approved' | 'declined',
    leaveTitle: string,
    managerName: string = 'Management',
  ) => {
    const subject = `Leave Request Update: ${leaveTitle}`;
    const body = `Dear Employee,

Your leave request "${leaveTitle}" has been ${status.toUpperCase()}.

Processed by: ${managerName}

Best regards,
RH Management Team`;

    await emailService.sendEmail(employeeEmail, subject, body);
  },
};
