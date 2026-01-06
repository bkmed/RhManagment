import { store } from '../store';
import {
  setLeaves,
  addLeave as addLeaveAction,
  updateLeave as updateLeaveAction,
  deleteLeave as deleteLeaveAction,
  selectAllLeaves,
  selectUpcomingLeaves,
  selectPendingLeaves,
} from '../store/slices/leavesSlice';
import { Leave } from './schema';

const MOCK_LEAVES: Leave[] = [
  {
    id: 1,
    title: 'Congés Annuel',
    employeeId: 10,
    employeeName: 'Ines B.',
    dateTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    reminderEnabled: true,
    status: 'pending',
    type: 'leave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Formation React',
    employeeId: 12,
    employeeName: 'Yassine C.',
    dateTime: new Date(Date.now() + 86400000 * 10).toISOString(),
    reminderEnabled: true,
    status: 'approved',
    type: 'leave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Déménagement',
    employeeId: 25,
    employeeName: 'Rania D.',
    dateTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    reminderEnabled: true,
    status: 'pending',
    type: 'leave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Rendez-vous Dentiste',
    employeeId: 40,
    employeeName: 'Hassen E.',
    dateTime: new Date(Date.now() + 3600000 * 3).toISOString(),
    reminderEnabled: true,
    status: 'pending',
    type: 'permission',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

if (selectAllLeaves(store.getState()).length === 0) {
  store.dispatch(setLeaves(MOCK_LEAVES));
}

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
  getByEmployeeId: async (employeeId: number): Promise<Leave[]> => {
    const leaves = selectAllLeaves(store.getState());
    return leaves
      .filter(a => a.employeeId === employeeId)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  },

  // Get leave by ID
  getById: async (id: number): Promise<Leave | null> => {
    const leaves = selectAllLeaves(store.getState());
    return leaves.find(a => a.id === id) || null;
  },

  // Add new leave
  add: async (
    leave: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const now = new Date().toISOString();
    const id = Date.now();

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
  update: async (id: number, updates: Partial<Leave>): Promise<void> => {
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
  delete: async (id: number): Promise<void> => {
    store.dispatch(deleteLeaveAction(id));
  },

  // Get pending leaves
  getPending: async (): Promise<Leave[]> => {
    return selectPendingLeaves(store.getState());
  },

  // Get approved leaves for an employee
  getApprovedByEmployeeId: async (employeeId: number): Promise<Leave[]> => {
    const leaves = selectAllLeaves(store.getState());
    return leaves.filter(
      l => l.employeeId === employeeId && l.status === 'approved',
    );
  },
};
