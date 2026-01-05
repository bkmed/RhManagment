import { store } from '../store';
import {
    setServices,
    addService as addServiceAction,
    updateService as updateServiceAction,
    deleteService as deleteServiceAction,
    selectAllServices,
} from '../store/slices/servicesSlice';
import { Service } from './schema';

const DEFAULT_SERVICES: string[] = [
    'Informatique',
    'Ressources Humaines',
    'Marketing',
    'Finance',
    'Ventes',
    'Logistique',
    'Direction',
];

export const servicesDb = {
    // Initialize with default services if empty
    init: async () => {
        const existing = selectAllServices(store.getState());
        if (existing.length === 0) {
            const now = new Date().toISOString();
            const initial = DEFAULT_SERVICES.map((name, index) => ({
                id: index + 1,
                name,
                createdAt: now,
                updatedAt: now,
            }));
            store.dispatch(setServices(initial));
        }
    },

    getAll: async (): Promise<Service[]> => {
        return selectAllServices(store.getState());
    },

    getByCompany: async (companyId: number): Promise<Service[]> => {
        const all = selectAllServices(store.getState());
        return all.filter(s => !s.companyId || s.companyId === companyId);
    },

    add: async (name: string, companyId?: number): Promise<number> => {
        const now = new Date().toISOString();
        const id = Date.now();
        const newService: Service = {
            id,
            name,
            companyId,
            createdAt: now,
            updatedAt: now,
        };
        store.dispatch(addServiceAction(newService));
        return id;
    },

    update: async (id: number, name: string, companyId?: number): Promise<void> => {
        const existing = selectAllServices(store.getState()).find(s => s.id === id);
        if (existing) {
            store.dispatch(updateServiceAction({
                ...existing,
                name,
                companyId,
                updatedAt: new Date().toISOString(),
            }));
        }
    },

    delete: async (id: number): Promise<void> => {
        store.dispatch(deleteServiceAction(id));
    },
};
