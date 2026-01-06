import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Department } from '../../database/schema';

interface DepartmentsState {
  items: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: DepartmentsState = {
  items: [],
  loading: false,
  error: null,
};

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.items = action.payload;
    },
    addDepartment: (state, action: PayloadAction<Department>) => {
      state.items.push(action.payload);
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
      const index = state.items.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteDepartment: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(d => d.id !== action.payload);
    },
  },
});

export const {
  setDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} = departmentsSlice.actions;

export const selectAllDepartments = (state: {
  departments: DepartmentsState;
}) => state.departments.items;

export default departmentsSlice.reducer;
