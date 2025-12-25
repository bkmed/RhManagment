import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
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

export const AddLeaveScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
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
  const [type, setType] = useState<'leave' | 'permission'>('leave');
  const [status, setStatus] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [department, setDepartment] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

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
      Alert.alert(t('common.error'), t('leaves.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = t('common.required');

    let permissionStart: Date | null = null;
    let permissionEnd: Date | null = null;

    if (type === 'permission') {
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
      const leaveData = {
        title: title.trim(),
        employeeName: (user?.role === 'employee' ? user.name : employeeName).trim() || undefined,
        employeeId: user?.role === 'employee' ? user.employeeId : initialEmployeeId,
        location: location.trim() || undefined,
        dateTime: type === 'permission' ? permissionStart!.toISOString() : startDate!.toISOString(),
        startDate: type === 'permission' ? permissionStart!.toISOString() : startDate!.toISOString(),
        endDate: type === 'permission' ? permissionEnd!.toISOString() : endDate!.toISOString(),
        notes: notes.trim() || undefined,
        reminderEnabled,
        type,
        status,
        department,
      };

      let id: number;
      if (isEdit && leaveId) {
        await leavesDb.update(leaveId, leaveData);
        id = leaveId;
      } else {
        id = await leavesDb.add(leaveData);

        // Notify HR/Admin (Simulated via local notification for now)
        await notificationService.notifyNewLeaveRequest(id, employeeName, t(`leaveTypes.${type}`));

        if (sendEmail) {
          // Open Email Draft for HR
          await emailService.sendLeaveRequestEmail(
            employeeName,
            t(`leaveTypes.${type}`),
            startDate!.toLocaleDateString(),
            endDate!.toLocaleDateString(),
            notes || ''
          );
        } else {
          // Just notify via app service (already handled above)
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

      // Navigation Logic
      if (Platform.OS === 'web') {
        // Explicitly reset subScreen to empty to return to list
        if (initialEmployeeName) {
          setActiveTab('Employees', '', {});
        } else {
          setActiveTab('Leaves', '', {});
        }
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving leave:', error);
      Alert.alert(t('common.error'), t('leaves.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Section: General Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.generalInfo') || t('navigation.personalInfo')}</Text>

            <View style={styles.responsiveRow}>
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

              {user?.role !== 'employee' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>{t('leaves.employee')}</Text>
                  <TextInput
                    style={styles.input}
                    value={employeeName}
                    onChangeText={setEmployeeName}
                    placeholder={t('leaves.employeePlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                  />
                </View>
              )}
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('leaves.leaveType')}
                  data={[
                    { label: t('leaveTypes.leave'), value: 'leave' },
                    { label: t('leaveTypes.permission'), value: 'permission' },
                  ]}
                  value={type}
                  onSelect={(val: any) => setType(val)}
                />
              </View>

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

            {user?.role !== 'employee' && (
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
            )}
          </View>

          {/* Section: Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.freqWeekly') || t('leaves.time')}</Text>

            <View style={styles.responsiveRow}>
              {type === 'permission' ? (
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
          </View>

          {/* Section: Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.notes')}</Text>

            <Text style={styles.label}>{t('leaves.notes')}</Text>
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
                <Text style={styles.label}>{t('common.sendEmail') || "Envoyer un email"}</Text>
                <Text style={styles.captionText}>{t('common.notifyHr') || "Notifier les RH"}</Text>
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
      </ScrollView >
    </View >
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
    fieldGroup: {
      marginTop: theme.spacing.m,
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
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.m,
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
