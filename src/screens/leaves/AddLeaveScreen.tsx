import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Image, // Added Image import
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'; // Added image picker imports
import { useTranslation } from 'react-i18next';
import { leavesDb } from '../../database/leavesDb';
import { Leave, Company, Team, Employee, Illness } from '../../database/schema';
import { Permission, rbacService } from '../../services/rbacService';
import { notificationService } from '../../services/notificationService';
import { emailService } from '../../services/emailService';
import { storageService } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';
import { CalendarButton } from '../../components/CalendarButton';
import { Dropdown } from '../../components/Dropdown';
import { useModal } from '../../context/ModalContext';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { selectAllLeaves } from '../../store/slices/leavesSlice';
import { selectAllIllnesses } from '../../store/slices/illnessesSlice';
import { RootState } from '../../store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, ParamListBase } from '@react-navigation/native';

export const AddLeaveScreen = ({
  navigation,
  route,
}: {
  navigation: NativeStackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase>;
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showModal } = useModal(); // Added useModal hook
  const styles = useMemo(() => createStyles(theme), [theme]);

  const params = route.params as
    | { leaveId?: string; employeeName?: string; employeeId?: number }
    | undefined;
  const leaveId = params?.leaveId;
  const isEdit = !!leaveId;
  const initialEmployeeName = params?.employeeName || '';
  const initialEmployeeId = params?.employeeId;

  const [title, setTitle] = useState('');
  const [employeeName, setEmployeeName] = useState(initialEmployeeName);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [type, setType] = useState<
    'leave' | 'sick_leave' | 'carer_leave' | 'permission' | 'authorization'
  >('leave');
  const [status, setStatus] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [department, setDepartment] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const allCompanies = useSelector((state: RootState) =>
    selectAllCompanies(state),
  );
  const allTeams = useSelector((state: RootState) => selectAllTeams(state));
  const allEmployees = useSelector((state: RootState) =>
    selectAllEmployees(state),
  );
  const allLeaves = useSelector((state: RootState) => selectAllLeaves(state));
  const allIllnesses = useSelector((state: RootState) => selectAllIllnesses(state));

  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [teamId, setTeamId] = useState<number | undefined>(undefined);
  const [employeeId, setEmployeeId] = useState<number | undefined>(
    user?.role === 'employee' && user?.id ? Number(user.id) : undefined,
  );

  // Cascading lists
  const filteredTeams = useMemo(() => {
    if (!companyId) return [];
    return allTeams.filter((t: Team) => t.companyId === companyId);
  }, [allTeams, companyId]);

  const filteredEmployees = useMemo(() => {
    if (!companyId && !teamId) return allEmployees;
    return allEmployees.filter((emp: Employee) => {
      const matchesCompany = !companyId || emp.companyId === companyId;
      const matchesTeam = !teamId || emp.teamId === teamId;
      return matchesCompany && matchesTeam;
    });
  }, [allEmployees, companyId, teamId]);

  // Permission specific state
  const [permissionDate, setPermissionDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000),
  ); // +1 hour
  const [maxPermissionHours, setMaxPermissionHours] = useState(2);

  // Auto-fill logic for employees
  useEffect(() => {
    loadConfig();
    if (!isEdit && user?.role === 'employee') {
      setEmployeeName(user.name);
      setDepartment(user.department || '');
      setEmployeeId(user.employeeId || undefined);
    }
  }, [user, isEdit]);

  const loadConfig = async () => {
    const savedMax = await storageService.getString(
      'config_max_permission_hours',
    );
    if (savedMax) {
      setMaxPermissionHours(parseInt(savedMax, 10));
    }
  };

  const { setActiveTab } = useContext(WebNavigationContext);

  useEffect(() => {
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        title: isEdit ? t('leaves.edit') : t('leaves.add'),
      });
    }
    if (isEdit) loadLeave();
  }, [leaveId]);

  const handleTakePhoto = () => {
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

  const loadLeave = async () => {
    if (!leaveId) return;
    try {
      const leave = await leavesDb.getById(Number(params?.leaveId));
      if (leave) {
        setTitle(leave.title || '');
        setEmployeeName(leave.employeeName || '');
        setEmployeeId(leave.employeeId || undefined);
        setLocation(leave.location || '');
        setStartDate(
          leave.startDate
            ? new Date(leave.startDate)
            : new Date(leave.dateTime),
        );
        setEndDate(
          leave.endDate ? new Date(leave.endDate) : new Date(leave.dateTime),
        );
        setNotes(leave.notes || '');
        setReminderEnabled(!!leave.reminderEnabled);
        setType(leave.type || 'leave');
        setStatus(leave.status || 'pending');
        setDepartment(leave.department || '');
        setPhotoUri(leave.photoUri || undefined); // Added photoUri load
      }
    } catch {
      notificationService.showAlert(t('common.error'), t('leaves.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = t('common.required');
    if (!employeeId && user?.role !== 'employee')
      newErrors.employeeId = t('common.required');

    let permissionStart: Date | null = null;
    let permissionEnd: Date | null = null;

    if (type === 'permission' || type === 'authorization') {
      // Validate Permission
      if (startTime >= endTime) {
        newErrors.endDate = t('permissions.invalidTime');
      } else {
        const diffMs = endTime.getTime() - startTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > maxPermissionHours) {
          newErrors.endDate = t('permissions.errorDuration', {
            hours: maxPermissionHours,
          });
        }
      }

      // Construct full dates
      permissionStart = new Date(permissionDate);
      permissionStart.setHours(
        startTime.getHours(),
        startTime.getMinutes(),
        0,
        0,
      );

      permissionEnd = new Date(permissionDate);
      permissionEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    } else {
      // Validate Leave
      if (!startDate) newErrors.startDate = t('common.required');
      if (!endDate) newErrors.endDate = t('common.required');
      if (startDate && endDate && startDate > endDate) {
        newErrors.endDate = t('common.invalidDateRange');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Collision Check
    const finalStartDate =
      type === 'permission' || type === 'authorization'
        ? permissionStart!
        : startDate!;
    const finalEndDate =
      type === 'permission' || type === 'authorization'
        ? permissionEnd!
        : endDate!;

    const hasCollision = allLeaves.some((l: Leave) => {
      if (l.id === leaveId) return false;
      if (
        Number(l.employeeId) !==
        Number(user?.role === 'employee' ? user?.employeeId : employeeId)
      )
        return false;
      if (l.status === 'declined') return false;

      const lStart = new Date(l.startDate || l.dateTime);
      const lEnd = new Date(l.endDate || l.dateTime);

      return finalStartDate < lEnd && finalEndDate > lStart;
    });

    if (!hasCollision) {
      const targetEmpId = Number(user?.role === 'employee' ? user?.employeeId : employeeId);
      const hasIllnessCollision = allIllnesses.some((i: Illness) => {
        if (Number(i.employeeId) !== targetEmpId) return false;

        const iStart = new Date(i.issueDate);
        const iEnd = i.expiryDate ? new Date(i.expiryDate) : iStart;

        // Match precision with illness (midnight dates usually)
        return finalStartDate <= iEnd && finalEndDate >= iStart;
      });

      if (hasIllnessCollision) {
        notificationService.showAlert(
          t('common.error'),
          t('illnesses.collisionError'),
        );
        return;
      }
    } else {
      notificationService.showAlert(
        t('common.error'),
        t('leaves.collisionError'),
      );
      return;
    }

    setLoading(true);

    try {
      const selectedEmp = allEmployees.find((e: Employee) => e.id === employeeId);
      const leaveData = {
        title: title.trim(),
        employeeName: (rbacService.isEmployee(user)
          ? user?.name || ''
          : selectedEmp?.name || employeeName
        ).trim(),
        employeeId:
          (rbacService.isEmployee(user) ? user?.employeeId : employeeId) || 0,
        location: location.trim() || undefined,
        dateTime:
          type === 'permission' || type === 'authorization'
            ? permissionStart!.toISOString()
            : startDate!.toISOString(),
        startDate:
          type === 'permission' || type === 'authorization'
            ? permissionStart!.toISOString()
            : startDate!.toISOString(),
        endDate:
          type === 'permission' || type === 'authorization'
            ? permissionEnd!.toISOString()
            : endDate!.toISOString(),
        notes: notes.trim() || undefined,
        reminderEnabled,
        type,
        status: rbacService.isEmployee(user) ? 'pending' : status, // Force pending for employees
        department: selectedEmp?.department || department,
        companyId: selectedEmp?.companyId || companyId,
        teamId: selectedEmp?.teamId || teamId,
        photoUri: photoUri || undefined, // Added photoUri to leaveData
      };

      let id: number;
      if (isEdit && leaveId) {
        await leavesDb.update(Number(leaveId), leaveData);
        id = Number(leaveId);
      } else {
        id = await leavesDb.add(leaveData);

        // Notify HR/Admin (Simulated via local notification for now)
        await notificationService.notifyNewLeaveRequest(
          id,
          leaveData.employeeName,
          t(`leaveTypes.${type}`),
        );

        if (sendEmail) {
          // Open Email Draft for HR - Don't await to avoid blocking UI
          emailService
            .sendLeaveRequestEmail(
              leaveData.employeeName,
              t(`leaveTypes.${type}`),
              startDate?.toLocaleDateString() ||
              new Date().toLocaleDateString(),
              endDate?.toLocaleDateString() || new Date().toLocaleDateString(),
              notes || '',
            )
            .catch(err => console.error('Email error:', err));
        }
      }

      if (reminderEnabled) {
        await notificationService.scheduleLeaveReminder(
          id,
          title,
          startDate!.toISOString(),
        );
      } else {
        await notificationService.cancelLeaveReminder(id);
      }

      showModal({
        title: t('common.success'),
        message: isEdit ? t('leaves.updateSuccess') : t('leaves.successMessage'),
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => {
              if (Platform.OS === 'web') {
                if (initialEmployeeId) {
                  setActiveTab('Employees', 'EmployeeDetails', {
                    employeeId: initialEmployeeId,
                  });
                } else {
                  setActiveTab('Leaves', 'LeaveList');
                }
              } else {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Main', { screen: 'Leaves' });
                }
              }
            },
          },
        ],
      });
    } catch (error) {
      console.error('Error saving leave:', error);
      notificationService.showAlert(t('common.error'), t('leaves.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Section: Leave Type & Identity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('leaves.leaveType')}</Text>

            <View style={styles.typeSelector}>
              {[
                { label: t('leaveTypes.standard_leave'), value: 'leave' },
                { label: t('leaveTypes.sick_leave'), value: 'sick_leave' },
                { label: t('leaveTypes.carer_leave'), value: 'carer_leave' },
                {
                  label: t('leaveTypes.authorization'),
                  value: 'authorization',
                },
                { label: t('leaveTypes.permission'), value: 'permission' },
              ].map(item => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setType(item.value as Leave['type'])}
                  style={[
                    styles.typeChip,
                    type === item.value && styles.activeTypeChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      type === item.value && styles.activeTypeChipText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('leaves.subject') || 'Objet'} *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={title}
                onChangeText={text => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder={t('leaves.subjectPlaceholder') || 'Objet de la demande'}
                placeholderTextColor={theme.colors.subText}
              />
              {errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}
            </View>

            {(rbacService.isAdmin(user) || rbacService.isRH(user)) && (
              <>
                <View style={styles.responsiveRow}>
                  <View style={styles.fieldContainer}>
                    <Dropdown
                      label={t('companies.selectCompany')}
                      data={[
                        { label: t('common.allCompanies'), value: '' },
                        ...allCompanies.map((c: Company) => ({
                          label: c.name,
                          value: String(c.id),
                        })),
                      ]}
                      value={companyId ? String(companyId) : ''}
                      onSelect={val => {
                        setCompanyId(val ? Number(val) : undefined);
                        setTeamId(undefined);
                        setEmployeeId(undefined);
                      }}
                    />
                  </View>
                  <View style={styles.fieldContainer}>
                    <Dropdown
                      label={t('teams.selectTeam')}
                      data={[
                        { label: t('common.noTeam'), value: '' },
                        ...filteredTeams.map((t: Team) => ({
                          label: t.name,
                          value: String(t.id),
                        })),
                      ]}
                      value={teamId ? String(teamId) : ''}
                      onSelect={val => {
                        setTeamId(val ? Number(val) : undefined);
                        setEmployeeId(undefined);
                      }}
                    />
                  </View>
                </View>

                <View style={styles.fieldContainer}>
                  <Dropdown
                    label={t('leaves.employee')}
                    data={filteredEmployees.map((e: Employee) => ({
                      label: e.name,
                      value: String(e.id),
                    }))}
                    value={employeeId ? String(employeeId) : ''}
                    onSelect={val => {
                      setEmployeeId(Number(val));
                      if (errors.employeeId)
                        setErrors({ ...errors, employeeId: '' });
                    }}
                    error={errors.employeeId}
                  />
                </View>
              </>
            )}

            {(rbacService.isAdmin(user) || rbacService.isRH(user) || rbacService.isManager(user)) && (
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('leaves.status')}
                  data={[
                    { label: t('leaveStatus.pending'), value: 'pending' },
                    { label: t('leaveStatus.approved'), value: 'approved' },
                    { label: t('leaveStatus.declined'), value: 'declined' },
                  ]}
                  value={status}
                  onSelect={(val: string) => setStatus(val as Leave['status'])}
                />
              </View>
            )}
          </View>

          {/* Section: Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('leaves.time')}</Text>

            <View style={styles.responsiveRow}>
              {type === 'permission' || type === 'authorization' ? (
                <>
                  <View style={styles.fieldContainer}>
                    <DateTimePickerField
                      label={t('permissions.date')}
                      value={permissionDate}
                      onChange={setPermissionDate}
                      mode="date"
                      minimumDate={new Date()}
                      required
                    />
                  </View>
                  <View style={styles.fieldContainer}>
                    <DateTimePickerField
                      label={t('permissions.startTime')}
                      value={startTime}
                      onChange={setStartTime}
                      mode="time"
                      required
                    />
                  </View>
                  <View style={styles.fieldContainer}>
                    <DateTimePickerField
                      label={t('permissions.endTime')}
                      value={endTime}
                      onChange={setEndTime}
                      mode="time"
                      required
                      error={errors.endDate}
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.fieldContainer}>
                    <DateTimePickerField
                      label={t('payroll.startDate')}
                      value={startDate}
                      onChange={setStartDate}
                      mode="date"
                      minimumDate={new Date()}
                      required
                      error={errors.startDate}
                    />
                  </View>
                  <View style={styles.fieldContainer}>
                    <DateTimePickerField
                      label={t('payroll.endDate')}
                      value={endDate}
                      onChange={setEndDate}
                      mode="date"
                      minimumDate={startDate || new Date()}
                      required
                      error={errors.endDate}
                    />
                  </View>
                </>
              )}
            </View>

            {type === 'sick_leave' && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('illnesses.addPhoto')}</Text>
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
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('leaves.cause') || 'Cause'}</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder={t('leaves.causePlaceholder') || 'Cause de la demande'}
                placeholderTextColor={theme.colors.subText}
              />
            </View>
          </View>

          {/* Section: Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.notes')}</Text>

            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('leaves.notesPlaceholder')}
              placeholderTextColor={theme.colors.subText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>{t('leaves.enableReminder')}</Text>
                <Text style={styles.captionText}>
                  {t('profile.notifications')}
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>{t('common.sendEmail')}</Text>
                <Text style={styles.captionText}>{t('common.notifyHr')}</Text>
              </View>
              <Switch
                value={sendEmail}
                onValueChange={setSendEmail}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.surface}
              />
            </View>

            <View style={styles.calendarButtonContainer}>
              <CalendarButton
                title={title || t('leaves.title')}
                date={
                  startDate
                    ? startDate.toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                time={
                  startDate
                    ? startDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                    : '12:00'
                }
                location={location}
                notes={`${t('leaves.employee')}: ${employeeName}\n${notes}`}
              />
            </View>
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
                ? t('leaves.update')
                : t('leaves.save')}
          </Text>
        </TouchableOpacity>
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
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    typeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.m,
    },
    typeChip: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeTypeChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    typeChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    activeTypeChipText: {
      color: '#FFF',
    },
    responsiveRow: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: theme.spacing.m,
    },
    fieldContainer: {
      flex: 1,
      marginBottom: theme.spacing.m,
    },
    fieldGroup: {
      marginTop: theme.spacing.m,
    },
    label: {
      fontSize: 13,
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
    notesInput: { height: 100, textAlignVertical: 'top' },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    captionText: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.l,
    },
    calendarButtonContainer: {
      marginTop: theme.spacing.l,
    },
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
      color: '#FFF',
      fontWeight: 'bold',
    },
    inputError: { borderColor: theme.colors.error },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });
