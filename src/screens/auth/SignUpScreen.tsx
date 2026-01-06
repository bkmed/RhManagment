import React, { useState, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Theme } from '../../theme';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { Dropdown } from '../../components/Dropdown';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const SignUpScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [country, setCountry] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    country?: string;
    birthDate?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = t('signUp.errorEmptyName');
      isValid = false;
    }

    if (!country) {
      newErrors.country = t('common.required');
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = t('signUp.errorEmptyEmail');
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = t('signUp.errorInvalidEmail');
      isValid = false;
    }

    if (!password) {
      newErrors.password = t('signUp.errorEmptyPassword');
      isValid = false;
    } else if (!isValidPassword(password)) {
      newErrors.password = t('signUp.errorWeakPassword');
      isValid = false;
    }

    // Age validation
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18 || age > 62) {
      newErrors.birthDate = t('employees.ageInvalid');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Register with pending status and additional fields
      const user = await authService.register(
        name,
        email,
        password,
        'employee',
        {
          country,
          birthDate: birthDate.toISOString().split('T')[0],
        },
      );

      await signUp(user);
    } catch (error: any) {
      notificationService.showAlert(
        t('signUp.errorTitle'),
        error.message || t('signUp.errorRegistrationFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('signUp.title')} subtitle={t('signUp.subtitle')}>
      <AuthInput
        label={t('signUp.nameLabel')}
        value={name}
        onChangeText={setName}
        placeholder={t('signUp.namePlaceholder')}
        error={errors.name}
      />

      <View style={{ marginBottom: theme.spacing.m }}>
        <DateTimePickerField
          label={t('employees.birthDate')}
          value={birthDate}
          onChange={setBirthDate}
          mode="date"
          maximumDate={new Date()}
          error={errors.birthDate}
        />
      </View>

      <View style={{ marginBottom: theme.spacing.m }}>
        <Dropdown
          label={t('employees.country')}
          data={[
            { label: 'France', value: 'France' },
            { label: 'Tunisie', value: 'Tunisia' },
            { label: 'Allemagne', value: 'Germany' },
            { label: 'Espagne', value: 'Spain' },
            { label: 'UK', value: 'UK' },
            { label: 'USA', value: 'USA' },
          ]}
          value={country}
          onSelect={setCountry}
          placeholder={t('employees.countryPlaceholder')}
        />
        {errors.country ? (
          <Text
            style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}
          >
            {errors.country}
          </Text>
        ) : null}
      </View>

      <AuthInput
        label={t('signUp.emailLabel')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('signUp.emailPlaceholder')}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />

      <AuthInput
        label={t('signUp.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('signUp.passwordPlaceholder')}
        secureTextEntry
        error={errors.password}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>{t('signUp.signUpButton')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('signUp.hasAccount')} </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>{t('signUp.signIn')}</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m, // Consistent with AuthInput
      alignItems: 'center',
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.s,
    },
    footerText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    link: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
