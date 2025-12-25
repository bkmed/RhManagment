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
import { appointmentsDb } from '../../database/appointmentsDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { CalendarButton } from '../../components/CalendarButton';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const AddAppointmentScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Web Navigation context
  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } }; // fallback pour mobile

  // Get appointmentId only if route exists (mobile)
  const appointmentId = route?.params?.appointmentId;
  const isEdit = !!appointmentId;

  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) loadAppointment();
  }, [appointmentId]);

  useEffect(() => {
    navigation?.setOptions({
      title: isEdit ? t('appointments.edit') : t('appointments.add'),
    });
  }, [isEdit, navigation, t]);

  const loadAppointment = async () => {
    try {
      const appt = await appointmentsDb.getById(appointmentId);
      if (appt) {
        setTitle(appt.title);
        setDoctorName(appt.doctorName || '');
        setLocation(appt.location || '');
        const dateTime = new Date(appt.dateTime);
        setDate(dateTime);
        setTime(dateTime);
        setNotes(appt.notes || '');
        setReminderEnabled(appt.reminderEnabled);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('appointments.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = t('common.required');
    if (!date) newErrors.date = t('common.required');
    if (!time) newErrors.time = t('common.required');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // Create combined DateTime
      const finalDateTime = new Date(date!);
      finalDateTime.setHours(time!.getHours());
      finalDateTime.setMinutes(time!.getMinutes());
      finalDateTime.setSeconds(0);
      finalDateTime.setMilliseconds(0);

      const appointmentData = {
        title: title.trim(),
        doctorName: doctorName.trim() || undefined,
        location: location.trim() || undefined,
        dateTime: finalDateTime.toISOString(),
        notes: notes.trim() || undefined,
        reminderEnabled,
      };

      let id: number;
      if (isEdit) {
        await appointmentsDb.update(appointmentId, appointmentData);
        id = appointmentId;
        await notificationService.cancelAppointmentReminder(appointmentId);
      } else {
        id = await appointmentsDb.add(appointmentData);
      }

      if (reminderEnabled) {
        await notificationService.scheduleAppointmentReminder(
          id,
          title,
          finalDateTime.toISOString(),
        );
      }

      // Go back: Mobile stack or Web tab
      if (Platform.OS === 'web') {
        setActiveTab('Appointments'); // retourne à la liste
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert(t('common.error'), t('appointments.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.label}>{t('appointments.appointmentTitle')} *</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={text => {
            setTitle(text);
            if (errors.title) setErrors({ ...errors, title: '' });
          }}
          placeholder={t('appointments.titlePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        {/* Doctor */}
        <Text style={styles.label}>{t('appointments.doctor')}</Text>
        <TextInput
          style={styles.input}
          value={doctorName}
          onChangeText={setDoctorName}
          placeholder={t('appointments.doctorPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        {/* Location */}
        <Text style={styles.label}>{t('appointments.location')}</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder={t('appointments.locationPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        {/* Date */}
        <DateTimePickerField
          label={t('appointments.date')}
          value={date}
          onChange={setDate}
          mode="date"
          minimumDate={new Date()}
          required
          error={errors.date}
          placeholder={t('appointments.date')}
        />

        {/* Time */}
        <DateTimePickerField
          label={t('appointments.time')}
          value={time}
          onChange={setTime}
          mode="time"
          required
          error={errors.time}
          placeholder={t('appointments.time')}
        />

        {/* Notes */}
        <Text style={styles.label}>{t('appointments.notes')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('appointments.notesPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          multiline
          numberOfLines={4}
        />

        {/* Reminder Switch */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>{t('appointments.enableReminder')}</Text>
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

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {isEdit ? t('appointments.update') : t('appointments.save')}
          </Text>
        </TouchableOpacity>

        {/* Calendar Button */}
        <CalendarButton
          title={title}
          date={date ? date.toISOString().split('T')[0] : ''}
          time={time ? time.toTimeString().substring(0, 5) : ''}
          location={location}
          notes={`Doctor: ${doctorName}\n${notes}`}
        />
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
