import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text
        style={[styles.label, error ? { color: theme.colors.error } : null]}
      >
        {label}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.subText}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.m, // Rounder corners
      padding: Platform.OS === 'web' ? 12 : theme.spacing.m,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1.5, // Slightly clear border
      borderColor: theme.colors.border,
      ...Platform.select({
        web: {
          outlineStyle: 'none', // Remove default web outline
        },
      }),
    },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.error + '10', // 10% opacity hex
    },
    errorText: {
      ...theme.textVariants.caption,
      color: theme.colors.error,
      marginTop: 4,
      marginLeft: 4,
      fontWeight: '500',
    },
  });
