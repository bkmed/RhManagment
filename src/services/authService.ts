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
}

export const authService = {
    // Login
    login: async (email: string, password: string): Promise<User> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

        // Demo accounts
        const demoAccounts: { [key: string]: { password: string; user: User } } = {
            'admin@demo.com': { password: 'admin123', user: { id: 'demo-admin', name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' } },
            'hr@demo.com': { password: 'hr123', user: { id: 'demo-hr', name: 'Demo HR', email: 'hr@demo.com', role: 'rh' } },
            'chef@demo.com': { password: 'chef123', user: { id: 'demo-chef', name: 'Demo Chef', email: 'chef@demo.com', role: 'chef_dequipe' } },
            'employee@demo.com': { password: 'employee123', user: { id: 'demo-emp', name: 'Demo Employee', email: 'employee@demo.com', role: 'employee' } },
        };

        if (demoAccounts[email] && demoAccounts[email].password === password) {
            const demoUser = demoAccounts[email].user;
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

    // Get current user
    getCurrentUser: async (): Promise<User | null> => {
        const json = storageService.getString(AUTH_KEY);
        return json ? JSON.parse(json) : null;
    },
};
