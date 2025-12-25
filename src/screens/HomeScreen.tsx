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
          <Text style={styles.appName}>{t('home.appName')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardBlue]}
            onPress={() => navigateToTab('Payroll')}
          >
            <Text style={styles.statNumber}>{summary.payroll}</Text>
            <Text style={styles.statLabel}>{t('home.activePayroll')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardGreen]}
            onPress={() => navigateToTab('Leaves')}
          >
            <Text style={styles.statNumber}>
              {summary.upcomingLeaves}
            </Text>
            <Text style={styles.statLabel}>
              {t('home.upcomingLeaves')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* My Leave Balance Section */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>{t('leavePolicy.title')}</Text>
            <Text style={styles.balanceManaged}>{t('leavePolicy.managedBy')}</Text>
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

          {user?.country && (
            <View style={styles.countryRow}>
              <Text style={styles.countryLabel}>{t('leavePolicy.country')}: </Text>
              <Text style={styles.countryValue}>{user.country}</Text>
            </View>
          )}

          {user?.hiringDate && (
            <>
              <View style={styles.balanceDivider} />
              <View style={styles.countryRow}>
                <Text style={styles.countryLabel}>{t('home.hiringDate')}: </Text>
                <Text style={styles.countryValue}>{new Date(user.hiringDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.countryRow}>
                <Text style={styles.countryLabel}>{t('home.seniority')}: </Text>
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
            </>
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
      marginBottom: 30,
      alignItems: 'center',
    },
    greeting: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    statCardBlue: {
      backgroundColor: theme.colors.primary,
    },
    statCardGreen: {
      backgroundColor: theme.colors.success,
    },
    statNumber: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: '#FFF',
      textAlign: 'center',
      opacity: 0.9,
    },
    alertCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.warningBackground,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      alignItems: 'center',
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
      marginBottom: 2,
    },
    alertMessage: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    actionIcon: {
      fontSize: 28,
      marginRight: theme.spacing.m,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 2,
    },
    actionSubtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    actionArrow: {
      fontSize: 24,
      color: theme.colors.primary,
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primaryBackground,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginTop: theme.spacing.m,
      alignItems: 'center',
    },
    tipIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    tipText: {
      flex: 1,
      ...theme.textVariants.body,
      color: theme.colors.primary,
      lineHeight: 20,
    },
    balanceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      ...theme.shadows.medium,
    },
    balanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: theme.spacing.m,
      flexWrap: 'wrap',
    },
    balanceTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontSize: 18,
    },
    balanceManaged: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontStyle: 'italic',
    },
    balanceGrid: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.s,
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
      fontSize: 24,
      color: theme.colors.text,
    },
    balanceDivider: {
      width: 1,
      height: '60%',
      backgroundColor: theme.colors.border,
    },
    countryRow: {
      flexDirection: 'row',
      marginTop: theme.spacing.m,
      paddingTop: theme.spacing.s,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      justifyContent: 'center',
    },
    countryLabel: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    countryValue: {
      ...theme.textVariants.caption,
      color: theme.colors.text,
      fontWeight: 'bold',
    },
  });
