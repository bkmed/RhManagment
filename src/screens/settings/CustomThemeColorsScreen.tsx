import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { Dropdown } from '../../components/Dropdown';

const COLOR_PALETTE = [
  { label: 'Deep Blue', value: '#0052CC' },
  { label: 'Royal Blue', value: '#172B4D' },
  { label: 'Teal', value: '#00A3BF' },
  { label: 'Emerald', value: '#36B37E' },
  { label: 'Purple', value: '#6554C0' },
  { label: 'Rose', value: '#FF5630' },
  { label: 'Amber', value: '#FFAB00' },
  { label: 'Slate', value: '#1D1D1F' },
  { label: 'Black', value: '#121212' },
  { label: 'White', value: '#FFFFFF' },
];

export const CustomThemeColorsScreen = () => {
  const { theme, customColors, setCustomColor } = useTheme() as any;
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const colorFields = [
    { key: 'primary', label: t('settings.primaryColor') || 'Primary Color' },
    {
      key: 'secondary',
      label: t('settings.secondaryColor') || 'Secondary Color',
    },
    {
      key: 'background',
      label: t('settings.backgroundColor') || 'Background Color',
    },
    { key: 'surface', label: t('settings.surfaceColor') || 'Surface Color' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.customizeColors') || 'Customize Colors'}
        </Text>
        <View style={styles.card}>
          {colorFields.map((field, index) => (
            <View
              key={field.key}
              style={[
                styles.colorPickerRow,
                index !== colorFields.length - 1 && styles.borderBottom,
              ]}
            >
              <Dropdown
                label={field.label}
                data={COLOR_PALETTE}
                value={customColors[field.key]}
                onSelect={val => setCustomColor(field.key, val)}
              />
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: customColors[field.key] },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    section: {
      padding: theme.spacing.m,
    },
    sectionTitle: {
      ...theme.textVariants.body,
      fontWeight: 'bold',
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
      textTransform: 'uppercase',
      fontSize: 12,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      overflow: 'hidden',
      ...theme.shadows.small,
    },
    colorPickerRow: {
      padding: theme.spacing.m,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    colorPreview: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      marginTop: theme.spacing.s,
    },
  });
