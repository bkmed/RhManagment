import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  permissionsService,
  PermissionStatus,
} from '../../services/permissions';
import { Theme } from '../../theme';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇹🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const ProfileScreen = ({ navigation }: any) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus>('unavailable');
  const [notificationPermission, setNotificationPermission] =
    useState<PermissionStatus>('unavailable');
  const [calendarPermission, setCalendarPermission] =
    useState<PermissionStatus>('unavailable');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const camera = await permissionsService.checkCameraPermission();
    const notification = await permissionsService.checkNotificationPermission();
    const calendar = await permissionsService.checkCalendarPermission();
    setCameraPermission(camera);
    setNotificationPermission(notification);
    setCalendarPermission(calendar);
  };

  const handleLanguageChange = async (langCode: string) => {
    try {
      await i18n.changeLanguage(langCode);
      storageService.setString('user-language', langCode);
      setCurrentLanguage(langCode);

      // Web doesn't need RTL handling via I18nManager
      // CSS direction is handled automatically by the browser
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.languageChangeError'));
    }
  };

  const handleCameraPermission = async (value: boolean) => {
    if (!value) {
      setCameraPermission('denied');
      return;
    }

    const status = await permissionsService.requestCameraPermission();
    setCameraPermission(status);

    if (status === 'blocked') {
      Alert.alert(
        t('profile.permissionBlocked'),
        t('profile.permissionBlockedMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('profile.openSettings'),
            onPress: () => permissionsService.openAppSettings(),
          },
        ],
      );
    }
  };

  const handleNotificationPermission = async (value: boolean) => {
    if (!value) {
      setNotificationPermission('denied');
      return;
    }

    const status = await permissionsService.requestNotificationPermission();
    setNotificationPermission(status);

    if (status === 'blocked') {
      Alert.alert(
        t('profile.permissionBlocked'),
        t('profile.permissionBlockedMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('profile.openSettings'),
            onPress: () => permissionsService.openAppSettings(),
          },
        ],
      );
    }
  };

  const handleCalendarPermission = async (value: boolean) => {
    if (!value) {
      setCalendarPermission('denied');
      return;
    }

    const status = await permissionsService.requestCalendarPermission();
    setCalendarPermission(status);

    if (status === 'blocked') {
      Alert.alert(
        t('profile.permissionBlocked'),
        t('profile.permissionBlockedMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('profile.openSettings'),
            onPress: () => permissionsService.openAppSettings(),
          },
        ],
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(navigation);
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.logoutError'));
    }
  };

  const getPermissionStatusText = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return t('profile.permissionGranted');
      case 'denied':
        return t('profile.permissionDenied');
      case 'blocked':
        return t('profile.permissionBlocked');
      case 'limited':
        return t('profile.permissionLimited');
      default:
        return t('profile.permissionUnavailable');
    }
  };

  const getPermissionStatusColor = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return theme.colors.success;
      case 'denied':
        return theme.colors.warning;
      case 'blocked':
        return theme.colors.error;
      default:
        return theme.colors.subText;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageRow,
                currentLanguage === lang.code && styles.languageRowActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={styles.languageName}>{lang.name}</Text>
              </View>
              {currentLanguage === lang.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.permissions')}</Text>

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>{t('profile.camera')}</Text>
              <Text
                style={[
                  styles.permissionStatus,
                  { color: getPermissionStatusColor(cameraPermission) },
                ]}
              >
                {getPermissionStatusText(cameraPermission)}
              </Text>
            </View>
            {cameraPermission !== 'unavailable' && (
              <Switch
                value={cameraPermission === 'granted'}
                onValueChange={handleCameraPermission}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            )}
          </View>

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>
                {t('profile.notifications')}
              </Text>
              <Text
                style={[
                  styles.permissionStatus,
                  { color: getPermissionStatusColor(notificationPermission) },
                ]}
              >
                {getPermissionStatusText(notificationPermission)}
              </Text>
            </View>
            {notificationPermission !== 'unavailable' && (
              <Switch
                value={notificationPermission === 'granted'}
                onValueChange={handleNotificationPermission}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            )}
          </View>

          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>
                {t('profile.calendar')}
              </Text>
              <Text
                style={[
                  styles.permissionStatus,
                  { color: getPermissionStatusColor(calendarPermission) },
                ]}
              >
                {getPermissionStatusText(calendarPermission)}
              </Text>
            </View>
            {calendarPermission !== 'unavailable' && (
              <Switch
                value={calendarPermission === 'granted'}
                onValueChange={handleCalendarPermission}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            )}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.appearance')}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{t('profile.darkMode')}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
      paddingBottom: theme.spacing.xl,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      marginBottom: theme.spacing.m,
      color: theme.colors.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.s,
    },
    label: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    languageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.s,
      borderRadius: theme.spacing.s,
      marginBottom: theme.spacing.xs,
    },
    languageRowActive: {
      backgroundColor: theme.colors.primaryBackground,
    },
    languageInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    languageFlag: {
      fontSize: 24,
      marginRight: theme.spacing.m,
    },
    languageName: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      fontSize: 16,
    },
    checkmark: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    permissionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    permissionInfo: {
      flex: 1,
    },
    permissionLabel: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    permissionStatus: {
      ...theme.textVariants.caption,
      fontSize: 12,
    },
    permissionButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.spacing.s,
    },
    permissionButtonText: {
      ...theme.textVariants.button,
      color: '#FFFFFF',
      fontSize: 14,
    },
    logoutButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    logoutText: {
      ...theme.textVariants.button,
      color: theme.colors.error,
    },
  });
