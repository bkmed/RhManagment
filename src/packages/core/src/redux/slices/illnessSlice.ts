import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import {
  createIllnessRecord,
  getIllnessRecordById,
  getIllnessRecordsByEmployeeId,
  getAllActiveIllnessRecords,
  updateIllnessRecord,
  uploadMedicalCertificate,
  getIllnessStatistics,
  type IllnessRecord,
} from "../../../../illness/src/illness-service"

interface IllnessState {
  employeeIllnesses: IllnessRecord[]
  activeIllnesses: IllnessRecord[]
  selectedIllness: IllnessRecord | null
  statistics: {
    totalActive: number
    totalRecovered: number
    totalChronic: number
    byType: Record<string, number>
  } | null
  loading: boolean
  error: string | null
}

const initialState: IllnessState = {
  employeeIllnesses: [],
  activeIllnesses: [],
  selectedIllness: null,
  statistics: null,
  loading: false,
  error: null,
}

export const fetchEmployeeIllnesses = createAsyncThunk(
  "illness/fetchEmployeeIllnesses",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const illnesses = await getIllnessRecordsByEmployeeId(employeeId)
      return illnesses
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch illness records")
    }
  },
)

export const fetchActiveIllnesses = createAsyncThunk("illness/fetchActiveIllnesses", async (_, { rejectWithValue }) => {
  try {
    const illnesses = await getAllActiveIllnessRecords()
    return illnesses
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch active illness records")
  }
})

export const fetchIllnessById = createAsyncThunk(
  "illness/fetchIllnessById",
  async (illnessId: string, { rejectWithValue }) => {
    try {
      const illness = await getIllnessRecordById(illnessId)
      return illness
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch illness record")
    }
  },
)

export const createNewIllnessRecord = createAsyncThunk(
  "illness/createIllness",
  async (illnessData: Omit<IllnessRecord, "id" | "createdAt" | "updatedAt">, { rejectWithValue }) => {
    try {
      const illness = await createIllnessRecord(illnessData)
      return illness
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create illness record")
    }
  },
)

export const updateIllnessData = createAsyncThunk(
  "illness/updateIllness",
  async ({ id, data }: { id: string; data: Partial<IllnessRecord> & { updatedBy: string } }, { rejectWithValue }) => {
    try {
      const illness = await updateIllnessRecord(id, data)
      return illness
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update illness record")
    }
  },
)

export const uploadMedicalDoc = createAsyncThunk(
  "illness/uploadMedicalCertificate",
  async (
    {
      illnessId,
      file,
      fileName,
      updatedBy,
    }: { illnessId: string; file: File | Blob; fileName: string; updatedBy: string },
    { rejectWithValue },
  ) => {
    try {
      const downloadURL = await uploadMedicalCertificate(illnessId, file, fileName, updatedBy)
      return { illnessId, downloadURL }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload medical certificate")
    }
  },
)

export const fetchIllnessStats = createAsyncThunk("illness/fetchStatistics", async (_, { rejectWithValue }) => {
  try {
    const stats = await getIllnessStatistics()
    return stats
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch illness statistics")
  }
})

const illnessSlice = createSlice({
  name: "illness",
  initialState,
  reducers: {
    clearIllnessError: (state) => {
      state.error = null
    },
    clearSelectedIllness: (state) => {
      state.selectedIllness = null
    },
  },
  extraReducers: (builder) => {
    // Fetch employee illnesses
    builder.addCase(fetchEmployeeIllnesses.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchEmployeeIllnesses.fulfilled, (state, action: PayloadAction<IllnessRecord[]>) => {
      state.loading = false
      state.employeeIllnesses = action.payload
    })
    builder.addCase(fetchEmployeeIllnesses.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch active illnesses
    builder.addCase(fetchActiveIllnesses.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchActiveIllnesses.fulfilled, (state, action: PayloadAction<IllnessRecord[]>) => {
      state.loading = false
      state.activeIllnesses = action.payload
    })
    builder.addCase(fetchActiveIllnesses.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch illness by ID
    builder.addCase(fetchIllnessById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchIllnessById.fulfilled, (state, action: PayloadAction<IllnessRecord | null>) => {
      state.loading = false
      state.selectedIllness = action.payload
    })
    builder.addCase(fetchIllnessById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create illness record
    builder.addCase(createNewIllnessRecord.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createNewIllnessRecord.fulfilled, (state, action: PayloadAction<IllnessRecord>) => {
      state.loading = false
      state.employeeIllnesses.push(action.payload)
      if (action.payload.status === "active") {
        state.activeIllnesses.push(action.payload)
      }
    })
    builder.addCase(createNewIllnessRecord.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update illness record
    builder.addCase(updateIllnessData.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateIllnessData.fulfilled, (state, action: PayloadAction<IllnessRecord>) => {
      state.loading = false
      if (state.selectedIllness && state.selectedIllness.id === action.payload.id) {
        state.selectedIllness = action.payload
      }
      state.employeeIllnesses = state.employeeIllnesses.map((illness) =>
        illness.id === action.payload.id ? action.payload : illness,
      )

      // Update active illnesses list if status changed
      if (action.payload.status === "active") {
        const exists = state.activeIllnesses.some((illness) => illness.id === action.payload.id)
        if (!exists) {
          state.activeIllnesses.push(action.payload)
        } else {
          state.activeIllnesses = state.activeIllnesses.map((illness) =>
            illness.id === action.payload.id ? action.payload : illness,
          )
        }
      } else {
        state.activeIllnesses = state.activeIllnesses.filter((illness) => illness.id !== action.payload.id)
      }
    })
    builder.addCase(updateIllnessData.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Upload medical certificate
    builder.addCase(uploadMedicalDoc.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(
      uploadMedicalDoc.fulfilled,
      (state, action: PayloadAction<{ illnessId: string; downloadURL: string }>) => {
        state.loading = false
        if (state.selectedIllness && state.selectedIllness.id === action.payload.illnessId) {
          state.selectedIllness.medicalCertificateUrl = action.payload.downloadURL
        }
        state.employeeIllnesses = state.employeeIllnesses.map((illness) =>
          illness.id === action.payload.illnessId
            ? { ...illness, medicalCertificateUrl: action.payload.downloadURL }
            : illness,
        )
        state.activeIllnesses = state.activeIllnesses.map((illness) =>
          illness.id === action.payload.illnessId
            ? { ...illness, medicalCertificateUrl: action.payload.downloadURL }
            : illness,
        )
      },
    )
    builder.addCase(uploadMedicalDoc.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch illness statistics
    builder.addCase(fetchIllnessStats.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchIllnessStats.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false
      state.statistics = action.payload
    })
    builder.addCase(fetchIllnessStats.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { clearIllnessError, clearSelectedIllness } = illnessSlice.actions
export default illnessSlice.reducer
