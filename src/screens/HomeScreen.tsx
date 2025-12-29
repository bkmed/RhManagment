import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react';
import { useAuth } from '../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { payrollDb } from '../database/payrollDb';
import { leavesDb } from '../database/leavesDb';
import { illnessesDb } from '../database/illnessesDb';
import { permissionsService } from '../services/permissions';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';
import { formatDate } from '../utils/dateUtils';

import { WebNavigationContext } from '../navigation/WebNavigationContext';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { setActiveTab } = useContext(WebNavigationContext);

  const [summary, setSummary] = useState({
    payroll: 0,
    upcomingLeaves: 0,
    expiringIllness: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
      checkPermission();
    }, []),
  );

  const checkPermission = async () => {
    // Check permission using unified service (works for web & native)
    const status = await permissionsService.checkNotificationPermission();
    setHasNotificationPermission(status === 'granted');
  };

  const handleEnableNotifications = async () => {
    const status = await permissionsService.requestNotificationPermission();
    setHasNotificationPermission(status === 'granted');
  };

  const loadSummary = async () => {
    try {
      let [allPayroll, upcomingLeaves, expiringIllnesses] = await Promise.all([
        payrollDb.getAll(),
        leavesDb.getUpcoming(),
        illnessesDb.getExpiringSoon(),
      ]);

      if (user?.role === 'employee' && user?.employeeId) {
        allPayroll = allPayroll.filter(p => p.employeeId === user.employeeId);
        upcomingLeaves = upcomingLeaves.filter(l => l.employeeId === user.employeeId);
        expiringIllnesses = expiringIllnesses.filter(i => i.employeeId === user.employeeId);
      }

      setSummary({
        payroll: allPayroll.length,
        upcomingLeaves: upcomingLeaves.length,
        expiringIllness: expiringIllnesses.length,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTab = (tab: string, screen?: string) => {
    if (Platform.OS === 'web') {
      // For web, clear subScreen to go to the list view
      setActiveTab(tab, screen);
    } else {
      // For native, navigate to the appropriate tab
      const stackScreen =
        tab === 'Payroll'
          ? 'PayrollTab'
          : tab === 'Leaves'
            ? 'LeavesTab'
            : tab === 'Analytics'
              ? 'Analytics'
              : undefined;

      if (stackScreen) {
        navigation.navigate(
          stackScreen === 'Analytics' ? stackScreen : 'Main',
          stackScreen === 'Analytics'
            ? undefined
            : { screen: stackScreen, params: screen ? { screen } : undefined },
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardPrimary]}
            onPress={() => navigateToTab('Payroll')}
          >
            <View style={styles.statIconWrapper}>
              <Text style={styles.statIcon}>💰</Text>
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{summary.payroll}</Text>
              <Text style={styles.statLabel}>{t('home.activePayroll')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardSuccess]}
            onPress={() => navigateToTab('Leaves')}
          >
            <View style={styles.statIconWrapper}>
              <Text style={styles.statIcon}>📅</Text>
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statNumber}>{summary.upcomingLeaves}</Text>
              <Text style={styles.statLabel}>{t('home.upcomingLeaves')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* My Leave Balance Section */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>{t('leavePolicy.title')}</Text>
            <View style={styles.managedBadge}>
              <Text style={styles.balanceManaged}>{t('leavePolicy.managedBy')}</Text>
            </View>
          </View>

          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>{t('leavePolicy.perYear')}</Text>
              <Text style={styles.balanceValue}>{user?.vacationDaysPerYear || 25}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>{t('leavePolicy.remaining')}</Text>
              <Text style={[styles.balanceValue, { color: theme.colors.primary }]}>
                {user?.remainingVacationDays ?? 25}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>{t('home.statePaidLeaves')}</Text>
              <Text style={styles.balanceValue}>{user?.statePaidLeaves || 0}</Text>
            </View>
          </View>

          {user?.hiringDate && (
            <View style={styles.senioritySection}>
              <View style={styles.seniorityRow}>
                <View style={styles.seniorityItem}>
                  <Text style={styles.countryLabel}>{t('home.hiringDate')}</Text>
                  <Text style={styles.countryValue}>{formatDate(user.hiringDate)}</Text>
                </View>
                <View style={[styles.seniorityItem, { alignItems: 'flex-end' }]}>
                  <Text style={styles.countryLabel}>{t('home.seniority')}</Text>
                  <Text style={styles.countryValue}>
                    {(() => {
                      const start = new Date(user.hiringDate);
                      const now = new Date();
                      let years = now.getFullYear() - start.getFullYear();
                      let months = now.getMonth() - start.getMonth();
                      if (months < 0) {
                        years--;
                        months += 12;
                      }
                      const parts = [];
                      if (years > 0) parts.push(`${years} ${years > 1 ? t('common.yearsUnit') : t('common.yearUnit')}`);
                      if (months > 0) parts.push(`${months} ${months > 1 ? t('common.monthsUnit') : t('common.monthUnit')}`);
                      return parts.join(', ') || `0 ${t('common.monthUnit')}`;
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Alerts */}
        {summary.expiringIllness > 0 && (
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {t('home.illnessAlert')}
              </Text>
              <Text style={styles.alertMessage}>
                {t('home.illnessExpiring', {
                  count: summary.expiringIllness,
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>

        {(user?.role === 'admin' || user?.role === 'rh') && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToTab('Payroll', 'AddPayroll')}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{t('home.addPayroll')}</Text>
              <Text style={styles.actionSubtitle}>
                {t('home.addPayrollSubtitle')}
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Claims Action */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Claims', 'AddClaim')}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('claims.newClaim')}</Text>
            <Text style={styles.actionSubtitle}>{t('claims.descriptionPlaceholder')}</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Leaves', 'AddLeave')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {t('home.scheduleLeave')}
            </Text>
            <Text style={styles.actionSubtitle}>
              {t('home.scheduleLeaveSubtitle')}
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {user?.role !== 'employee' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateToTab('Analytics')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{t('home.viewAnalytics')}</Text>
              <Text style={styles.actionSubtitle}>
                {t('home.viewAnalyticsSubtitle')}
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Tips Section */}
        {!hasNotificationPermission && (
          <TouchableOpacity
            style={styles.tipCard}
            onPress={handleEnableNotifications}
          >
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{t('home.tip')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// Styles remain unchanged
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
      paddingBottom: 40,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: 32,
      paddingTop: 20,
    },
    greeting: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
      fontWeight: '500',
    },
    userName: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: 4,
    },
    subtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontSize: 14,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.medium,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    statCardPrimary: {
      backgroundColor: theme.colors.primary,
    },
    statCardSuccess: {
      backgroundColor: theme.colors.success,
    },
    statIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statIcon: {
      fontSize: 20,
    },
    statInfo: {
      flex: 1,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFF',
    },
    statLabel: {
      fontSize: 12,
      color: '#FFF',
      opacity: 0.9,
      fontWeight: '500',
    },
    alertCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.warningBackground,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
      padding: theme.spacing.m,
      borderRadius: 12,
      marginBottom: 20,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    alertIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    alertContent: {
      flex: 1,
    },
    alertTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 2,
    },
    alertMessage: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontSize: 13,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    actionButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderRadius: 16,
      marginBottom: 12,
      alignItems: 'center',
      ...theme.shadows.small,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionIcon: {
      fontSize: 24,
      marginRight: theme.spacing.m,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      ...theme.textVariants.body,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    actionSubtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    actionArrow: {
      fontSize: 20,
      color: theme.colors.primary,
      opacity: 0.5,
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primaryBackground,
      padding: theme.spacing.m,
      borderRadius: 12,
      marginTop: 20,
      alignItems: 'center',
    },
    tipIcon: {
      fontSize: 18,
      marginRight: 12,
    },
    tipText: {
      flex: 1,
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    balanceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: theme.spacing.l,
      marginBottom: 24,
      ...theme.shadows.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    balanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    balanceTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
    },
    managedBadge: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    balanceManaged: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    balanceGrid: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    balanceItem: {
      alignItems: 'center',
      flex: 1,
    },
    balanceLabel: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    balanceValue: {
      ...theme.textVariants.header,
      fontSize: 22,
    },
    balanceDivider: {
      width: 1,
      height: 30,
      backgroundColor: theme.colors.border,
    },
    senioritySection: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 16,
    },
    seniorityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    seniorityItem: {
      flex: 1,
    },
    countryLabel: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginBottom: 2,
    },
    countryValue: {
      ...theme.textVariants.body,
      fontWeight: '600',
      color: theme.colors.text,
      fontSize: 14,
    },
  });
