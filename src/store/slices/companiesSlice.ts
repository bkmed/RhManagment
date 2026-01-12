import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../../database/schema';

interface CompaniesState {
  items: Company[];
  selectedCompanyId: string | null;
}

const initialState: CompaniesState = {
  items: [],
  selectedCompanyId: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.items = action.payload;
    },
    addCompany: (state, action: PayloadAction<Company>) => {
      state.items.push(action.payload);
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCompany: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(c => c.id !== action.payload);
      if (state.selectedCompanyId === action.payload) {
        state.selectedCompanyId = null;
      }
    },
    setSelectedCompanyId: (state, action: PayloadAction<string | null>) => {
      state.selectedCompanyId = action.payload;
    },
  },
});

export const {
  setCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
  setSelectedCompanyId,
} = companiesSlice.actions;

export const selectAllCompanies = (state: { companies: CompaniesState }) =>
  state.companies.items;
export const selectSelectedCompanyId = (state: { companies: CompaniesState }) =>
  state.companies.selectedCompanyId;

export const selectSelectedCompany = (state: { companies: CompaniesState }) =>
  state.companies.items.find(c => c.id === state.companies.selectedCompanyId);

export const selectCompanyById =
  (id: string) => (state: { companies: CompaniesState }) =>
    state.companies.items.find(c => c.id === id);

export default companiesSlice.reducer;
