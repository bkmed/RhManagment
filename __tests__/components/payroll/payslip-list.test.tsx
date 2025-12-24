import { render, fireEvent } from "@testing-library/react-native"
import { PayslipList } from "../../../src/packages/payroll/src/components/payslip-list"
import * as payslipService from "../../../src/packages/payroll/src/payslip-service"

// Mock the payslip service
jest.mock("../../../packages/payroll/src/payslip-service", () => ({
  getPayslipsByEmployeeId: jest.fn(),
  getAllPayslips: jest.fn(),
  markPayslipAsViewed: jest.fn(),
}))

describe("PayslipList", () => {
  const mockUser = {
    uid: "user123",
    email: "test@example.com",
    displayName: "Test User",
    role: "employee",
  }

  const mockPayslips = [
    {
      id: "payslip1",
      employeeId: "user123",
      period: { month: 1, year: 2023 },
      issueDate: "2023-01-31T00:00:00.000Z",
      grossSalary: 5000,
      netSalary: 3500,
      items: [],
      status: "published",
      viewedByEmployee: true,
    },
    {
      id: "payslip2",
      employeeId: "user123",
      period: { month: 2, year: 2023 },
      issueDate: "2023-02-28T00:00:00.000Z",
      grossSalary: 5000,
      netSalary: 3500,
      items: [],
      status: "published",
      viewedByEmployee: false,
    },
  ]

  const mockOnViewPayslip = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correctly with payslips", async () => {
    const mockGetPayslips = payslipService.getPayslipsByEmployeeId as jest.Mock
    mockGetPayslips.mockResolvedValueOnce(mockPayslips)

    const { getByText, findByText } = render(<PayslipList user={mockUser} onViewPayslip={mockOnViewPayslip} />)

    expect(getByText("Loading payslips...")).toBeTruthy()

    await findByText("Payslips")
    expect(getByText("January 2023")).toBeTruthy()
    expect(getByText("February 2023")).toBeTruthy()
    expect(getByText("3500.00 €")).toBeTruthy()
  })

  it("shows empty state when no payslips", async () => {
    const mockGetPayslips = payslipService.getPayslipsByEmployeeId as jest.Mock
    mockGetPayslips.mockResolvedValueOnce([])

    const { findByText } = render(<PayslipList user={mockUser} onViewPayslip={mockOnViewPayslip} />)

    await findByText("No payslips available")
  })

  it("marks payslip as viewed when clicked", async () => {
    const mockGetPayslips = payslipService.getPayslipsByEmployeeId as jest.Mock
    mockGetPayslips.mockResolvedValueOnce(mockPayslips)

    const mockMarkAsViewed = payslipService.markPayslipAsViewed as jest.Mock
    mockMarkAsViewed.mockResolvedValueOnce(undefined)

    const { findAllByText } = render(<PayslipList user={mockUser} onViewPayslip={mockOnViewPayslip} />)

    const viewButtons = await findAllByText("View")
    fireEvent.press(viewButtons[1]) // Press the second payslip's view button (unread)

    expect(mockMarkAsViewed).toHaveBeenCalledWith("payslip2")
    expect(mockOnViewPayslip).toHaveBeenCalledWith(mockPayslips[1])
  })
})
