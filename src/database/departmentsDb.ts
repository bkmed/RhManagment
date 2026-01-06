import { store } from '../store';
import {
  setDepartments,
  addDepartment as addDepartmentAction,
  updateDepartment as updateDepartmentAction,
  deleteDepartment as deleteDepartmentAction,
  selectAllDepartments,
} from '../store/slices/departmentsSlice';
import { Department } from './schema';

const DEFAULT_DEPARTMENTS: string[] = [
  'Finance',
  'Human Resources',
  'Information Technology',
  'Legal',
  'Marketing',
  'Operations',
  'Research & Development',
  'Sales',
];

export const departmentsDb = {
  // Initialize with default departments if empty
  init: async () => {
    const existing = selectAllDepartments(store.getState());
    if (existing.length === 0) {
      const now = new Date().toISOString();
      const initial = DEFAULT_DEPARTMENTS.map((name, index) => ({
        id: index + 1,
        name,
        createdAt: now,
        updatedAt: now,
      }));
      store.dispatch(setDepartments(initial));
    }
  },

  getAll: async (): Promise<Department[]> => {
    return selectAllDepartments(store.getState());
  },

  getByCompany: async (companyId: number): Promise<Department[]> => {
    const all = selectAllDepartments(store.getState());
    return all.filter(d => !d.companyId || d.companyId === companyId);
  },

  add: async (name: string, companyId?: number): Promise<number> => {
    const now = new Date().toISOString();
    const id = Date.now();
    const newDept: Department = {
      id,
      name,
      companyId,
      createdAt: now,
      updatedAt: now,
    };
    store.dispatch(addDepartmentAction(newDept));
    return id;
  },

  update: async (
    id: number,
    name: string,
    companyId?: number,
  ): Promise<void> => {
    const existing = selectAllDepartments(store.getState()).find(
      d => d.id === id,
    );
    if (existing) {
      store.dispatch(
        updateDepartmentAction({
          ...existing,
          name,
          companyId,
          updatedAt: new Date().toISOString(),
        }),
      );
    }
  },

  delete: async (id: number): Promise<void> => {
    store.dispatch(deleteDepartmentAction(id));
  },
};
