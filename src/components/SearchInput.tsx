import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.subText}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearButton}
        >
          <View style={styles.clearIcon}>
            {/* Simple X icon representation */}
            <View
              style={[styles.xLine, { transform: [{ rotate: '45deg' }] }]}
            />
            <View
              style={[styles.xLine, { transform: [{ rotate: '-45deg' }] }]}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.m,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingRight: 40, // Space for clear button
    },
    clearButton: {
      position: 'absolute',
      right: 10,
      top: 12,
      padding: 5,
    },
    clearIcon: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.subText,
      borderRadius: 10,
    },
    xLine: {
      position: 'absolute',
      width: 12,
      height: 2,
      backgroundColor: theme.colors.surface,
    },
  });
