import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Theme } from '../theme';

export interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryPickerProps {
  value: string;
  onSelect: (country: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

// Comprehensive list of countries with flags
const COUNTRIES: Country[] = [
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
];

export const CountryPicker: React.FC<CountryPickerProps> = ({
  value,
  onSelect,
  label,
  placeholder,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCountry = COUNTRIES.find(c => c.name === value);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const query = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      country =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleSelect = (country: Country) => {
    onSelect(country.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <View style={styles.selectorContent}>
          {selectedCountry ? (
            <>
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.selectedText}>{selectedCountry.name}</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>
              {placeholder || t('common.selectCountry') || 'Select a country'}
            </Text>
          )}
        </View>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('common.selectCountry') || 'Select Country'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('common.search') || 'Search...'}
              placeholderTextColor={theme.colors.subText}
            />

            <ScrollView style={styles.countriesList}>
              {filteredCountries.map(country => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    value === country.name && styles.countryItemSelected,
                  ]}
                  onPress={() => handleSelect(country)}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text
                    style={[
                      styles.countryName,
                      value === country.name && styles.countryNameSelected,
                    ]}
                  >
                    {country.name}
                  </Text>
                  {value === country.name && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: Platform.OS === 'web' ? 0 : theme.spacing.m,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 48,
    },
    selectorDisabled: {
      opacity: 0.5,
    },
    selectorContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    flag: {
      fontSize: 24,
      marginRight: theme.spacing.s,
    },
    selectedText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    placeholderText: {
      fontSize: 16,
      color: theme.colors.subText,
    },
    arrow: {
      fontSize: 12,
      color: theme.colors.subText,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.l,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      width: '100%',
      maxWidth: 500,
      maxHeight: '80%',
      ...theme.shadows.large,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.l,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: theme.colors.subText,
      padding: 4,
    },
    searchInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      margin: theme.spacing.l,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      fontSize: 16,
    },
    countriesList: {
      maxHeight: 400,
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.m,
      paddingHorizontal: theme.spacing.l,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    countryItemSelected: {
      backgroundColor: `${theme.colors.primary}15`,
    },
    countryFlag: {
      fontSize: 24,
      marginRight: theme.spacing.m,
    },
    countryName: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    countryNameSelected: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    checkmark: {
      fontSize: 20,
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
  });
