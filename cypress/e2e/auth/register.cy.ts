describe("Authentication - Register", () => {
  beforeEach(() => {
    cy.visit("/register")
  })

  it("should display register form", () => {
    cy.contains("Create an Account")
    cy.get('input[placeholder="Enter your full name"]').should("be.visible")
    cy.get('input[placeholder="Enter your email"]').should("be.visible")
    cy.get('input[placeholder="Create a password"]').should("be.visible")
    cy.get('input[placeholder="Confirm your password"]').should("be.visible")
    cy.contains("button", "Register").should("be.visible")
  })

  it("should show validation error when submitting empty form", () => {
    cy.contains("button", "Register").click()
    cy.contains("All fields are required").should("be.visible")
  })

  it("should show password mismatch error", () => {
    cy.get('input[placeholder="Enter your full name"]').type("Test User")
    cy.get('input[placeholder="Enter your email"]').type("test@example.com")
    cy.get('input[placeholder="Create a password"]').type("password123")
    cy.get('input[placeholder="Confirm your password"]').type("password456")
    cy.contains("button", "Register").click()
    cy.contains("Passwords do not match").should("be.visible")
  })

  it("should register successfully with valid data", () => {
    // This test requires a mock or a test user in your Firebase
    cy.intercept("POST", "**/identitytoolkit/v3/relyingparty/signupNewUser*", {
      body: {
        kind: "identitytoolkit#SignupNewUserResponse",
        localId: "testUserId",
        email: "newuser@example.com",
        displayName: "New User",
        idToken: "fake-token",
      },
    }).as("registerRequest")

    cy.get('input[placeholder="Enter your full name"]').type("New User")
    cy.get('input[placeholder="Enter your email"]').type("newuser@example.com")
    cy.get('input[placeholder="Create a password"]').type("password123")
    cy.get('input[placeholder="Confirm your password"]').type("password123")
    cy.contains("button", "Register").click()

    cy.wait("@registerRequest")
    cy.url().should("include", "/dashboard")
  })

  it("should navigate back to login page", () => {
    cy.contains("Login").click()
    cy.contains("Login to HR Portal").should("be.visible")
  })
})
