import { store } from '../store';
import {
    setCompanies,
    addCompany as addCompanyAction,
    updateCompany as updateCompanyAction,
    deleteCompany as deleteCompanyAction,
    selectAllCompanies,
    selectCompanyById,
} from '../store/slices/companiesSlice';
import { Company } from './schema';

const MOCK_COMPANIES: Company[] = [
    { id: 1, name: 'TechGlobe Solutions', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 2, name: 'EcoFlow Dynamics', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

if (selectAllCompanies(store.getState()).length === 0) {
    store.dispatch(setCompanies(MOCK_COMPANIES));
}

export const companiesDb = {
    // Get all companies
    getAll: async (): Promise<Company[]> => {
        const companies = selectAllCompanies(store.getState());
        return [...companies].sort((a, b) => a.name.localeCompare(b.name));
    },

    // Get company by ID
    getById: async (id: number): Promise<Company | null> => {
        return selectCompanyById(id)(store.getState()) || null;
    },

    // Add new company
    add: async (
        company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<number> => {
        const now = new Date().toISOString();
        const id = Date.now();

        const newCompany: Company = {
            ...company,
            id,
            createdAt: now,
            updatedAt: now,
        };

        store.dispatch(addCompanyAction(newCompany));
        return id;
    },

    // Update company
    update: async (id: number, updates: Partial<Company>): Promise<void> => {
        const existing = selectCompanyById(id)(store.getState());

        if (existing) {
            const updated = {
                ...existing,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            store.dispatch(updateCompanyAction(updated));
        }
    },

    // Delete company
    delete: async (id: number): Promise<void> => {
        store.dispatch(deleteCompanyAction(id));
    },
};
