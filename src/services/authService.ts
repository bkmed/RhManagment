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

    // Demo accounts
    const demoAccounts: { [key: string]: { password: string; user: User } } = {
      'admin@demo.com': {
        password: 'admin123',
        user: {
          id: 'demo-admin',
          employeeId: '1001',
          name: 'Demo Admin',
          email: 'admin@demo.com',
          role: 'admin',
          vacationDaysPerYear: 30,
          remainingVacationDays: 20,
          statePaidLeaves: 25,
          country: 'France',
          hiringDate: '2018-01-15',
          notificationPreferences: { push: true, email: true },
        },
      },
      'rh@demo.com': {
        password: 'rh123',
        user: {
          id: 'demo-rh',
          employeeId: '1002',
          name: 'Demo RH',
          email: 'rh@demo.com',
          role: 'rh',
          companyId: '1',
          vacationDaysPerYear: 28,
          remainingVacationDays: 15,
          statePaidLeaves: 30,
          country: 'Tunisia',
          hiringDate: '2019-03-10',
          notificationPreferences: { push: true, email: false },
        },
      },
      'chef@demo.com': {
        password: 'chef123',
        user: {
          id: 'demo-manager',
          employeeId: '1003',
          name: 'Demo Manager',
          email: 'chef@demo.com',
          role: 'manager',
          department: 'IT',
          teamId: '1',
          companyId: '1',
          vacationDaysPerYear: 25,
          remainingVacationDays: 10,
          statePaidLeaves: 30,
          country: 'Tunisia',
          hiringDate: '2020-06-01',
          notificationPreferences: { push: true, email: true },
        },
      },
      'employee@demo.com': {
        password: 'employee123',
        user: {
          id: 'demo-emp',
          employeeId: '1004',
          name: 'Demo Employee',
          email: 'employee@demo.com',
          role: 'employee',
          department: 'IT',
          teamId: '1',
          companyId: '1',
          vacationDaysPerYear: 25,
          remainingVacationDays: 25,
          statePaidLeaves: 30,
          country: 'Tunisia',
          hiringDate: '2021-09-20',
          notificationPreferences: { push: true, email: false },
        },
      },
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
        const matchedEmp = allEmployees.find(
          (e: Employee) => e.email === email,
        );
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
      const testUser: User = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@test.com',
        role: 'admin',
        notificationPreferences: { push: true, email: true },
      };
      storageService.setString(AUTH_KEY, JSON.stringify(testUser));
      return testUser;
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
  const { companiesDb } = require('../database/companiesDb');
  const { teamsDb } = require('../database/teamsDb');
  const { reviewPeriodsDb } = require('../database/reviewPeriodsDb');

  console.log('SEEDING DEMO DATA...');

  // 1. Create Companies (2)
  const company1Id = await companiesDb.add({
    name: 'Tech Solutions Inc.',
    logo: 'https://via.placeholder.com/150',
    address: '123 Tech Park',
    country: 'France',
  });
  const company2Id = await companiesDb.add({
    name: 'Global Services Ltd',
    logo: 'https://via.placeholder.com/150',
    address: '456 Business Blvd',
    country: 'Tunisia',
  });

  // 2. Create Teams (8) - 4 per company
  const teamIds: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const tId = await teamsDb.add({
      name: `Tech Team ${i}`,
      department: 'IT',
      companyId: company1Id,
    });
    teamIds.push(tId);
  }
  for (let i = 1; i <= 4; i++) {
    const tId = await teamsDb.add({
      name: `Service Team ${i}`,
      department: 'Operations',
      companyId: company2Id,
    });
    teamIds.push(tId);
  }

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

  // Managers (8) - One per team
  for (let i = 0; i < teamIds.length; i++) {
    const teamId = teamIds[i];
    const email = `manager${i + 1}@demo.com`;
    const isDemoManager = i === 0;
    const finalEmail = isDemoManager ? 'chef@demo.com' : email;

    const mgrId = await employeesDb.add({
      name: isDemoManager ? 'Demo Manager' : `Manager Team ${i + 1}`,
      firstName: isDemoManager ? 'Demo' : 'Manager',
      lastName: isDemoManager ? 'Manager' : `Team ${i + 1}`,
      email: finalEmail,
      role: 'manager',
      teamId: teamId,
      companyId: i < 4 ? company1Id : company2Id,
      department: i < 4 ? 'IT' : 'Operations',
      position: 'Team Lead',
      country: 'Tunisia',
      hiringDate: '2020-06-01',
      address: 'Ennasr, Tunis',
      age: 38,
      gender: 'male',
      skills: ['Agile', 'Team Leadership', 'Project Management'],
      vacationDaysPerYear: 28,
      remainingVacationDays: 20,
      statePaidLeaves: 5,
    });

    // Update team with managerId
    const team = await teamsDb.getById(teamId);
    if (team) {
      await teamsDb.update(teamId, { ...team, managerId: mgrId });
    }
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

  console.log('DEMO DATA SEEDED SUCCESSFULLY');
  storageService.setBoolean('demo_data_seeded', true);
};
