import React, { useState, useEffect, useMemo, useContext } from 'react';
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
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { payrollDb } from '../../database/payrollDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';
import { Dropdown } from '../../components/Dropdown';

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
  const [mealVouchers, setMealVouchers] = useState('');
  const [giftVouchers, setGiftVouchers] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusType, setBonusType] = useState('none');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');

  // New fields
  const [month, setMonth] = useState(new Date().getMonth() + 1 + '');
  const [year, setYear] = useState(new Date().getFullYear() + '');
  const [hoursWorked, setHoursWorked] = useState('');

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

  /* Removed require */

  const { setActiveTab } = useContext(WebNavigationContext);

  const loadPayroll = async () => {
    if (!payrollId) return;
    try {
      const item = await payrollDb.getById(payrollId);
      if (item) {
        setName(item.name || '');
        setAmount(item.amount || '');
        setFrequency(item.frequency || 'Daily');

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
        setMealVouchers(item.mealVouchers || '');
        setGiftVouchers(item.giftVouchers || '');
        setBonusAmount(item.bonusAmount || '');
        setBonusType(item.bonusType || 'none');
        setDepartment(item.department || '');
        setLocation(item.location || '');
        setMonth(item.month || new Date().getMonth() + 1 + '');
        setYear(item.year || new Date().getFullYear() + '');
        setHoursWorked(item.hoursWorked ? item.hoursWorked.toString() : '');
      }
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('payroll.loadError'));
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = t('common.required');
    if (!amount.trim()) newErrors.amount = t('common.required');
    if (!startDate) newErrors.startDate = t('common.required');

    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = t('common.invalidDateRange');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
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
        mealVouchers: mealVouchers.trim() || undefined,
        giftVouchers: giftVouchers.trim() || undefined,
        bonusAmount: bonusAmount.trim() || undefined,
        bonusType,
        department,
        location,
        month,
        year,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : undefined,
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
      notificationService.showAlert(t('common.error'), t('payroll.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = () => setTimes([...times, new Date(new Date().setHours(12, 0))]);
  const handleRemoveTime = (index: number) =>
    setTimes(times.filter((_, i) => i !== index));

  const handleTimeChange = (index: number, newDate: Date) => {
    const newTimes = [...times];
    newTimes[index] = newDate;
    setTimes(newTimes);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Section: Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.generalInfo') || t('navigation.personalInfo')}</Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
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
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.baseSalary')} *</Text>
                <TextInput
                  style={[styles.input, errors.amount && styles.inputError]}
                  value={amount}
                  onChangeText={text => {
                    setAmount(text);
                    if (errors.amount) setErrors({ ...errors, amount: '' });
                  }}
                  placeholder={t('payroll.amountPlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                  keyboardType="numeric"
                />
                {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
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

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>{t('common.details') || 'Benefits & Bonuses'}</Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.mealVouchers')}</Text>
                <TextInput
                  style={styles.input}
                  value={mealVouchers}
                  onChangeText={setMealVouchers}
                  placeholder="e.g. 15 x 6.50"
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.giftVouchers')}</Text>
                <TextInput
                  style={styles.input}
                  value={giftVouchers}
                  onChangeText={setGiftVouchers}
                  placeholder="e.g. 100.00"
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>

            <View style={[styles.responsiveRow, { marginTop: theme.spacing.m }]}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.bonusType')}</Text>
                <View style={styles.frequencyContainer}>
                  {[
                    { key: 'none', label: t('payroll.none') },
                    { key: '13th_month', label: t('payroll.thirtheenthMonth') },
                    { key: 'performance', label: t('payroll.performanceBonus') }
                  ].map(bonus => (
                    <TouchableOpacity
                      key={bonus.key}
                      style={[
                        styles.frequencyButton,
                        bonusType === bonus.key && styles.frequencyButtonActive,
                      ]}
                      onPress={() => {
                        setBonusType(bonus.key);
                        if (bonus.key === '13th_month' && !bonusAmount) {
                          setBonusAmount(amount);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.frequencyText,
                          bonusType === bonus.key && styles.frequencyTextActive,
                        ]}
                      >
                        {bonus.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.bonusAmount')}</Text>
                <TextInput
                  style={styles.input}
                  value={bonusAmount}
                  onChangeText={setBonusAmount}
                  placeholder={t('payroll.amountPlaceholder')}
                  placeholderTextColor={theme.colors.subText}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* New Section: Period & Worked Hours */}
            <View style={[styles.responsiveRow, { marginTop: theme.spacing.m }]}>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('payroll.month')}
                  data={Array.from({ length: 12 }, (_, i) => ({
                    label: new Date(0, i).toLocaleString(undefined, { month: 'long' }),
                    value: (i + 1).toString()
                  }))}
                  value={month}
                  onSelect={setMonth}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.year')}</Text>
                <TextInput
                  style={styles.input}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  placeholder="2024"
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.hoursWorked')}</Text>
                <TextInput
                  style={styles.input}
                  value={hoursWorked}
                  onChangeText={setHoursWorked}
                  keyboardType="numeric"
                  placeholder="e.g., 150"
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>
          </View>

          {/* Section: Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.freqWeekly') || t('leaves.time')}</Text>

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

            <View style={styles.responsiveRow}>
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
                  error={errors.endDate}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.label}>{t('payroll.reminderTimes')}</Text>
            <View style={styles.timesGrid}>
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
            </View>
            <TouchableOpacity onPress={handleAddTime} style={styles.addTimeButton}>
              <Text style={styles.addTimeButtonText}>
                + {t('payroll.addTime')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section: Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.notes')}</Text>

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

            <View style={styles.divider} />

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>{t('payroll.enableReminders')}</Text>
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

            <View style={[styles.switchRow, { marginTop: theme.spacing.m }]}>
              <View>
                <Text style={[styles.label, { color: theme.colors.error }]}>{t('payroll.isUrgent')}</Text>
                <Text style={styles.captionText}>{t('employees.notes')}</Text>
              </View>
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
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? t('common.loading') : isEdit ? t('payroll.update') : t('common.save')}
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
    frequencyContainer: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.m,
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
    timesGrid: {
      marginBottom: theme.spacing.m,
    },
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
    captionText: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.l,
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
