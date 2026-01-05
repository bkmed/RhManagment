/// <reference types="cypress" />
describe("Employee Profile", () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem("isAuthenticated", "true")
      win.localStorage.setItem("userRole", "employee")
      win.localStorage.setItem("userId", "testUserId")
    })

    // Mock API response for employee data
    cy.intercept("GET", "**/employees*", {
      body: {
        id: "emp123",
        userId: "testUserId",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        position: "Software Developer",
        department: "Engineering",
        hireDate: "2022-01-15",
        phone: "123-456-7890",
        address: "123 Main St, City, Country",
        emergencyContact: {
          name: "Jane Doe",
          relationship: "Spouse",
          phone: "987-654-3210",
        },
      },
    }).as("getEmployeeData")

    cy.visit("/profile")
    cy.wait("@getEmployeeData")
  })

  it("should display employee profile information", () => {
    cy.contains("John Doe").should("be.visible")
    cy.contains("Software Developer").should("be.visible")
    cy.contains("Engineering").should("be.visible")
    cy.contains("Contact Information").should("be.visible")
    cy.contains("john.doe@example.com").should("be.visible")
    cy.contains("123-456-7890").should("be.visible")
    cy.contains("123 Main St, City, Country").should("be.visible")
  })

  it("should display emergency contact information", () => {
    cy.contains("Emergency Contact").should("be.visible")
    cy.contains("Jane Doe").should("be.visible")
    cy.contains("Spouse").should("be.visible")
    cy.contains("987-654-3210").should("be.visible")
  })

  it("should open edit form when edit button is clicked", () => {
    cy.contains("Edit Profile").click()
    cy.contains("Edit Profile").should("be.visible")
    cy.get('input[value="John"]').should("be.visible")
    cy.get('input[value="Doe"]').should("be.visible")
    cy.get('input[value="123-456-7890"]').should("be.visible")
    cy.get('input[value="123 Main St, City, Country"]').should("be.visible")
  })

  it("should update profile when form is submitted", () => {
    cy.intercept("PATCH", "**/employees/emp123", {
      body: {
        id: "emp123",
        userId: "testUserId",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        position: "Senior Software Developer",
        department: "Engineering",
        hireDate: "2022-01-15",
        phone: "555-123-4567",
        address: "456 New St, City, Country",
      },
    }).as("updateEmployee")

    cy.contains("Edit Profile").click()
    cy.get('input[value="123-456-7890"]').clear().type("555-123-4567")
    cy.get('input[value="123 Main St, City, Country"]').clear().type("456 New St, City, Country")
    cy.contains("button", "Save Changes").click()

    cy.wait("@updateEmployee")
    cy.contains("555-123-4567").should("be.visible")
    cy.contains("456 New St, City, Country").should("be.visible")
  })

  it("should cancel editing and return to view mode", () => {
    cy.contains("Edit Profile").click()
    cy.get('input[value="John"]').clear().type("Johnny")
    cy.contains("button", "Cancel").click()
    cy.contains("John Doe").should("be.visible") // Should show original name
    cy.contains("Contact Information").should("be.visible")
  })
})
