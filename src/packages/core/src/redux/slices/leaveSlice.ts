import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  createLeaveRequest,
  getLeaveRequestById,
  getLeaveRequestsByEmployeeId,
  getPendingLeaveRequests,
  updateLeaveRequestStatus,
  type LeaveRequest,
  type LeaveStatus,
} from "../../../../leave/src/leave-service"

interface LeaveState {
  employeeLeaves: LeaveRequest[]
  pendingLeaves: LeaveRequest[]
  selectedLeave: LeaveRequest | null
  loading: boolean
  error: string | null
}

const initialState: LeaveState = {
  employeeLeaves: [],
  pendingLeaves: [],
  selectedLeave: null,
  loading: false,
  error: null,
}

export const fetchEmployeeLeaves = createAsyncThunk(
  "leave/fetchEmployeeLeaves",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const leaves = await getLeaveRequestsByEmployeeId(employeeId)
      return leaves
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch leave requests")
    }
  },
)

export const fetchPendingLeaves = createAsyncThunk("leave/fetchPendingLeaves", async (_, { rejectWithValue }) => {
  try {
    const leaves = await getPendingLeaveRequests()
    return leaves
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch pending leave requests")
  }
})

export const fetchLeaveById = createAsyncThunk("leave/fetchLeaveById", async (leaveId: string, { rejectWithValue }) => {
  try {
    const leave = await getLeaveRequestById(leaveId)
    return leave
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch leave request")
  }
})

export const submitLeaveRequest = createAsyncThunk(
  "leave/submitRequest",
  async (leaveData: Omit<LeaveRequest, "id" | "status" | "createdAt" | "updatedAt">, { rejectWithValue }) => {
    try {
      const leave = await createLeaveRequest(leaveData)
      return leave
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to submit leave request")
    }
  },
)

export const updateLeaveStatus = createAsyncThunk(
  "leave/updateStatus",
  async (
    {
      leaveId,
      status,
      approvedBy,
      rejectionReason,
    }: { leaveId: string; status: LeaveStatus; approvedBy?: string; rejectionReason?: string },
    { rejectWithValue },
  ) => {
    try {
      const leave = await updateLeaveRequestStatus(leaveId, status, approvedBy, rejectionReason)
      return leave
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update leave status")
    }
  },
)

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null
    },
    clearSelectedLeave: (state) => {
      state.selectedLeave = null
    },
  },
  extraReducers: (builder) => {
    // Fetch employee leaves
    builder.addCase(fetchEmployeeLeaves.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchEmployeeLeaves.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
      state.loading = false
      state.employeeLeaves = action.payload
    })
    builder.addCase(fetchEmployeeLeaves.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch pending leaves
    builder.addCase(fetchPendingLeaves.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchPendingLeaves.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
      state.loading = false
      state.pendingLeaves = action.payload
    })
    builder.addCase(fetchPendingLeaves.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch leave by ID
    builder.addCase(fetchLeaveById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchLeaveById.fulfilled, (state, action: PayloadAction<LeaveRequest | null>) => {
      state.loading = false
      state.selectedLeave = action.payload
    })
    builder.addCase(fetchLeaveById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Submit leave request
    builder.addCase(submitLeaveRequest.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(submitLeaveRequest.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
      state.loading = false
      state.employeeLeaves.push(action.payload)
    })
    builder.addCase(submitLeaveRequest.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update leave status
    builder.addCase(updateLeaveStatus.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateLeaveStatus.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
      state.loading = false
      if (state.selectedLeave && state.selectedLeave.id === action.payload.id) {
        state.selectedLeave = action.payload
      }
      state.employeeLeaves = state.employeeLeaves.map((leave) =>
        leave.id === action.payload.id ? action.payload : leave,
      )
      state.pendingLeaves = state.pendingLeaves.filter((leave) => leave.id !== action.payload.id)
    })
    builder.addCase(updateLeaveStatus.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { clearLeaveError, clearSelectedLeave } = leaveSlice.actions
export default leaveSlice.reducer
