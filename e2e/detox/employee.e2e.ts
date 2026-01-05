import { device, element, by, expect } from "detox";
describe("Employee Management", () => {
  beforeAll(async () => {
    await device.launchApp()
    // Login first
    await element(by.placeholder("Enter your email")).typeText("admin@example.com")
    await element(by.placeholder("Enter your password")).typeText("password123")
    await element(by.text("Login")).tap()
  })

  beforeEach(async () => {
    // Navigate to Employees tab before each test
    await element(by.text("Employees")).tap()
  })

  it("should display employee list", async () => {
    await expect(element(by.text("Employee Directory"))).toBeVisible()
    await expect(element(by.text("John Doe"))).toBeVisible()
    await expect(element(by.text("Jane Smith"))).toBeVisible()
  })

  it("should search for employees", async () => {
    await element(by.placeholder("Search employees...")).typeText("John")
    await expect(element(by.text("John Doe"))).toBeVisible()
    await expect(element(by.text("Jane Smith"))).not.toBeVisible()

    // Clear search
    await element(by.placeholder("Search employees...")).clearText()
  })

  it("should filter employees by department", async () => {
    await element(by.text("Filter")).tap()
    await element(by.text("Engineering")).tap()
    await element(by.text("Apply")).tap()

    await expect(element(by.text("John Doe"))).toBeVisible()
    await expect(element(by.text("Jane Smith"))).not.toBeVisible()

    // Clear filter
    await element(by.text("Clear Filters")).tap()
  })

  it("should view employee details", async () => {
    await element(by.text("John Doe")).tap()

    await expect(element(by.text("Employee Profile"))).toBeVisible()
    await expect(element(by.text("John Doe"))).toBeVisible()
    await expect(element(by.text("Software Developer"))).toBeVisible()
    await expect(element(by.text("Engineering"))).toBeVisible()
    await expect(element(by.text("Contact Information"))).toBeVisible()
    await expect(element(by.text("john.doe@example.com"))).toBeVisible()

    // Go back to list
    await element(by.text("Back")).tap()
  })

  it("should add a new employee", async () => {
    await element(by.text("Add Employee")).tap()

    await expect(element(by.text("Add New Employee"))).toBeVisible()

    await element(by.placeholder("First Name")).typeText("Robert")
    await element(by.placeholder("Last Name")).typeText("Johnson")
    await element(by.placeholder("Email")).typeText("robert.johnson@example.com")
    await element(by.placeholder("Position")).typeText("Project Manager")
    await element(by.placeholder("Department")).typeText("Management")
    await element(by.placeholder("Phone (optional)")).typeText("555-123-4567")

    await element(by.text("Save")).tap()

    // Check if we're back at the employee list
    await expect(element(by.text("Employee Directory"))).toBeVisible()
    await expect(element(by.text("Robert Johnson"))).toBeVisible()
  })

  it("should edit an employee", async () => {
    await element(by.text("Robert Johnson")).tap()
    await element(by.text("Edit")).tap()

    await element(by.placeholder("Position")).clearText()
    await element(by.placeholder("Position")).typeText("Senior Project Manager")

    await element(by.text("Save Changes")).tap()

    await expect(element(by.text("Senior Project Manager"))).toBeVisible()

    // Go back to list
    await element(by.text("Back")).tap()
  })
})
