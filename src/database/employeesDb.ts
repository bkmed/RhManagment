import { storageService } from '../services/storage';
import { Employee } from './schema';

const EMPLOYEES_KEY = 'employees';

// Helper functions
const getAllEmployees = (): Employee[] => {
  const json = storageService.getString(EMPLOYEES_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllEmployees = (employees: Employee[]): void => {
  storageService.setString(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const employeesDb = {
  // Get all employees
  getAll: async (): Promise<Employee[]> => {
    const employees = getAllEmployees();
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  },

  // Get employee by ID
  getById: async (id: number): Promise<Employee | null> => {
    const employees = getAllEmployees();
    return employees.find(e => e.id === id) || null;
  },

  // Add new employee
  add: async (
    employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const employees = getAllEmployees();
    const now = new Date().toISOString();
    const id = Date.now();

    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: now,
      updatedAt: now,
    };

    employees.push(newEmployee);
    saveAllEmployees(employees);

    return id;
  },

  // Update employee
  update: async (id: number, updates: Partial<Employee>): Promise<void> => {
    const employees = getAllEmployees();
    const index = employees.findIndex(e => e.id === id);

    if (index !== -1) {
      employees[index] = {
        ...employees[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllEmployees(employees);
    }
  },

  // Delete employee
  delete: async (id: number): Promise<void> => {
    const employees = getAllEmployees();
    const filtered = employees.filter(e => e.id !== id);
    saveAllEmployees(filtered);
  },
};
