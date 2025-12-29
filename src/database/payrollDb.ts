import { store } from '../store';
import {
  addPayroll as addPayrollAction,
  updatePayroll as updatePayrollAction,
  deletePayroll as deletePayrollAction,
  selectAllPayroll,
} from '../store/slices/payrollSlice';
import { Payroll, PayrollHistory } from './schema';
import { storageService } from '../services/storage';

const PAYROLL_HISTORY_KEY = 'payroll_history';

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
    const items = selectAllPayroll(store.getState());
    return [...items];
  },

  // Get payroll item by ID
  getById: async (id: number): Promise<Payroll | null> => {
    const items = selectAllPayroll(store.getState());
    return items.find(m => m.id === id) || null;
  },

  // Add new payroll item
  add: async (
    item: Omit<Payroll, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const now = new Date().toISOString();
    const id = Date.now();

    const newItem: Payroll = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addPayrollAction(newItem));
    return id;
  },

  // Update payroll item
  update: async (id: number, updates: Partial<Payroll>): Promise<void> => {
    const items = selectAllPayroll(store.getState());
    const existing = items.find(m => m.id === id);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updatePayrollAction(updated));
    }
  },

  // Delete payroll item
  delete: async (id: number): Promise<void> => {
    store.dispatch(deletePayrollAction(id));

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
