import { storageService } from '../services/storage';
import { Payroll, PayrollHistory } from './schema';

const PAYROLL_KEY = 'payroll';
const PAYROLL_HISTORY_KEY = 'payroll_history';

// Helper functions
const getAllPayrollItems = (): Payroll[] => {
  const json = storageService.getString(PAYROLL_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllPayrollItems = (items: Payroll[]): void => {
  storageService.setString(PAYROLL_KEY, JSON.stringify(items));
};

const getAllHistory = (): PayrollHistory[] => {
  const json = storageService.getString(PAYROLL_HISTORY_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllHistory = (history: PayrollHistory[]): void => {
  storageService.setString(PAYROLL_HISTORY_KEY, JSON.stringify(history));
};

export const payrollDb = {
  // Get all payroll items
  getAll: async (): Promise<Payroll[]> => {
    return getAllPayrollItems();
  },

  // Get payroll item by ID
  getById: async (id: number): Promise<Payroll | null> => {
    const items = getAllPayrollItems();
    return items.find(m => m.id === id) || null;
  },

  // Add new payroll item
  add: async (
    item: Omit<Payroll, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const items = getAllPayrollItems();
    const now = new Date().toISOString();
    const id = Date.now(); // Use timestamp as ID

    const newItem: Payroll = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    items.push(newItem);
    saveAllPayrollItems(items);

    return id;
  },

  // Update payroll item
  update: async (id: number, updates: Partial<Payroll>): Promise<void> => {
    const items = getAllPayrollItems();
    const index = items.findIndex(m => m.id === id);

    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllPayrollItems(items);
    }
  },

  // Delete payroll item
  delete: async (id: number): Promise<void> => {
    const items = getAllPayrollItems();
    const filtered = items.filter(m => m.id !== id);
    saveAllPayrollItems(filtered);

    // Also delete associated history
    const history = getAllHistory();
    const filteredHistory = history.filter(h => h.payrollId !== id);
    saveAllHistory(filteredHistory);
  },

  // Get payroll history
  getHistory: async (payrollId: number): Promise<PayrollHistory[]> => {
    const history = getAllHistory();
    return history
      .filter(h => h.payrollId === payrollId)
      .sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
      );
  },

  // Add history entry
  addHistory: async (
    payrollId: number,
    status: 'paid' | 'missed' | 'skipped',
    notes?: string,
  ): Promise<void> => {
    const history = getAllHistory();
    const now = new Date().toISOString();
    const id = Date.now();

    const newEntry: PayrollHistory = {
      id,
      payrollId,
      paidAt: now,
      status,
      notes,
    };

    history.push(newEntry);
    saveAllHistory(history);
  },

  // Get all history (for analytics)
  getAllHistory: async (): Promise<PayrollHistory[]> => {
    return getAllHistory();
  },
};
