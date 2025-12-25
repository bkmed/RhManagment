import { storageService } from './storage';

const AUTH_KEY = 'auth_session';
const USERS_KEY = 'auth_users';

export type UserRole = 'admin' | 'employee' | 'rh' | 'chef_dequipe';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    employeeId?: number;
    department?: string;
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
            const sessionUser: User = { id: user.id, name: user.name, email: user.email, role: user.role };
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

    // Logout
    logout: async (): Promise<void> => {
        storageService.delete(AUTH_KEY);
        // Ensure web storage is cleared instantly if async issues exist (though this is sync)
        return Promise.resolve();
    },

    // Get current user
    getCurrentUser: async (): Promise<User | null> => {
        const json = storageService.getString(AUTH_KEY);
        return json ? JSON.parse(json) : null;
    },
};
