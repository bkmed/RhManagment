describe("Calendar", () => {
  beforeAll(async () => {
    await device.launchApp()
    // Login first
    await element(by.placeholder("Enter your email")).typeText("test@example.com")
    await element(by.placeholder("Enter your password")).typeText("password123")
    await element(by.text("Login")).tap()
  })

  beforeEach(async () => {
    // Navigate to Calendar tab before each test
    await element(by.text("Calendar")).tap()
  })

  it("should display calendar with month view by default", async () => {
    await expect(element(by.text("Month"))).toBeVisible()
    await expect(element(by.text("Week"))).toBeVisible()
    await expect(element(by.text("Day"))).toBeVisible()

    // Check if we have day headers
    await expect(element(by.text("Sun"))).toBeVisible()
    await expect(element(by.text("Mon"))).toBeVisible()
    await expect(element(by.text("Tue"))).toBeVisible()
    await expect(element(by.text("Wed"))).toBeVisible()
    await expect(element(by.text("Thu"))).toBeVisible()
    await expect(element(by.text("Fri"))).toBeVisible()
    await expect(element(by.text("Sat"))).toBeVisible()
  })

  it("should navigate between months", async () => {
    // Get current month name
    const currentMonthElement = await element(by.id("currentMonth")).getText()

    // Go to next month
    await element(by.id("nextMonth")).tap()

    // Check if month changed
    await expect(element(by.id("currentMonth"))).not.toHaveText(currentMonthElement)

    // Go back to previous month
    await element(by.id("prevMonth")).tap()

    // Check if we're back to the original month
    await expect(element(by.id("currentMonth"))).toHaveText(currentMonthElement)
  })

  it("should switch to week view", async () => {
    await element(by.text("Week")).tap()

    // Check if we're in week view
    await expect(element(by.id("weekView"))).toBeVisible()

    // Check if we have 7 days in the week view
    const weekDays = await element(by.id("weekDays")).getAttributes()
    expect(weekDays.children.length).toBe(7)
  })

  it("should switch to day view", async () => {
    await element(by.text("Day")).tap()

    // Check if we're in day view
    await expect(element(by.id("dayView"))).toBeVisible()

    // Check if we have the date displayed
    await expect(element(by.id("currentDate"))).toBeVisible()
  })

  it("should display events in the calendar", async () => {
    // Go back to month view
    await element(by.text("Month")).tap()

    // Check if we have events displayed
    await expect(element(by.id("eventDot"))).toBeVisible()

    // Go to day view to see event details
    await element(by.text("Day")).tap()

    // Check if we have event details
    await expect(element(by.text("John Doe - Vacation Leave"))).toBeVisible()
    await expect(element(by.text("All day"))).toBeVisible()
  })

  it("should display event details when clicked", async () => {
    await element(by.text("Day")).tap()
    await element(by.text("John Doe - Vacation Leave")).tap()

    await expect(element(by.text("Event Details"))).toBeVisible()
    await expect(element(by.text("Summer vacation"))).toBeVisible()

    // Close event details
    await element(by.text("Close")).tap()
  })

  it("should go to today", async () => {
    // First navigate to a different month
    await element(by.text("Month")).tap()
    await element(by.id("nextMonth")).tap()

    // Then click Today button
    await element(by.text("Today")).tap()

    // Check if today is highlighted
    await expect(element(by.id("todayHighlight"))).toBeVisible()
  })

  it("should display event legend", async () => {
    await expect(element(by.text("Vacation"))).toBeVisible()
    await expect(element(by.text("Sick Leave"))).toBeVisible()
    await expect(element(by.text("Personal Leave"))).toBeVisible()
    await expect(element(by.text("Holiday"))).toBeVisible()
    await expect(element(by.text("Other"))).toBeVisible()
  })
})
