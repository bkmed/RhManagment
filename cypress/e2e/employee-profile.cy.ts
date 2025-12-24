describe("Employee Profile", () => {
  beforeEach(() => {
    // Mock login
    cy.visit("/")
    cy.window().then((win) => {
      // Mock authentication state
      win.localStorage.setItem("isAuthenticated", "true")
      win.localStorage.setItem("userRole", "employee")
    })
    cy.visit("/profile")
  })

  it("should display employee profile", () => {
    cy.contains("Contact Information").should("be.visible")
    cy.contains("Employment Details").should("be.visible")
    cy.contains("Edit Profile").should("be.visible")
  })

  it("should open edit form when edit button is clicked", () => {
    cy.contains("Edit Profile").click()
    cy.contains("Edit Profile").should("be.visible")
    cy.get('input[placeholder="First Name"]').should("be.visible")
    cy.get('input[placeholder="Last Name"]').should("be.visible")
    cy.contains("button", "Save Changes").should("be.visible")
    cy.contains("button", "Cancel").should("be.visible")
  })

  it("should cancel editing and return to view mode", () => {
    cy.contains("Edit Profile").click()
    cy.contains("button", "Cancel").click()
    cy.contains("Contact Information").should("be.visible")
    cy.contains("Employment Details").should("be.visible")
  })
})
