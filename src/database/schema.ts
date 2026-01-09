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
  companyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: number;
  code: string; // e.g. "EUR", "USD", "TND"
  symbol: string; // e.g. "€", "$", "DT"
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id?: number;
  name: string;
  amount: number;
  currency: string;
  frequency: string; // e.g., "Daily", "Twice a day", "Weekly"
  times: string; // JSON string of times, e.g., ["08:00", "20:00"]
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional for ongoing payroll items
  notes?: string;
  reminderEnabled: boolean;
  isUrgent?: boolean;
  employeeId?: number;
  mealVouchers?: number;
  giftVouchers?: number;
  bonusAmount?: number;
  bonusType?: string; // '13th_month', 'performance', 'none'
  createdAt: string;
  updatedAt: string;
  department?: string; // Service
  location?: string; // Local
  month?: string; // e.g., "1" for January
  year?: string; // e.g., "2024"
  hoursWorked?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  companyId?: number;
  teamId?: number;
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
  type: 'leave' | 'sick_leave' | 'carer_leave' | 'permission' | 'authorization';
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
  location?: string; // Local
  companyId?: number;
  teamId?: number;
}

export interface Invoice {
  id?: number;
  employeeId: number;
  employeeName?: string;
  amount: number;
  currency: string;
  description: string;
  photoUri?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  companyId?: number;
  teamId?: number;
  department?: string; // Service
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
  companyId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  id: number;
  companyId: number;
  maxPermissionHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  name: string;
  managerId?: number; // Employee ID of the manager
  department: string;
  service?: string;
  companyId?: number;
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
  backgroundPhotoUri?: string;
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
  alias?: string; // NEW: Short display name
  firstName?: string;
  lastName?: string;
  position?: string;
  phone?: string;
  email: string; // REQUIRED & UNIQUE
  address?: string;
  city?: string;
  country: string;
  age?: number; // DEPRECATED: Calculate from birthDate
  birthDate?: string; // NEW: ISO date (YYYY-MM-DD)
  jobTitle?: string; // NEW: Job title
  gender?: 'male' | 'female' | 'other';
  photoUri?: string;
  notes?: string;
  department?: string;
  role?: string; // 'admin' | 'rh' | 'chef_dequipe' | 'employee'
  teamId?: number; // CONSTRAINT: One team per employee
  companyId?: number; // CONSTRAINT: One company per employee
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
  tag?: string; // e.g. "company-name_1"

  createdAt: string;
  updatedAt: string;
  location?: string;
  backgroundPhotoUri?: string;
}

export interface Device {
  id?: number;
  name: string;
  type: string;
  serialNumber: string;
  status: 'available' | 'assigned' | 'maintenance';
  condition: 'working' | 'faulty';
  assignedTo?: string;
  assignedToId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'planned';
  createdAt: string;
  updatedAt: string;
}
