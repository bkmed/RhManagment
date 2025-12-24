describe("Payroll Management", () => {
  beforeAll(async () => {
    await device.launchApp()
    // Login first
    await element(by.placeholder("Enter your email")).typeText("test@example.com")
    await element(by.placeholder("Enter your password")).typeText("password123")
    await element(by.text("Login")).tap()
  })

  beforeEach(async () => {
    // Navigate to Payroll tab before each test
    await element(by.text("Payroll")).tap()
  })

  it("should display payslips list", async () => {
    await expect(element(by.text("Payslips"))).toBeVisible()
    await expect(element(by.text("June 2023"))).toBeVisible()
    await expect(element(by.text("May 2023"))).toBeVisible()
    await expect(element(by.text("3800.00 €"))).toBeVisible()
  })

  it("should view payslip details", async () => {
    await element(by.text("View")).atIndex(0).tap()

    await expect(element(by.text("Payslip Details"))).toBeVisible()
    await expect(element(by.text("June 2023"))).toBeVisible()
    await expect(element(by.text("Base Salary"))).toBeVisible()
    await expect(element(by.text("5000.00"))).toBeVisible()
    await expect(element(by.text("Income Tax"))).toBeVisible()
    await expect(element(by.text("1000.00"))).toBeVisible()
    await expect(element(by.text("Social Security"))).toBeVisible()
    await expect(element(by.text("200.00"))).toBeVisible()
    await expect(element(by.text("Net Salary: 3800.00 €"))).toBeVisible()

    // Go back to list
    await element(by.text("Back to List")).tap()
  })

  it("should mark payslip as viewed after viewing", async () => {
    // Check if the first payslip has a "New" badge
    await expect(element(by.text("New"))).toBeVisible()

    // View the payslip
    await element(by.text("View")).atIndex(0).tap()

    // Go back to list
    await element(by.text("Back to List")).tap()

    // Check if the "New" badge is gone
    await expect(element(by.text("New"))).not.toBeVisible()
  })

  // Admin-only tests
  describe("Admin Payroll Functions", () => {
    beforeAll(async () => {
      // Logout first
      await element(by.text("Profile")).tap()
      await element(by.text("Logout")).tap()

      // Login as admin
      await element(by.placeholder("Enter your email")).typeText("admin@example.com")
      await element(by.placeholder("Enter your password")).typeText("password123")
      await element(by.text("Login")).tap()

      // Navigate to Admin Payroll
      await element(by.text("Admin")).tap()
      await element(by.text("Payroll")).tap()
    })

    it("should display payroll management options", async () => {
      await expect(element(by.text("Payroll Management"))).toBeVisible()
      await expect(element(by.text("Create Payslip"))).toBeVisible()
      await expect(element(by.text("Payslips"))).toBeVisible()
    })

    it("should create a new payslip", async () => {
      await element(by.text("Create Payslip")).tap()

      await expect(element(by.text("Create Payslip"))).toBeVisible()

      // Select employee
      await element(by.text("Select Employee")).tap()
      await element(by.text("John Doe")).tap()

      // Fill in payslip details
      await element(by.placeholder("Month (1-12)")).typeText("7")
      await element(by.placeholder("Year")).typeText("2023")
      await element(by.placeholder("Enter gross salary")).typeText("5000")

      // Add earnings and deductions
      await element(by.text("Base Salary")).atIndex(0).tap()
      await element(by.placeholder("Amount")).atIndex(0).typeText("5000")

      await element(by.text("Income Tax")).atIndex(0).tap()
      await element(by.placeholder("Amount")).atIndex(1).typeText("1000")

      await element(by.text("Social Security")).atIndex(0).tap()
      await element(by.placeholder("Amount")).atIndex(2).typeText("200")

      await element(by.text("Create Payslip")).tap()

      // Check for success message
      await expect(element(by.text("Payslip created successfully"))).toBeVisible()
    })

    it("should publish a draft payslip", async () => {
      await element(by.text("Drafts")).tap()
      await element(by.text("July 2023")).tap()

      await expect(element(by.text("Payslip Details"))).toBeVisible()
      await expect(element(by.text("Draft"))).toBeVisible()

      await element(by.text("Publish")).tap()
      await element(by.text("Yes, Publish")).tap()

      // Check if status changed to published
      await expect(element(by.text("Published"))).toBeVisible()

      // Go back to list
      await element(by.text("Back to List")).tap()
    })
  })
})
