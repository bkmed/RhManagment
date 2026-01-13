import { storageService } from './storage';
import { Employee } from '../database/schema';

const AUTH_KEY = 'auth_session';
const USERS_KEY = 'auth_users';

export type UserRole = 'admin' | 'employee' | 'rh' | 'manager';
export const ROLES: UserRole[] = ['admin', 'employee', 'rh', 'manager'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  alias?: string;
  jobTitle?: string;
  department?: string;
  photoUri?: string;
  vacationDaysPerYear?: number;
  remainingVacationDays?: number;
  statePaidLeaves?: number;
  country?: string;
  hiringDate?: string;
  firstName?: string;
  lastName?: string;
  address?: string; // Added address
  age?: number;
  gender?: 'male' | 'female' | 'other';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  socialLinks?: {
    linkedin?: string;
    skype?: string;
    twitter?: string;
    website?: string;
  };
  skills?: string[];
  teamId?: string;
  companyId?: string;
  status?: 'active' | 'pending' | 'rejected';
  birthDate?: string;
  backgroundPhotoUri?: string;
  notificationPreferences?: {
    push: boolean;
    email: boolean;
  };
}

export const authService = {
  // Login
  login: async (emailInput: string, password: string): Promise<User> => {
    const email = emailInput.trim().toLowerCase();
    // Simulate API delay
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

    // Seed demo data if it's the first time
    if (!storageService.getBoolean('demo_data_seeded')) {
      await seedDemoData();
    }

    const usersJson = storageService.getString(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    const user = users.find(
      (u: User & { password?: string }) =>
        u.email === email && u.password === password,
    );

    if (user) {
      const sessionUser: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUri: user.photoUri,
        department: user.department,
        employeeId: user.employeeId,
        notificationPreferences: user.notificationPreferences || {
          push: true,
          email: true,
        },
      };
      storageService.setString(AUTH_KEY, JSON.stringify(sessionUser));
      return sessionUser;
    }

    throw new Error('Invalid credentials');
  },

  // Register
  register: async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'employee',
    additionalInfo: { country?: string; birthDate?: string } = {},
  ): Promise<User> => {
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

    const usersJson = storageService.getString(USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    if (users.find((u: User & { password?: string }) => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
      country: additionalInfo.country,
      birthDate: additionalInfo.birthDate,
      status: 'pending', // Default status for new self-registered employees
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    storageService.setString(USERS_KEY, JSON.stringify(users));

    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      country: newUser.country,
      notificationPreferences: { push: true, email: true },
      // We pass status here if User interface supports it, otherwise it's just in the DB
    };
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
      const userIndex = users.findIndex(
        (u: User & { password?: string }) => u.id === newUser.id,
      );
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
  const { reviewPeriodsDb } = require('../database/reviewPeriodsDb');

  console.log('SEEDING DEMO DATA...');

  // Use static IDs matching companiesDb.ts and teamsDb.ts mock data
  const company1Id = '1'; // TechGlobe Solutions
  const company2Id = '2'; // EcoFlow Dynamics

  // Use static team IDs matching teamsDb.ts mock data
  // Teams 1-3 belong to company 1, Teams 4-6 belong to company 2
  const teamIds: string[] = ['1', '2', '3', '4', '5', '6'];

  // 3. Create Users (90)
  // Roles: 1 Admin, 3 RH, 8 Managers (1 per team), 78 Employees

  // Admin
  await employeesDb.add({
    name: 'Super Admin',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@demo.com',
    role: 'admin',
    companyId: company1Id,
    teamId: undefined,
    position: 'CTO',
    department: 'Management',
    vacationDaysPerYear: 30,
    remainingVacationDays: 30,
    statePaidLeaves: 0,
    country: 'France',
    hiringDate: '2018-01-15',
    address: '123 Avenue des Champs-Élysées, Paris',
    age: 42,
    gender: 'male',
    skills: ['Leadership', 'Strategy', 'HR Tech', 'Management'],
    password: 'admin',
  });

  // RH (3)
  const rhEmails = ['rh1@demo.com', 'rh2@demo.com', 'rh@demo.com'];
  for (let i = 0; i < rhEmails.length; i++) {
    const email = rhEmails[i];
    const isMainRH = email === 'rh@demo.com';

    await employeesDb.add({
      name: isMainRH ? 'Demo RH' : `RH Officer ${i + 1}`,
      firstName: isMainRH ? 'Demo' : 'RH',
      lastName: isMainRH ? 'RH' : `Officer ${i + 1}`,
      email: email,
      role: 'rh',
      companyId: company1Id,
      department: 'Human Resources',
      position: 'HR Manager',
      vacationDaysPerYear: 30,
      remainingVacationDays: 25,
      statePaidLeaves: 0,
      country: 'Tunisia',
      hiringDate: '2019-03-10',
      address: 'Berges du Lac, Tunis',
      age: 35,
      gender: 'female',
      skills: ['Recruitment', 'Conflict Resolution', 'Labor Law', 'Payroll'],
    });
  }

  // Employees (78)
  const firstNames = [
    'Sarah',
    'John',
    'Mohamed',
    'Fatima',
    'Lucas',
    'Emma',
    'Thomas',
    'Sophie',
    'Ahmed',
    'Yasmine',
    'Nicolas',
    'Julie',
  ];
  const lastNames = [
    'Smith',
    'Doe',
    'Ben Ali',
    'Dubois',
    'Martin',
    'Bernard',
    'Petit',
    'Durand',
    'Leroy',
    'Moreau',
    'Simon',
    'Laurent',
  ];

  for (let i = 0; i < 78; i++) {
    const firstName = i === 0 ? 'Demo' : firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = i === 0 ? 'Employee' : lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `emp${i + 1}@demo.com`;

    // Use specific email for demo employee
    const finalEmail = i === 0 ? 'employee@demo.com' : email;
    const assignedTeamId = teamIds[i % teamIds.length];
    const assignedCompanyId = i % teamIds.length < 4 ? company1Id : company2Id;

    const empId = await employeesDb.add({
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: finalEmail,
      role: 'employee',
      teamId: assignedTeamId,
      companyId: assignedCompanyId,
      department: assignedCompanyId === company1Id ? 'IT' : 'Operations',
      position: 'Senior Developer',
      country: 'Tunisia',
      address: 'Sidi Bou Said, Tunis',
      age: 29,
      gender: 'male',
      skills: ['React Native', 'TypeScript', 'Redux', 'Git'],
      vacationDaysPerYear: 25,
      remainingVacationDays: i === 0 ? 25 : Math.floor(Math.random() * 25),
      statePaidLeaves: i === 0 ? 30 : Math.floor(Math.random() * 10),
      hiringDate: i === 0 ? '2021-09-20' : new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        1,
      )
        .toISOString()
        .split('T')[0],
    });

    // Generate some leaves and payroll for the first few employees
    if (i < 10) {
      await leavesDb.add({
        title: 'Vacation',
        employeeName: `${firstName} ${lastName}`,
        employeeId: empId,
        dateTime: new Date().toISOString(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'approved',
        type: 'leave',
        reminderEnabled: false,
      });

      await payrollDb.add({
        name: 'Monthly Salary',
        amount: 2500 + Math.floor(Math.random() * 1000),
        currency: assignedCompanyId === company1Id ? 'EUR' : 'TND',
        frequency: 'Monthly',
        times: JSON.stringify(['09:00']),
        startDate: new Date().toISOString(),
        reminderEnabled: true,
        employeeId: empId,
        companyId: assignedCompanyId,
      });
    }
  }

  // 4. Create Review Periods
  await reviewPeriodsDb.add({
    name: 'Q1 2024 Performance Review',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'active',
  });

  // 5. Create Users in Persistent Storage
  const users: (User & { password?: string })[] = [];

  // Helper to add user
  const addUser = (
    id: string,
    email: string,
    password: string,
    role: UserRole,
    employeeId?: string,
    additionalProps: Partial<User> = {},
  ) => {
    users.push({
      id,
      email,
      password,
      role,
      name: additionalProps.name || '',
      employeeId,
      notificationPreferences: { push: true, email: true },
      ...additionalProps,
    });
  };

  // Admin User
  const adminEmp = (await employeesDb.getAll()).find((e: Employee) => e.email === 'admin@demo.com');
  if (adminEmp) {
    addUser('demo-admin', 'admin@demo.com', 'admin123', 'admin', adminEmp.id, {
      name: 'Super Admin',
      vacationDaysPerYear: 30,
      remainingVacationDays: 20,
      statePaidLeaves: 25,
      country: 'France',
      hiringDate: '2018-01-15',
    });
  }

  // RH User
  const rhEmp = (await employeesDb.getAll()).find((e: Employee) => e.email === 'rh@demo.com');
  if (rhEmp) {
    addUser('demo-rh', 'rh@demo.com', 'rh123', 'rh', rhEmp.id, {
      name: 'Demo RH',
      companyId: company1Id, // Use static Company ID
      vacationDaysPerYear: 28,
      remainingVacationDays: 15,
      statePaidLeaves: 30,
      country: 'Tunisia',
      hiringDate: '2019-03-10',
    });
  }

  // Manager User
  const managerEmp = (await employeesDb.getAll()).find((e: Employee) => e.email === 'chef@demo.com');
  if (managerEmp) {
    addUser('demo-manager', 'chef@demo.com', 'chef123', 'manager', managerEmp.id, {
      name: 'Demo Manager',
      companyId: company1Id,
      teamId: '1',
      department: 'IT',
      vacationDaysPerYear: 25,
      remainingVacationDays: 10,
      statePaidLeaves: 30,
      country: 'Tunisia',
      hiringDate: '2020-06-01',
    });
  }

  // Employee User
  const employeeEmp = (await employeesDb.getAll()).find((e: Employee) => e.email === 'employee@demo.com');
  if (employeeEmp) {
    addUser('demo-emp', 'employee@demo.com', 'employee123', 'employee', employeeEmp.id, {
      name: 'Demo Employee',
      companyId: company1Id,
      teamId: '1',
      department: 'IT',
      vacationDaysPerYear: 25,
      remainingVacationDays: 25,
      statePaidLeaves: 30,
      country: 'Tunisia',
      hiringDate: '2021-09-20',
    });
  }

  // Save to storage
  storageService.setString(USERS_KEY, JSON.stringify(users));

  console.log('DEMO DATA SEEDED SUCCESSFULLY');
  storageService.setBoolean('demo_data_seeded', true);
};
