export const palette = {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  accent: '#F5A623',
  error: '#E74C3C',
  success: '#2ECC71',
  warning: '#F1C40F',
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F8F9FA',
  gray200: '#E1E4E8',
  gray300: '#D1D5DB',
  gray500: '#7F8C8D',
  gray800: '#333333',
  gray900: '#1A1A1A',
  darkSurface: '#2C2C2E',
  darkBackground: '#1C1C1E',
};

const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

const textVariants = {
  header: {
    fontSize: 28,
    fontWeight: '700' as '700',
    letterSpacing: 0.5,
  },
  subheader: {
    fontSize: 20,
    fontWeight: '600' as '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as '600',
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
    text: palette.gray800,
    subText: palette.gray500,
    border: palette.gray200,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    warningBackground: '#FFF3CD',
    primaryBackground: '#E3F2FD',
    successBackground: '#D4EDDA',
    card: palette.white,
    notification: palette.error,
  },
  spacing,
  shadows,
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: palette.gray800 },
    subheader: { ...textVariants.subheader, color: palette.gray800 },
    body: { ...textVariants.body, color: palette.gray800 },
    caption: { ...textVariants.caption, color: palette.gray500 },
    button: { ...textVariants.button, color: palette.white },
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    background: palette.darkBackground,
    surface: palette.darkSurface,
    text: palette.white,
    subText: palette.gray300,
    border: palette.gray500,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    warningBackground: '#4A4434',
    primaryBackground: '#1E3A5F',
    successBackground: '#1E3D2F',
    card: palette.darkSurface,
    notification: palette.error,
  },
  spacing,
  shadows,
  textVariants: {
    ...textVariants,
    header: { ...textVariants.header, color: palette.gray100 },
    subheader: { ...textVariants.subheader, color: palette.gray100 },
    body: { ...textVariants.body, color: palette.gray100 },
    caption: { ...textVariants.caption, color: palette.gray300 },
    button: { ...textVariants.button, color: palette.white },
  },
};

export type Theme = typeof lightTheme;
export const theme = lightTheme; // Default export for backward compatibility during refactor
