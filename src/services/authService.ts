import { storageService } from './storage';

const AUTH_KEY = 'auth_session';
const USERS_KEY = 'auth_users';

export type UserRole = 'admin' | 'employee' | 'rh' | 'chef_dequipe';
export const ROLES: UserRole[] = ['admin', 'employee', 'rh', 'chef_dequipe'];

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    employeeId?: number;
    department?: string;
    photoUri?: string;
    vacationDaysPerYear?: number;
    remainingVacationDays?: number;
    statePaidLeaves?: number;
    country?: string;
}

export const authService = {
    // Login
    login: async (email: string, password: string): Promise<User> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

        // Demo accounts
        const demoAccounts: { [key: string]: { password: string; user: User } } = {
            'admin@demo.com': { password: 'admin123', user: { id: 'demo-admin', name: 'Demo Admin', email: 'admin@demo.com', role: 'admin', vacationDaysPerYear: 30, remainingVacationDays: 20, statePaidLeaves: 25, country: 'France' } },
            'hr@demo.com': { password: 'hr123', user: { id: 'demo-hr', name: 'Demo HR', email: 'hr@demo.com', role: 'rh', vacationDaysPerYear: 28, remainingVacationDays: 15, statePaidLeaves: 30, country: 'Tunisia' } },
            'manager@demo.com': { password: 'manager123', user: { id: 'demo-manager', name: 'Demo Manager', email: 'manager@demo.com', role: 'chef_dequipe', department: 'IT', vacationDaysPerYear: 25, remainingVacationDays: 10, statePaidLeaves: 30, country: 'Tunisia' } },
            'employee@demo.com': { password: 'employee123', user: { id: 'demo-emp', name: 'Demo Employee', email: 'employee@demo.com', role: 'employee', department: 'IT', vacationDaysPerYear: 25, remainingVacationDays: 25, statePaidLeaves: 30, country: 'Tunisia' } },
        };

        if (demoAccounts[email] && demoAccounts[email].password === password) {
            let demoUser = demoAccounts[email].user;

            // Seed demo data if it's the first time
            if (!storageService.getBoolean('demo_data_seeded')) {
                await seedDemoData();
            }

            // Attempt to link with seeded employeeId
            try {
                const { employeesDb } = require('../database/employeesDb');
                const allEmployees = await employeesDb.getAll();
                const matchedEmp = allEmployees.find((e: any) => e.email === email);
                if (matchedEmp) {
                    demoUser = { ...demoUser, employeeId: matchedEmp.id };
                }
            } catch (err) {
                console.warn('Failed to link demo user with employee ID', err);
            }

            storageService.setString(AUTH_KEY, JSON.stringify(demoUser));
            return demoUser;
        }

        // Backward compatibility for old test user
        if (email === 'test@test.com' && password === 'test') {
            const testUser: User = { id: 'test-user', name: 'Test User', email: 'test@test.com', role: 'admin' };
            storageService.setString(AUTH_KEY, JSON.stringify(testUser));
            return testUser;
        }

        const usersJson = storageService.getString(USERS_KEY);
        const users = usersJson ? JSON.parse(usersJson) : [];

        const user = users.find((u: any) => u.email === email && u.password === password);

        if (user) {
            const sessionUser: User = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                photoUri: user.photoUri,
                department: user.department,
                employeeId: user.employeeId
            };
            storageService.setString(AUTH_KEY, JSON.stringify(sessionUser));
            return sessionUser;
        }

        throw new Error('Invalid credentials');
    },

    // Register
    register: async (name: string, email: string, password: string, role: UserRole = 'employee'): Promise<User> => {
        await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

        const usersJson = storageService.getString(USERS_KEY);
        const users = usersJson ? JSON.parse(usersJson) : [];

        if (users.find((u: any) => u.email === email)) {
            throw new Error('Email already exists');
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            role,
        };

        users.push(newUser);
        storageService.setString(USERS_KEY, JSON.stringify(users));

        const sessionUser: User = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
        storageService.setString(AUTH_KEY, JSON.stringify(sessionUser));

        return sessionUser;
    },

    // Update User
    updateUser: async (updatedData: Partial<User>): Promise<User> => {
        const currentJson = storageService.getString(AUTH_KEY);
        if (!currentJson) throw new Error('Not logged in');

        const currentUser = JSON.parse(currentJson);
        const newUser = { ...currentUser, ...updatedData };

        // Update session
        storageService.setString(AUTH_KEY, JSON.stringify(newUser));

        // Update user record in USERS_KEY if it's not a demo account
        const usersJson = storageService.getString(USERS_KEY);
        if (usersJson) {
            const users = JSON.parse(usersJson);
            const userIndex = users.findIndex((u: any) => u.id === newUser.id);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...updatedData };
                storageService.setString(USERS_KEY, JSON.stringify(users));
            }
        }

        return newUser;
    },

    // Logout
    logout: async (): Promise<void> => {
        storageService.delete(AUTH_KEY);
        return Promise.resolve();
    },

    getCurrentUser: async (): Promise<User | null> => {
        const json = storageService.getString(AUTH_KEY);
        return json ? JSON.parse(json) : null;
    },
};

