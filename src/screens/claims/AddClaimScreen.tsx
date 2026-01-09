import React, { useState, useMemo, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { claimsDb } from '../../database/claimsDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { ClaimType, Device } from '../../database/schema';
import { Dropdown } from '../../components/Dropdown';
import { devicesDb } from '../../database/devicesDb';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { RootState } from '../../store';

export const AddClaimScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [type, setType] = useState<ClaimType>('material');
  const [description, setDescription] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [photoUri, setPhotoUri] = useState('');
  const [errors, setErrors] = useState<{ description?: string; device?: string }>({});
  const [loading, setLoading] = useState(false);

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(
    user?.role === 'employee' && user?.id ? Number(user.id) : null,
  );

  // Load devices for selected employee - Moved here to fix scoping issue
  useEffect(() => {
    const loadDevices = async () => {
      if (employeeId) {
        const devices = await devicesDb.getByEmployeeId(employeeId);
        setAvailableDevices(devices);
      } else {
        setAvailableDevices([]);
      }
    };
    loadDevices();
  }, [employeeId]);

  const companies = useSelector((state: RootState) =>
    selectAllCompanies(state),
  );
  const teams = useSelector((state: RootState) => selectAllTeams(state));
  const employees = useSelector((state: RootState) =>
    selectAllEmployees(state),
  );

  const { setActiveTab } = useContext(WebNavigationContext);

  const handleTakePhoto = async () => {
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

    showModal({
      title: t('illnesses.addPhoto'),
      message: t('illnesses.chooseOption'),
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

  const handleSave = async () => {
    const newErrors: { description?: string; device?: string } = {};
    if (type === 'material' && !selectedDevice) {
      newErrors.device = t('common.required');
    }
    if (!description.trim() && type !== 'material') {
      newErrors.description = t('common.required');
    }
    if (type === 'material' && selectedDevice === 'other' && !description.trim()) {
      newErrors.description = t('common.required');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const claimData = {
        type,
        title: type === 'material' ? (selectedDevice === 'other' ? 'Other Material' : availableDevices.find(d => String(d.id) === selectedDevice)?.name) : t(`claims.type_${type}`),
        description: description.trim(),
        isUrgent,
        status: 'pending' as const,
        photoUri: photoUri || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyId,
        teamId,
        employeeId: employeeId || 0,
        deviceId: type === 'material' && selectedDevice !== 'other' ? Number(selectedDevice) : undefined,
      };

      await claimsDb.add(claimData);

      showModal({
        title: t('common.success'),
        message: t('claims.successMessage'),
        buttons: [{ text: 'OK', onPress: () => goBack() }],
      });
    } catch (error) {
      console.error('Error saving claim:', error);
      notificationService.showAlert(t('common.error'), t('claims.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Home');
    } else {
      navigation.goBack();
    }
  };

  const claimTypes = [
    { label: t('claims.typeMaterial'), value: 'material' },
    { label: t('claims.typeAccount'), value: 'account' },
    { label: t('claims.typeOther'), value: 'other' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{t('claims.newClaim')}</Text>

          <View style={styles.section}>
            <View style={styles.fieldContainer}>
              <Dropdown
                label={t('claims.type')}
                data={claimTypes}
                value={type}
                onSelect={val => setType(val as ClaimType)}
              />
            </View>

            {type === 'material' && (
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('profile.myMaterial')}
                  data={[
                    ...availableDevices.map(d => ({ label: d.name, value: String(d.id) })),
                    { label: t('common.other'), value: 'other' }
                  ]}
                  value={selectedDevice}
                  onSelect={setSelectedDevice}
                  error={errors.device}
                />
              </View>
            )}

            {/* Company / Team / Employee Selection */}
            <View style={styles.fieldContainer}>
              {(user?.role === 'admin' || user?.role === 'rh') && (
                <View
                  style={[
                    styles.fieldContainer,
                    { marginBottom: theme.spacing.m },
                  ]}
                >
                  <Dropdown
                    label={t('companies.selectCompany')}
                    data={companies.map(c => ({
                      label: c.name,
                      value: String(c.id),
                    }))}
                    value={companyId ? String(companyId) : ''}
                    onSelect={val => setCompanyId(Number(val))}
                  />
                </View>
              )}
              {(user?.role === 'admin' || user?.role === 'rh') && (
                <View
                  style={[
                    styles.fieldContainer,
                    { marginBottom: theme.spacing.m },
                  ]}
                >
                  <Dropdown
                    label={t('teams.selectTeam')}
                    data={teams.map(t => ({
                      label: t.name,
                      value: String(t.id),
                    }))}
                    value={teamId ? String(teamId) : ''}
                    onSelect={val => setTeamId(Number(val))}
                  />
                </View>
              )}
              {(user?.role === 'admin' || user?.role === 'rh') && (
                <View style={styles.fieldContainer}>
                  <Dropdown
                    label={t('employees.name')}
                    data={employees.map(e => ({
                      label: e.name,
                      value: String(e.id),
                    }))}
                    value={employeeId ? String(employeeId) : ''}
                    onSelect={val => setEmployeeId(Number(val))}
                  />
                </View>
              )}
            </View>

            {(type !== 'material' || selectedDevice === 'other') && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('claims.description')} *</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    errors.description && { borderColor: theme.colors.error },
                  ]}
                  value={description}
                  onChangeText={text => {
                    setDescription(text);
                    if (errors.description)
                      setErrors({ ...errors, description: '' });
                  }}
                  placeholder={t('claims.descriptionPlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                  multiline
                  numberOfLines={6}
                />
                {errors.description && (
                  <Text
                    style={{
                      color: theme.colors.error,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {errors.description}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.switchRow}>
              <View>
                <Text style={[styles.label, { color: theme.colors.error }]}>
                  {t('common.urgent')}
                </Text>
                <Text style={styles.captionText}>{t('claims.urgentNote')}</Text>
              </View>
              <Switch
                value={isUrgent}
                onValueChange={setIsUrgent}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.error,
                }}
                thumbColor={theme.colors.surface}
              />
            </View>

            <View style={styles.photoSection}>
              <Text style={styles.label}>{t('illnesses.addPhoto')}</Text>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleTakePhoto}
              >
                {photoUri ? (
                  <View style={styles.photoWrapper}>
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                    <View style={styles.changePhotoOverlay}>
                      <Text style={styles.changePhotoText}>
                        {t('profile.changePhoto')}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>
                      {t('illnesses.photoButton')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? t('common.loading') : t('common.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m },
    formContainer: {
      maxWidth: Platform.OS === 'web' ? 600 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: theme.spacing.l,
      textAlign: 'center',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    fieldContainer: {
      marginBottom: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      paddingTop: theme.spacing.m,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    captionText: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    photoSection: {
      marginTop: theme.spacing.l,
      paddingTop: theme.spacing.m,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    photoButton: {
      alignItems: 'center',
      marginTop: theme.spacing.s,
    },
    photoWrapper: {
      width: '100%',
      height: 200,
      borderRadius: theme.spacing.s,
      overflow: 'hidden',
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    changePhotoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 8,
      alignItems: 'center',
    },
    changePhotoText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: '600',
    },
    photoPlaceholder: {
      width: '100%',
      height: 120,
      borderRadius: theme.spacing.s,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    photoPlaceholderText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      textAlign: 'center',
    },
  });
