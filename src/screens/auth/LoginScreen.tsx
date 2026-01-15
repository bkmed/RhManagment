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
import { isValidEmail } from '../../utils/validation';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';

export const LoginScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = t('login.errorEmptyEmail');
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = t('login.errorInvalidEmail');
      isValid = false;
    }

    if (!password) {
      newErrors.password = t('login.errorEmptyPassword');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await authService.login(email, password);
      await signIn(user);
    } catch (error: any) {
      notificationService.showAlert(
        t('login.errorTitle'),
        error.message || t('login.errorLoginFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t('login.welcomeBack')}
      subtitle={t('login.signInSubtitle')}
    >
      <AuthInput
        label={t('login.emailLabel')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('login.emailPlaceholder')}
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />

      <AuthInput
        label={t('login.passwordLabel')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('login.passwordPlaceholder')}
        secureTextEntry
        error={errors.password}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>
          {t('login.forgotPassword')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>{t('login.signInButton')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>{t('login.tipTitle')}</Text>
        <View style={styles.demoTable}>
          <View style={styles.demoRow}>
            <Text style={[styles.demoCell, styles.demoHeader]}>
              {t('login.role')}
            </Text>
            <Text style={[styles.demoCell, styles.demoHeader]}>
              {t('login.emailLabel')}
            </Text>
            <Text style={[styles.demoCell, styles.demoHeader]}>
              {t('login.passwordLabel')}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.demoRow}
            onPress={() => {
              setEmail('admin@demo.com');
              setPassword('admin123');
            }}
          >
            <Text style={styles.demoCell}>{t('login.admin')}</Text>
            <Text style={styles.demoCell}>admin@demo.com</Text>
            <Text style={styles.demoCell}>admin123</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoRow}
            onPress={() => {
              setEmail('rh@demo.com');
              setPassword('rh123');
            }}
          >
            <Text style={styles.demoCell}>{t('login.hr')}</Text>
            <Text style={styles.demoCell}>rh@demo.com</Text>
            <Text style={styles.demoCell}>rh123</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoRow}
            onPress={() => {
              setEmail('chef@demo.com');
              setPassword('chef123');
            }}
          >
            <Text style={styles.demoCell}>{t('login.team')}</Text>
            <Text style={styles.demoCell}>chef@demo.com</Text>
            <Text style={styles.demoCell}>chef123</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoRow}
            onPress={() => {
              setEmail('employee@demo.com');
              setPassword('employee123');
            }}
          >
            <Text style={styles.demoCell}>{t('login.user')}</Text>
            <Text style={styles.demoCell}>employee@demo.com</Text>
            <Text style={styles.demoCell}>employee123</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('login.noAccount')} </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>{t('login.signUp')}</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.l,
    },
    forgotPasswordText: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m, // Consistent with AuthInput
      alignItems: 'center',
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
    tipContainer: {
      backgroundColor: theme.colors.primaryBackground, // Use primary background for tip
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.l,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30', // Transparent primary border
    },
    tipTitle: {
      ...theme.textVariants.caption,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    tipText: {
      ...theme.textVariants.caption,
      color: theme.colors.text,
      textAlign: 'center',
    },
    demoTable: {
      width: '100%',
      marginTop: theme.spacing.s,
    },
    demoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary + '15',
    },
    demoCell: {
      ...theme.textVariants.caption,
      fontSize: 10,
      flex: 1,
      color: theme.colors.text,
      textAlign: 'center',
    },
    demoHeader: {
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
  });
