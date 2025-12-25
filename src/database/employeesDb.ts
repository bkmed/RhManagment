import { store } from '../store';
import {
  addEmployee as addEmployeeAction,
  updateEmployee as updateEmployeeAction,
  deleteEmployee as deleteEmployeeAction,
  selectAllEmployees,
  selectEmployeeById,
} from '../store/slices/employeesSlice';
import { Employee } from './schema';

export const employeesDb = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    const employees = selectAllEmployees(store.getState());
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  },

  // Get employee by ID
  getById: async (id: number): Promise<Employee | null> => {
    return selectEmployeeById(id)(store.getState()) || null;
  },

  // Add new employee
  add: async (
    employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const now = new Date().toISOString();
    const id = Date.now();

    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addEmployeeAction(newEmployee));
    return id;
  },

  // Update employee
  update: async (id: number, updates: Partial<Employee>): Promise<void> => {
    const existing = selectEmployeeById(id)(store.getState());

    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateEmployeeAction(updated));
    }
  },

  // Delete employee
  delete: async (id: number): Promise<void> => {
    store.dispatch(deleteEmployeeAction(id));
  },
};
