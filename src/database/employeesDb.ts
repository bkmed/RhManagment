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
    let employees = selectAllEmployees(store.getState());

    // Seed 50 employees if empty (or legacy demo data)
    if (employees.length < 5) {
      const generated: Employee[] = [];
      const now = new Date().toISOString();

      // 1. Admin (ID: 1)
      generated.push({
        id: 1, name: 'Admin Principal', role: 'admin', email: 'admin@demo.com',
        hiringDate: '2020-01-01', companyId: 1, country: 'France',
        vacationDaysPerYear: 25, remainingVacationDays: 15, statePaidLeaves: 30,
        createdAt: now, updatedAt: now
      });

      // 2. RH (ID: 2)
      generated.push({
        id: 2, name: 'Responsable RH', role: 'rh', email: 'rh@demo.com',
        hiringDate: '2020-02-15', companyId: 1, country: 'France',
        vacationDaysPerYear: 25, remainingVacationDays: 20, statePaidLeaves: 30,
        createdAt: now, updatedAt: now
      });

      // 3. Chefs de groupe (IDs: 3-7)
      const managers = ['Marc Lavoine', 'Julie Gayet', 'Omar Sy', 'Marion Cotillard', 'Jean Dujardin'];
      managers.forEach((name, i) => {
        generated.push({
          id: 3 + i, name, role: 'chef_dequipe', email: `chef${i + 1}@demo.com`,
          hiringDate: '2021-03-10', companyId: (i % 2) + 1, teamId: i + 1, country: 'France',
          vacationDaysPerYear: 25, remainingVacationDays: 10, statePaidLeaves: 30,
          createdAt: now, updatedAt: now
        });
      });

      // 4. Cleaners (Femmes de ménage) (IDs: 49-50)
      for (let i = 49; i <= 50; i++) {
        generated.push({
          id: i, name: i === 49 ? 'Fatima Managi' : 'Aicha Agent', role: 'employee', email: `cleaner${i}@demo.com`,
          hiringDate: '2023-01-05', companyId: 2, teamId: 5, country: 'France',
          vacationDaysPerYear: 25, remainingVacationDays: 25, statePaidLeaves: 30,
          createdAt: now, updatedAt: now
        });
      }

      // 5. Regular Employees (IDs: 8-48)
      const names = [
        'Thomas', 'Ines', 'Yassine', 'Sarah', 'Lucas', 'Leila', 'Adam', 'Eva', 'Karim', 'Sofia',
        'Zied', 'Rim', 'Walid', 'Amira', 'Hedi', 'Ons', 'Mahdi', 'Sana', 'Fedi', 'Ghofrane',
        'Nabil', 'Rania', 'Sofiane', 'Dora', 'Anis', 'Jihene', 'Sami', 'Ines', 'Ali', 'May',
        'Omar', 'Salma', 'Kais', 'Amel', 'Bassem', 'Nour', 'Wissem', 'Aya', 'Hassen', 'Nada', 'Elyes'
      ];

      for (let i = 8; i <= 48; i++) {
        const nameIndex = (i - 8) % names.length;
        const teamId = ((i - 8) % 5) + 1; // Distribute across 5 teams
        generated.push({
          id: i, name: `${names[nameIndex]} ${String.fromCharCode(65 + (i % 26))}.`, role: 'employee',
          email: `${names[nameIndex].toLowerCase()}${i}@demo.com`,
          hiringDate: '2022-06-20', companyId: (teamId % 2) + 1, teamId, country: 'France',
          vacationDaysPerYear: 25, remainingVacationDays: 12, statePaidLeaves: 30,
          createdAt: now, updatedAt: now
        });
      }

      const { setEmployees } = require('../store/slices/employeesSlice');
      store.dispatch(setEmployees(generated));
      employees = generated;
    }

    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
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
