import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

declare const document: any;

export const WebThemeHandler = () => {
  const { theme } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Update body background
      document.body.style.backgroundColor = theme.colors.background;

      // Update app root background if it exists
      const appRoot = document.getElementById('app-root');
      if (appRoot) {
        appRoot.style.backgroundColor = theme.colors.background;
      }
    }
  }, [theme.colors.background]);

  return null;
};
