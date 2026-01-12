/// <reference types="cypress" />
describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.contains('Login to HR Portal');
    cy.get('input[placeholder="Enter your email"]').should('be.visible');
    cy.get('input[placeholder="Enter your password"]').should('be.visible');
    cy.contains('button', 'Login').should('be.visible');
  });

  it('should show validation error when submitting empty form', () => {
    cy.contains('button', 'Login').click();
    cy.contains('Email and password are required').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('Register').click();
    cy.contains('Create an Account').should('be.visible');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[placeholder="Enter your email"]').type('invalid@example.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpassword');
    cy.contains('button', 'Login').click();
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // This test requires a mock or a test user in your Firebase
    cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword*', {
      body: {
        kind: 'identitytoolkit#VerifyPasswordResponse',
        localId: 'testUserId',
        email: 'test@example.com',
        displayName: 'Test User',
        idToken: 'fake-token',
        registered: true,
      },
    }).as('loginRequest');

    cy.get('input[placeholder="Enter your email"]').type('test@example.com');
    cy.get('input[placeholder="Enter your password"]').type('password123');
    cy.contains('button', 'Login').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });
});
