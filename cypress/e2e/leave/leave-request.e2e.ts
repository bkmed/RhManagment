/// <reference types="cypress" />
describe("Leave Request", () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem("isAuthenticated", "true")
      win.localStorage.setItem("userRole", "employee")
      win.localStorage.setItem("userId", "testUserId")
    })

    cy.visit("/leave")
  })

  it("should display leave request form", () => {
    cy.contains("Request Leave").should("be.visible")
    cy.contains("Leave Type").should("be.visible")
    cy.contains("button", "Vacation").should("be.visible")
    cy.contains("button", "Sick").should("be.visible")
    cy.contains("button", "Personal").should("be.visible")
    cy.contains("button", "Other").should("be.visible")
    cy.get('input[placeholder="YYYY-MM-DD"]').should("have.length", 2)
    cy.get("textarea").should("be.visible")
    cy.contains("button", "Submit Request").should("be.visible")
  })

  it("should show validation error when submitting empty form", () => {
    cy.contains("button", "Submit Request").click()
    cy.contains("All fields are required").should("be.visible")
  })

  it("should select different leave types", () => {
    cy.contains("button", "Vacation").should("have.class", "primary")

    cy.contains("button", "Sick").click()
    cy.contains("button", "Sick").should("have.class", "primary")
    cy.contains("button", "Vacation").should("not.have.class", "primary")

    cy.contains("button", "Personal").click()
    cy.contains("button", "Personal").should("have.class", "primary")
    cy.contains("button", "Sick").should("not.have.class", "primary")

    cy.contains("button", "Other").click()
    cy.contains("button", "Other").should("have.class", "primary")
    cy.contains("button", "Personal").should("not.have.class", "primary")
  })

  it("should submit leave request successfully", () => {
    cy.intercept("POST", "**/leaveRequests*", {
      body: {
        id: "leave123",
        employeeId: "testUserId",
        type: "vacation",
        startDate: "2023-07-10",
        endDate: "2023-07-15",
        reason: "Summer vacation",
        status: "pending",
        createdAt: "2023-06-15T10:30:00.000Z",
        updatedAt: "2023-06-15T10:30:00.000Z",
      },
    }).as("createLeaveRequest")

    cy.contains("button", "Vacation").click()
    cy.get('input[placeholder="YYYY-MM-DD"]').first().type("2023-07-10")
    cy.get('input[placeholder="YYYY-MM-DD"]').last().type("2023-07-15")
    cy.get("textarea").type("Summer vacation")
    cy.contains("button", "Submit Request").click()

    cy.wait("@createLeaveRequest")
    cy.contains("Leave request submitted successfully").should("be.visible")
  })

  it("should display leave history", () => {
    cy.intercept("GET", "**/leaveRequests*", {
      body: [
        {
          id: "leave123",
          employeeId: "testUserId",
          type: "vacation",
          startDate: "2023-07-10",
          endDate: "2023-07-15",
          reason: "Summer vacation",
          status: "pending",
          createdAt: "2023-06-15T10:30:00.000Z",
          updatedAt: "2023-06-15T10:30:00.000Z",
        },
        {
          id: "leave124",
          employeeId: "testUserId",
          type: "sick",
          startDate: "2023-05-05",
          endDate: "2023-05-06",
          reason: "Fever",
          status: "approved",
          createdAt: "2023-05-04T09:15:00.000Z",
          updatedAt: "2023-05-04T14:20:00.000Z",
        },
      ],
    }).as("getLeaveRequests")

    cy.contains("Leave History").click()
    cy.wait("@getLeaveRequests")

    cy.contains("Vacation").should("be.visible")
    cy.contains("2023-07-10").should("be.visible")
    cy.contains("2023-07-15").should("be.visible")
    cy.contains("Pending").should("be.visible")

    cy.contains("Sick").should("be.visible")
    cy.contains("2023-05-05").should("be.visible")
    cy.contains("2023-05-06").should("be.visible")
    cy.contains("Approved").should("be.visible")
  })
})
