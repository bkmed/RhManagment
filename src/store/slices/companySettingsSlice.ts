import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompanySettings } from '../../database/schema';

interface CompanySettingsState {
    settings: CompanySettings[];
    loading: boolean;
    error: string | null;
}

const initialState: CompanySettingsState = {
    settings: [],
    loading: false,
    error: null,
};

const companySettingsSlice = createSlice({
    name: 'companySettings',
    initialState,
    reducers: {
        setCompanySettings: (state, action: PayloadAction<CompanySettings[]>) => {
            state.settings = action.payload;
        },
        updateCompanySettings: (state, action: PayloadAction<CompanySettings>) => {
            const index = state.settings.findIndex((s) => s.companyId === action.payload.companyId);
            if (index !== -1) {
                state.settings[index] = action.payload;
            } else {
                state.settings.push(action.payload);
            }
        },
    },
});

export const { setCompanySettings, updateCompanySettings } = companySettingsSlice.actions;

export const selectAllCompanySettings = (state: { companySettings: CompanySettingsState }) => state.companySettings.settings;
export const selectCompanySettingsByCompanyId = (state: { companySettings: CompanySettingsState }, companyId: number) =>
    state.companySettings.settings.find(s => s.companyId === companyId);

export default companySettingsSlice.reducer;
