import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { illnessesDb } from '../../database/illnessesDb';
import { notificationService } from '../../services/notificationService';
import { Permission, rbacService } from '../../services/rbacService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { RootState } from '../../store';
import { Dropdown } from '../../components/Dropdown';
import { selectAllIllnesses } from '../../store/slices/illnessesSlice';
import { selectAllLeaves } from '../../store/slices/leavesSlice';
import { Illness, Leave, Company, Team, Employee } from '../../database/schema';
import { selectAllServices } from '../../store/slices/servicesSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, ParamListBase } from '@react-navigation/native';

export const AddIllnessScreen = ({
  navigation,
  route,
}: {
  navigation: NativeStackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase>;
}) => {
  const { theme } = useTheme();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const params = route.params as
    | { illnessId?: string; employeeName?: string; employeeId?: number }
    | undefined;
  const illnessId = params?.illnessId;
  const isEdit = !!illnessId;
  const initialEmployeeName = params?.employeeName || '';
  const initialEmployeeId = params?.employeeId;

  const [payrollName, setPayrollName] = useState('');
  const [employeeName, setEmployeeName] = useState(initialEmployeeName);
  const [issueDate, setIssueDate] = useState<Date | null>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [photoUri, setPhotoUri] = useState('');
  const [notes, setNotes] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const companies = useSelector((state: RootState) =>
    selectAllCompanies(state),
  );
  const teams = useSelector((state: RootState) => selectAllTeams(state));
  const employees = useSelector((state: RootState) =>
    selectAllEmployees(state),
  );
  const services = useSelector((state: RootState) => selectAllServices(state));
  const allIllnesses = useSelector((state: RootState) =>
    selectAllIllnesses(state),
  );
  const allLeaves = useSelector((state: RootState) => selectAllLeaves(state));

  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [teamId, setTeamId] = useState<number | undefined>(undefined);
  const [employeeId, setEmployeeId] = useState<number | undefined>(
    !rbacService.hasPermission(user, Permission.MANAGE_TEAMS) && user?.id ? Number(user.id) : undefined,
  );

  // Auto-fill logic for employees
  useEffect(() => {
    if (!isEdit && rbacService.isEmployee(user) && user) {
      setEmployeeName(user.name);
      setDepartment(user.department || '');
      setPayrollName(user.name); // Default payroll name to employee name for simplicity if needed
    }
  }, [user, isEdit]);

  /* Removed require */

  const { setActiveTab } = useContext(WebNavigationContext);

  useEffect(() => {
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        title: isEdit ? t('illnesses.edit') : t('illnesses.add'),
      });
    }
    if (isEdit) loadIllness();
  }, [illnessId]);

  const loadIllness = async () => {
    if (!illnessId) return;
    try {
      const illness = await illnessesDb.getById(Number(illnessId));
      if (illness) {
        setPayrollName(illness.payrollName || '');
        setEmployeeName(illness.employeeName || '');
        setIssueDate(
          illness.issueDate ? new Date(illness.issueDate) : new Date(),
        );
        setExpiryDate(illness.expiryDate ? new Date(illness.expiryDate) : null);
        setPhotoUri(illness.photoUri || '');
        setNotes(illness.notes || '');
        setDepartment(illness.department || '');
        setLocation(illness.location || '');
      }
    } catch {
      notificationService.showAlert(
        t('common.error'),
        t('illnesses.loadError'),
      );
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const input = (window as any).document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
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
    const newErrors: { [key: string]: string } = {};
    if (!payrollName.trim()) newErrors.payrollName = t('common.required');
    if (!issueDate) newErrors.issueDate = t('common.required');

    if (issueDate && expiryDate && expiryDate < issueDate) {
      newErrors.expiryDate = t('common.invalidDateRange');
    }

    if ((rbacService.isAdmin(user) || rbacService.isRH(user)) && !employeeId) {
      newErrors.employeeId = t('common.required');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Collision Check
    const checkStart = issueDate!;
    const checkEnd = expiryDate || issueDate!;

    const hasCollision = allIllnesses.some((i: Illness) => {
      if (Number(i.id) === Number(illnessId)) return false;
      if (
        Number(i.employeeId) !==
        Number(user?.role === 'employee' ? user?.employeeId : employeeId)
      )
        return false;

      const iStart = new Date(i.issueDate);
      const iEnd = i.expiryDate ? new Date(i.expiryDate) : iStart;

      // Overlap check
      return checkStart <= iEnd && checkEnd >= iStart;
    });

    if (!hasCollision) {
      const targetEmpId = Number(user?.role === 'employee' ? user?.employeeId : employeeId);
      const hasLeaveCollision = allLeaves.some((l: Leave) => {
        if (Number(l.employeeId) !== targetEmpId) return false;
        if (l.status === 'declined') return false;

        const lStart = new Date(l.startDate || l.dateTime);
        const lEnd = new Date(l.endDate || l.dateTime);

        return checkStart < lEnd && checkEnd > lStart;
      });

      if (hasLeaveCollision) {
        notificationService.showAlert(
          t('common.error'),
          t('leaves.collisionError'),
        );
        return;
      }
    } else {
      notificationService.showAlert(
        t('common.error'),
        t('illnesses.collisionError'),
      );
      return;
    }

    setLoading(true);
    try {
      const illnessData = {
        payrollName: payrollName.trim(),
        employeeName:
          (user?.role === 'employee' ? user.name : employeeName).trim() ||
          undefined,
        employeeId:
          rbacService.isEmployee(user) ? user?.employeeId : initialEmployeeId,
        issueDate: issueDate!.toISOString().split('T')[0],
        expiryDate: expiryDate
          ? expiryDate.toISOString().split('T')[0]
          : undefined,
        photoUri: photoUri || undefined,
        notes: notes.trim() || undefined,
        department,
        location,
        companyId,
        teamId,
      };

      let id: number;
      if (isEdit && illnessId) {
        await illnessesDb.update(
          Number(illnessId),
          illnessData as Partial<Illness>,
        );
        id = Number(illnessId);
      } else {
        id = await illnessesDb.add(illnessData as Omit<Illness, 'id'>);
      }

      if (expiryDate) {
        await notificationService.scheduleIllnessExpiryReminder(
          id,
          payrollName,
          expiryDate.toISOString(),
        );
      }

      showModal({
        title: t('common.success'),
        message: isEdit ? t('illnesses.updateSuccess') || t('common.saved') : t('illnesses.saveSuccess') || t('common.saved'),
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => {
              if (Platform.OS === 'web') {
                if (initialEmployeeId) {
                  setActiveTab('Employees');
                } else {
                  setActiveTab('Illnesses', 'IllnessList');
                }
              } else {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Main', { screen: 'Illnesses' });
                }
              }
            },
          },
        ],
      });
    } catch (error) {
      console.error('Error saving illness:', error);
      notificationService.showAlert(
        t('common.error'),
        t('illnesses.saveError'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Section: Medical Case */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('common.generalInfo') || t('navigation.personalInfo')}
            </Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  {t('illnesses.payrollNameLabel')} *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.payrollName && styles.inputError,
                  ]}
                  value={payrollName}
                  onChangeText={text => {
                    setPayrollName(text);
                    if (errors.payrollName)
                      setErrors({ ...errors, payrollName: '' });
                  }}
                  placeholder={t('illnesses.payrollPlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                />
                {errors.payrollName && (
                  <Text style={styles.errorText}>{errors.payrollName}</Text>
                )}
              </View>

              {!rbacService.isEmployee(user) && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>
                    {t('illnesses.employeeNameLabel')}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={employeeName}
                    onChangeText={setEmployeeName}
                    placeholder={t('illnesses.employeePlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                  />
                </View>
              )}
            </View>

            {/* Company / Team / Employee Selection */}
            <View style={styles.responsiveRow}>
              {(rbacService.isAdmin(user) || rbacService.isRH(user)) && (
                <View style={styles.fieldContainer}>
                  <Dropdown
                    label={t('companies.selectCompany')}
                    data={companies.map((c: Company) => ({
                      label: c.name,
                      value: String(c.id),
                    }))}
                    value={companyId ? String(companyId) : ''}
                    onSelect={val => setCompanyId(Number(val))}
                  />
                </View>
              )}
              {(rbacService.isAdmin(user) || rbacService.isRH(user)) && (
                <View style={styles.fieldContainer}>
                  <Dropdown
                    label={t('teams.selectTeam')}
                    data={teams.map((t: Team) => ({
                      label: t.name,
                      value: String(t.id),
                    }))}
                    value={teamId ? String(teamId) : ''}
                    onSelect={val => setTeamId(Number(val))}
                  />
                </View>
              )}
            </View>

            {(user?.role === 'admin' || user?.role === 'rh') && (
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('employees.name') + ' *'}
                  data={employees
                    .filter(e => {
                      if (companyId && e.companyId !== companyId) return false;
                      if (teamId && e.teamId !== teamId) return false;
                      return true;
                    })
                    .map(e => ({
                      label: e.name,
                      value: String(e.id),
                    }))}
                  value={employeeId ? String(employeeId) : ''}
                  onSelect={val => {
                    setEmployeeId(Number(val));
                    if (errors.employeeId) setErrors({ ...errors, employeeId: '' });
                  }}
                  error={errors.employeeId}
                />
              </View>
            )}

            {user?.role !== 'employee' && (
              <View style={styles.responsiveRow}>
                <View style={styles.fieldContainer}>
                  <Dropdown
                    label={t('common.service')}
                    data={services.map(s => ({ label: s.name, value: s.name }))}
                    value={department}
                    onSelect={setDepartment}
                  />
                </View>
                {/* Local field removed as per Phase 7 */}
              </View>
            )}
          </View>

          {/* Section: Period */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('payroll.freqWeekly') || t('leaves.time')}
            </Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('illnesses.startDateLabel') || 'Start Date'}
                  value={issueDate}
                  onChange={setIssueDate}
                  mode="date"
                  required
                  error={errors.issueDate}
                />
              </View>

              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('illnesses.endDateLabel') || 'End Date'}
                  value={expiryDate}
                  onChange={setExpiryDate}
                  mode="date"
                  minimumDate={issueDate || new Date()}
                  error={errors.expiryDate}
                />
              </View>
            </View>

            {issueDate && expiryDate && (
              <Text style={styles.durationText}>
                {t('leaves.duration')}: {Math.ceil((expiryDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} {t('leaves.days')}
              </Text>
            )}
          </View>

          {/* Section: Documentation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.notes')}</Text>

            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleTakePhoto}
            >
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

            <Text style={styles.label}>{t('illnesses.notesLabel')}</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('illnesses.notesLabel')}
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
            {loading
              ? t('common.loading')
              : isEdit
                ? t('illnesses.updateButton')
                : t('illnesses.saveButton')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
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
    photo: { width: 150, height: 100, borderRadius: theme.spacing.s },
    photoPlaceholder: {
      width: 150,
      height: 100,
      borderRadius: theme.spacing.s,
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
    inputError: { borderColor: theme.colors.error },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    durationText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontWeight: '600',
      marginTop: theme.spacing.m,
      textAlign: 'center',
    }
  });
