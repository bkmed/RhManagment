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
import { payrollDb } from '../../database/payrollDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const AddPayrollScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const payrollId = route?.params?.payrollId;
  const isEdit = !!payrollId;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
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
    if (isEdit) loadPayroll();
  }, [payrollId]);

  useEffect(() => {
    navigation?.setOptions({
      title: isEdit ? t('payroll.edit') : t('payroll.add'),
    });
  }, [isEdit, navigation, t]);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } };

  const loadPayroll = async () => {
    if (!payrollId) return;
    try {
      const item = await payrollDb.getById(payrollId);
      if (item) {
        setName(item.name || '');
        setAmount(item.amount || '');
        setFrequency(item.frequency || 'Daily');

        // Parse times usually string "['08:00', '20:00']"
        // Convert to Date objects for the picker
        let parsedTimes: Date[] = [];
        try {
          const timeStrings = item.times ? JSON.parse(item.times) : ['08:00', '20:00'];
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

        setStartDate(item.startDate ? new Date(item.startDate) : new Date());
        setEndDate(item.endDate ? new Date(item.endDate) : null);
        setNotes(item.notes || '');
        setReminderEnabled(!!item.reminderEnabled);
        setIsUrgent(!!item.isUrgent);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('payroll.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = t('common.required');
    if (!amount.trim()) newErrors.amount = t('common.required');
    if (!startDate) newErrors.startDate = t('common.required');

    // Validate End Date > Start Date
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = t('common.invalidDateRange');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // Format times back to string array HH:MM
      const timeStrings = times.map(t =>
        t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );

      const payrollData = {
        name: name.trim(),
        amount: amount.trim(),
        frequency,
        times: JSON.stringify(timeStrings),
        startDate: startDate!.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        notes: notes.trim() || undefined,
        reminderEnabled,
        isUrgent,
      };

      let id: number;
      if (isEdit && payrollId) {
        await payrollDb.update(payrollId, payrollData);
        id = payrollId;
      } else {
        id = await payrollDb.add(payrollData);
      }

      if (reminderEnabled) {
        const item = await payrollDb.getById(id);
        if (item) await notificationService.schedulePayrollReminders(item);
      }

      if (Platform.OS === 'web') {
        setActiveTab('Payroll');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving payroll:', error);
      Alert.alert(t('common.error'), t('payroll.saveError'));
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
        <Text style={styles.label}>{t('payroll.name')} *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={text => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder={t('payroll.namePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>{t('payroll.amount')} *</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          value={amount}
          onChangeText={text => {
            setAmount(text);
            if (errors.amount) setErrors({ ...errors, amount: '' });
          }}
          placeholder={t('payroll.amountPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

        <Text style={styles.label}>{t('payroll.frequency')}</Text>
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
                {t(`payroll.freq${freq.replace(/\s+/g, '')}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('payroll.reminderTimes')}</Text>
        {times.map((time, index) => (
          <View key={index} style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <DateTimePickerField
                label=""
                value={time}
                onChange={(d) => handleTimeChange(index, d)}
                mode="time"
                placeholder={t('common.timePlaceholder')}
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
            + {t('payroll.addTime')}
          </Text>
        </TouchableOpacity>

        {/* Start Date */}
        <DateTimePickerField
          label={t('payroll.startDate')}
          value={startDate}
          onChange={setStartDate}
          mode="date"
          minimumDate={new Date()}
          required
          error={errors.startDate}
        />

        {/* End Date */}
        <DateTimePickerField
          label={t('payroll.endDate')}
          value={endDate}
          onChange={setEndDate}
          mode="date"
          minimumDate={startDate || new Date()}
          error={errors.endDate}
        />

        <Text style={styles.label}>{t('payroll.notes')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('payroll.notesPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          multiline
          numberOfLines={4}
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>{t('payroll.enableReminders')}</Text>
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
          <Text style={styles.label}>{t('payroll.isUrgent')}</Text>
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
            {isEdit ? t('payroll.update') : t('common.save')}
            {' '}{t('payroll.payroll')}
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
      marginTop: 20
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
