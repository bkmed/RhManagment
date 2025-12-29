import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company } from '../../database/schema';

interface CompaniesState {
    items: Company[];
}

const initialState: CompaniesState = {
    items: [],
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
            const index = state.items.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteCompany: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((c) => c.id !== action.payload);
        },
    },
});

export const { setCompanies, addCompany, updateCompany, deleteCompany } = companiesSlice.actions;

export const selectAllCompanies = (state: { companies: CompaniesState }) => state.companies.items;

export const selectCompanyById = (id: number) => (state: { companies: CompaniesState }) =>
    state.companies.items.find((c) => c.id === id);

export default companiesSlice.reducer;
