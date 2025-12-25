import React, { useState, useEffect, useMemo, useContext } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';
import { CalendarButton } from '../../components/CalendarButton';

export const AddLeaveScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const leaveId = route?.params?.leaveId;
  const isEdit = !!leaveId;
  const initialEmployeeName = route?.params?.employeeName || '';
  const initialEmployeeId = route?.params?.employeeId;

  const [title, setTitle] = useState('');
  const [employeeName, setEmployeeName] = useState(initialEmployeeName);
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext) as any
    : { setActiveTab: () => { } };

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
        setDateTime(leave.dateTime ? new Date(leave.dateTime) : new Date());
        setNotes(leave.notes || '');
        setReminderEnabled(!!leave.reminderEnabled);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('leaves.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = t('common.required');
    if (!dateTime) newErrors.dateTime = t('common.required');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const leaveData = {
        title: title.trim(),
        employeeName: employeeName.trim() || undefined,
        employeeId: initialEmployeeId,
        location: location.trim() || undefined,
        dateTime: dateTime!.toISOString(),
        notes: notes.trim() || undefined,
        reminderEnabled,
      };

      let id: number;
      if (isEdit && leaveId) {
        await leavesDb.update(leaveId, leaveData);
        id = leaveId;
      } else {
        id = await leavesDb.add(leaveData);
      }

      if (reminderEnabled) {
        await notificationService.scheduleLeaveReminder(
          id,
          title,
          dateTime!.toISOString(),
        );
      } else {
        await notificationService.cancelLeaveReminder(id);
      }

      if (Platform.OS === 'web') {
        if (initialEmployeeName) {
          setActiveTab('Employees');
        } else {
          setActiveTab('Leaves');
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
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{t('leaves.location')}</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder={t('leaves.locationPlaceholder')}
                placeholderTextColor={theme.colors.subText}
              />
            </View>
          </View>

          {/* Section: Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.freqWeekly') || t('leaves.time')}</Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('leaves.date')}
                  value={dateTime}
                  onChange={setDateTime}
                  mode="date"
                  minimumDate={new Date()}
                  required
                  error={errors.dateTime}
                />
              </View>

              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('leaves.time')}
                  value={dateTime}
                  onChange={setDateTime}
                  mode="time"
                />
              </View>
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

            <View style={styles.calendarButtonContainer}>
              <CalendarButton
                title={title || t('leaves.title')}
                date={dateTime ? dateTime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                time={dateTime ? dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00'}
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
    container: { backgroundColor: theme.colors.background, flex: 1 },
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
