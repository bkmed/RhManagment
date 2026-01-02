import { Department } from './schema';

// Mocking the DB for now since I cannot easily create the Redux slice in one step without verifying structure.
let MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: 'HR', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 2, name: 'Engineering', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const departmentsDb = {
    getAll: async (): Promise<Department[]> => {
        return Promise.resolve([...MOCK_DEPARTMENTS]);
    },

    add: async (name: string): Promise<number> => {
        const newDept: Department = {
            id: Date.now(),
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        MOCK_DEPARTMENTS.push(newDept);
        return Promise.resolve(newDept.id);
    },

    update: async (id: number, name: string): Promise<void> => {
        const index = MOCK_DEPARTMENTS.findIndex(d => d.id === id);
        if (index !== -1) {
            MOCK_DEPARTMENTS[index] = { ...MOCK_DEPARTMENTS[index], name, updatedAt: new Date().toISOString() };
        }
        return Promise.resolve();
    },

    delete: async (id: number): Promise<void> => {
        MOCK_DEPARTMENTS = MOCK_DEPARTMENTS.filter(d => d.id !== id);
        return Promise.resolve();
    }
};
