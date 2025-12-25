import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Dropdown } from '../../components/Dropdown';
import { AuthInput } from '../../components/auth/AuthInput';
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
  const { showToast } = useToast();
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

  useEffect(() => {
    checkPermissions();
  }, []);

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
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.languageChangeError'));
    }
  };

  const handlePickPhoto = () => {
    const input = (window as any).document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => setPhotoUri(event.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
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
        <View style={styles.webProfileLayout}>
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

          <View style={styles.settingsGrid}>
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
                { label: t('profile.camera'), status: cameraPermission },
                { label: t('profile.notifications'), status: notificationPermission },
                { label: t('profile.calendar'), status: calendarPermission },
              ].map((perm, index) => (
                <View key={index} style={styles.permissionRow}>
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionLabel}>{perm.label}</Text>
                    <Text style={[styles.permissionStatus, { color: getPermissionStatusColor(perm.status) }]}>
                      {getPermissionStatusText(perm.status)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Leave Policy Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{t('leavePolicy.managedBy')}</Text>
              </View>
              <View style={styles.policyRow}>
                <Text style={styles.policyLabel}>{t('leavePolicy.perYear')}</Text>
                <Text style={styles.policyValue}>{user?.vacationDaysPerYear || 25}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.policyRow}>
                <Text style={styles.policyLabel}>{t('leavePolicy.remaining')}</Text>
                <Text style={[styles.policyValue, { color: theme.colors.primary, fontSize: 24 }]}>
                  {user?.remainingVacationDays ?? 25}
                </Text>
              </View>
              {user?.country && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.policyRow}>
                    <Text style={styles.policyLabel}>{t('leavePolicy.country')}</Text>
                    <Text style={styles.policyValue}>{user.country}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>{t('profile.version')} 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m, paddingBottom: theme.spacing.xl },
    webProfileLayout: { maxWidth: 1000, width: '100%', alignSelf: 'center' },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
      flex: 1,
      minWidth: 350,
    },
    sectionTitle: { ...theme.textVariants.subheader, color: theme.colors.text, fontSize: 18 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.l,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    avatarContainer: { position: 'relative', marginRight: theme.spacing.xl },
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
    editOverlayText: { fontSize: 32 },
    roleBadge: {
      position: 'absolute',
      bottom: 0,
      right: -10,
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: 4,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    roleBadgeText: { fontSize: 11, fontWeight: 'bold', color: theme.colors.text, textTransform: 'uppercase' },
    headerInfo: { flex: 1 },
    userName: { ...theme.textVariants.header, fontSize: 28, color: theme.colors.text, marginBottom: theme.spacing.xs },
    userEmail: { ...theme.textVariants.body, color: theme.colors.subText, fontSize: 16, marginBottom: theme.spacing.m },
    editButton: {
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.spacing.m,
      backgroundColor: theme.colors.primary + '20',
      alignSelf: 'flex-start',
    },
    editButtonText: { color: theme.colors.primary, fontWeight: 'bold' },
    editForm: { flex: 1 },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: theme.spacing.m, gap: theme.spacing.m },
    actionButton: { paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.s, borderRadius: theme.spacing.s },
    cancelButton: { backgroundColor: theme.colors.border },
    cancelButtonText: { color: theme.colors.text },
    saveButton: { backgroundColor: theme.colors.primary },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
    settingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.l },
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
    policyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.s,
    },
    policyLabel: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    policyValue: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontWeight: 'bold',
    },
  });
