import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, premiumTheme, Theme } from '../theme';
import { storageService } from '../services/storage';

const THEME_KEY = 'user_theme_preference';
export type ThemeMode = 'light' | 'dark' | 'premium';

type ThemeContextType = {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void; // Keeps toggle for simple use cases
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeMode: 'light',
  setThemeMode: () => { },
  toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    const savedTheme = (await storageService.getString(THEME_KEY)) as ThemeMode;
    if (savedTheme && ['light', 'dark', 'premium'].includes(savedTheme)) {
      setThemeModeState(savedTheme);
    } else {
      setThemeModeState(systemScheme === 'dark' ? 'dark' : 'light');
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    storageService.setString(THEME_KEY, mode);
  };

  const toggleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'premium'];
    const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const theme = themeMode === 'premium' ? premiumTheme : (themeMode === 'dark' ? darkTheme : lightTheme);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
