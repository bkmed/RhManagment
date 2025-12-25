import { storageService } from '../services/storage';
import { Leave } from './schema';

const LEAVES_KEY = 'leaves';

// Helper functions
const getAllLeaves = (): Leave[] => {
  const json = storageService.getString(LEAVES_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllLeaves = (leaves: Leave[]): void => {
  storageService.setString(LEAVES_KEY, JSON.stringify(leaves));
};

export const leavesDb = {
  // Get all leaves
  getAll: async (): Promise<Leave[]> => {
    const leaves = getAllLeaves();
    return leaves.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
  },

  // Get upcoming leaves
  getUpcoming: async (): Promise<Leave[]> => {
    const leaves = getAllLeaves();
    const now = new Date().toISOString();

    return leaves
      .filter(a => a.dateTime >= now)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  },

  // Get leaves by employee ID
  getByEmployeeId: async (employeeId: number): Promise<Leave[]> => {
    const leaves = getAllLeaves();
    return leaves
      .filter(a => a.employeeId === employeeId)
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  },

  // Get leave by ID
  getById: async (id: number): Promise<Leave | null> => {
    const leaves = getAllLeaves();
    return leaves.find(a => a.id === id) || null;
  },

  // Add new leave
  add: async (
    leave: Omit<Leave, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const leaves = getAllLeaves();
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

    leaves.push(newLeave);
    saveAllLeaves(leaves);

    return id;
  },

  // Update leave
  update: async (id: number, updates: Partial<Leave>): Promise<void> => {
    const leaves = getAllLeaves();
    const index = leaves.findIndex(a => a.id === id);

    if (index !== -1) {
      leaves[index] = {
        ...leaves[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllLeaves(leaves);
    }
  },

  // Delete leave
  delete: async (id: number): Promise<void> => {
    const leaves = getAllLeaves();
    const filtered = leaves.filter(a => a.id !== id);
    saveAllLeaves(filtered);
  },

  // Get pending leaves
  getPending: async (): Promise<Leave[]> => {
    const leaves = getAllLeaves();
    return leaves.filter(l => l.status === 'pending');
  },

  // Get approved leaves for an employee
  getApprovedByEmployeeId: async (employeeId: number): Promise<Leave[]> => {
    const leaves = getAllLeaves();
    return leaves.filter(l => l.employeeId === employeeId && l.status === 'approved');
  },
};
