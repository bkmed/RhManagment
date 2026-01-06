import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  lightTheme,
  darkTheme,
  premiumTheme,
  Theme,
  createCustomTheme,
} from '../theme';
import { storageService } from '../services/storage';

const THEME_KEY = 'user_theme_preference';
const CUSTOM_COLORS_KEY = 'user_custom_colors';
export type ThemeMode = 'light' | 'dark' | 'premium' | 'custom';

export type CustomColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
};

type ThemeContextType = {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  customColors: CustomColors;
  setCustomColor: (key: keyof CustomColors, color: string) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeMode: 'light',
  setThemeMode: () => {},
  customColors: {
    primary: '#0052CC',
    secondary: '#00A3BF',
    background: '#121212',
    surface: '#1D1D1F',
  },
  setCustomColor: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [customColors, setCustomColors] = useState<CustomColors>({
    primary: '#0052CC',
    secondary: '#00A3BF',
    background: '#121212',
    surface: '#1D1D1F',
  });

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    const savedTheme = (await storageService.getString(THEME_KEY)) as ThemeMode;
    if (
      savedTheme &&
      ['light', 'dark', 'premium', 'custom'].includes(savedTheme)
    ) {
      setThemeModeState(savedTheme);
    } else {
      setThemeModeState(systemScheme === 'dark' ? 'dark' : 'light');
    }

    const savedColors = await storageService.getString(CUSTOM_COLORS_KEY);
    if (savedColors) {
      try {
        setCustomColors(JSON.parse(savedColors));
      } catch (e) {
        console.error('Error parsing custom colors', e);
      }
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    storageService.setString(THEME_KEY, mode);
  };

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'premium', 'custom'];
    const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const setCustomColor = (key: keyof CustomColors, color: string) => {
    const nextColors = { ...customColors, [key]: color };
    setCustomColors(nextColors);
    storageService.setString(CUSTOM_COLORS_KEY, JSON.stringify(nextColors));
  };

  const theme =
    themeMode === 'premium'
      ? premiumTheme
      : themeMode === 'dark'
      ? darkTheme
      : themeMode === 'custom'
      ? createCustomTheme(customColors)
      : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode,
        customColors,
        setCustomColor,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
