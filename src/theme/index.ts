export const palette = {
  primary: '#0052CC', // Deeper, more professional blue
  secondary: '#00A3BF', // Sophisticated teal
  accent: '#FF8B00', // Clearer orange
  error: '#DE350B', // Slightly more subtle red
  success: '#36B37E', // More professional green
  warning: '#FFAB00', // Better yellow
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F4F5F7', // Lighter background
  gray200: '#EBECF0',
  gray300: '#DFE1E6',
  gray500: '#7A869A', // Better contrast for subtext
  gray800: '#172B4D', // Deep navy for titles
  gray900: '#091E42', // Near black navy
  darkSurface: '#1D1D1F',
  darkBackground: '#121212',
};

const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

import { Platform } from 'react-native';

const shadows = {
  small: {
    shadowColor: '#091E42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    ...(Platform.OS === 'web' && { boxShadow: '0px 2px 3px rgba(9, 30, 66, 0.1)' }),
  },
  medium: {
    shadowColor: '#091E42',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    ...(Platform.OS === 'web' && { boxShadow: '0px 8px 12px rgba(9, 30, 66, 0.15)' }),
  },
  large: {
    shadowColor: '#091E42',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    ...(Platform.OS === 'web' && { boxShadow: '0px 12px 16px rgba(9, 30, 66, 0.2)' }),
  },
};

const textVariants = {
  header: {
    fontSize: 28,
    fontWeight: '700' as '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600' as '600',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  button: {
    fontSize: 14,
    fontWeight: '600' as '600',
    letterSpacing: 0.2,
  },
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    background: palette.gray100,
    surface: palette.white,
    text: palette.gray900,
    subText: palette.gray500,
    border: palette.gray200,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    warningBackground: '#FFFAE6',
    primaryBackground: '#DEEBFF',
    successBackground: '#E3FCEF',
    card: palette.white,
    notification: palette.error,
  },
  spacing,
  shadows,
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: palette.gray900 },
    subheader: { ...textVariants.subheader, color: palette.gray800 },
    body: { ...textVariants.body, color: palette.gray800 },
    caption: { ...textVariants.caption, color: palette.gray500 },
    button: { ...textVariants.button, color: palette.white },
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#4C9AFF', // Lighter blue for dark mode accessibility
    secondary: palette.secondary,
    accent: palette.accent,
    background: palette.darkBackground,
    surface: palette.darkSurface,
    text: '#E3E3E3',
    subText: '#A5ADBA',
    border: '#334454',
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    warningBackground: '#2D2200',
    primaryBackground: '#0747A6',
    successBackground: '#006644',
    card: palette.darkSurface,
    notification: palette.error,
  },
  spacing,
  shadows,
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: '#FFFFFF' },
    subheader: { ...textVariants.subheader, color: '#E3E3E3' },
    body: { ...textVariants.body, color: '#E3E3E3' },
    caption: { ...textVariants.caption, color: '#A5ADBA' },
    button: { ...textVariants.button, color: palette.white },
  },
};

export const premiumTheme = {
  dark: true,
  colors: {
    primary: '#D4AF37', // Gold
    secondary: '#C0C0C0', // Silver
    accent: '#FFD700', // Bright Gold
    background: '#0B0D17', // Deep Space Navy
    surface: '#161B22', // Darker Galaxy
    text: '#F0E68C', // Khaki/Light Gold text
    subText: '#8B8682', // Muted stone
    border: '#30363D', // Subtle gold-tinted border
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    warningBackground: '#2D2200',
    primaryBackground: '#3D3004', // Dark Gold Background
    successBackground: '#006644',
    card: '#1C2128',
    notification: '#D4AF37',
  },
  spacing,
  shadows: {
    ...shadows,
    medium: {
      shadowColor: '#D4AF37',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
      ...(Platform.OS === 'web' && { boxShadow: '0px 4px 10px rgba(212, 175, 55, 0.3)' }),
    },
  },
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: '#D4AF37', letterSpacing: 1 },
    subheader: { ...textVariants.subheader, color: '#F0E68C' },
    body: { ...textVariants.body, color: '#F0E68C' },
    caption: { ...textVariants.caption, color: '#8B8682' },
    button: { ...textVariants.button, color: '#0B0D17' },
  },
};

export const createCustomTheme = (customColors: {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
}): Theme => {
  const isDark = true; // Most custom themes look better in dark mode base
  return {
    dark: isDark,
    colors: {
      primary: customColors.primary,
      secondary: customColors.secondary,
      accent: palette.accent,
      background: customColors.background,
      surface: customColors.surface,
      text: '#FFFFFF',
      subText: palette.gray500,
      border: palette.gray800,
      error: palette.error,
      success: palette.success,
      warning: palette.warning,
      warningBackground: '#2D2200',
      primaryBackground: customColors.primary + '33',
      successBackground: '#E3FCEF',
      card: customColors.surface,
      notification: customColors.primary,
    },
    spacing,
    shadows,
    textVariants: {
      ...textVariants,
      header: { ...textVariants.header, color: '#FFFFFF' },
      subheader: { ...textVariants.subheader, color: '#E3E3E3' },
      body: { ...textVariants.body, color: '#E3E3E3' },
      caption: { ...textVariants.caption, color: palette.gray500 },
      button: { ...textVariants.button, color: '#FFFFFF' },
    },
  };
};

export type Theme = typeof lightTheme;
export const theme = lightTheme; // Default export for backward compatibility during refactor
