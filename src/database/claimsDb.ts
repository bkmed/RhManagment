import { store } from '../store';
import {
    setClaims,
    addClaim as addClaimAction,
    updateClaim as updateClaimAction,
    deleteClaim as deleteClaimAction,
    selectAllClaims,
} from '../store/slices/claimsSlice';
import { Claim } from './schema';

// Mock Data for initial seeding
const MOCK_CLAIMS: Claim[] = [
    {
        id: 1,
        employeeId: 1,
        type: 'material',
        description: 'Laptop screen value incorrect',
        isUrgent: true,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 2,
        employeeId: 2,
        type: 'account',
        description: 'Password reset for email',
        isUrgent: false,
        status: 'processed',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 3,
        employeeId: 1,
        type: 'other',
        description: 'Air conditioning too cold in office 302',
        isUrgent: false,
        status: 'rejected',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// Initialize with mock data if empty
if (selectAllClaims(store.getState()).length === 0) {
    store.dispatch(setClaims(MOCK_CLAIMS));
}

export const claimsDb = {
    getAll: async (): Promise<Claim[]> => {
        return selectAllClaims(store.getState());
    },

    getByEmployeeId: async (employeeId: number): Promise<Claim[]> => {
        return selectAllClaims(store.getState()).filter(c => c.employeeId === employeeId);
    },

    add: async (item: Omit<Claim, 'id'>): Promise<number> => {
        const id = Date.now();
        const newItem: Claim = { ...item, id };
        store.dispatch(addClaimAction(newItem));
        return id;
    },

    update: async (id: number, updates: Partial<Claim>): Promise<void> => {
        const items = selectAllClaims(store.getState());
        const existing = items.find(c => c.id === id);

        if (existing) {
            const updated = {
                ...existing,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            store.dispatch(updateClaimAction(updated));
        }
    },

    getById: async (id: number): Promise<Claim | null> => {
        const items = selectAllClaims(store.getState());
        return items.find(c => c.id === id) || null;
    },

    delete: async (id: number): Promise<void> => {
        store.dispatch(deleteClaimAction(id));
    },
};
