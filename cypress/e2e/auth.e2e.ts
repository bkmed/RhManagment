/// <reference types="cypress" />
describe('Authentication', () => {
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
    cy.get('input[placeholder="Enter your full name"]').should('be.visible');
  });

  it('should show password mismatch error on register', () => {
    cy.contains('Register').click();
    cy.get('input[placeholder="Enter your full name"]').type('Test User');
    cy.get('input[placeholder="Enter your email"]').type('test@example.com');
    cy.get('input[placeholder="Create a password"]').type('password123');
    cy.get('input[placeholder="Confirm your password"]').type('password456');
    cy.contains('button', 'Register').click();
    cy.contains('Passwords do not match').should('be.visible');
  });
});
