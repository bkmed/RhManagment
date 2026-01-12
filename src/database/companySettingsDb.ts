import { store } from '../store';
import {
  updateCompanySettings as updateCompanySettingsAction,
  selectCompanySettingsByCompanyId,
} from '../store/slices/companySettingsSlice';
import { CompanySettings } from './schema';

export const companySettingsDb = {
  getSettingsByCompany: async (companyId: string): Promise<CompanySettings> => {
    const state = store.getState();
    const existing = selectCompanySettingsByCompanyId(state, companyId);
    if (existing) {
      return existing;
    }

    // Return default settings if none exist
    const now = new Date().toISOString();
    return {
      id: Date.now().toString(),
      companyId,
      maxPermissionHours: 2,
      createdAt: now,
      updatedAt: now,
    };
  },

  saveSettings: async (settings: CompanySettings): Promise<void> => {
    const now = new Date().toISOString();
    const updatedSettings = {
      ...settings,
      updatedAt: now,
    };
    store.dispatch(updateCompanySettingsAction(updatedSettings));
  },

  /**
   * Helper to get max permission hours directly
   */
  getMaxPermissionHours: async (companyId?: string): Promise<number> => {
    if (!companyId) return 2; // Default
    const settings = await companySettingsDb.getSettingsByCompany(companyId);
    return settings.maxPermissionHours;
  },
};
