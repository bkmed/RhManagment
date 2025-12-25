import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { payrollDb } from '../../database/payrollDb';
import { employeesDb } from '../../database/employeesDb';
import { notificationService } from '../../services/notificationService';
import { Payroll, Employee } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export const PayrollDetailsScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { payrollId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext) as any
    : { setActiveTab: () => { } };

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Payroll');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadData();
  }, [payrollId]);

  const loadData = async () => {
    try {
      const payrollItem = await payrollDb.getById(payrollId);
      if (payrollItem) {
        setPayroll(payrollItem);
        if (payrollItem.employeeId) {
          const emp = await employeesDb.getById(payrollItem.employeeId);
          setEmployee(emp);
        }
      }
    } catch (error) {
      Alert.alert(t('payrollDetails.errorLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    if (!payroll) return { base: 0, bonus: 0, vouchers: 0, earnings: 0, deductions: 0, net: 0 };

    // Convert string amounts (e.g., "3000€" or "3000") to numbers
    const cleanAmount = (val: string | number | undefined) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      return parseFloat(val.toString().replace(/[^0-9.-]/g, '')) || 0;
    };

    const baseSalary = cleanAmount(payroll.amount);
    const bonus = cleanAmount(payroll.bonusAmount);
    // Vouchers technically "benefits" but let's count them in gross for display
    const vouchers = cleanAmount(payroll.mealVouchers) + cleanAmount(payroll.giftVouchers);

    const gross = baseSalary + bonus + vouchers;

    // Dummy deduction (e.g., 20% for social charges)
    const deductions = gross * 0.22;
    const net = gross - deductions;

    return {
      base: baseSalary,
      bonus,
      vouchers,
      earnings: gross,
      deductions,
      net
    };
  }, [payroll]);

  if (loading || !payroll) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: theme.colors.text }}>{t('payrollDetails.loading')}</Text>
      </View>
    );
  }

  const renderEarningRow = (label: string, value: number) => {
    if (value === 0) return null;
    return (
      <View style={styles.tableRow}>
        <Text style={styles.tableCellLabel}>{label}</Text>
        <Text style={styles.tableCellValue}>{value.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.payslipCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.companyName}>{t('payslip.companyName')}</Text>
              <Text style={styles.companyAddress}>{t('payslip.companyAddress')}</Text>
            </View>
            <View style={styles.payslipBadge}>
              <Text style={styles.payslipBadgeText}>{t('payslip.title').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Employee & Period Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.sectionTitle}>{t('payslip.employeeHeader')}</Text>
              <Text style={styles.infoValue}>{employee?.name || payroll.name}</Text>
              <Text style={styles.infoLabel}>{employee?.position || t('roles.employee')}</Text>
            </View>
            <View style={[styles.infoBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.sectionTitle}>{t('payslip.period')}</Text>
              <Text style={styles.infoValue}>{payroll.startDate}</Text>
              <Text style={styles.infoLabel}>{payroll.frequency}</Text>
            </View>
          </View>

          {/* Earnings Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>{t('payslip.description')}</Text>
              <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>{t('payslip.amount')}</Text>
            </View>

            <View style={styles.tableBody}>
              {renderEarningRow(t('payroll.baseSalary'), totals.base)}
              {payroll.bonusType !== 'none' && renderEarningRow(
                payroll.bonusType === '13th_month' ? t('payroll.thirtheenthMonth') : t('payroll.performanceBonus'),
                totals.bonus
              )}
              {renderEarningRow(t('payroll.mealVouchers'), cleanAmount(payroll.mealVouchers))}
              {renderEarningRow(t('payroll.giftVouchers'), cleanAmount(payroll.giftVouchers))}

              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('payslip.totalEarnings')}</Text>
                <Text style={styles.totalValue}>{totals.earnings.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Deductions (Placeholder) */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>{t('payslip.deductions')}</Text>
              <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>{t('payslip.amount')}</Text>
            </View>
            <View style={styles.tableBody}>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>Social Charges (22%)</Text>
                <Text style={styles.tableCellValue}>-{totals.deductions.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Final Totals */}
          <View style={styles.finalTotalsSection}>
            <View style={styles.finalTotalItem}>
              <Text style={styles.finalTotalLabel}>{t('payslip.grossPay')}</Text>
              <Text style={styles.finalTotalValue}>{totals.earnings.toFixed(2)}</Text>
            </View>
            <View style={[styles.finalTotalItem, styles.netPayContainer]}>
              <Text style={[styles.finalTotalLabel, styles.netPayLabel]}>{t('payslip.netPay')}</Text>
              <Text style={[styles.finalTotalValue, styles.netPayValue]}>{totals.net.toFixed(2)}</Text>
            </View>
          </View>

          {payroll.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.infoLabel}>{t('payroll.notes')}</Text>
              <Text style={styles.notesText}>{payroll.notes}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {(user?.role === 'admin' || user?.role === 'rh') && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => navigation.navigate('AddPayroll', { payrollId })}
              >
                <Text style={styles.buttonText}>{t('common.edit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    t('common.delete'),
                    t('payrollDetails.deleteConfirmMessage'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      {
                        text: t('common.delete'),
                        style: 'destructive',
                        onPress: async () => {
                          await payrollDb.delete(payrollId);
                          navigateBack();
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.buttonText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const cleanAmount = (val: string | number | undefined) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/[^0-9.-]/g, '')) || 0;
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: theme.spacing.m,
      paddingBottom: theme.spacing.xl,
    },
    payslipCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      ...theme.shadows.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
    companyName: {
      ...theme.textVariants.header,
      fontSize: 20,
      color: theme.colors.primary,
    },
    companyAddress: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    payslipBadge: {
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    payslipBadgeText: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    divider: {
      height: 2,
      backgroundColor: theme.colors.primary + '20',
      marginVertical: theme.spacing.m,
    },
    infoSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.l,
    },
    infoBlock: {
      flex: 1,
    },
    sectionTitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontWeight: 'bold',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    infoValue: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontSize: 16,
    },
    infoLabel: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    tableContainer: {
      marginBottom: theme.spacing.l,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      padding: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tableHeaderCell: {
      flex: 1,
      ...theme.textVariants.caption,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    tableBody: {
      paddingTop: 8,
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    tableCellLabel: {
      ...theme.textVariants.body,
      fontSize: 14,
      color: theme.colors.text,
    },
    tableCellValue: {
      ...theme.textVariants.body,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    totalRow: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginTop: 8,
      paddingTop: 8,
    },
    totalLabel: {
      ...theme.textVariants.body,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    totalValue: {
      ...theme.textVariants.body,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    finalTotalsSection: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      gap: 8,
    },
    finalTotalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    finalTotalLabel: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    finalTotalValue: {
      ...theme.textVariants.body,
      fontWeight: '600',
    },
    netPayContainer: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    netPayLabel: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
    },
    netPayValue: {
      ...theme.textVariants.header,
      color: theme.colors.primary,
      fontSize: 24,
    },
    notesSection: {
      marginTop: theme.spacing.l,
      padding: theme.spacing.m,
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    notesText: {
      ...theme.textVariants.body,
      fontSize: 13,
      fontStyle: 'italic',
      color: theme.colors.text,
      marginTop: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginTop: theme.spacing.xl,
      justifyContent: 'center',
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: theme.spacing.s,
      minWidth: 120,
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: theme.colors.secondary,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    buttonText: {
      ...theme.textVariants.button,
      color: '#FFF',
    },
  });
