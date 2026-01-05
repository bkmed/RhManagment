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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { leavesDb } from '../../database/leavesDb';
import { notificationService } from '../../services/notificationService';
import { emailService } from '../../services/emailService';
import { storageService } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';
import { CalendarButton } from '../../components/CalendarButton';
import { Dropdown } from '../../components/Dropdown';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { RootState } from '../../store';

export const AddLeaveScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const leaveId = route?.params?.leaveId;
  const isEdit = !!leaveId;
  const initialEmployeeName = route?.params?.employeeName || '';
  const initialEmployeeId = route?.params?.employeeId;

  const [title, setTitle] = useState('');
  const [employeeName, setEmployeeName] = useState(initialEmployeeName);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [type, setType] = useState<'leave' | 'sick_leave' | 'carer_leave' | 'permission' | 'authorization'>('leave');
  const [status, setStatus] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [department, setDepartment] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const allCompanies = useSelector((state: RootState) => selectAllCompanies(state));
  const allTeams = useSelector((state: RootState) => selectAllTeams(state));
  const allEmployees = useSelector((state: RootState) => selectAllEmployees(state));

  const [companyId, setCompanyId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(user?.role === 'employee' && user?.id ? Number(user.id) : null);

  // Cascading lists
  const filteredTeams = useMemo(() => {
    if (!companyId) return [];
    return allTeams.filter(t => t.companyId === companyId);
  }, [allTeams, companyId]);

  const filteredEmployees = useMemo(() => {
    if (!companyId && !teamId) return allEmployees;
    return allEmployees.filter(emp => {
      const matchesCompany = !companyId || emp.companyId === companyId;
      const matchesTeam = !teamId || emp.teamId === teamId;
      return matchesCompany && matchesTeam;
    });
  }, [allEmployees, companyId, teamId]);

  // Permission specific state
  const [permissionDate, setPermissionDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // +1 hour
  const [maxPermissionHours, setMaxPermissionHours] = useState(2);

  // Auto-fill logic for employees
  useEffect(() => {
    loadConfig();
    if (!isEdit && user?.role === 'employee') {
      setEmployeeName(user.name);
      setDepartment(user.department || '');
      setEmployeeId(user.employeeId || null);
    }
  }, [user, isEdit]);

  const loadConfig = async () => {
    const savedMax = await storageService.getString('config_max_permission_hours');
    if (savedMax) {
      setMaxPermissionHours(parseInt(savedMax, 10));
    }
  };


  const { setActiveTab } = useContext(WebNavigationContext);

  useEffect(() => {
    navigation?.setOptions({
      title: isEdit ? t('leaves.edit') : t('leaves.add'),
    });
    if (isEdit) loadLeave();
  }, [leaveId]);

  const loadLeave = async () => {
    if (!leaveId) return;
    try {
      const leave = await leavesDb.getById(leaveId);
      if (leave) {
        setTitle(leave.title || '');
        setEmployeeName(leave.employeeName || '');
        setEmployeeId(leave.employeeId || null);
        setLocation(leave.location || '');
        setStartDate(leave.startDate ? new Date(leave.startDate) : new Date(leave.dateTime));
        setEndDate(leave.endDate ? new Date(leave.endDate) : new Date(leave.dateTime));
        setNotes(leave.notes || '');
        setReminderEnabled(!!leave.reminderEnabled);
        setType(leave.type || 'leave');
        setStatus(leave.status || 'pending');
        setDepartment(leave.department || '');
      }
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('leaves.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = t('common.required');
    if (!employeeId && user?.role !== 'employee') newErrors.employeeId = t('common.required');

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
          newErrors.endDate = t('permissions.errorDuration', { hours: maxPermissionHours });
        }
      }

      // Construct full dates
      permissionStart = new Date(permissionDate);
      permissionStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

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

    setLoading(true);

    try {
      const selectedEmp = allEmployees.find(e => e.id === employeeId);
      const leaveData = {
        title: title.trim(),
        employeeName: (user?.role === 'employee' ? (user?.name || '') : (selectedEmp?.name || employeeName)).trim(),
        employeeId: (user?.role === 'employee' ? user?.employeeId : employeeId) || 0,
        location: location.trim() || undefined,
        dateTime: (type === 'permission' || type === 'authorization') ? permissionStart!.toISOString() : startDate!.toISOString(),
        startDate: (type === 'permission' || type === 'authorization') ? permissionStart!.toISOString() : startDate!.toISOString(),
        endDate: (type === 'permission' || type === 'authorization') ? permissionEnd!.toISOString() : endDate!.toISOString(),
        notes: notes.trim() || undefined,
        reminderEnabled,
        type,
        status,
        department: selectedEmp?.department || department,
        companyId: selectedEmp?.companyId || companyId,
        teamId: selectedEmp?.teamId || teamId,
      };

      let id: number;
      if (isEdit && leaveId) {
        await leavesDb.update(leaveId, leaveData);
        id = leaveId;
      } else {
        id = await leavesDb.add(leaveData);

        // Notify HR/Admin (Simulated via local notification for now)
        await notificationService.notifyNewLeaveRequest(id, leaveData.employeeName, t(`leaveTypes.${type}`));

        if (sendEmail) {
          // Open Email Draft for HR - Don't await to avoid blocking UI
          emailService.sendLeaveRequestEmail(
            leaveData.employeeName,
            t(`leaveTypes.${type}`),
            startDate?.toLocaleDateString() || new Date().toLocaleDateString(),
            endDate?.toLocaleDateString() || new Date().toLocaleDateString(),
            notes || ''
          ).catch(err => console.error('Email error:', err));
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

      // Show Success Pulse
      showToast(
        isEdit ? t('leaves.updateSuccess') : t('leaves.successMessage'),
        'success'
      );

      // Navigation Logic with a small delay to allow toast/state to settle
      setTimeout(() => {
        if (Platform.OS === 'web') {
          if (initialEmployeeId) {
            setActiveTab('Employees', 'EmployeeDetails', { employeeId: initialEmployeeId });
          } else {
            setActiveTab('Leaves', '', {});
          }
        } else {
          if (navigation && navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Leaves' as any);
          }
        }
      }, 100);
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
                { label: t('leaveTypes.authorization'), value: 'authorization' },
                { label: t('leaveTypes.permission'), value: 'permission' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setType(item.value as any)}
                  style={[styles.typeChip, type === item.value && styles.activeTypeChip]}
                >
                  <Text style={[styles.typeChipText, type === item.value && styles.activeTypeChipText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('leaves.leaveTitle')} *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={title}
                onChangeText={text => {
                  setTitle(text);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder={t('leaves.titlePlaceholder')}
                placeholderTextColor={theme.colors.subText}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {(user?.role === 'admin' || user?.role === 'rh') && (
              <>
                <View style={styles.responsiveRow}>
                  <View style={styles.fieldContainer}>
                    <Dropdown
                      label={t('companies.selectCompany')}
                      data={[
                        { label: t('common.allCompanies'), value: '' },
                        ...allCompanies.map(c => ({ label: c.name, value: String(c.id) }))
                      ]}
                      value={companyId ? String(companyId) : ''}
                      onSelect={(val) => {
                        setCompanyId(val ? Number(val) : null);
                        setTeamId(null);
                        setEmployeeId(null);
                      }}
                    />
                  </View>
                  <View style={styles.fieldContainer}>
                    <Dropdown
                      label={t('teams.selectTeam')}
                      data={[
                        { label: t('common.noTeam'), value: '' },
                        ...filteredTeams.map(t => ({ label: t.name, value: String(t.id) }))
                      ]}
                      value={teamId ? String(teamId) : ''}
                      onSelect={(val) => {
                        setTeamId(val ? Number(val) : null);
                        setEmployeeId(null);
                      }}
                    />
                  </View>
                </View>

                <View style={styles.fieldContainer}>
                  <Dropdown
                    label={t('leaves.employee')}
                    data={filteredEmployees.map(e => ({ label: e.name, value: String(e.id) }))}
                    value={employeeId ? String(employeeId) : ''}
                    onSelect={(val) => {
                      setEmployeeId(Number(val));
                      if (errors.employeeId) setErrors({ ...errors, employeeId: '' });
                    }}
                    error={errors.employeeId}
                  />
                </View>
              </>
            )}

            {user?.role !== 'employee' && (
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('leaves.status')}
                  data={[
                    { label: t('leaveStatus.pending'), value: 'pending' },
                    { label: t('leaveStatus.approved'), value: 'approved' },
                    { label: t('leaveStatus.declined'), value: 'declined' },
                  ]}
                  value={status}
                  onSelect={(val: any) => setStatus(val)}
                />
              </View>
            )}
          </View>

          {/* Section: Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('leaves.time')}</Text>

            <View style={styles.responsiveRow}>
              {(type === 'permission' || type === 'authorization') ? (
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
                <Text style={styles.captionText}>{t('profile.notifications')}</Text>
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
                date={startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                time={startDate ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00'}
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
            {loading ? t('common.loading') : isEdit ? t('leaves.update') : t('leaves.save')}
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
    captionText: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
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
