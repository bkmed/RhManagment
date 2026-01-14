import { Illness, Leave } from '../database/schema';

export interface AbsenceStatus {
  isAbsent: boolean;
  type?: 'sick' | 'leave';
  startDate?: string;
  endDate?: string;
  reason?: string;
}

/**
 * Check if a user is currently absent (on sick leave or regular leave)
 */
export const getUserAbsenceStatus = (
  employeeId: string,
  illnesses: Illness[],
  leaves: Leave[],
): AbsenceStatus => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Check for active illness
  const activeIllness = illnesses.find(illness => {
    if (illness.employeeId !== employeeId) return false;

    const startDate = new Date(illness.issueDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = illness.expiryDate ? new Date(illness.expiryDate) : null;
    if (endDate) endDate.setHours(23, 59, 59, 999);

    return startDate <= now && (!endDate || endDate >= now);
  });

  if (activeIllness) {
    return {
      isAbsent: true,
      type: 'sick',
      startDate: activeIllness.issueDate,
      endDate: activeIllness.expiryDate,
      reason: activeIllness.notes,
    };
  }

  // Check for active leave
  const activeLeave = leaves.find(leave => {
    if (leave.employeeId !== employeeId) return false;
    if (leave.status !== 'approved') return false;

    const startDate = leave.startDate && new Date(leave.startDate);
    if (startDate) startDate.setHours(0, 0, 0, 0);

    const endDate = leave.endDate && new Date(leave.endDate);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    return startDate && startDate <= now && endDate && endDate >= now;
  });

  if (activeLeave) {
    return {
      isAbsent: true,
      type: 'leave',
      startDate: activeLeave.startDate,
      endDate: activeLeave.endDate,
      reason: activeLeave.title,
    };
  }

  return { isAbsent: false };
};

/**
 * Format the absence period for display
 */
export const formatAbsencePeriod = (
  startDate: string,
  endDate?: string,
): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  if (!end) {
    return `Since ${formatDate(start)}`;
  }

  const now = new Date();
  if (end < now) {
    return `Until ${formatDate(end)}`;
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
};
