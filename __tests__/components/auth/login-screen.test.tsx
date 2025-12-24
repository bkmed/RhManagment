import { render, fireEvent, waitFor } from "@testing-library/react-native"
import { LoginScreen } from "../../../src/packages/auth/src/components/login-screen"
import * as authService from "../../../src/packages/auth/src/auth-service"

// Mock the auth service
jest.mock("../../../packages/auth/src/auth-service", () => ({
  signIn: jest.fn(),
}))

describe("LoginScreen", () => {
  const mockOnLoginSuccess = jest.fn()
  const mockOnRegisterPress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correctly", () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} onRegisterPress={mockOnRegisterPress} />,
    )

    expect(getByText("Login to HR Portal")).toBeTruthy()
    expect(getByPlaceholderText("Enter your email")).toBeTruthy()
    expect(getByPlaceholderText("Enter your password")).toBeTruthy()
    expect(getByText("Login")).toBeTruthy()
    expect(getByText("Register")).toBeTruthy()
  })

  it("shows validation error when form is empty", () => {
    const { getByText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} onRegisterPress={mockOnRegisterPress} />,
    )

    fireEvent.press(getByText("Login"))
    expect(getByText("Email and password are required")).toBeTruthy()
  })

  it("calls signIn with correct credentials", async () => {
    const mockSignIn = authService.signIn as jest.Mock
    mockSignIn.mockResolvedValueOnce({ uid: "123", email: "test@example.com", role: "employee" })

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} onRegisterPress={mockOnRegisterPress} />,
    )

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "test@example.com")
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "password123")
    fireEvent.press(getByText("Login"))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })
  })

  it("shows error message when login fails", async () => {
    const mockSignIn = authService.signIn as jest.Mock
    mockSignIn.mockRejectedValueOnce(new Error("Invalid credentials"))

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} onRegisterPress={mockOnRegisterPress} />,
    )

    fireEvent.changeText(getByPlaceholderText("Enter your email"), "test@example.com")
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "password123")
    fireEvent.press(getByText("Login"))

    await waitFor(() => {
      expect(getByText("Invalid credentials")).toBeTruthy()
      expect(mockOnLoginSuccess).not.toHaveBeenCalled()
    })
  })

  it("navigates to register screen when register is pressed", () => {
    const { getByText } = render(
      <LoginScreen onLoginSuccess={mockOnLoginSuccess} onRegisterPress={mockOnRegisterPress} />,
    )

    fireEvent.press(getByText("Register"))
    expect(mockOnRegisterPress).toHaveBeenCalled()
  })
})
