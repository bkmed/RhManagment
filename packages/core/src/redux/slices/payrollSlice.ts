import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  createPayslip,
  getPayslipById,
  getPayslipsByEmployeeId,
  getAllPayslips,
  updatePayslip,
  markPayslipAsViewed,
  publishPayslip,
  uploadPayslipPdf,
  type Payslip,
} from "../../../../payroll/src/payslip-service"

interface PayrollState {
  employeePayslips: Payslip[]
  allPayslips: Payslip[]
  selectedPayslip: Payslip | null
  loading: boolean
  error: string | null
}

const initialState: PayrollState = {
  employeePayslips: [],
  allPayslips: [],
  selectedPayslip: null,
  loading: false,
  error: null,
}

export const fetchEmployeePayslips = createAsyncThunk(
  "payroll/fetchEmployeePayslips",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const payslips = await getPayslipsByEmployeeId(employeeId)
      return payslips
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch payslips")
    }
  },
)

export const fetchAllPayslips = createAsyncThunk(
  "payroll/fetchAllPayslips",
  async (status?: "draft" | "published", { rejectWithValue }) => {
    try {
      const payslips = await getAllPayslips(status)
      return payslips
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch payslips")
    }
  },
)

export const fetchPayslipById = createAsyncThunk(
  "payroll/fetchPayslipById",
  async (payslipId: string, { rejectWithValue }) => {
    try {
      const payslip = await getPayslipById(payslipId)
      return payslip
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch payslip")
    }
  },
)

export const createNewPayslip = createAsyncThunk(
  "payroll/createPayslip",
  async (payslipData: Omit<Payslip, "id" | "viewedByEmployee">, { rejectWithValue }) => {
    try {
      const payslip = await createPayslip(payslipData)
      return payslip
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create payslip")
    }
  },
)

export const updatePayslipData = createAsyncThunk(
  "payroll/updatePayslip",
  async ({ id, data }: { id: string; data: Partial<Payslip> }, { rejectWithValue }) => {
    try {
      const payslip = await updatePayslip(id, data)
      return payslip
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update payslip")
    }
  },
)

export const markPayslipViewed = createAsyncThunk(
  "payroll/markViewed",
  async (payslipId: string, { rejectWithValue }) => {
    try {
      await markPayslipAsViewed(payslipId)
      return payslipId
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark payslip as viewed")
    }
  },
)

export const publishDraftPayslip = createAsyncThunk(
  "payroll/publishPayslip",
  async (payslipId: string, { rejectWithValue }) => {
    try {
      const payslip = await publishPayslip(payslipId)
      return payslip
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to publish payslip")
    }
  },
)

export const uploadPayslipDocument = createAsyncThunk(
  "payroll/uploadPdf",
  async ({ id, file }: { id: string; file: File | Blob }, { rejectWithValue }) => {
    try {
      const downloadURL = await uploadPayslipPdf(id, file)
      return { id, pdfUrl: downloadURL }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload payslip PDF")
    }
  },
)

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearPayrollError: (state) => {
      state.error = null
    },
    clearSelectedPayslip: (state) => {
      state.selectedPayslip = null
    },
  },
  extraReducers: (builder) => {
    // Fetch employee payslips
    builder.addCase(fetchEmployeePayslips.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchEmployeePayslips.fulfilled, (state, action: PayloadAction<Payslip[]>) => {
      state.loading = false
      state.employeePayslips = action.payload
    })
    builder.addCase(fetchEmployeePayslips.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch all payslips
    builder.addCase(fetchAllPayslips.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchAllPayslips.fulfilled, (state, action: PayloadAction<Payslip[]>) => {
      state.loading = false
      state.allPayslips = action.payload
    })
    builder.addCase(fetchAllPayslips.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch payslip by ID
    builder.addCase(fetchPayslipById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchPayslipById.fulfilled, (state, action: PayloadAction<Payslip | null>) => {
      state.loading = false
      state.selectedPayslip = action.payload
    })
    builder.addCase(fetchPayslipById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create payslip
    builder.addCase(createNewPayslip.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createNewPayslip.fulfilled, (state, action: PayloadAction<Payslip>) => {
      state.loading = false
      state.allPayslips.push(action.payload)
    })
    builder.addCase(createNewPayslip.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update payslip
    builder.addCase(updatePayslipData.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updatePayslipData.fulfilled, (state, action: PayloadAction<Payslip>) => {
      state.loading = false
      if (state.selectedPayslip && state.selectedPayslip.id === action.payload.id) {
        state.selectedPayslip = action.payload
      }
      state.employeePayslips = state.employeePayslips.map((payslip) =>
        payslip.id === action.payload.id ? action.payload : payslip,
      )
      state.allPayslips = state.allPayslips.map((payslip) =>
        payslip.id === action.payload.id ? action.payload : payslip,
      )
    })
    builder.addCase(updatePayslipData.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Mark payslip as viewed
    builder.addCase(markPayslipViewed.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(markPayslipViewed.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false
      if (state.selectedPayslip && state.selectedPayslip.id === action.payload) {
        state.selectedPayslip.viewedByEmployee = true
      }
      state.employeePayslips = state.employeePayslips.map((payslip) =>
        payslip.id === action.payload ? { ...payslip, viewedByEmployee: true } : payslip,
      )
    })
    builder.addCase(markPayslipViewed.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Publish payslip
    builder.addCase(publishDraftPayslip.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(publishDraftPayslip.fulfilled, (state, action: PayloadAction<Payslip>) => {
      state.loading = false
      if (state.selectedPayslip && state.selectedPayslip.id === action.payload.id) {
        state.selectedPayslip = action.payload
      }
      state.allPayslips = state.allPayslips.map((payslip) =>
        payslip.id === action.payload.id ? action.payload : payslip,
      )
    })
    builder.addCase(publishDraftPayslip.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Upload payslip PDF
    builder.addCase(uploadPayslipDocument.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(uploadPayslipDocument.fulfilled, (state, action: PayloadAction<{ id: string; pdfUrl: string }>) => {
      state.loading = false
      if (state.selectedPayslip && state.selectedPayslip.id === action.payload.id) {
        state.selectedPayslip.pdfUrl = action.payload.pdfUrl
      }
      state.employeePayslips = state.employeePayslips.map((payslip) =>
        payslip.id === action.payload.id ? { ...payslip, pdfUrl: action.payload.pdfUrl } : payslip,
      )
      state.allPayslips = state.allPayslips.map((payslip) =>
        payslip.id === action.payload.id ? { ...payslip, pdfUrl: action.payload.pdfUrl } : payslip,
      )
    })
    builder.addCase(uploadPayslipDocument.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { clearPayrollError, clearSelectedPayslip } = payrollSlice.actions
export default payrollSlice.reducer
