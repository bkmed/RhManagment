import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '../../database/schema';

interface EmployeesState {
  items: Employee[];
}

const initialState: EmployeesState = {
  items: [],
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action: PayloadAction<Employee[]>) => {
      state.items = action.payload;
    },
    addEmployee: (
      state,
      action: PayloadAction<{ employee: Employee; companyName?: string }>,
    ) => {
      const { employee, companyName } = action.payload;
      const companyPrefix = companyName
        ? companyName.toLowerCase().replace(/\s+/g, '-')
        : 'unknown';

      // Count existing employees in the same company (or prefix)
      const companyEmployees = state.items.filter(e =>
        e.tag?.startsWith(companyPrefix),
      );
      const rank = companyEmployees.length + 1;

      const newEmployee = {
        ...employee,
        tag: `${companyPrefix}_${rank}`,
      };
      state.items.push(newEmployee);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.items.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(e => e.id !== action.payload);
    },
  },
});

export const { setEmployees, addEmployee, updateEmployee, deleteEmployee } =
  employeesSlice.actions;

export const selectAllEmployees = (state: { employees: EmployeesState }) =>
  state.employees.items;

export const selectEmployeeById =
  (id: string) => (state: { employees: EmployeesState }) =>
    state.employees.items.find(e => e.id === id);

export default employeesSlice.reducer;
