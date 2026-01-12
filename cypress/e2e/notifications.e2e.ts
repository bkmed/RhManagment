/// <reference types="cypress" />
describe('Notifications', () => {
  beforeEach(() => {
    // Mock login
    cy.visit('/');
    cy.window().then(win => {
      // Mock authentication state
      win.localStorage.setItem('isAuthenticated', 'true');
      win.localStorage.setItem('userRole', 'employee');
    });
    cy.visit('/notifications');
  });

  it('should display notifications list', () => {
    cy.contains('Notifications').should('be.visible');
  });

  it('should mark notification as read when clicked', () => {
    // Find an unread notification
    cy.get('.unreadIndicator').first().parent().click();

    // Verify it's now marked as read (no unread indicator)
    cy.get('.unreadIndicator').should('have.length.lessThan', 1);
  });

  it('should mark all notifications as read', () => {
    cy.contains('Mark all as read').click();
    cy.get('.unreadIndicator').should('not.exist');
  });
});
