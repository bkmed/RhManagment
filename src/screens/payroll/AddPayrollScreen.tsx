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
import { medicationsDb } from '../../database/medicationsDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const AddMedicationScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const medicationId = route?.params?.medicationId;
  const isEdit = !!medicationId;

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [times, setTimes] = useState<Date[]>([new Date(new Date().setHours(8, 0, 0, 0)), new Date(new Date().setHours(20, 0, 0, 0))]);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) loadMedication();
  }, [medicationId]);

  useEffect(() => {
    navigation?.setOptions({
      title: isEdit ? t('medications.edit') : t('medications.add'),
    });
  }, [isEdit, navigation, t]);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } };

  const loadMedication = async () => {
    if (!medicationId) return;
    try {
      const med = await medicationsDb.getById(medicationId);
      if (med) {
        setName(med.name || '');
        setDosage(med.dosage || '');
        setFrequency(med.frequency || 'Daily');

        // Parse times usually string "['08:00', '20:00']"
        // Convert to Date objects for the picker
        let parsedTimes: Date[] = [];
        try {
          const timeStrings = med.times ? JSON.parse(med.times) : ['08:00', '20:00'];
          parsedTimes = timeStrings.map((ts: string) => {
            const [h, m] = ts.split(':').map(Number);
            const d = new Date();
            d.setHours(h);
            d.setMinutes(m);
            return d;
          });
        } catch (e) {
          parsedTimes = [new Date(new Date().setHours(8, 0)), new Date(new Date().setHours(20, 0))];
        }
        setTimes(parsedTimes);

        setStartDate(med.startDate ? new Date(med.startDate) : new Date());
        setEndDate(med.endDate ? new Date(med.endDate) : null);
        setNotes(med.notes || '');
        setReminderEnabled(!!med.reminderEnabled);
        setIsUrgent(!!med.isUrgent);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('medications.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = t('common.required');
    if (!dosage.trim()) newErrors.dosage = t('common.required');
    if (!startDate) newErrors.startDate = t('common.required');

    // Validate End Date > Start Date
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = t('common.invalidDateRange'); // Add key to i18n
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // Format times back to string array HH:MM
      const timeStrings = times.map(t =>
        t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );

      const medicationData = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        times: JSON.stringify(timeStrings),
        startDate: startDate!.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        notes: notes.trim() || undefined,
        reminderEnabled,
        isUrgent,
      };

      let id: number;
      if (isEdit && medicationId) {
        await medicationsDb.update(medicationId, medicationData);
        id = medicationId;
      } else {
        id = await medicationsDb.add(medicationData);
      }

      if (reminderEnabled) {
        const med = await medicationsDb.getById(id);
        if (med) await notificationService.scheduleMedicationReminders(med);
      }

      if (Platform.OS === 'web') {
        setActiveTab('Medications');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert(t('common.error'), t('medications.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = () => setTimes([...times, new Date(new Date().setHours(12, 0))]);
  const handleRemoveTime = (index: number) =>
    setTimes(times.filter((_, i) => i !== index));

  // Time change
  const handleTimeChange = (index: number, newDate: Date) => {
    const newTimes = [...times];
    newTimes[index] = newDate;
    setTimes(newTimes);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>{t('medications.name')} *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={text => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder={t('medications.namePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>{t('medications.dosage')} *</Text>
        <TextInput
          style={[styles.input, errors.dosage && styles.inputError]}
          value={dosage}
          onChangeText={text => {
            setDosage(text);
            if (errors.dosage) setErrors({ ...errors, dosage: '' });
          }}
          placeholder={t('medications.dosagePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}

        <Text style={styles.label}>{t('medications.frequency')}</Text>
        <View style={styles.frequencyContainer}>
          {['Daily', 'Twice a day', 'Weekly'].map(freq => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyButton,
                frequency === freq && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency(freq)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  frequency === freq && styles.frequencyTextActive,
                ]}
              >
                {t(`medications.freq${freq.replace(/\s+/g, '')}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('medications.reminderTimes')}</Text>
        {times.map((time, index) => (
          <View key={index} style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <DateTimePickerField
                label=""
                value={time}
                onChange={(d) => handleTimeChange(index, d)}
                mode="time"
                placeholder="HH:MM"
              />
            </View>
            {times.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveTime(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={handleAddTime} style={styles.addTimeButton}>
          <Text style={styles.addTimeButtonText}>
            + {t('medications.addTime')}
          </Text>
        </TouchableOpacity>

        {/* Start Date */}
        <DateTimePickerField
          label={t('medications.startDate')}
          value={startDate}
          onChange={setStartDate}
          mode="date"
          minimumDate={new Date()} // No past start dates?
          required
          error={errors.startDate}
        />

        {/* End Date */}
        <DateTimePickerField
          label={t('medications.endDate')}
          value={endDate}
          onChange={setEndDate}
          mode="date"
          minimumDate={startDate || new Date()} // End date >= start date
          error={errors.endDate}
        />

        <Text style={styles.label}>{t('medications.notes')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('medications.notesPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          multiline
          numberOfLines={4}
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>{t('medications.enableReminders')}</Text>
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

        <View style={styles.switchRow}>
          <Text style={styles.label}>{t('medications.isUrgent')}</Text>
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

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {isEdit ? t('medications.update') : t('common.save')}
            {t('medications.medication')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m },
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
    notesInput: { minHeight: 100, textAlignVertical: 'top' },
    frequencyContainer: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.s,
    },
    frequencyButton: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    frequencyButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    frequencyText: { ...theme.textVariants.body, color: theme.colors.subText },
    frequencyTextActive: { color: theme.colors.surface, fontWeight: '600' },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.s,
    },
    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.error,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20 // align with input
    },
    removeButtonText: {
      color: theme.colors.surface,
      fontSize: 18,
      fontWeight: 'bold',
    },
    addTimeButton: {
      padding: theme.spacing.m,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.spacing.s,
      borderStyle: 'dashed',
    },
    addTimeButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
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
