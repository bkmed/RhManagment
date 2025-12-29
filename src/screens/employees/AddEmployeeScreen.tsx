import React, { useState, useMemo, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { employeesDb } from '../../database';
import { notificationService } from '../../services/notificationService';
import { Theme } from '../../theme';
import { ROLES, UserRole } from '../../services/authService';
import { Dropdown } from '../../components/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { permissionsService } from '../../services/permissions';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const AddEmployeeScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const styles = useMemo(() => createStyles(theme), [theme]);

  /* Removed require */

  const { setActiveTab } = useContext(WebNavigationContext);

  const employeeId = route.params?.id || route.params?.employeeId;

  const [name, setName] = useState('');

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Employees');
    } else {
      navigation.goBack();
    }
  };
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<UserRole>('employee');
  const [loading, setLoading] = useState(false);
  const [vacationDays, setVacationDays] = useState('25');
  const [country, setCountry] = useState('France');
  const [hiringDate, setHiringDate] = useState<Date | null>(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      const employee = await employeesDb.getById(employeeId);
      if (employee) {
        setName(employee.name);
        setPosition(employee.position || '');
        setPhone(employee.phone || '');
        setEmail(employee.email || '');
        setAddress(employee.address || '');
        setNotes(employee.notes || '');
        setPhotoUri(employee.photoUri || undefined);
        setRole((employee.role as UserRole) || 'employee');
        setDepartment(employee.department || '');
        setLocation(employee.location || '');
        setVacationDays(String(employee.vacationDaysPerYear || 25));
        setCountry(employee.country || 'France');
        if (employee.hiringDate) {
          setHiringDate(new Date(employee.hiringDate));
        }
      }
    } catch (error) {
      showToast(t('employees.loadError'));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('employees.nameRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTakePhoto = async () => {
    const status = await permissionsService.requestCameraPermission();
    if (status !== 'granted') {
      notificationService.showAlert(t('profile.permissionDenied'), t('profile.permissionBlockedMessage'));
      return;
    }

    // In a real app, we'd use react-native-image-picker here
    showToast('Camera integration would go here', 'info');
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const employeeData = {
        name: name.trim(),
        position,
        phone,
        email,
        address,
        notes,
        photoUri,
        role,
        department,
        location,
        vacationDaysPerYear: parseInt(vacationDays) || 25,
        remainingVacationDays: parseInt(vacationDays) || 25,
        statePaidLeaves: 0,
        country,
        hiringDate: hiringDate ? hiringDate.toISOString() : undefined,
      };

      if (employeeId) {
        await employeesDb.update(employeeId, employeeData);
        showToast(t('employees.updated'));
      } else {
        await employeesDb.add(employeeData);
        showToast(t('employees.added'));
      }
      if (Platform.OS === 'web') {
        setActiveTab('Employees');
      } else {
        navigation?.goBack();
      }
    } catch (error) {
      showToast(t('employees.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showModal({
      title: t('common.delete'),
      message: t('employees.deleteConfirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (employeeId) {
                await employeesDb.delete(employeeId);
                showToast(t('employees.deletedSuccessfully'), 'success');
                navigateBack();
              }
            } catch (error) {
              showToast(t('common.error'), 'info');
            }
          },
        },
      ],
    });
  };

  const departmentOptions = [
    { label: t('roles.rh'), value: 'rh' },
    { label: t('roles.chef_dequipe'), value: 'chef_dequipe' },
    { label: t('roles.employee'), value: 'employee' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Section: Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('navigation.personalInfo')}</Text>

            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoPlaceholderText}>
                    {t('illnesses.photoButton')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.name')} *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={text => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder={t('employees.namePlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.phone')}</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('employees.phonePlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('employees.email')}</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder={t('employees.emailPlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.responsiveRow}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>{t('employees.address')}</Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder={t('employees.addressPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <DateTimePickerField
                    label={t('employees.hiringDate')}
                    value={hiringDate}
                    onChange={setHiringDate}
                    mode="date"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Section: Employment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('navigation.employmentDetails')}</Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('employees.specialty')}
                  data={departmentOptions}
                  value={position}
                  onSelect={setPosition}
                  placeholder={t('employees.specialtyPlaceholder')}
                />
              </View>

              <View style={styles.fieldContainer}>
                {currentUser?.role === 'admin' && (
                  <Dropdown
                    label={t('signUp.roleLabel')}
                    data={ROLES.map((r: UserRole) => ({ label: t(`roles.${r}`), value: r }))}
                    value={role}
                    onSelect={(val) => setRole(val as UserRole)}
                    placeholder={t('signUp.roleLabel')}
                  />
                )}
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('common.service')}</Text>
                <TextInput
                  style={styles.input}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder={t('common.service')}
                  placeholderTextColor={theme.colors.subText}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('common.local')}</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder={t('common.local')}
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>

            <Text style={styles.label}>{t('employees.notes')}</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('employees.notesPlaceholder')}
              placeholderTextColor={theme.colors.subText}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? t('common.loading') : employeeId ? t('common.save') : t('common.add')}
          </Text>
        </TouchableOpacity>

        {employeeId && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m, paddingBottom: theme.spacing.xl },
    formContainer: {
      flex: 1,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
      marginBottom: theme.spacing.l,
      fontSize: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.s,
    },
    responsiveRow: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: theme.spacing.m,
    },
    fieldContainer: {
      flex: 1,
      marginBottom: Platform.OS === 'web' ? 0 : theme.spacing.m,
    },
    photoButton: { alignItems: 'center', marginBottom: theme.spacing.l },
    photo: { width: 120, height: 120, borderRadius: 60 },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    photoPlaceholderText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      textAlign: 'center',
      fontSize: 12,
      padding: 4,
    },
    label: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      marginTop: theme.spacing.m,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    notesInput: { height: 100, textAlignVertical: 'top' },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.xl,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    deleteButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    inputError: { borderColor: theme.colors.error },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });
