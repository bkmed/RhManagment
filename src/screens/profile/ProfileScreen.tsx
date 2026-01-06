import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { notificationService } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { Dropdown } from '../../components/Dropdown';
import { AuthInput } from '../../components/auth/AuthInput';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  permissionsService,
  PermissionStatus,
} from '../../services/permissions';
import { Theme } from '../../theme';
import { selectPendingLeaves } from '../../store/slices/leavesSlice';
import { selectPendingClaims } from '../../store/slices/claimsSlice';
import { selectAllPayroll } from '../../store/slices/payrollSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllDevices } from '../../store/slices/devicesSlice';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { Device } from '../../database/schema';

const { width } = Dimensions.get('window');

export const ProfileScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { user, signOut, updateProfile } = useAuth();
  const { setActiveTab } = React.useContext(WebNavigationContext) as any;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUri, setPhotoUri] = useState(user?.photoUri || '');
  const [backgroundPhotoUri, setBackgroundPhotoUri] = useState(
    user?.backgroundPhotoUri || '',
  );
  const [loading, setLoading] = useState(false);

  // Extended fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    user?.gender || 'male',
  );
  const [emergencyName, setEmergencyName] = useState(
    user?.emergencyContact?.name || '',
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    user?.emergencyContact?.phone || '',
  );
  const [emergencyRelationship, setEmergencyRelationship] = useState(
    user?.emergencyContact?.relationship || '',
  );
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [skype, setSkype] = useState(user?.socialLinks?.skype || '');
  const [website, setWebsite] = useState(user?.socialLinks?.website || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');

  // Stats from Redux
  const pendingLeaves = useSelector(selectPendingLeaves);
  const pendingClaims = useSelector(selectPendingClaims);
  const payrollItems = useSelector(selectAllPayroll);
  const teams = useSelector(selectAllTeams);
  const devices = useSelector(selectAllDevices);
  const companies = useSelector(selectAllCompanies);

  const myDevicesCount = useMemo(() => {
    return devices.filter((d: Device) => d.assignedToId === user?.employeeId)
      .length;
  }, [devices, user?.employeeId]);

  const userTeam = useMemo(() => {
    return teams.find(t => t.id === user?.teamId);
  }, [teams, user]);

  const userCompany = useMemo(() => {
    return companies.find(c => c.id === user?.companyId);
  }, [companies, user]);

  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus>('unavailable');
  const [notificationPermission, setNotificationPermission] =
    useState<PermissionStatus>('unavailable');
  const [calendarPermission, setCalendarPermission] =
    useState<PermissionStatus>('unavailable');
  const [storagePermission, setStoragePermission] =
    useState<PermissionStatus>('unavailable');

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const camera = await permissionsService.checkCameraPermission();
    const notification = await permissionsService.checkNotificationPermission();
    const calendar = await permissionsService.checkCalendarPermission();
    const storage = await permissionsService.checkStoragePermission();
    setCameraPermission(camera);
    setNotificationPermission(notification);
    setCalendarPermission(calendar);
    setStoragePermission(storage);
  };

  const handlePickPhoto = async () => {
    if (Platform.OS === 'web') {
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
      return;
    }

    const status = await permissionsService.requestCameraPermission();
    setCameraPermission(status);

    if (status !== 'granted') {
      showModal({
        title: t('profile.permissionDenied'),
        message: t('profile.permissionBlockedMessage'),
        buttons: [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('profile.openSettings'),
            onPress: () => permissionsService.openAppSettings(),
          },
        ],
      });
      return;
    }

    showModal({
      title: t('profile.changePhoto'),
      buttons: [
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
            launchImageLibrary(
              { mediaType: 'photo', quality: 0.8 },
              response => {
                if (response.assets && response.assets[0]?.uri) {
                  setPhotoUri(response.assets[0].uri);
                }
              },
            );
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    });
  };

  const handlePickBackgroundPhoto = async () => {
    if (Platform.OS === 'web') {
      const input = (window as any).document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) =>
            setBackgroundPhotoUri(event.target.result);
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    const status = await permissionsService.requestCameraPermission();
    setCameraPermission(status);

    if (status !== 'granted') {
      showModal({
        title: t('profile.permissionDenied'),
        message: t('profile.permissionBlockedMessage'),
        buttons: [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('profile.openSettings'),
            onPress: () => permissionsService.openAppSettings(),
          },
        ],
      });
      return;
    }

    showModal({
      title: t('profile.changeBackgroundPhoto'),
      buttons: [
        {
          text: t('illnesses.takePhoto'),
          onPress: () => {
            launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
              if (response.assets && response.assets[0]?.uri) {
                setBackgroundPhotoUri(response.assets[0].uri);
              }
            });
          },
        },
        {
          text: t('illnesses.chooseFromLibrary'),
          onPress: () => {
            launchImageLibrary(
              { mediaType: 'photo', quality: 0.8 },
              response => {
                if (response.assets && response.assets[0]?.uri) {
                  setBackgroundPhotoUri(response.assets[0].uri);
                }
              },
            );
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    });
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      showModal({
        title: t('common.error'),
        message: t('signUp.errorEmptyFields'),
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        photoUri,
        backgroundPhotoUri,
        firstName,
        lastName,
        age: parseInt(age) || undefined,
        gender,
        emergencyContact: emergencyName
          ? {
            name: emergencyName,
            phone: emergencyPhone,
            relationship: emergencyRelationship,
          }
          : undefined,
        socialLinks:
          linkedin || skype || website
            ? {
              linkedin,
              skype,
              website,
            }
            : undefined,
        skills: skills
          ? skills
            .split(',')
            .map(s => s.trim())
            .filter(s => s)
          : undefined,
      });
      setIsEditing(false);
      showModal({
        title: t('common.success'),
        message: t('profile.updatedSuccessfully'),
      });
    } catch (error) {
      showModal({ title: t('common.error'), message: t('common.loadFailed') });
      console.error(error);
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
  };

  const handleNotificationPermission = async (value: boolean) => {
    if (!user) return;

    if (value) {
      const status = await permissionsService.requestNotificationPermission();
      setNotificationPermission(status);
      if (status !== 'granted' && Platform.OS !== 'web') return;
    } else {
      setNotificationPermission('denied');
    }

    // Persist preference
    try {
      await updateProfile({
        notificationPreferences: {
          push: value,
          email: user.notificationPreferences?.email ?? false,
        },
      });
    } catch (error) {
      console.error('Failed to update push preference:', error);
    }
  };

  const handleEmailNotificationToggle = async (value: boolean) => {
    if (!user) return;

    try {
      await updateProfile({
        notificationPreferences: {
          push: user.notificationPreferences?.push ?? true,
          email: value,
        },
      });
    } catch (error) {
      console.error('Failed to update email preference:', error);
    }
  };

  const handleCalendarPermission = async (value: boolean) => {
    if (!value) {
      setCalendarPermission('denied');
      return;
    }
    const status = await permissionsService.requestCalendarPermission();
    setCalendarPermission(status);
  };

  const handleStoragePermission = async (value: boolean) => {
    if (!value) {
      setStoragePermission('denied');
      return;
    }
    const status = await permissionsService.requestStoragePermission();
    setStoragePermission(status);
  };

  const handleLogout = async () => {
    try {
      await signOut(navigation);
    } catch (error) {
      notificationService.showAlert(
        t('common.error'),
        t('profile.logoutError'),
      );
      console.error(error);
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

  const DashboardStat = ({ label, value, icon, color }: any) => (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + '15' }]}
      >
        <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        {/* Header Background */}
        <View style={styles.headerBackground}>
          {backgroundPhotoUri ? (
            <Image
              source={{ uri: backgroundPhotoUri }}
              style={styles.backgroundImage}
            />
          ) : null}
          {isEditing && (
            <TouchableOpacity
              style={styles.editBackgroundButton}
              onPress={handlePickBackgroundPhoto}
            >
              <Text style={styles.editBackgroundIcon}>📸</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mainContent}>
          {/* Profile Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={isEditing ? handlePickPhoto : undefined}
                disabled={!isEditing}
              >
                <View
                  style={[
                    styles.avatar,
                    { borderColor: theme.colors.surface, borderWidth: 4 },
                  ]}
                >
                  {photoUri ? (
                    <Image
                      source={{ uri: photoUri }}
                      style={styles.avatarImage}
                    />
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

              <View style={styles.headerMainInfo}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.teamContainer}>
                  <Text style={styles.teamText}>
                    🏢 {userCompany?.name || t('companies.noCompanyAssigned')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.teamContainer,
                    {
                      marginTop: 4,
                      backgroundColor:
                        (userTeam
                          ? theme.colors.secondary
                          : theme.colors.border) + '10',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.teamText,
                      {
                        color: userTeam
                          ? theme.colors.secondary
                          : theme.colors.subText,
                      },
                    ]}
                  >
                    👥 {userTeam?.name || t('teams.noTeamAssigned')}
                  </Text>
                </View>
              </View>
            </View>

            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>✎ {t('profile.edit')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats Dashboard */}
          {!isEditing && (
            <View style={styles.statsRow}>
              <DashboardStat
                icon="📅"
                value={pendingLeaves.length}
                label={t('leaves.upcoming')}
                color={theme.colors.primary}
              />
              <DashboardStat
                icon="📝"
                value={pendingClaims.length}
                label={t('claims.statusPending')}
                color={theme.colors.secondary}
              />
              <DashboardStat
                icon="💰"
                value={payrollItems.length}
                label={t('payroll.title')}
                color="#4CAF50"
              />
              <DashboardStat
                icon="💻"
                value={myDevicesCount}
                label={t('devices.myMaterial')}
                color={theme.colors.warning}
              />
            </View>
          )}

          {isEditing ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👤 {t('profile.edit')}</Text>
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

                <View style={styles.responsiveRow}>
                  <View
                    style={[
                      styles.fieldContainerFlex,
                      { marginRight: theme.spacing.m },
                    ]}
                  >
                    <AuthInput
                      label={t('employees.firstName')}
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder={t('employees.firstName')}
                    />
                  </View>
                  <View style={styles.fieldContainerFlex}>
                    <AuthInput
                      label={t('employees.lastName')}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder={t('employees.lastName')}
                    />
                  </View>
                </View>

                <View style={styles.responsiveRow}>
                  <View
                    style={[
                      styles.fieldContainerFlex,
                      { marginRight: theme.spacing.m },
                    ]}
                  >
                    <AuthInput
                      label={t('employees.age')}
                      value={age}
                      onChangeText={setAge}
                      placeholder="25"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.fieldContainerFlex}>
                    <Dropdown
                      label={t('employees.gender')}
                      data={[
                        { label: t('employees.genderMale'), value: 'male' },
                        { label: t('employees.genderFemale'), value: 'female' },
                        { label: t('employees.genderOther'), value: 'other' },
                      ]}
                      value={gender}
                      onSelect={val => setGender(val as any)}
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.subSectionTitle}>
                  🚑 {t('employees.emergencyContact')}
                </Text>
                <AuthInput
                  label={t('employees.emergencyName')}
                  value={emergencyName}
                  onChangeText={setEmergencyName}
                  placeholder={t('employees.emergencyName')}
                />
                <View style={styles.responsiveRow}>
                  <View
                    style={[
                      styles.fieldContainerFlex,
                      { marginRight: theme.spacing.m },
                    ]}
                  >
                    <AuthInput
                      label={t('employees.emergencyPhone')}
                      value={emergencyPhone}
                      onChangeText={setEmergencyPhone}
                      placeholder={t('employees.emergencyPhone')}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.fieldContainerFlex}>
                    <AuthInput
                      label={t('employees.emergencyRelationship')}
                      value={emergencyRelationship}
                      onChangeText={setEmergencyRelationship}
                      placeholder={t('employees.emergencyRelationship')}
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.subSectionTitle}>
                  🔗 {t('employees.socialLinks')}
                </Text>
                <AuthInput
                  label={t('employees.linkedin')}
                  value={linkedin}
                  onChangeText={setLinkedin}
                  placeholder="https://linkedin.com/in/..."
                />

                <AuthInput
                  label={t('employees.skype')}
                  value={linkedin}
                  onChangeText={setSkype}
                  placeholder="https://skype.com/..."
                />

                <AuthInput
                  label={t('employees.website')}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://example.com"
                />

                <AuthInput
                  label={t('employees.skills')}
                  value={skills}
                  onChangeText={setSkills}
                  placeholder="React, Node.js, HR (Separate with commas)"
                />

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                      setPhotoUri(user?.photoUri || '');
                      setBackgroundPhotoUri(user?.backgroundPhotoUri || '');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>
                      {t('common.cancel')}
                    </Text>
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
            </View>
          ) : (
            <>
              {/* Professional Profile View */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  🎯 {t('profile.professionalProfile')}
                </Text>

                <View style={styles.responsiveRow}>
                  <View style={styles.fieldContainerFlex}>
                    <Text style={styles.fieldLabel}>
                      {t('employees.company')}
                    </Text>
                    <Text
                      style={[
                        styles.userName,
                        { fontSize: 16, marginBottom: theme.spacing.m },
                      ]}
                    >
                      🏢 {userCompany?.name || t('companies.noCompanyAssigned')}
                    </Text>
                  </View>
                  <View style={styles.fieldContainerFlex}>
                    <Text style={styles.fieldLabel}>{t('teams.title')}</Text>
                    <Text
                      style={[
                        styles.userName,
                        { fontSize: 16, marginBottom: theme.spacing.m },
                      ]}
                    >
                      👥 {userTeam?.name || t('teams.noTeamAssigned')}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.fieldLabel}>{t('employees.skills')}</Text>
                <View style={styles.tagContainer}>
                  {user?.skills?.map((skill: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{skill}</Text>
                    </View>
                  )) || (
                      <Text style={styles.emptyText}>{t('common.noData')}</Text>
                    )}
                </View>

                <View style={styles.divider} />

                <Text style={styles.fieldLabel}>
                  {t('employees.socialLinks')}
                </Text>
                <View style={styles.socialRows}>
                  {user?.socialLinks?.linkedin && (
                    <View style={styles.socialItem}>
                      <Text style={styles.socialIcon}>💼</Text>
                      <Text style={styles.socialValue}>
                        {user.socialLinks.linkedin}
                      </Text>
                    </View>
                  )}
                  {user?.socialLinks?.website && (
                    <View style={styles.socialItem}>
                      <Text style={styles.socialIcon}>🌐</Text>
                      <Text style={styles.socialValue}>
                        {user.socialLinks.website}
                      </Text>
                    </View>
                  )}
                  {user?.socialLinks?.skype && (
                    <View style={styles.socialItem}>
                      <Text style={styles.socialIcon}>💬</Text>
                      <Text style={styles.socialValue}>
                        {user.socialLinks.skype}
                      </Text>
                    </View>
                  )}
                  {!user?.socialLinks && (
                    <Text style={styles.emptyText}>{t('common.noData')}</Text>
                  )}
                </View>
              </View>

              {/* Security & Permissions */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  🔒 {t('profile.securityPermissions')}
                </Text>
                {[
                  {
                    label: t('profile.camera'),
                    status: cameraPermission,
                    onValueChange: handleCameraPermission,
                  },
                  {
                    label: t('profile.documents') || 'Documents',
                    status: storagePermission,
                    onValueChange: handleStoragePermission,
                  },
                  {
                    label:
                      t('settings.pushNotifications') || 'Push Notifications',
                    status:
                      user?.notificationPreferences?.push &&
                        notificationPermission === 'granted'
                        ? 'granted'
                        : notificationPermission,
                    onValueChange: handleNotificationPermission,
                    value: user?.notificationPreferences?.push ?? true,
                  },
                  {
                    label:
                      t('settings.emailNotifications') || 'Email Notifications',
                    status: (user?.notificationPreferences?.email
                      ? 'granted'
                      : 'denied') as PermissionStatus,
                    onValueChange: handleEmailNotificationToggle,
                    value: user?.notificationPreferences?.email ?? false,
                  },
                  {
                    label: t('profile.calendar'),
                    status: calendarPermission,
                    onValueChange: handleCalendarPermission,
                  },
                ].map((perm, index) => (
                  <View key={index} style={styles.permissionRow}>
                    <View style={styles.permissionInfo}>
                      <Text style={styles.permissionLabel}>{perm.label}</Text>
                      <Text
                        style={[
                          styles.permissionStatus,
                          { color: getPermissionStatusColor(perm.status) },
                        ]}
                      >
                        {getPermissionStatusText(perm.status)}
                      </Text>
                    </View>
                    <Switch
                      value={
                        perm.value !== undefined
                          ? perm.value
                          : perm.status === 'granted'
                      }
                      onValueChange={perm.onValueChange}
                      trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.primary,
                      }}
                      thumbColor={theme.colors.surface}
                    />
                  </View>
                ))}
              </View>

              {/* My Material Link */}
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    setActiveTab('Profile', 'MyDevices');
                  } else {
                    navigation.navigate('MyDevices');
                  }
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, marginRight: theme.spacing.m }}>
                    💻
                  </Text>
                  <View>
                    <Text style={styles.cardTitle}>
                      {t('devices.myMaterial')}
                    </Text>
                    <Text style={styles.emptyText}>
                      {myDevicesCount} {t('devices.assigned')}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, color: theme.colors.subText }}>
                  ›
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 {t('profile.logout')}</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>{t('profile.version')} 1.0.0</Text>
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
    content: {
      paddingBottom: theme.spacing.xl,
    },
    headerBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      backgroundColor: theme.colors.primary,
      overflow: 'hidden',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    editBackgroundButton: {
      position: 'absolute',
      top: theme.spacing.m,
      right: theme.spacing.m,
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editBackgroundIcon: {
      fontSize: 20,
    },
    mainContent: {
      padding: theme.spacing.m,
      marginTop: 60, // Peak relative to header background
    },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.m,
      ...theme.shadows.medium,
    },
    headerTop: {
      flexDirection: Platform.OS === 'web' && width > 600 ? 'row' : 'column',
      alignItems: 'center',
    },
    headerMainInfo: {
      marginLeft: Platform.OS === 'web' && width > 600 ? theme.spacing.l : 0,
      marginTop: Platform.OS === 'web' && width > 600 ? 0 : theme.spacing.m,
      alignItems:
        Platform.OS === 'web' && width > 600 ? 'flex-start' : 'center',
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF' },
    editOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editOverlayText: { fontSize: 24 },
    roleBadge: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      backgroundColor: theme.colors.secondary,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: 4,
      borderRadius: 15,
      borderWidth: 3,
      borderColor: theme.colors.surface,
    },
    roleBadgeText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    userName: {
      ...theme.textVariants.header,
      fontSize: 26,
      color: theme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      fontSize: 16,
      marginBottom: 8,
    },
    teamContainer: {
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: 4,
      borderRadius: theme.spacing.s,
    },
    teamText: { color: theme.colors.primary, fontWeight: '600', fontSize: 14 },
    editButton: {
      alignSelf: 'stretch',
      marginTop: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.spacing.m,
      backgroundColor: theme.colors.primary + '10',
      alignItems: 'center',
    },
    editButtonText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.m,
      gap: theme.spacing.s,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.s,
    },
    statIcon: { fontSize: 20 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
    statLabel: { fontSize: 11, color: theme.colors.subText },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    cardTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontSize: 18,
      marginBottom: theme.spacing.l,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.s,
    },
    tag: {
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tagText: { color: theme.colors.primary, fontSize: 13, fontWeight: '500' },
    socialRows: { gap: theme.spacing.m },
    socialItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
    },
    socialIcon: { fontSize: 18, marginRight: theme.spacing.m },
    socialValue: { color: theme.colors.text, fontSize: 14, flex: 1 },
    emptyText: { color: theme.colors.subText, fontStyle: 'italic' },
    editForm: { width: '100%' },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.l,
      gap: theme.spacing.m,
    },
    actionButton: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.spacing.m,
    },
    cancelButton: { backgroundColor: theme.colors.border },
    cancelButtonText: { color: theme.colors.text, fontWeight: '600' },
    saveButton: { backgroundColor: theme.colors.primary },
    saveButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.l,
    },
    permissionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    permissionInfo: { flex: 1 },
    permissionLabel: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    permissionStatus: { ...theme.textVariants.caption, fontSize: 12 },
    logoutButton: {
      backgroundColor: theme.colors.surface,
      margin: theme.spacing.m,
      padding: theme.spacing.l,
      borderRadius: theme.spacing.m,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    logoutText: {
      ...theme.textVariants.button,
      color: theme.colors.error,
      fontSize: 16,
    },
    versionText: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      textAlign: 'center',
    },
    responsiveRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
    },
    fieldContainerFlex: {
      flex: 1,
    },
    subSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.m,
      marginTop: theme.spacing.s,
    },
  });
