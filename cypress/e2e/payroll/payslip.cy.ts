describe("Payslip Management", () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem("isAuthenticated", "true")
      win.localStorage.setItem("userRole", "employee")
      win.localStorage.setItem("userId", "testUserId")
    })

    // Mock API response for payslips
    cy.intercept("GET", "**/payslips*", {
      body: [
        {
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
        {
          id: "payslip122",
          employeeId: "testUserId",
          period: { month: 5, year: 2023 },
          issueDate: "2023-05-31T00:00:00.000Z",
          grossSalary: 5000,
          netSalary: 3800,
          items: [
            { label: "Base Salary", amount: 5000, type: "earning" },
            { label: "Income Tax", amount: 1000, type: "deduction" },
            { label: "Social Security", amount: 200, type: "deduction" },
          ],
          status: "published",
          viewedByEmployee: true,
        },
      ],
    }).as("getPayslips")

    cy.visit("/payroll")
    cy.wait("@getPayslips")
  })

  it("should display payslips list", () => {
    cy.contains("Payslips").should("be.visible")
    cy.contains("June 2023").should("be.visible")
    cy.contains("May 2023").should("be.visible")
    cy.contains("3800.00 €").should("be.visible")
  })

  it("should show unread indicator for new payslips", () => {
    cy.contains("June 2023").parent().parent().find(".unreadBadge").should("be.visible")
    cy.contains("May 2023").parent().parent().find(".unreadBadge").should("not.exist")
  })

  it("should view payslip details", () => {
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

    cy.intercept("PATCH", "**/payslips/payslip123", {
      body: { viewedByEmployee: true },
    }).as("markAsViewed")

    cy.contains("June 2023").parent().parent().contains("View").click()

    cy.wait("@getPayslipDetails")
    cy.wait("@markAsViewed")

    cy.contains("Payslip Details").should("be.visible")
    cy.contains("June 2023").should("be.visible")
    cy.contains("Base Salary").should("be.visible")
    cy.contains("5000.00").should("be.visible")
    cy.contains("Income Tax").should("be.visible")
    cy.contains("1000.00").should("be.visible")
    cy.contains("Social Security").should("be.visible")
    cy.contains("200.00").should("be.visible")
    cy.contains("Net Salary: 3800.00 €").should("be.visible")
  })

  it("should download payslip PDF", () => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen")
    })

    cy.contains("June 2023").parent().parent().contains("Download").click()
    cy.get("@windowOpen").should("be.called")
  })

  it("should mark payslip as viewed after viewing", () => {
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

    cy.intercept("PATCH", "**/payslips/payslip123", {
      body: { viewedByEmployee: true },
    }).as("markAsViewed")

    cy.intercept("GET", "**/payslips*", {
      body: [
        {
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
          viewedByEmployee: true,
        },
        {
          id: "payslip122",
          employeeId: "testUserId",
          period: { month: 5, year: 2023 },
          issueDate: "2023-05-31T00:00:00.000Z",
          grossSalary: 5000,
          netSalary: 3800,
          items: [
            { label: "Base Salary", amount: 5000, type: "earning" },
            { label: "Income Tax", amount: 1000, type: "deduction" },
            { label: "Social Security", amount: 200, type: "deduction" },
          ],
          status: "published",
          viewedByEmployee: true,
        },
      ],
    }).as("getUpdatedPayslips")

    cy.contains("June 2023").parent().parent().contains("View").click()
    cy.wait("@getPayslipDetails")
    cy.wait("@markAsViewed")

    cy.contains("Back to List").click()
    cy.wait("@getUpdatedPayslips")

    cy.contains("June 2023").parent().parent().find(".unreadBadge").should("not.exist")
  })
})
