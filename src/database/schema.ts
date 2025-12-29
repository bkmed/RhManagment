export type ClaimType = 'material' | 'account' | 'other';

export interface Claim {
  id?: number;
  employeeId: number;
  type: ClaimType;
  description: string;
  isUrgent: boolean;
  status: 'pending' | 'processed' | 'rejected';
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id?: number;
  name: string;
  amount: string;
  frequency: string; // e.g., "Daily", "Twice a day", "Weekly"
  times: string; // JSON string of times, e.g., ["08:00", "20:00"]
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional for ongoing payroll items
  notes?: string;
  reminderEnabled: boolean;
  isUrgent?: boolean;
  employeeId?: number;
  mealVouchers?: string;
  giftVouchers?: string;
  bonusAmount?: string;
  bonusType?: string; // '13th_month', 'performance', 'none'
  createdAt: string;
  updatedAt: string;
  department?: string; // Service
  location?: string;   // Local
  month?: string;      // e.g., "1" for January
  year?: string;       // e.g., "2024"
  hoursWorked?: number;
}

export interface PayrollHistory {
  id?: number;
  payrollId: number;
  paidAt: string; // ISO datetime string
  status: 'paid' | 'missed' | 'skipped';
  notes?: string;
}

export interface Leave {
  id?: number;
  title: string;
  employeeName?: string;
  employeeId?: number;
  location?: string; // Local
  dateTime: string; // ISO datetime string
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  notes?: string;
  reminderEnabled: boolean;
  status: 'pending' | 'approved' | 'declined';
  type: 'leave' | 'permission';
  createdAt: string;
  updatedAt: string;
  department?: string; // Service
}

export interface RemoteWork {
  id?: number;
  employeeId: number;
  date: string; // ISO date string (YYYY-MM-DD)
  status: 'remote' | 'office';
  createdAt: string;
  updatedAt: string;
}

export interface Illness {
  id?: number;
  payrollName: string;
  payrollIds?: string; // JSON string of number[] linking to Payroll.id
  employeeName?: string;
  employeeId?: number;
  issueDate: string;
  expiryDate?: string;
  photoUri?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  department?: string; // Service
  location?: string;   // Local
}

export interface IllnessHistory {
  id: number;
  illnessId: number;
  action: 'created' | 'updated' | 'refilled';
  date: string;
  notes?: string;
}

export interface Company {
  id: number;
  name: string;
  logo?: string;
  address?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  managerId?: number; // Employee ID of the manager
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id?: number;
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUri?: string;
  notes?: string;
  department?: string;
  role?: string;
  teamId?: number;
  companyId?: number;
  vacationDaysPerYear: number;
  remainingVacationDays: number;
  statePaidLeaves: number;
  country: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  hiringDate?: string;
}
