import { storageService } from './storage';

const MENU_PREFS_KEY = 'menu_preferences';

export interface MenuPreferences {
  hiddenItems: string[]; // List of keys of items to hide
  customOrder?: string[]; // List of keys in custom order (optional)
}

export const menuPreferencesService = {
  getPreferences: async (): Promise<MenuPreferences> => {
    const json = storageService.getString(MENU_PREFS_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return { hiddenItems: [], customOrder: [] };
  },

  savePreferences: async (prefs: MenuPreferences): Promise<void> => {
    storageService.setString(MENU_PREFS_KEY, JSON.stringify(prefs));
  },

  toggleItemVisibility: async (key: string): Promise<string[]> => {
    const prefs = await menuPreferencesService.getPreferences();
    let hidden = [...prefs.hiddenItems];
    if (hidden.includes(key)) {
      hidden = hidden.filter(k => k !== key);
    } else {
      hidden.push(key);
    }
    await menuPreferencesService.savePreferences({
      ...prefs,
      hiddenItems: hidden,
    });
    return hidden;
  },

  isHidden: (key: string, preferences: MenuPreferences): boolean => {
    return preferences.hiddenItems.includes(key);
  },

  reorderItems: async (newOrder: string[]): Promise<void> => {
    const prefs = await menuPreferencesService.getPreferences();
    await menuPreferencesService.savePreferences({
      ...prefs,
      customOrder: newOrder,
    });
  },
};
