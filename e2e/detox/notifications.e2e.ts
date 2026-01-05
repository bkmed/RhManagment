import { device, element, by, expect } from "detox";
describe("Notifications", () => {
  beforeAll(async () => {
    await device.launchApp()
    // Login first
    await element(by.placeholder("Enter your email")).typeText("test@example.com")
    await element(by.placeholder("Enter your password")).typeText("password123")
    await element(by.text("Login")).tap()
  })

  beforeEach(async () => {
    // Navigate to Notifications tab before each test
    await element(by.text("Notifications")).tap()
  })

  it("should display notifications list", async () => {
    await expect(element(by.text("Notifications"))).toBeVisible()
    await expect(element(by.text("New Payslip Available"))).toBeVisible()
    await expect(element(by.text("Leave Request Approved"))).toBeVisible()
  })

  it("should show unread indicator for new notifications", async () => {
    await expect(element(by.id("unreadIndicator"))).toBeVisible()
  })

  it("should mark notification as read when clicked", async () => {
    // Count unread indicators before clicking
    const unreadBefore = await element(by.id("unreadIndicator")).getAttributes()
    const countBefore = unreadBefore.length

    // Click on an unread notification
    await element(by.text("New Payslip Available")).tap()

    // Go back to notifications
    await element(by.text("Back")).tap()

    // Count unread indicators after clicking
    const unreadAfter = await element(by.id("unreadIndicator")).getAttributes()
    const countAfter = unreadAfter.length

    // Check if count decreased
    expect(countAfter).toBeLessThan(countBefore)
  })

  it("should mark all notifications as read", async () => {
    await element(by.text("Mark all as read")).tap()

    // Check if all unread indicators are gone
    await expect(element(by.id("unreadIndicator"))).not.toBeVisible()
  })

  it("should navigate to related content when notification is clicked", async () => {
    await element(by.text("New Payslip Available")).tap()

    // Check if we're redirected to payslip details
    await expect(element(by.text("Payslip Details"))).toBeVisible()

    // Go back to notifications
    await element(by.text("Back")).tap()
  })
})
