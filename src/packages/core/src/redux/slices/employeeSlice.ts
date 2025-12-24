import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  createEmployee,
  getEmployeeById,
  getEmployeeByUserId,
  getAllEmployees,
  updateEmployee,
  uploadEmployeeDocument,
  type Employee,
} from "../../../../employees/src/employee-service"

interface EmployeeState {
  currentEmployee: Employee | null
  employees: Employee[]
  selectedEmployee: Employee | null
  loading: boolean
  error: string | null
}

const initialState: EmployeeState = {
  currentEmployee: null,
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
}

export const fetchCurrentEmployee = createAsyncThunk(
  "employee/fetchCurrent",
  async (userId: string, { rejectWithValue }) => {
    try {
      const employee = await getEmployeeByUserId(userId)
      return employee
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch employee")
    }
  },
)

export const fetchAllEmployees = createAsyncThunk("employee/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const employees = await getAllEmployees()
    return employees
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch employees")
  }
})

export const fetchEmployeeById = createAsyncThunk(
  "employee/fetchById",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const employee = await getEmployeeById(employeeId)
      return employee
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch employee")
    }
  },
)

export const createNewEmployee = createAsyncThunk(
  "employee/create",
  async (employeeData: Omit<Employee, "id">, { rejectWithValue }) => {
    try {
      const employee = await createEmployee(employeeData)
      return employee
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create employee")
    }
  },
)

export const updateEmployeeProfile = createAsyncThunk(
  "employee/update",
  async ({ id, data }: { id: string; data: Partial<Employee> }, { rejectWithValue }) => {
    try {
      const employee = await updateEmployee(id, data)
      return employee
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update employee")
    }
  },
)

export const uploadEmployeeDoc = createAsyncThunk(
  "employee/uploadDocument",
  async (
    {
      employeeId,
      file,
      fileName,
      fileType,
    }: { employeeId: string; file: File | Blob; fileName: string; fileType: string },
    { rejectWithValue },
  ) => {
    try {
      const downloadURL = await uploadEmployeeDocument(employeeId, file, fileName, fileType)
      return { employeeId, downloadURL, fileName, fileType }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload document")
    }
  },
)

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    clearEmployeeError: (state) => {
      state.error = null
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null
    },
  },
  extraReducers: (builder) => {
    // Fetch current employee
    builder.addCase(fetchCurrentEmployee.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchCurrentEmployee.fulfilled, (state, action: PayloadAction<Employee | null>) => {
      state.loading = false
      state.currentEmployee = action.payload
    })
    builder.addCase(fetchCurrentEmployee.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch all employees
    builder.addCase(fetchAllEmployees.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchAllEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
      state.loading = false
      state.employees = action.payload
    })
    builder.addCase(fetchAllEmployees.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch employee by ID
    builder.addCase(fetchEmployeeById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchEmployeeById.fulfilled, (state, action: PayloadAction<Employee | null>) => {
      state.loading = false
      state.selectedEmployee = action.payload
    })
    builder.addCase(fetchEmployeeById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create employee
    builder.addCase(createNewEmployee.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createNewEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
      state.loading = false
      state.employees.push(action.payload)
    })
    builder.addCase(createNewEmployee.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update employee
    builder.addCase(updateEmployeeProfile.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateEmployeeProfile.fulfilled, (state, action: PayloadAction<Employee>) => {
      state.loading = false
      if (state.currentEmployee && state.currentEmployee.id === action.payload.id) {
        state.currentEmployee = action.payload
      }
      if (state.selectedEmployee && state.selectedEmployee.id === action.payload.id) {
        state.selectedEmployee = action.payload
      }
      state.employees = state.employees.map((employee) =>
        employee.id === action.payload.id ? action.payload : employee,
      )
    })
    builder.addCase(updateEmployeeProfile.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Upload document
    builder.addCase(uploadEmployeeDoc.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(uploadEmployeeDoc.fulfilled, (state) => {
      state.loading = false
    })
    builder.addCase(uploadEmployeeDoc.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { clearEmployeeError, clearSelectedEmployee } = employeeSlice.actions
export default employeeSlice.reducer
