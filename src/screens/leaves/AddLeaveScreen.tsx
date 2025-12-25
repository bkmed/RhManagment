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
import { calendarService } from '../../services/calendarService';
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
    ? useContext(WebNavigationContext)
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

      // If came from EmployeeDetails (has initialEmployeeName), return to Employees
      // Otherwise return to Leaves
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
        {/* Title */}
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

        {/* Employee */}
        <Text style={styles.label}>{t('leaves.employee')}</Text>
        <TextInput
          style={styles.input}
          value={employeeName}
          onChangeText={setEmployeeName}
          placeholder={t('leaves.employeePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        {/* Location/Type */}
        <Text style={styles.label}>{t('leaves.location')}</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder={t('leaves.locationPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        {/* Date & Time */}
        <DateTimePickerField
          label={t('leaves.date')}
          value={dateTime}
          onChange={setDateTime}
          mode="date"
          minimumDate={new Date()}
          required
          error={errors.dateTime}
        />

        <DateTimePickerField
          label={t('leaves.time')}
          value={dateTime}
          onChange={setDateTime}
          mode="time"
        />

        {/* Notes */}
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

        {/* Reminder */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>{t('leaves.enableReminder')}</Text>
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

        {/* Add to Calendar */}
        <CalendarButton
          title={title || t('leaves.title')}
          startDate={dateTime || new Date()}
          location={location}
          notes={`Employee: ${employeeName}\n${notes}`}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {isEdit ? t('leaves.update') : t('leaves.save')}
          </Text>
        </TouchableOpacity>
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
      padding: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.body,
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
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    notesInput: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.m,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.small,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });
