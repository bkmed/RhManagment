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
export interface Service {
  id: number;
  name: string;
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
  country?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  managerId?: number; // Employee ID of the manager
  department: string;
  service?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface SocialLinks {
  linkedin?: string;
  skype?: string;
  twitter?: string;
  website?: string;
}

export interface JobHistoryItem {
  company: string;
  role: string;
  period: string; // e.g. "2020 - 2022"
  description?: string;
}

export interface PerformanceReview {
  id?: number;
  employeeId: number;
  reviewerId: number;
  period: string; // e.g. "Q1 2024"
  score: number; // 1-5
  comments: string;
  date: string;
  createdAt: string;
}

export interface Goal {
  id?: number;
  employeeId: number;
  title: string;
  description: string;
  deadline: string;
  progress: number; // 0-100
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  date: string;
  targetDepartment?: string; // Optional: specific department or 'all'
  createdAt: string;
  category: 'news' | 'event' | 'alert';
  companyId?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string; // Could be 'all' for company-wide chat or common team ID
  createdAt: string;
}

export interface Employee {
  id?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  photoUri?: string;
  notes?: string;
  department?: string;
  role?: string; // 'admin' | 'rh' | 'manager' | 'employee'
  teamId?: number;
  companyId?: number;
  vacationDaysPerYear: number;
  remainingVacationDays: number;
  statePaidLeaves: number;
  hiringDate?: string;

  // Extended Details
  emergencyContact?: EmergencyContact;
  socialLinks?: SocialLinks;
  jobHistory?: JobHistoryItem[];
  careerGoals?: string;
  skills?: string[];

  createdAt: string;
  updatedAt: string;
  location?: string;
}
