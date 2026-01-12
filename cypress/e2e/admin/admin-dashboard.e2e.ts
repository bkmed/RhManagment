/// <reference types="cypress" />
describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Mock authentication as admin
    cy.window().then(win => {
      win.localStorage.setItem('isAuthenticated', 'true');
      win.localStorage.setItem('userRole', 'admin');
      win.localStorage.setItem('userId', 'adminUserId');
      win.localStorage.setItem('displayName', 'Admin User');
    });

    // Mock API responses for dashboard data
    cy.intercept('GET', '**/employees*', {
      body: [
        {
          id: 'emp123',
          userId: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          position: 'Software Developer',
          department: 'Engineering',
          hireDate: '2022-01-15',
        },
        {
          id: 'emp124',
          userId: 'user124',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          position: 'UI Designer',
          department: 'Design',
          hireDate: '2022-03-10',
        },
        {
          id: 'emp125',
          userId: 'user125',
          firstName: 'Robert',
          lastName: 'Johnson',
          email: 'robert.johnson@example.com',
          position: 'Project Manager',
          department: 'Management',
          hireDate: '2022-02-20',
        },
      ],
    }).as('getEmployees');

    cy.intercept('GET', '**/leaveRequests*', {
      body: [
        {
          id: 'leave123',
          employeeId: 'user123',
          type: 'vacation',
          startDate: '2023-07-10',
          endDate: '2023-07-15',
          reason: 'Summer vacation',
          status: 'pending',
          createdAt: '2023-06-15T10:30:00.000Z',
          updatedAt: '2023-06-15T10:30:00.000Z',
        },
        {
          id: 'leave124',
          employeeId: 'user124',
          type: 'sick',
          startDate: '2023-06-20',
          endDate: '2023-06-21',
          reason: 'Fever',
          status: 'pending',
          createdAt: '2023-06-19T09:15:00.000Z',
          updatedAt: '2023-06-19T09:15:00.000Z',
        },
      ],
    }).as('getLeaveRequests');

    cy.intercept('GET', '**/payslips*', {
      body: [
        {
          id: 'payslip123',
          employeeId: 'user123',
          period: { month: 6, year: 2023 },
          issueDate: '2023-06-30T00:00:00.000Z',
          grossSalary: 5000,
          netSalary: 3800,
          status: 'published',
        },
        {
          id: 'payslip124',
          employeeId: 'user124',
          period: { month: 6, year: 2023 },
          issueDate: '2023-06-30T00:00:00.000Z',
          grossSalary: 4500,
          netSalary: 3400,
          status: 'published',
        },
      ],
    }).as('getPayslips');

    cy.intercept('GET', '**/notifications/count*', {
      body: { count: 5 },
    }).as('getNotificationCount');

    cy.visit('/admin/dashboard');
    cy.wait([
      '@getEmployees',
      '@getLeaveRequests',
      '@getPayslips',
      '@getNotificationCount',
    ]);
  });

  it('should display welcome message and dashboard title', () => {
    cy.contains('Welcome, Admin User').should('be.visible');
    cy.contains('Dashboard Overview').should('be.visible');
  });

  it('should display stat cards with correct counts', () => {
    cy.contains('Total Employees').parent().contains('3').should('be.visible');
    cy.contains('Pending Leaves').parent().contains('2').should('be.visible');
    cy.contains('Payslips Issued').parent().contains('2').should('be.visible');
    cy.contains('Notifications').parent().contains('5').should('be.visible');
  });

  it('should display quick actions', () => {
    cy.contains('Quick Actions').should('be.visible');
    cy.contains('Add Employee').should('be.visible');
    cy.contains('Approve Leaves').should('be.visible');
    cy.contains('Create Payslip').should('be.visible');
    cy.contains('View Calendar').should('be.visible');
  });

  it('should display pending leave requests', () => {
    cy.contains('Pending Leave Requests').should('be.visible');
    cy.contains('Vacation Leave').should('be.visible');
    cy.contains('Sick Leave').should('be.visible');
    cy.contains('2023-07-10 - 2023-07-15').should('be.visible');
    cy.contains('2023-06-20 - 2023-06-21').should('be.visible');
    cy.get('.badge').contains('Pending').should('have.length', 2);
  });

  it('should display recent employees', () => {
    cy.contains('Recent Employees').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('Jane Smith').should('be.visible');
    cy.contains('Robert Johnson').should('be.visible');
    cy.contains('Software Developer').should('be.visible');
    cy.contains('UI Designer').should('be.visible');
    cy.contains('Project Manager').should('be.visible');
  });

  it('should display recent activity', () => {
    cy.contains('Recent Activity').should('be.visible');
    cy.contains('New vacation leave request').should('be.visible');
    cy.contains('New sick leave request').should('be.visible');
    cy.contains('Payslip created for 6/2023').should('be.visible');
  });

  it('should navigate to employees page when clicking on Total Employees', () => {
    cy.contains('Total Employees').click();
    cy.url().should('include', '/admin/employees');
  });

  it('should navigate to leave approvals page when clicking on Pending Leaves', () => {
    cy.contains('Pending Leaves').click();
    cy.url().should('include', '/admin/leave-approvals');
  });

  it('should navigate to payroll page when clicking on Payslips Issued', () => {
    cy.contains('Payslips Issued').click();
    cy.url().should('include', '/admin/payroll');
  });

  it('should navigate to notifications page when clicking on Notifications', () => {
    cy.contains('Notifications').click();
    cy.url().should('include', '/notifications');
  });

  it('should navigate to add employee page when clicking on Add Employee', () => {
    cy.contains('Add Employee').click();
    cy.url().should('include', '/admin/add-employee');
  });

  it('should navigate to leave approvals page when clicking on Approve Leaves', () => {
    cy.contains('Approve Leaves').click();
    cy.url().should('include', '/admin/leave-approvals');
  });

  it('should navigate to create payslip page when clicking on Create Payslip', () => {
    cy.contains('Create Payslip').click();
    cy.url().should('include', '/admin/create-payslip');
  });

  it('should navigate to calendar page when clicking on View Calendar', () => {
    cy.contains('View Calendar').click();
    cy.url().should('include', '/calendar');
  });

  it('should navigate to employee details when clicking on an employee', () => {
    cy.contains('John Doe').click();
    cy.url().should('include', '/admin/employees/emp123');
  });

  it('should navigate to leave details when clicking on a leave request', () => {
    cy.contains('Vacation Leave').click();
    cy.url().should('include', '/admin/leave-approvals/leave123');
  });
});
