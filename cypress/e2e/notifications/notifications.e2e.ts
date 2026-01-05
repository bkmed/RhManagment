/// <reference types="cypress" />
describe("Notifications", () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem("isAuthenticated", "true")
      win.localStorage.setItem("userRole", "employee")
      win.localStorage.setItem("userId", "testUserId")
    })

    // Mock API response for notifications
    cy.intercept("GET", "**/notifications*", {
      body: [
        {
          id: "notif123",
          userId: "testUserId",
          type: "payslip_available",
          title: "New Payslip Available",
          message: "Your payslip for June 2023 is now available",
          read: false,
          createdAt: "2023-06-30T10:00:00.000Z",
          data: { payslipId: "payslip123", month: 6, year: 2023 },
        },
        {
          id: "notif122",
          userId: "testUserId",
          type: "leave_approved",
          title: "Leave Request Approved",
          message: "Your vacation leave request from 2023-07-10 to 2023-07-15 has been approved",
          read: true,
          createdAt: "2023-06-15T14:30:00.000Z",
          data: { status: "approved", leaveType: "vacation", startDate: "2023-07-10", endDate: "2023-07-15" },
        },
      ],
    }).as("getNotifications")

    cy.visit("/notifications")
    cy.wait("@getNotifications")
  })

  it("should display notifications list", () => {
    cy.contains("Notifications").should("be.visible")
    cy.contains("New Payslip Available").should("be.visible")
    cy.contains("Your payslip for June 2023 is now available").should("be.visible")
    cy.contains("Leave Request Approved").should("be.visible")
    cy.contains("Your vacation leave request from 2023-07-10 to 2023-07-15 has been approved").should("be.visible")
  })

  it("should show unread indicator for new notifications", () => {
    cy.contains("New Payslip Available").parent().parent().find(".unreadIndicator").should("be.visible")
    cy.contains("Leave Request Approved").parent().parent().find(".unreadIndicator").should("not.exist")
  })

  it("should mark notification as read when clicked", () => {
    cy.intercept("PATCH", "**/notifications/notif123", {
      body: { read: true },
    }).as("markAsRead")

    cy.contains("New Payslip Available").click()
    cy.wait("@markAsRead")

    cy.intercept("GET", "**/notifications*", {
      body: [
        {
          id: "notif123",
          userId: "testUserId",
          type: "payslip_available",
          title: "New Payslip Available",
          message: "Your payslip for June 2023 is now available",
          read: true,
          createdAt: "2023-06-30T10:00:00.000Z",
          data: { payslipId: "payslip123", month: 6, year: 2023 },
        },
        {
          id: "notif122",
          userId: "testUserId",
          type: "leave_approved",
          title: "Leave Request Approved",
          message: "Your vacation leave request from 2023-07-10 to 2023-07-15 has been approved",
          read: true,
          createdAt: "2023-06-15T14:30:00.000Z",
          data: { status: "approved", leaveType: "vacation", startDate: "2023-07-10", endDate: "2023-07-15" },
        },
      ],
    }).as("getUpdatedNotifications")

    cy.visit("/notifications")
    cy.wait("@getUpdatedNotifications")

    cy.contains("New Payslip Available").parent().parent().find(".unreadIndicator").should("not.exist")
  })

  it("should mark all notifications as read", () => {
    cy.intercept("POST", "**/markAllNotificationsAsRead*", {
      body: { success: true },
    }).as("markAllAsRead")

    cy.contains("Mark all as read").click()
    cy.wait("@markAllAsRead")

    cy.get(".unreadIndicator").should("not.exist")
  })

  it("should navigate to related content when notification is clicked", () => {
    cy.intercept("PATCH", "**/notifications/notif123", {
      body: { read: true },
    }).as("markAsRead")

    cy.intercept("GET", "**/payslips/payslip123", {
      body: {
        id: "payslip123",
        employeeId: "testUserId",
        period: { month: 6, year: 2023 },
        issueDate: "2023-06-30T00:00:00.000Z",
        grossSalary: 5000,
        netSalary: 3800,
        items: [
          { label: "Base Salary", amount: 5000, type: "earning" },
          { label: "Income Tax", amount: 1000, type: "deduction" },
          { label: "Social Security", amount: 200, type: "deduction" },
        ],
        status: "published",
        viewedByEmployee: false,
      },
    }).as("getPayslipDetails")

    cy.contains("New Payslip Available").click()
    cy.wait("@markAsRead")
    cy.wait("@getPayslipDetails")

    cy.url().should("include", "/payroll/payslip123")
    cy.contains("Payslip Details").should("be.visible")
  })
})
