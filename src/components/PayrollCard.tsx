import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Payroll } from '../database/schema';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

interface PayrollCardProps {
  payroll: Payroll;
  onPress: () => void;
}

export const PayrollCard: React.FC<PayrollCardProps> = ({
  payroll,
  onPress,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Format month/year display
  const getMonthYearDisplay = () => {
    if (payroll.month && payroll.year) {
      const monthIndex = parseInt(payroll.month) - 1;
      const monthNames = {
        fr: [
          'Janvier',
          'Février',
          'Mars',
          'Avril',
          'Mai',
          'Juin',
          'Juillet',
          'Août',
          'Septembre',
          'Octobre',
          'Novembre',
          'Décembre',
        ],
        en: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        ar: [
          'يناير',
          'فبراير',
          'مارس',
          'أبريل',
          'مايو',
          'يونيو',
          'يوليو',
          'أغسطس',
          'سبتمبر',
          'أكتوبر',
          'نوفمبر',
          'ديسمبر',
        ],
        de: [
          'Januar',
          'Februar',
          'März',
          'April',
          'Mai',
          'Juni',
          'Juli',
          'August',
          'September',
          'Oktober',
          'November',
          'Dezember',
        ],
        es: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre',
        ],
      };
      const currentLang = i18n.language as keyof typeof monthNames;
      const monthName =
        monthNames[currentLang]?.[monthIndex] || monthNames.en[monthIndex];
      return `${monthName} ${payroll.year}`;
    }
    return null;
  };

  const monthYearDisplay = getMonthYearDisplay();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <View style={styles.titleColumn}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{payroll.name}</Text>
              {payroll.isUrgent && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>
                    {t('payroll.isUrgent').toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {monthYearDisplay && (
              <View style={styles.monthYearBadge}>
                <Text style={styles.monthYearIcon}>📅</Text>
                <Text style={styles.monthYearText}>{monthYearDisplay}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>{t('payroll.baseSalary')}</Text>
          <Text style={styles.amount}>
            {payroll.amount} {payroll.currency || '€'}
          </Text>
        </View>
      </View>

      <View style={styles.benefitsRow}>
        {payroll.mealVouchers && (
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎫</Text>
            <Text style={styles.benefitText}>
              {t('payroll.mealVouchers')}: {payroll.mealVouchers.toFixed(2)}{' '}
              {payroll.currency || '€'}
            </Text>
          </View>
        )}
        {payroll.giftVouchers && (
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎁</Text>
            <Text style={styles.benefitText}>
              {payroll.giftVouchers} {t('payroll.giftVouchers')}
            </Text>
          </View>
        )}
        {payroll.bonusAmount && payroll.bonusType !== 'none' && (
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💰</Text>
            <Text style={styles.benefitText}>
              {payroll.bonusType === '13th_month'
                ? t('payroll.thirtheenthMonth')
                : t('payroll.performanceBonus')}
              : {payroll.bonusAmount} {payroll.currency || '€'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
      borderLeftWidth: 5,
      borderLeftColor: theme.colors.primary,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.s,
    },
    nameContainer: {
      flex: 1,
    },
    titleColumn: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: 4,
    },
    name: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontSize: 18,
    },
    monthYearBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '15',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      gap: 4,
    },
    monthYearIcon: {
      fontSize: 12,
    },
    monthYearText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    urgentBadge: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 2,
      borderRadius: 8,
    },
    urgentText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    amountContainer: {
      alignItems: 'flex-end',
    },
    amountLabel: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontSize: 10,
    },
    amount: {
      ...theme.textVariants.header,
      color: theme.colors.primary,
      fontSize: 22,
      fontWeight: 'bold',
    },
    benefitsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.m,
      marginVertical: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    benefitIcon: {
      fontSize: 14,
    },
    benefitText: {
      ...theme.textVariants.caption,
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: 13,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.s,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.s,
    },
    frequency: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      fontSize: 13,
      fontWeight: '500',
    },
    freqContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    freqIcon: {
      fontSize: 14,
    },
    timeIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    timesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timeBadge: {
      backgroundColor: theme.colors.primary + '10',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
    },
    timeText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    moreTimes: {
      fontSize: 12,
      color: theme.colors.subText,
      fontWeight: 'bold',
    },
  });
