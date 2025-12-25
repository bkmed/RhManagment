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
    const times = JSON.parse(payroll.times) as string[];

    // Format month/year display
    const getMonthYearDisplay = () => {
        if (payroll.month && payroll.year) {
            const monthIndex = parseInt(payroll.month) - 1;
            const monthNames = {
                fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
                en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
                de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            };
            const currentLang = i18n.language as keyof typeof monthNames;
            const monthName = monthNames[currentLang]?.[monthIndex] || monthNames.en[monthIndex];
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
                                    <Text style={styles.urgentText}>{t('payroll.urgent')}</Text>
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
                    <Text style={styles.amount}>{payroll.amount}</Text>
                </View>
            </View>

            <View style={styles.benefitsRow}>
                {payroll.mealVouchers && (
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>🍱</Text>
                        <Text style={styles.benefitText}>{payroll.mealVouchers}</Text>
                    </View>
                )}
                {payroll.giftVouchers && (
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>🎁</Text>
                        <Text style={styles.benefitText}>{payroll.giftVouchers}</Text>
                    </View>
                )}
                {payroll.bonusAmount && payroll.bonusType !== 'none' && (
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>💰</Text>
                        <Text style={styles.benefitText}>
                            {payroll.bonusType === '13th_month' ? t('payroll.thirtheenthMonth') : t('payroll.performanceBonus')}
                            : {payroll.bonusAmount}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.frequency}>{t(`payroll.freq${payroll.frequency.replace(/\s+/g, '')}`)}</Text>
                <View style={styles.timesContainer}>
                    {times.slice(0, 3).map((time, index) => (
                        <View key={index} style={styles.timeBadge}>
                            <Text style={styles.timeText}>{time}</Text>
                        </View>
                    ))}
                    {times.length > 3 && (
                        <Text style={styles.moreTimes}>+{times.length - 3}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
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
            fontSize: 20,
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
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 4,
            borderRadius: 6,
            gap: 4,
        },
        benefitIcon: {
            fontSize: 12,
        },
        benefitText: {
            ...theme.textVariants.caption,
            color: theme.colors.text,
            fontWeight: '600',
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
            fontSize: 14,
        },
        timesContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        timeBadge: {
            backgroundColor: theme.colors.secondary + '20',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
        },
        timeText: {
            color: theme.colors.secondary,
            fontSize: 12,
            fontWeight: '600',
        },
        moreTimes: {
            fontSize: 12,
            color: theme.colors.subText,
        },
    });
