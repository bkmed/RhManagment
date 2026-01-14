import { store } from '../store';
import {
  addLeave as addLeaveAction,
  updateLeave as updateLeaveAction,
  deleteLeave as deleteLeaveAction,
  selectAllLeaves,
  selectUpcomingLeaves,
  selectPendingLeaves,
} from '../store/slices/leavesSlice';
import { Leave } from './schema';

export const leavesDb = {
  // Get all leaves
  getAll: async (): Promise<Leave[]> => {
    const leaves = selectAllLeaves(store.getState());
    return [...leaves].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
  },

  // Get upcoming leaves
  getUpcoming: async (): Promise<Leave[]> => {
    return selectUpcomingLeaves(store.getState());
  },

  // Get leaves by employee ID
  getByEmployeeId: async (employeeId: string): Promise<Leave[]> => {
    const leaves = selectAllLeaves(store.getState());
    return leaves
      .filter(a => a.employeeId === employeeId)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  },

  // Get leave by ID
  getById: async (id: string): Promise<Leave | null> => {
    const leaves = selectAllLeaves(store.getState());
    return leaves.find(a => a.id === id) || null;
  },

  // Add new leave
  add: async (
    leave: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<string> => {
    const now = new Date().toISOString();
    const id = Date.now().toString();

    const newLeave: Leave = {
      ...leave,
      id,
      status: leave.status || 'pending',
      type: leave.type || 'leave',
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addLeaveAction(newLeave));
    return id;
  },

  // Update leave
  update: async (id: string, updates: Partial<Leave>): Promise<void> => {
    const leaves = selectAllLeaves(store.getState());
    const existing = leaves.find(a => a.id === id);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateLeaveAction(updated));
    }
  },

  // Delete leave
  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteLeaveAction(id));
  },

  // Get pending leaves
  getPending: async (): Promise<Leave[]> => {
    return selectPendingLeaves(store.getState());
  },

  // Get approved leaves for an employee
  getApprovedByEmployeeId: async (employeeId: string): Promise<Leave[]> => {
    const leaves = selectAllLeaves(store.getState());
    return leaves.filter(
      l => l.employeeId === employeeId && l.status === 'approved',
    );
  },
};
