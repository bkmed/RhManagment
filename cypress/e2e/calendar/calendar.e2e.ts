/// <reference types="cypress" />
describe('Calendar', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then(win => {
      win.localStorage.setItem('isAuthenticated', 'true');
      win.localStorage.setItem('userRole', 'employee');
      win.localStorage.setItem('userId', 'testUserId');
    });

    // Mock API response for calendar events
    cy.intercept('GET', '**/calendar/events*', {
      body: [
        {
          id: 'event1',
          title: 'John Doe - Vacation Leave',
          start: '2023-07-10T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
          allDay: true,
          type: 'leave',
          employeeId: 'testUserId',
          employeeName: 'John Doe',
          color: '#4299e1',
          description: 'Summer vacation',
        },
        {
          id: 'event2',
          title: 'Independence Day',
          start: '2023-07-04T00:00:00.000Z',
          end: '2023-07-05T00:00:00.000Z',
          allDay: true,
          type: 'holiday',
          color: '#ed8936',
        },
      ],
    }).as('getCalendarEvents');

    cy.visit('/calendar');
    cy.wait('@getCalendarEvents');
  });

  it('should display calendar with month view by default', () => {
    cy.contains('July 2023').should('be.visible');
    cy.get('.monthContainer').should('be.visible');
    cy.get('.dayHeader').should('have.length', 7);
    cy.contains('Sun').should('be.visible');
    cy.contains('Mon').should('be.visible');
    cy.contains('Tue').should('be.visible');
    cy.contains('Wed').should('be.visible');
    cy.contains('Thu').should('be.visible');
    cy.contains('Fri').should('be.visible');
    cy.contains('Sat').should('be.visible');
  });

  it('should navigate between months', () => {
    cy.intercept('GET', '**/calendar/events*', {
      body: [],
    }).as('getAugustEvents');

    cy.get('.navButton').eq(1).click(); // Next month button
    cy.wait('@getAugustEvents');
    cy.contains('August 2023').should('be.visible');

    cy.intercept('GET', '**/calendar/events*', {
      body: [],
    }).as('getJulyEvents');

    cy.get('.navButton').eq(0).click(); // Previous month button
    cy.wait('@getJulyEvents');
    cy.contains('July 2023').should('be.visible');
  });

  it('should switch to week view', () => {
    cy.intercept('GET', '**/calendar/events*', {
      body: [
        {
          id: 'event1',
          title: 'John Doe - Vacation Leave',
          start: '2023-07-10T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
          allDay: true,
          type: 'leave',
          employeeId: 'testUserId',
          employeeName: 'John Doe',
          color: '#4299e1',
          description: 'Summer vacation',
        },
        {
          id: 'event2',
          title: 'Independence Day',
          start: '2023-07-04T00:00:00.000Z',
          end: '2023-07-05T00:00:00.000Z',
          allDay: true,
          type: 'holiday',
          color: '#ed8936',
        },
      ],
    }).as('getWeekEvents');

    cy.contains('Week').click();
    cy.wait('@getWeekEvents');

    cy.get('.weekViewContainer').should('be.visible');
    cy.get('.weekViewDay').should('have.length', 7);
    cy.contains('John Doe - Vacation Leave').should('be.visible');
    cy.contains('Independence Day').should('be.visible');
  });

  it('should switch to day view', () => {
    cy.intercept('GET', '**/calendar/events*', {
      body: [
        {
          id: 'event1',
          title: 'John Doe - Vacation Leave',
          start: '2023-07-10T00:00:00.000Z',
          end: '2023-07-15T00:00:00.000Z',
          allDay: true,
          type: 'leave',
          employeeId: 'testUserId',
          employeeName: 'John Doe',
          color: '#4299e1',
          description: 'Summer vacation',
        },
      ],
    }).as('getDayEvents');

    cy.contains('Day').click();
    cy.wait('@getDayEvents');

    cy.get('.dayViewContainer').should('be.visible');
    cy.contains('John Doe - Vacation Leave').should('be.visible');
  });

  it('should display event details when clicked', () => {
    cy.contains('Day').click();
    cy.contains('John Doe - Vacation Leave').click();

    cy.contains('Event Details').should('be.visible');
    cy.contains('Summer vacation').should('be.visible');
    cy.contains('July 10, 2023').should('be.visible');
    cy.contains('July 15, 2023').should('be.visible');
  });

  it('should go to today', () => {
    cy.intercept('GET', '**/calendar/events*', {
      body: [],
    }).as('getTodayEvents');

    // First navigate to a different month
    cy.get('.navButton').eq(1).click(); // Next month button
    cy.contains('August 2023').should('be.visible');

    // Then click Today button
    cy.contains('Today').click();
    cy.wait('@getTodayEvents');

    // Should show current month (using dynamic check since test could run in any month)
    const today = new Date();
    const currentMonth = today.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    cy.contains(currentMonth).should('be.visible');
  });

  it('should display event legend', () => {
    cy.get('.legendContainer').should('be.visible');
    cy.contains('Vacation').should('be.visible');
    cy.contains('Sick Leave').should('be.visible');
    cy.contains('Personal Leave').should('be.visible');
    cy.contains('Holiday').should('be.visible');
    cy.contains('Other').should('be.visible');
  });
});