const seedDemoData = async () => {
    const { employeesDb } = require('../database/employeesDb');
    const { leavesDb } = require('../database/leavesDb');
    const { payrollDb } = require('../database/payrollDb');

    // Create Employees
    const empAdminId = await employeesDb.add({
        name: 'Demo Admin',
        position: 'Administrator',
        email: 'admin@demo.com',
        department: 'Management',
        role: 'admin',
        vacationDaysPerYear: 30,
        remainingVacationDays: 20,
        statePaidLeaves: 25,
        country: 'France',
        notes: 'Demo admin account',
    });

    const emp1Id = await employeesDb.add({
        name: 'Demo Employee',
        position: 'Software Engineer',
        email: 'employee@demo.com',
        department: 'IT',
        role: 'employee',
        vacationDaysPerYear: 25,
        remainingVacationDays: 15,
        statePaidLeaves: 30,
        country: 'Tunisia',
        notes: 'Demo account',
    });

    const managerId = await employeesDb.add({
        name: 'Demo Manager',
        position: 'Team Lead',
        email: 'manager@demo.com',
        department: 'IT',
        role: 'chef_dequipe',
        vacationDaysPerYear: 28,
        remainingVacationDays: 10,
        statePaidLeaves: 30,
        country: 'Tunisia',
        notes: 'Demo manager account',
    });

    const hrId = await employeesDb.add({
        name: 'Demo HR',
        position: 'HR Manager',
        email: 'hr@demo.com',
        department: 'HR',
        role: 'rh',
        vacationDaysPerYear: 30,
        remainingVacationDays: 20,
        statePaidLeaves: 25,
        country: 'France',
        notes: 'Demo HR account',
    });

    // Create Leaves
    await leavesDb.add({
        title: 'Summer Vacation',
        employeeName: 'Demo Employee',
        employeeId: emp1Id,
        dateTime: new Date(Date.now() + 86400000 * 5).toISOString(),
        location: 'Office',
        status: 'pending',
        type: 'leave',
        reminderEnabled: true,
        notes: 'Holidays with family',
    });

    await leavesDb.add({
        title: 'Doctor Appointment',
        employeeName: 'Demo Employee',
        employeeId: emp1Id,
        dateTime: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: 'Medical Center',
        status: 'approved',
        type: 'permission',
        reminderEnabled: false,
        notes: 'Routine checkup',
    });

    // Create Payroll
    await payrollDb.add({
        name: 'Base Salary',
        amount: '3500',
        frequency: 'Daily',
        times: JSON.stringify(['09:00']),
        startDate: new Date().toISOString(),
        reminderEnabled: true,
        employeeId: emp1Id,
    });

    storageService.setBoolean('demo_data_seeded', true);
};
