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
  Image,
  TextInput,
} from 'react-native';
import { storageService } from '../../services/storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../../components/Dropdown';
import { AuthInput } from '../../components/auth/AuthInput';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
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
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export const ProfileScreen = ({ navigation }: any) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, signOut, updateProfile } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUri, setPhotoUri] = useState(user?.photoUri || '');
  const [loading, setLoading] = useState(false);

  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus>('unavailable');
  const [notificationPermission, setNotificationPermission] =
    useState<PermissionStatus>('unavailable');
  const [calendarPermission, setCalendarPermission] =
    useState<PermissionStatus>('unavailable');
  const [maxPermissionHours, setMaxPermissionHours] = useState('2');

  useEffect(() => {
    checkPermissions();
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const savedMax = await storageService.getString('config_max_permission_hours');
    if (savedMax) setMaxPermissionHours(savedMax);
  };

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhotoUri(user?.photoUri || '');
  }, [user]);

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

      const shouldBeRTL = langCode === 'ar';
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.forceRTL(shouldBeRTL);
        if (Platform.OS !== 'web') {
          Alert.alert(
            t('profile.restartRequired'),
            t('profile.restartRequiredMessage'),
            [{ text: t('common.ok') }],
          );
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.languageChangeError'));
    }
  };

  const handlePickPhoto = async () => {
    const status = await permissionsService.requestCameraPermission();
    setCameraPermission(status);

    if (status !== 'granted') {
      Alert.alert(
        t('profile.permissionDenied'),
        t('profile.permissionBlockedMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('profile.openSettings'),
            onPress: () => permissionsService.openAppSettings(),
          },
        ],
      );
      return;
    }

    Alert.alert(t('profile.changePhoto'), '', [
      {
        text: t('illnesses.takePhoto'),
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets && response.assets[0]?.uri) {
              setPhotoUri(response.assets[0].uri);
            }
          });
        },
      },
      {
        text: t('illnesses.chooseFromLibrary'),
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets && response.assets[0]?.uri) {
              setPhotoUri(response.assets[0].uri);
            }
          });
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(t('common.error'), t('signUp.errorEmptyFields'));
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        photoUri,
      });
      setIsEditing(false);
      Alert.alert(t('common.success'), t('profile.updatedSuccessfully'));
    } catch (error) {
      Alert.alert(t('common.error'), t('common.loadFailed'));
    } finally {
      setLoading(false);
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
      Alert.alert(t('profile.permissionBlocked'), t('profile.permissionBlockedMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.openSettings'), onPress: () => permissionsService.openAppSettings() },
      ]);
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
      Alert.alert(t('profile.permissionBlocked'), t('profile.permissionBlockedMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.openSettings'), onPress: () => permissionsService.openAppSettings() },
      ]);
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
      Alert.alert(t('profile.permissionBlocked'), t('profile.permissionBlockedMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.openSettings'), onPress: () => permissionsService.openAppSettings() },
      ]);
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
      case 'granted': return t('profile.permissionGranted');
      case 'denied': return t('profile.permissionDenied');
      case 'blocked': return t('profile.permissionBlocked');
      case 'limited': return t('profile.permissionLimited');
      default: return t('profile.permissionUnavailable');
    }
  };

  const getPermissionStatusColor = (status: PermissionStatus) => {
    switch (status) {
      case 'granted': return theme.colors.success;
      case 'denied': return theme.colors.warning;
      case 'blocked': return theme.colors.error;
      default: return theme.colors.subText;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header Section */}
        <View style={styles.headerCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={isEditing ? handlePickPhoto : undefined}
            disabled={!isEditing}
          >
            <View style={styles.avatar}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
              {isEditing && (
                <View style={styles.editOverlay}>
                  <Text style={styles.editOverlayText}>📸</Text>
                </View>
              )}
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {t(`roles.${user?.role}`)}
              </Text>
            </View>
          </TouchableOpacity>

          {!isEditing ? (
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>{t('profile.edit')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editForm}>
              <AuthInput
                label={t('signUp.nameLabel')}
                value={name}
                onChangeText={setName}
                placeholder={t('signUp.namePlaceholder')}
              />
              <AuthInput
                label={t('signUp.emailLabel')}
                value={email}
                onChangeText={setEmail}
                placeholder={t('signUp.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                    setPhotoUri(user?.photoUri || '');
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSaveProfile}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? t('common.loading') : t('profile.save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Dropdown
              label={t('profile.language')}
              data={LANGUAGES.map(lang => ({
                label: `${lang.flag} ${lang.name}`,
                value: lang.code,
              }))}
              value={currentLanguage}
              onSelect={handleLanguageChange}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>{t('profile.darkMode')}</Text>
              <Text style={styles.captionText}>{t('profile.appearance')}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t('profile.securityPermissions')}</Text>
          </View>
          {[
            { label: t('profile.camera'), status: cameraPermission, onValueChange: handleCameraPermission },
            { label: t('profile.notifications'), status: notificationPermission, onValueChange: handleNotificationPermission },
            { label: t('profile.calendar'), status: calendarPermission, onValueChange: handleCalendarPermission },
          ].map((perm, index) => (
            <View key={index} style={styles.permissionRow}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionLabel}>{perm.label}</Text>
                <Text style={[styles.permissionStatus, { color: getPermissionStatusColor(perm.status) }]}>
                  {getPermissionStatusText(perm.status)}
                </Text>
              </View>
              {perm.status !== 'unavailable' && (
                <Switch
                  value={perm.status === 'granted'}
                  onValueChange={perm.onValueChange}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.surface}
                />
              )}
            </View>
          ))}
        </View>

        {/* Admin Settings Section */}
        {(user?.role === 'admin' || user?.role === 'rh') && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('permissions.settings')}</Text>
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('permissions.maxHours')}</Text>
              <TextInput
                style={styles.input}
                value={maxPermissionHours}
                onChangeText={(text) => {
                  const hours = text.replace(/[^0-9]/g, '');
                  setMaxPermissionHours(hours);
                  storageService.setString('config_max_permission_hours', hours);
                }}
                keyboardType="numeric"
                placeholder="2"
                placeholderTextColor={theme.colors.subText}
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>{t('profile.version')} 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m, paddingBottom: theme.spacing.xl },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    sectionTitle: { ...theme.textVariants.subheader, color: theme.colors.text, fontSize: 18 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    avatarContainer: { position: 'relative', marginBottom: theme.spacing.m },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' },
    editOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editOverlayText: { fontSize: 24 },
    roleBadge: {
      position: 'absolute',
      bottom: -4,
      right: -10,
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    roleBadgeText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.text, textTransform: 'uppercase' },
    headerInfo: { alignItems: 'center', width: '100%' },
    userName: { ...theme.textVariants.header, fontSize: 24, color: theme.colors.text, marginBottom: 4 },
    userEmail: { ...theme.textVariants.body, color: theme.colors.subText, fontSize: 16, marginBottom: theme.spacing.m },
    editButton: {
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.spacing.m,
      backgroundColor: theme.colors.primary + '20',
    },
    editButtonText: { color: theme.colors.primary, fontWeight: 'bold' },
    editForm: { width: '100%', paddingHorizontal: theme.spacing.m },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: theme.spacing.m, gap: theme.spacing.m },
    actionButton: { paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.s, borderRadius: theme.spacing.s },
    cancelButton: { backgroundColor: theme.colors.border },
    cancelButtonText: { color: theme.colors.text },
    saveButton: { backgroundColor: theme.colors.primary },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
    fieldGroup: { marginBottom: theme.spacing.m },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.m },
    captionText: { ...theme.textVariants.caption, color: theme.colors.subText },
    versionText: { ...theme.textVariants.caption, color: theme.colors.subText, textAlign: 'center', marginTop: theme.spacing.l },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: theme.spacing.s },
    label: { ...theme.textVariants.body, color: theme.colors.text },
    permissionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    fieldContainer: {
      marginTop: theme.spacing.m,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    permissionInfo: { flex: 1 },
    permissionLabel: { ...theme.textVariants.body, color: theme.colors.text, marginBottom: theme.spacing.xs },
    permissionStatus: { ...theme.textVariants.caption, fontSize: 12 },
    logoutButton: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    logoutText: { ...theme.textVariants.button, color: theme.colors.error },
  });
