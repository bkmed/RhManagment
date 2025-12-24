describe("Leave Management", () => {
  beforeAll(async () => {
    await device.launchApp()
    // Login first
    await element(by.placeholder("Enter your email")).typeText("test@example.com")
    await element(by.placeholder("Enter your password")).typeText("password123")
    await element(by.text("Login")).tap()
  })

  beforeEach(async () => {
    // Navigate to Leave tab before each test
    await element(by.text("Leave")).tap()
  })

  it("should display leave request form", async () => {
    await expect(element(by.text("Request Leave"))).toBeVisible()
    await expect(element(by.text("Leave Type"))).toBeVisible()
    await expect(element(by.text("Vacation"))).toBeVisible()
    await expect(element(by.text("Sick"))).toBeVisible()
    await expect(element(by.text("Personal"))).toBeVisible()
    await expect(element(by.text("Other"))).toBeVisible()
    await expect(element(by.text("Start Date"))).toBeVisible()
    await expect(element(by.text("End Date"))).toBeVisible()
    await expect(element(by.text("Reason"))).toBeVisible()
    await expect(element(by.text("Submit Request"))).toBeVisible()
  })

  it("should show validation error when submitting empty form", async () => {
    await element(by.text("Submit Request")).tap()
    await expect(element(by.text("All fields are required"))).toBeVisible()
  })

  it("should select different leave types", async () => {
    await element(by.text("Sick")).tap()
    await element(by.text("Personal")).tap()
    await element(by.text("Other")).tap()
    await element(by.text("Vacation")).tap()
  })

  it("should submit leave request successfully", async () => {
    await element(by.text("Vacation")).tap()

    // Fill in dates
    await element(by.placeholder("YYYY-MM-DD")).atIndex(0).typeText("2023-08-10")
    await element(by.placeholder("YYYY-MM-DD")).atIndex(1).typeText("2023-08-15")

    // Fill in reason
    await element(by.placeholder("Provide a reason for your leave request")).typeText("Summer vacation")

    await element(by.text("Submit Request")).tap()

    // Check for success message
    await expect(element(by.text("Leave request submitted successfully"))).toBeVisible()
  })

  it("should display leave history", async () => {
    await element(by.text("Leave History")).tap()

    await expect(element(by.text("Leave Requests"))).toBeVisible()
    await expect(element(by.text("Vacation"))).toBeVisible()
    await expect(element(by.text("2023-08-10"))).toBeVisible()
    await expect(element(by.text("2023-08-15"))).toBeVisible()
    await expect(element(by.text("Pending"))).toBeVisible()
  })

  it("should view leave request details", async () => {
    await element(by.text("Leave History")).tap()
    await element(by.text("Vacation")).tap()

    await expect(element(by.text("Leave Request Details"))).toBeVisible()
    await expect(element(by.text("Vacation Leave"))).toBeVisible()
    await expect(element(by.text("2023-08-10"))).toBeVisible()
    await expect(element(by.text("2023-08-15"))).toBeVisible()
    await expect(element(by.text("Summer vacation"))).toBeVisible()
    await expect(element(by.text("Pending"))).toBeVisible()

    // Go back to list
    await element(by.text("Back")).tap()
  })

  it("should cancel a pending leave request", async () => {
    await element(by.text("Leave History")).tap()
    await element(by.text("Vacation")).tap()

    await element(by.text("Cancel Request")).tap()
    await element(by.text("Yes, Cancel")).tap()

    // Check if status changed to cancelled
    await expect(element(by.text("Cancelled"))).toBeVisible()

    // Go back to list
    await element(by.text("Back")).tap()
  })
})
