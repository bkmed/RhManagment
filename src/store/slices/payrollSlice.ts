import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payroll } from '../../database/schema';

interface PayrollState {
    items: Payroll[];
}

const initialState: PayrollState = {
    items: [],
};

const payrollSlice = createSlice({
    name: 'payroll',
    initialState,
    reducers: {
        setPayroll: (state, action: PayloadAction<Payroll[]>) => {
            state.items = action.payload;
        },
        addPayroll: (state, action: PayloadAction<Payroll>) => {
            state.items.push(action.payload);
        },
        updatePayroll: (state, action: PayloadAction<Payroll>) => {
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deletePayroll: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((p) => p.id !== action.payload);
        },
    },
});

export const { setPayroll, addPayroll, updatePayroll, deletePayroll } = payrollSlice.actions;

export const selectAllPayroll = (state: { payroll: PayrollState }) => state.payroll.items;

export default payrollSlice.reducer;
