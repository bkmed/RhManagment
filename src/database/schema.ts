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
  createdAt: string;
  updatedAt: string;
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
  location?: string;
  dateTime: string; // ISO datetime string
  notes?: string;
  reminderEnabled: boolean;
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
}

export interface IllnessHistory {
  id: number;
  illnessId: number;
  action: 'created' | 'updated' | 'refilled';
  date: string;
  notes?: string;
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
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}
