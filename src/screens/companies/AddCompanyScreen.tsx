import React, { useState, useMemo, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { companiesDb } from '../../database/companiesDb';
import { useModal } from '../../context/ModalContext';
import { notificationService } from '../../services/notificationService';
import { Theme } from '../../theme';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { CountryPicker } from '../../components/CountryPicker';
import { isValidEmail } from '../../utils/validation';

export const AddCompanyScreen = ({ navigation, route }: any) => {
  const editId = route?.params?.id;
  const isEdit = !!editId;

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = useContext(WebNavigationContext);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      loadCompanyData();
    }
  }, [editId]);

  const loadCompanyData = async () => {
    try {
      const company = await companiesDb.getById(editId);
      if (company) {
        setName(company.name);
        setAddress(company.address || '');
        setCountry(company.country || '');
        setEmail(company.email || '');
        setPhone(company.phone || '');
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = t('common.required');

    // Email validation
    if (email && !isValidEmail(email)) {
      newErrors.email = t('common.invalidEmail') || 'Invalid email address';
    }

    // Phone validation
    if (phone && !/^[\d\s\-+]+$/.test(phone)) {
      newErrors.phone = t('common.invalidPhone') || 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const companyData = {
        name,
        address,
        country,
        email,
        phone,
        logo: '', // Optional or future enhancement
      };

      if (isEdit) {
        await companiesDb.update(editId, companyData);
      } else {
        await companiesDb.add(companyData);
      }

      showModal({
        title: t('common.success'),
        message: isEdit ? t('companies.updateSuccess') || t('common.saved') : t('companies.saveSuccess') || t('common.saved'),
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => {
              if (Platform.OS === 'web') {
                setActiveTab('Companies', 'CompanyList');
              } else {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Main', { screen: 'Companies' });
                }
              }
            },
          },
        ],
      });
    } catch (error: any) {
      console.error('Error saving company:', error);
      const errorMessage = error?.message || t('common.saveError');
      notificationService.showAlert(t('common.error'), errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isEdit
              ? t('companies.edit') || 'Edit Company'
              : t('companies.add') || t('companies.title')}
          </Text>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {t('companies.name') || t('common.name')}
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder={t('companies.namePlaceholder') || 'e.g. Acme Corp'}
              placeholderTextColor={theme.colors.subText}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {t('companies.address') || t('common.address')}
            </Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder={
                t('companies.addressPlaceholder') || 'e.g. 123 Business St'
              }
              placeholderTextColor={theme.colors.subText}
            />
          </View>

          {/* Country */}
          <View style={styles.fieldContainer}>
            <CountryPicker
              label={t('companies.country') || 'Country'}
              value={country}
              onSelect={setCountry}
              placeholder={
                t('companies.countryPlaceholder') || 'Select a country'
              }
            />
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {t('companies.email') || t('common.email')}
            </Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder={
                t('companies.emailPlaceholder') || 'e.g. contact@acme.com'
              }
              placeholderTextColor={theme.colors.subText}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {t('companies.phone') || t('common.phone')}
            </Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={text => {
                setPhone(text);
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              keyboardType="phone-pad"
              placeholder={
                t('companies.phonePlaceholder') || 'e.g. +1 234 567 890'
              }
              placeholderTextColor={theme.colors.subText}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      ...theme.shadows.medium,
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: theme.spacing.l,
      textAlign: 'center',
    },
    fieldContainer: {
      marginBottom: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      alignItems: 'center',
      marginTop: theme.spacing.m,
      ...theme.shadows.small,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
