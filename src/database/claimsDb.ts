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
    employeeId: 8,
    employeeName: 'John Smith',
    companyId: 1,
    teamId: 1,
    type: 'material',
    description: 'Écran de rechange pour le bureau 10',
    isUrgent: true,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    employeeId: 15,
    employeeName: 'Sarah Doe',
    companyId: 1,
    teamId: 2,
    type: 'account',
    description: 'Accès VPN expiré',
    isUrgent: false,
    status: 'processed',
    processedByName: 'Demo HR',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    employeeId: 22,
    employeeName: 'Mohamed Ben Ali',
    companyId: 2,
    teamId: 5,
    type: 'other',
    description: 'Problème de chauffage zone B',
    isUrgent: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    employeeId: 30,
    employeeName: 'Fatima Dubois',
    companyId: 1,
    teamId: 4,
    type: 'material',
    description: 'Chaise de bureau cassée',
    isUrgent: false,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    employeeId: 49,
    employeeName: 'Lucas Martin',
    companyId: 2,
    teamId: 7,
    type: 'other',
    description: 'Demande de nouveaux produits de nettoyage',
    isUrgent: true,
    status: 'pending',
    createdAt: new Date(Date.now()).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

if (
  selectAllClaims(store.getState()).length === 0 ||
  selectAllClaims(store.getState()).length < 5
) {
  store.dispatch(setClaims(MOCK_CLAIMS));
}

export const claimsDb = {
  getAll: async (): Promise<Claim[]> => {
    const items = selectAllClaims(store.getState());
    return [...items];
  },

  getByEmployeeId: async (employeeId: number): Promise<Claim[]> => {
    return selectAllClaims(store.getState()).filter(
      c => c.employeeId === employeeId,
    );
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
        updatedAt: new Date().toISOString(),
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
