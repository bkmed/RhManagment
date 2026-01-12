import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { payrollDb, currenciesDb, Currency } from '../../database';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { Payroll } from '../../database/schema';
import { Dropdown } from '../../components/Dropdown';
import { useSelector } from 'react-redux';
import { selectAllServices } from '../../store/slices/servicesSlice';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { Permission, rbacService } from '../../services/rbacService';
import { useAuth } from '../../context/AuthContext';
import { RootState } from '../../store';

export const AddPayrollScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const payrollId = route?.params?.payrollId;
  const [isEdit, setIsEdit] = useState(!!payrollId); // Make isEdit stateful to be updated by loadInitialData

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [times, setTimes] = useState<Date[]>([
    new Date(new Date().setHours(8, 0, 0, 0)),
    new Date(new Date().setHours(20, 0, 0, 0)),
  ]);
  const [mealVouchers, setMealVouchers] = useState('');
  const [giftVouchers, setGiftVouchers] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusType, setBonusType] = useState('none');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('€'); // Default currency
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>(
    [],
  );

  // New fields
  const [month, setMonth] = useState(new Date().getMonth() + 1 + '');
  const [year, setYear] = useState(new Date().getFullYear() + '');
  const [hoursWorked, setHoursWorked] = useState('');

  // Phase 11: New fields
  const [overtimeHours, setOvertimeHours] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');

  // Split vouchers
  const [mealVoucherCount, setMealVoucherCount] = useState('');
  const [mealVoucherValue, setMealVoucherValue] = useState('');
  const [giftVoucherCount, setGiftVoucherCount] = useState('');
  const [giftVoucherValue, setGiftVoucherValue] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const services = useSelector((state: RootState) => selectAllServices(state));
  const companies = useSelector((state: RootState) =>
    selectAllCompanies(state),
  );
  const teams = useSelector((state: RootState) => selectAllTeams(state));
  const employees = useSelector((state: RootState) =>
    selectAllEmployees(state),
  );
  const { user } = useAuth();

  // New state for company/team/employee
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [payrollId]);

  // Automated Overtime Calculation
  useEffect(() => {
    const hours = parseFloat(hoursWorked);
    if (!isNaN(hours) && hours > 168) {
      setOvertimeHours((hours - 168).toString());
    } else {
      setOvertimeHours('0');
    }
  }, [hoursWorked]);

  useEffect(() => {
    if (navigation && typeof navigation.setOptions === 'function') {
      navigation.setOptions({
        title: isEdit ? t('payroll.edit') : t('payroll.add'),
      });
    }
  }, [isEdit, navigation, t]);

  /* Removed require */

  const { setActiveTab } = useContext(WebNavigationContext) as any;

  const loadInitialData = async () => {
    try {
      // Load currencies
      await currenciesDb.init(); // Ensure defaults exist
      const currencies = await currenciesDb.getAll();
      setAvailableCurrencies(currencies);
      if (currencies.length > 0 && !payrollId) {
        // Use payrollId to check if it's an edit
        setCurrency(currencies[0].symbol);
      }

      if (payrollId) {
        setIsEdit(true);
        const item = await payrollDb.getById(payrollId);
        if (item) {
          setName(item.name || '');
          setAmount(item.amount ? item.amount.toString() : '');
          setFrequency(item.frequency || 'Daily');

          let parsedTimes: Date[] = [];
          try {
            const timeStrings = item.times
              ? JSON.parse(item.times)
              : ['08:00', '20:00'];
            parsedTimes = timeStrings.map((ts: string) => {
              const [h, m] = ts.split(':').map(Number);
              const d = new Date();
              d.setHours(h);
              d.setMinutes(m);
              return d;
            });
          } catch (error) {
            parsedTimes = [
              new Date(new Date().setHours(8, 0)),
              new Date(new Date().setHours(20, 0)),
            ];
            console.error(error);
          }
          setTimes(parsedTimes);

          setMealVouchers(
            item.mealVouchers ? item.mealVouchers.toString() : '',
          );
          setGiftVouchers(
            item.giftVouchers ? item.giftVouchers.toString() : '',
          );
          setBonusAmount(item.bonusAmount ? item.bonusAmount.toString() : '');
          setBonusType(item.bonusType || 'none');
          setDepartment(item.department || '');
          setLocation(item.location || '');
          setMonth(item.month || new Date().getMonth() + 1 + '');
          setYear(item.year || new Date().getFullYear() + '');
          setHoursWorked(item.hoursWorked ? item.hoursWorked.toString() : '');
          setCurrency(item.currency || '€');
          setEmployeeId(item.employeeId ?? null);
          if (item.employeeId) {
            const emp = employees.find(e => e.id === item.employeeId);
            setCompanyId(emp?.companyId ?? null);
            setTeamId(emp?.teamId ?? null);
          }
        }
      }
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('payroll.loadError'));
      console.error(error);
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = t('common.required');
    if (!amount.trim()) {
      newErrors.amount = t('common.required');
    } else if (isNaN(Number(amount))) {
      newErrors.amount = t('common.invalidAmount') || 'Invalid amount';
    }

    if (hoursWorked) {
      const hours = parseFloat(hoursWorked);
      if (isNaN(hours)) {
        newErrors.hoursWorked = t('common.invalidAmount');
      } else if (hours > 168) {
        newErrors.hoursWorked = t('payroll.invalidHours') || 'Max 168 hours (Standard working month)';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const timeStrings = times.map(t =>
        t.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      );

      const payrollData: Omit<Payroll, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        amount: parseFloat(amount) || 0,
        currency,
        frequency,
        times: JSON.stringify(timeStrings),
        startDate: new Date().toISOString().split('T')[0], // Default to today
        reminderEnabled: false,
        isUrgent: false,
        mealVouchers: mealVoucherCount && mealVoucherValue ? parseFloat(mealVoucherCount) * parseFloat(mealVoucherValue) : undefined,
        giftVouchers: giftVoucherCount && giftVoucherValue ? parseFloat(giftVoucherCount) * parseFloat(giftVoucherValue) : undefined,
        bonusAmount: bonusAmount ? parseFloat(bonusAmount) : undefined,
        bonusType,
        department,
        location,
        month,
        year,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : undefined,
        overtimeHours: overtimeHours ? parseFloat(overtimeHours) : undefined,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        companyId: companyId ?? undefined,
        teamId: teamId ?? undefined,
        employeeId: employeeId ?? undefined,
        employeeName: employees.find(e => e.id === employeeId)?.name || '',
      };

      if (isEdit && payrollId) {
        await payrollDb.update(payrollId, payrollData);
      } else {
        await payrollDb.add(payrollData);
      }

      /* Reminders removed */

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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Section: Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('common.generalInfo') || t('navigation.personalInfo')}
            </Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('payroll.name') + ' *'}
                  data={[
                    {
                      label: t('payroll.items.baseSalary'),
                      value: 'baseSalary',
                    },
                    {
                      label: t('payroll.items.mealTicket'),
                      value: 'mealTicket',
                    },
                    {
                      label: t('payroll.items.transportAllowance'),
                      value: 'transportAllowance',
                    },
                    {
                      label: t('payroll.items.performanceBonus'),
                      value: 'performanceBonus',
                    },
                    {
                      label: t('payroll.items.thirteenthMonth'),
                      value: 'thirteenthMonth',
                    },
                    { label: t('payroll.items.bonus'), value: 'bonus' },
                    { label: t('payroll.items.indemnity'), value: 'indemnity' },
                    { label: t('payroll.items.overtime'), value: 'overtime' },
                  ]}
                  value={name}
                  onSelect={setName}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.baseSalary')} *</Text>
                <View style={[styles.responsiveRow, { gap: theme.spacing.s }]}>
                  <View style={{ flex: 1 }}>
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
                  </View>
                  <View style={{ width: 100 }}>
                    <Dropdown
                      label={t('payroll.currency')}
                      data={availableCurrencies.map(c => ({
                        label: `${c.symbol} (${c.code})`,
                        value: c.symbol,
                      }))}
                      value={currency}
                      onSelect={setCurrency}
                    />
                  </View>
                </View>
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}
              </View>
            </View>

            {/* Company / Team / Employee Selection */}
            <View style={styles.responsiveRow}>
              {(rbacService.isAdmin(user) || rbacService.isRH(user)) && (
                <View style={styles.fieldContainer}>
                  <Dropdown
                    label={t('companies.selectCompany')}
                    data={companies.map(c => ({
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
                    data={teams.map(t => ({
                      label: t.name,
                      value: String(t.id),
                    }))}
                    value={teamId ? String(teamId) : ''}
                    onSelect={val => setTeamId(Number(val))}
                  />
                </View>
              )}
            </View>

            {(rbacService.isAdmin(user) || rbacService.isRH(user)) && (
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('employees.name')}
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
                  onSelect={val => setEmployeeId(Number(val))}
                />
              </View>
            )}

            {/* Removed Department and Location fields as per Phase 7 */}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>
              {t('common.details') || 'Benefits & Bonuses'}
            </Text>

            {/* Replaced by split inputs below */}

            <View
              style={[styles.responsiveRow, { marginTop: theme.spacing.m }]}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.bonusType')}</Text>
                <View style={styles.frequencyContainer}>
                  {[
                    { key: 'none', label: t('payroll.none') },
                    { key: '13th_month', label: t('payroll.thirtheenthMonth') },
                    {
                      key: 'performance',
                      label: t('payroll.performanceBonus'),
                    },
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
            <View
              style={[styles.responsiveRow, { marginTop: theme.spacing.m }]}
            >
              <View style={styles.fieldContainer}>
                <Dropdown
                  label={t('payroll.month')}
                  data={Array.from({ length: 12 }, (_, i) => ({
                    label: new Date(0, i).toLocaleString(undefined, {
                      month: 'long',
                    }),
                    value: (i + 1).toString(),
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
                  style={[styles.input, errors.hoursWorked && styles.inputError]}
                  value={hoursWorked}
                  onChangeText={setHoursWorked}
                  keyboardType="numeric"
                  placeholder="e.g., 150"
                  placeholderTextColor={theme.colors.subText}
                />
                {errors.hoursWorked && (
                  <Text style={styles.errorText}>{errors.hoursWorked}</Text>
                )}
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.overtimeHours') || 'Overtime Hours'}</Text>
                <TextInput
                  style={styles.input}
                  value={overtimeHours}
                  onChangeText={setOvertimeHours}
                  keyboardType="numeric"
                  placeholder="e.g. 10"
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.overtimeRate') || 'Overtime Rate / Hour'}</Text>
                <TextInput
                  style={styles.input}
                  value={overtimeRate}
                  onChangeText={setOvertimeRate}
                  keyboardType="numeric"
                  placeholder="e.g. 25.00"
                  placeholderTextColor={theme.colors.subText}
                />
              </View>
            </View>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.mealVouchers')}</Text>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={mealVoucherCount}
                    onChangeText={setMealVoucherCount}
                    placeholder={t('common.count') || 'Count'}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={mealVoucherValue}
                    onChangeText={setMealVoucherValue}
                    placeholder={t('common.unitPrice') || 'Unit'}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('payroll.giftVouchers')}</Text>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={giftVoucherCount}
                    onChangeText={setGiftVoucherCount}
                    placeholder={t('common.count') || 'Count'}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={giftVoucherValue}
                    onChangeText={setGiftVoucherValue}
                    placeholder={t('common.unitPrice') || 'Unit'}
                    keyboardType="numeric"
                  />
                </View>
              </View>
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
                ? t('payroll.update')
                : t('common.save')}{' '}
            {t('payroll.payroll')}
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
      marginTop: 20,
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
