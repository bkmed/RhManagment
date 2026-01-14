import { store } from '../store';
import {
  addClaim as addClaimAction,
  updateClaim as updateClaimAction,
  deleteClaim as deleteClaimAction,
  selectAllClaims,
} from '../store/slices/claimsSlice';
import { Claim } from './schema';

export const claimsDb = {
  getAll: async (): Promise<Claim[]> => {
    const items = selectAllClaims(store.getState());
    return [...items];
  },

  getByEmployeeId: async (employeeId: string): Promise<Claim[]> => {
    return selectAllClaims(store.getState()).filter(
      c => c.employeeId === employeeId,
    );
  },

  add: async (item: Omit<Claim, 'id'>): Promise<string> => {
    const id = Date.now().toString();
    const newItem: Claim = { ...item, id };
    store.dispatch(addClaimAction(newItem));
    return id;
  },

  update: async (id: string, updates: Partial<Claim>): Promise<void> => {
    const items = selectAllClaims(store.getState());
    const existing = items.find(c => c.id === id);

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateClaimAction(updated));
    }
  },

  getById: async (id: string): Promise<Claim | null> => {
    const items = selectAllClaims(store.getState());
    return items.find(c => c.id === id) || null;
  },

  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteClaimAction(id));
  },
};
