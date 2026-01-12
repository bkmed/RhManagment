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

    // Seed employees if empty
    if (employees.length < 5) {
      const generated: Employee[] = [];
      const now = new Date().toISOString();

      // 1. HRs (one per company)
      const hrs = [
        {
          id: '1',
          name: 'HR Admin TechGlobe',
          email: 'hr1@techglobe.com',
          companyId: '1',
        },
        {
          id: '2',
          name: 'HR Admin EcoFlow',
          email: 'hr2@ecoflow.com',
          companyId: '2',
        },
      ];

      hrs.forEach(hr => {
        generated.push({
          ...hr,
          role: 'rh',
          hiringDate: '2020-01-01',
          country: 'France',
          vacationDaysPerYear: 25,
          remainingVacationDays: 15,
          statePaidLeaves: 30,
          createdAt: now,
          updatedAt: now,
        });
      });

      // 2. Managers (3 per company, total 6)
      const managersData = [
        { id: '3', name: 'Marc Lavoine', companyId: '1', teamId: '1' },
        { id: '4', name: 'Julie Gayet', companyId: '1', teamId: '2' },
        { id: '5', name: 'Omar Sy', companyId: '1', teamId: '3' },
        { id: '6', name: 'Marion Cotillard', companyId: '2', teamId: '4' },
        { id: '7', name: 'Jean Dujardin', companyId: '2', teamId: '5' },
        { id: '8', name: 'Sophie Marceau', companyId: '2', teamId: '6' },
      ];

      managersData.forEach(m => {
        generated.push({
          ...m,
          role: 'manager',
          email: `${m.name.toLowerCase().replace(' ', '.')}@demo.com`,
          hiringDate: '2021-03-10',
          country: 'France',
          vacationDaysPerYear: 25,
          remainingVacationDays: 10,
          statePaidLeaves: 30,
          createdAt: now,
          updatedAt: now,
        });
      });

      // 3. Employees (10 per company, total 20)
      const names = [
        'Thomas',
        'Ines',
        'Yassine',
        'Sarah',
        'Lucas',
        'Leila',
        'Adam',
        'Eva',
        'Karim',
        'Sofia',
        'Zied',
        'Rim',
        'Walid',
        'Amira',
        'Hedi',
        'Ons',
        'Mahdi',
        'Sana',
        'Fedi',
        'Ghofrane',
      ];

      for (let i = 0; i < 20; i++) {
        const companyId = i < 10 ? '1' : '2';
        const teamOffset = i < 10 ? 0 : 3;
        const teamId = ((i % 3) + 1 + teamOffset).toString();
        const id = (9 + i).toString();

        generated.push({
          id,
          name: `${names[i]} ${String.fromCharCode(65 + (i % 26))}.`,
          role: 'employee',
          email: `${names[i].toLowerCase()}${id}@demo.com`,
          hiringDate: '2022-06-20',
          companyId,
          teamId,
          country: 'France',
          vacationDaysPerYear: 25,
          remainingVacationDays: 12,
          statePaidLeaves: 30,
          createdAt: now,
          updatedAt: now,
        });
      }

      const { setEmployees } = require('../store/slices/employeesSlice');
      store.dispatch(setEmployees(generated));
      employees = generated;
    }

    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  },

  // Get employee by ID
  getById: async (id: string): Promise<Employee | null> => {
    return selectEmployeeById(id)(store.getState()) || null;
  },

  // Add new employee
  add: async (
    employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
    companyName?: string,
  ): Promise<string> => {
    // Check for duplicate email
    const allEmployees = selectAllEmployees(store.getState());
    const emailExists = allEmployees.some(
      e => e.email.toLowerCase() === employee.email.toLowerCase(),
    );

    if (emailExists) {
      throw new Error('Email already exists');
    }

    const now = new Date().toISOString();
    const id = Date.now().toString();

    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: now,
      updatedAt: now,
    };

    store.dispatch(addEmployeeAction({ employee: newEmployee, companyName }));
    return id;
  },

  // Update employee
  update: async (id: string, updates: Partial<Employee>): Promise<void> => {
    const existing = selectEmployeeById(id)(store.getState());

    if (existing) {
      // Check for duplicate email if email is being updated
      if (
        updates.email &&
        updates.email.toLowerCase() !== existing.email.toLowerCase()
      ) {
        const allEmployees = selectAllEmployees(store.getState());
        const emailExists = allEmployees.some(
          e =>
            e.id !== id &&
            e.email.toLowerCase() === updates.email!.toLowerCase(),
        );
        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      const updated = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      store.dispatch(updateEmployeeAction(updated));
    }
  },

  // Delete employee
  delete: async (id: string): Promise<void> => {
    store.dispatch(deleteEmployeeAction(id));
  },
};
