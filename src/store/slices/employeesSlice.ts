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
        addEmployee: (state, action: PayloadAction<Employee>) => {
            state.items.push(action.payload);
        },
        updateEmployee: (state, action: PayloadAction<Employee>) => {
            const index = state.items.findIndex((e) => e.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteEmployee: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((e) => e.id !== action.payload);
        },
    },
});

export const { setEmployees, addEmployee, updateEmployee, deleteEmployee } = employeesSlice.actions;

export const selectAllEmployees = (state: { employees: EmployeesState }) => state.employees.items;

export const selectEmployeeById = (id: number) => (state: { employees: EmployeesState }) =>
    state.employees.items.find((e) => e.id === id);

export default employeesSlice.reducer;
