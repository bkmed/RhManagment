import { storageService } from '../services/storage';
import { Claim } from './schema';

const CLAIMS_KEY = 'claims';

// Mock Data
const MOCK_CLAIMS: Claim[] = [
    {
        id: 1,
        employeeId: 1, // Alice
        type: 'material',
        description: 'Laptop screen value incorrect',
        isUrgent: true,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date().toISOString(),
    },
    {
        id: 2,
        employeeId: 2, // Bob
        type: 'account',
        description: 'Password reset for email',
        isUrgent: false,
        status: 'processed',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        updatedAt: new Date().toISOString(),
    },
    {
        id: 3,
        employeeId: 1, // Alice
        type: 'other',
        description: 'Air conditioning too cold in office 302',
        isUrgent: false,
        status: 'rejected',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

const getAllClaims = (): Claim[] => {
    const json = storageService.getString(CLAIMS_KEY);
    if (!json) {
        // Seed if empty
        saveAllClaims(MOCK_CLAIMS);
        return MOCK_CLAIMS;
    }
    return JSON.parse(json);
};

const saveAllClaims = (items: Claim[]): void => {
    storageService.setString(CLAIMS_KEY, JSON.stringify(items));
};

export const claimsDb = {
    getAll: async (): Promise<Claim[]> => {
        return getAllClaims();
    },

    getByEmployeeId: async (employeeId: number): Promise<Claim[]> => {
        return getAllClaims().filter(c => c.employeeId === employeeId);
    },

    add: async (item: Omit<Claim, 'id'>): Promise<number> => {
        const items = getAllClaims();
        const id = Date.now();
        const newItem: Claim = { ...item, id };
        items.push(newItem);
        saveAllClaims(items);
        return id;
    },

    update: async (id: number, updates: Partial<Claim>): Promise<void> => {
        const items = getAllClaims();
        const index = items.findIndex(c => c.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            saveAllClaims(items);
        }
    },

    delete: async (id: number): Promise<void> => {
        const items = getAllClaims();
        const filtered = items.filter(c => c.id !== id);
        saveAllClaims(filtered);
    }
};
