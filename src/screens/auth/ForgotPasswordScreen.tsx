import React, { useState, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../services/notificationService';
import { Theme } from '../../theme';
import { isValidEmail } from '../../utils/validation';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setEmailError(t('forgotPassword.errorEmptyEmail'));
      return;
    } else if (!isValidEmail(email)) {
      setEmailError(t('forgotPassword.errorInvalidEmail'));
      return;
    }
    setEmailError('');

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      notificationService.showAlert(
        t('forgotPassword.successTitle'),
        t('forgotPassword.successMessage'),
      );
      navigation.goBack();
    }, 1500);
  };

  return (
    <AuthLayout
      title={t('forgotPassword.title')}
      subtitle={t('forgotPassword.subtitle')}
    >
      <AuthInput
        label={t('forgotPassword.emailLabel')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('forgotPassword.emailPlaceholder')}
        autoCapitalize="none"
        keyboardType="email-address"
        error={emailError}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>
            {t('forgotPassword.sendInstructionsButton')}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>
          {t('forgotPassword.backToLogin')}
        </Text>
      </TouchableOpacity>
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
    backButton: {
      alignItems: 'center',
    },
    backButtonText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
  });
