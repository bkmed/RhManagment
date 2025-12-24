import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  I18nManager,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
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

      // Set RTL for Arabic on native platforms
      const shouldBeRTL = langCode === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        Alert.alert(
          t('profile.restartRequired'),
          t('profile.restartRequiredMessage'),
          [{ text: t('common.ok') }],
        );
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.languageChangeError'));
    }
  };

  const handleCameraPermission = async (value: boolean) => {
    if (!value) {
      // User is trying to disable - just update UI
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
      // User is trying to disable - just update UI
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
      // User is trying to disable - just update UI
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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={currentLanguage}
              onValueChange={(itemValue) => handleLanguageChange(itemValue)}
              style={styles.picker}
              dropdownIconColor={theme.colors.text}
            >
              {LANGUAGES.map(lang => (
                <Picker.Item
                  key={lang.code}
                  label={`${lang.flag} ${lang.name}`}
                  value={lang.code}
                  color={Platform.OS === 'ios' ? theme.colors.text : undefined}
                />
              ))}
            </Picker>
          </View>
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
      flex: 1,
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
    pickerContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    picker: {
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
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
