/// <reference types="cypress" />
describe('Payslips', () => {
  beforeEach(() => {
    // Mock login as employee
    cy.visit('/');
    cy.window().then(win => {
      // Mock authentication state
      win.localStorage.setItem('isAuthenticated', 'true');
      win.localStorage.setItem('userRole', 'employee');
    });
    cy.visit('/payroll');
  });

  it('should display payslips list', () => {
    cy.contains('Payslips').should('be.visible');
  });

  it('should show payslip details when clicked', () => {
    cy.contains('View').first().click();
    cy.contains('Payslip Details').should('be.visible');
    cy.contains('Net Salary:').should('be.visible');
  });

  it('should mark payslip as viewed when opened', () => {
    // Find an unread payslip (with "New" badge)
    cy.get('.unreadBadge')
      .first()
      .parent()
      .within(() => {
        cy.contains('View').click();
      });

    // Go back to list and verify the badge is gone
    cy.contains('Back to List').click();
    cy.get('.unreadBadge').should('have.length.lessThan', 1);
  });
});
