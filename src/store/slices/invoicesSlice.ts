import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Invoice } from '../../database/schema';

interface InvoicesState {
  items: Invoice[];
}

const initialState: InvoicesState = {
  items: [],
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.items = action.payload;
    },
    addInvoice: (state, action: PayloadAction<Invoice>) => {
      state.items.push(action.payload);
    },
    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const index = state.items.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteInvoice: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
  },
});

export const { setInvoices, addInvoice, updateInvoice, deleteInvoice } =
  invoicesSlice.actions;

export const selectAllInvoices = (state: { invoices: InvoicesState }) =>
  state.invoices.items;

export const selectPendingInvoices = (state: { invoices: InvoicesState }) =>
  state.invoices.items.filter(i => i.status === 'pending');

export default invoicesSlice.reducer;
