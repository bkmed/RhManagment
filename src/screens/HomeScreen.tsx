import React, { useState, useMemo, useContext, useCallback } from 'react';
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
import { employeesDb } from '../database/employeesDb';
import { claimsDb } from '../database/claimsDb';
import { permissionsService } from '../services/permissions';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';
import { formatDate } from '../utils/dateUtils';
import { WebNavigationContext } from '../navigation/WebNavigationContext';

// ======= Helper Components =======

const StatCard = ({ title, value, icon, color, onPress, styles }: any) => {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: color }]}
      onPress={onPress}
    >
      <View style={styles.statIconWrapper}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statNumber}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ActivityItem = ({ icon, title, subtitle, time, theme, styles }: any) => {
  return (
    <View style={[styles.activityItem, { borderBottomColor: theme.colors.border }]}>
      <View style={[styles.activityIconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
        <Text style={styles.activityIcon}>{icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.activitySubtitle, { color: theme.colors.subText }]}>{subtitle}</Text>
        <Text style={[styles.activityTime, { color: theme.colors.subText }]}>{time}</Text>
      </View>
    </View>
  );
};

// ======= Role Dashboards =======

const AdminDashboard = ({ summary, recentActivity, navigateToTab, styles, theme }: any) => {
  const { t } = useTranslation();

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.statsContainer}>
        <StatCard
          title={t('navigation.employees')}
          value={summary.totalEmployees}
          icon="👥"
          color={theme.colors.primary}
          onPress={() => navigateToTab('Employees')}
          styles={styles}
        />
        <StatCard
          title={t('leaves.approvals')}
          value={summary.pendingLeaves}
          icon="⏳"
          color={theme.colors.warning}
          onPress={() => navigateToTab('Leaves', 'LeaveApprovalList')}
          styles={styles}
        />
      </View>
      <View style={styles.statsContainer}>
        <StatCard
          title={t('navigation.claims')}
          value={summary.pendingClaims}
          icon="📝"
          color={theme.colors.secondary}
          onPress={() => navigateToTab('Claims')}
          styles={styles}
        />
        <StatCard
          title={t('navigation.payroll')}
          value={summary.totalPayroll}
          icon="💰"
          color={theme.colors.success}
          onPress={() => navigateToTab('Payroll')}
          styles={styles}
        />
      </View>

      <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Employees', 'AddEmployee')}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={styles.actionIcon}>➕</Text>
          </View>
          <Text style={styles.actionLabel}>{t('employees.add')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Companies')}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: theme.colors.secondary + '15' }]}>
            <Text style={styles.actionIcon}>🏢</Text>
          </View>
          <Text style={styles.actionLabel}>{t('home.companies')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Teams')}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: theme.colors.success + '15' }]}>
            <Text style={styles.actionIcon}>🚀</Text>
          </View>
          <Text style={styles.actionLabel}>{t('home.teams')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Leaves', 'TeamVacations')}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: theme.colors.info + '15' }]}>
            <Text style={styles.actionIcon}>🏖️</Text>
          </View>
          <Text style={styles.actionLabel}>{t('navigation.leaves')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('home.recentActivity')}</Text>
      <View style={styles.activityCard}>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity: any, index: number) => (
            <ActivityItem
              key={index}
              icon={activity.icon}
              title={activity.title}
              subtitle={activity.subtitle}
              time={formatDate(activity.date)}
              theme={theme}
              styles={styles}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('home.noRecentActivity')}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const EmployeeDashboard = ({
  user,
  summary,
  navigateToTab,
  hasNotificationPermission,
  handleEnableNotifications,
  styles,
  theme,
}: any) => {
  const { t } = useTranslation();

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.statsContainer}>
        <StatCard
          title={t('home.activePayroll')}
          value={summary.payroll}
          icon="💰"
          color={theme.colors.primary}
          onPress={() => navigateToTab('Payroll')}
          styles={styles}
        />
        <StatCard
          title={t('home.upcomingLeaves')}
          value={summary.upcomingLeaves}
          icon="📅"
          color={theme.colors.success}
          onPress={() => navigateToTab('Leaves')}
          styles={styles}
        />
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>{t('leavePolicy.title')}</Text>
          <View style={[styles.managedBadge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.balanceManaged, { color: theme.colors.primary }]}>
              {t('leavePolicy.managedBy')}
            </Text>
          </View>
        </View>

        <View style={styles.balanceGrid}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>{t('leavePolicy.perYear')}</Text>
            <Text style={styles.balanceValue}>
              {user?.vacationDaysPerYear || 25}
            </Text>
          </View>
          <View style={[styles.balanceDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>{t('leavePolicy.remaining')}</Text>
            <Text style={[styles.balanceValue, { color: theme.colors.primary }]}>
              {user?.remainingVacationDays ?? 25}
            </Text>
          </View>
          <View style={[styles.balanceDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>{t('home.statePaidLeaves')}</Text>
            <Text style={styles.balanceValue}>
              {user?.statePaidLeaves || 0}
            </Text>
          </View>
        </View>

        {user?.hiringDate && (
          <View style={styles.senioritySection}>
            <View style={styles.seniorityRow}>
              <View style={styles.seniorityItem}>
                <Text style={styles.countryLabel}>{t('home.hiringDate')}</Text>
                <Text style={styles.countryValue}>
                  {formatDate(user.hiringDate)}
                </Text>
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
                    if (years > 0)
                      parts.push(
                        `${years} ${years > 1
                          ? t('common.yearsUnit')
                          : t('common.yearUnit')
                        }`,
                      );
                    if (months > 0)
                      parts.push(
                        `${months} ${months > 1
                          ? t('common.monthsUnit')
                          : t('common.monthUnit')
                        }`,
                      );
                    return parts.join(', ') || `0 ${t('common.monthUnit')}`;
                  })()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigateToTab('Claims', 'AddClaim')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
            <Text style={{ fontSize: 20 }}>📝</Text>
          </View>
          <Text style={styles.quickActionText}>{t('claims.newClaim')}</Text>
          <Text style={{ color: theme.colors.subText }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigateToTab('Leaves', 'AddLeave')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.success + '15' }]}>
            <Text style={{ fontSize: 20 }}>📅</Text>
          </View>
          <Text style={styles.quickActionText}>{t('home.scheduleLeave')}</Text>
          <Text style={{ color: theme.colors.subText }}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionItem}
          onPress={() => navigateToTab('Profile', 'CareerHub')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={{ fontSize: 20 }}>🚀</Text>
          </View>
          <Text style={styles.quickActionText}>{t('navigation.careerHub')}</Text>
          <Text style={{ color: theme.colors.subText }}>›</Text>
        </TouchableOpacity>
      </View>

      {!hasNotificationPermission && (
        <TouchableOpacity
          style={styles.tipCard}
          onPress={handleEnableNotifications}
        >
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>{t('home.tip')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ======= Main HomeScreen =======

export const HomeScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { setActiveTab } = useContext(WebNavigationContext) as any;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [summary, setSummary] = useState<any>({
    payroll: 0,
    upcomingLeaves: 0,
    expiringIllness: 0,
    totalEmployees: 0,
    pendingLeaves: 0,
    pendingClaims: 0,
    totalPayroll: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(true);

  const loadData = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'rh') {
        const [employees, allLeaves, allClaims, allPayroll] = await Promise.all([
          employeesDb.getAll(),
          leavesDb.getAll(),
          claimsDb.getAll(),
          payrollDb.getAll(),
        ]);

        const pendingLeaves = allLeaves.filter(l => l.status === 'pending');
        const pendingClaims = allClaims.filter(c => c.status === 'pending');

        setSummary({
          totalEmployees: employees.length,
          pendingLeaves: pendingLeaves.length,
          pendingClaims: pendingClaims.length,
          totalPayroll: allPayroll.length,
        });

        const activity = [
          ...pendingLeaves.slice(0, 3).map(l => ({
            icon: '📅',
            title: `${t('leaves.approvals')}: ${l.employeeName || t('common.unknown')}`,
            subtitle: l.title,
            date: l.createdAt,
          })),
          ...pendingClaims.slice(0, 3).map(c => ({
            icon: '📝',
            title: t('claims.newClaim'),
            subtitle: c.description,
            date: c.createdAt,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setRecentActivity(activity);
      } else {
        let [allPayroll, upcomingLeaves, expiringIllnesses] = await Promise.all([
          payrollDb.getAll(),
          leavesDb.getUpcoming(),
          illnessesDb.getExpiringSoon(),
        ]);

        if (user?.employeeId) {
          allPayroll = allPayroll.filter(p => p.employeeId === user.employeeId);
          upcomingLeaves = upcomingLeaves.filter(l => l.employeeId === user.employeeId);
          expiringIllnesses = expiringIllnesses.filter(i => i.employeeId === user.employeeId);
        }

        setSummary({
          payroll: allPayroll.length,
          upcomingLeaves: upcomingLeaves.length,
          expiringIllness: expiringIllnesses.length,
        });
      }

      const status = await permissionsService.checkNotificationPermission();
      setHasNotificationPermission(status === 'granted');
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user]),
  );

  const handleEnableNotifications = async () => {
    const status = await permissionsService.requestNotificationPermission();
    setHasNotificationPermission(status === 'granted');
  };

  const navigateToTab = (tab: string, screen?: string) => {
    if (Platform.OS === 'web') {
      setActiveTab(tab, screen);
    } else {
      const stackScreen =
        tab === 'Payroll'
          ? 'PayrollTab'
          : tab === 'Leaves'
            ? 'LeavesTab'
            : tab === 'Analytics'
              ? 'Analytics'
              : tab === 'Employees'
                ? 'Employees'
                : tab === 'Claims'
                  ? 'Claims'
                  : undefined;

      if (stackScreen) {
        navigation.navigate('Main', {
          screen: stackScreen,
          params: screen ? { screen } : undefined,
        });
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>{t('home.greeting')}</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationIcon, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigateToTab('Profile', 'Notifications')}
          >
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {user?.role === 'admin' || user?.role === 'rh' ? (
          <AdminDashboard
            summary={summary}
            recentActivity={recentActivity}
            navigateToTab={navigateToTab}
            styles={styles}
            theme={theme}
          />
        ) : (
          <EmployeeDashboard
            user={user}
            summary={summary}
            navigateToTab={navigateToTab}
            hasNotificationPermission={hasNotificationPermission}
            handleEnableNotifications={handleEnableNotifications}
            styles={styles}
            theme={theme}
          />
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      padding: 24,
      paddingTop: Platform.OS === 'ios' ? 20 : 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    welcome: {
      fontSize: 16,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    notificationIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    dashboardContainer: {
      paddingHorizontal: 24,
      gap: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    statCard: {
      flex: 1,
      padding: 16,
      borderRadius: 20,
      gap: 12,
      ...theme.shadows.small,
    },
    statIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 22,
    },
    statInfo: {
      gap: 2,
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
      fontWeight: '600',
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionButton: {
      width: '48%',
      padding: 16,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
      ...theme.shadows.small,
    },
    actionIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionIcon: {
      fontSize: 24,
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    activityCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    activityItem: {
      flexDirection: 'row',
      padding: 16,
      alignItems: 'center',
      borderBottomWidth: 1,
    },
    activityIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    activityIcon: {
      fontSize: 20,
    },
    activityContent: {
      flex: 1,
      gap: 2,
    },
    activityTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
    activitySubtitle: {
      fontSize: 13,
    },
    activityTime: {
      fontSize: 11,
      marginTop: 2,
    },
    balanceCard: {
      borderRadius: 24,
      padding: 24,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.medium,
    },
    balanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    balanceTitle: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '700',
    },
    managedBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    balanceManaged: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    balanceGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    balanceItem: {
      alignItems: 'center',
      flex: 1,
    },
    balanceLabel: {
      fontSize: 12,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    balanceValue: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
    },
    balanceDivider: {
      width: 1,
      height: 40,
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
      fontSize: 11,
      color: theme.colors.subText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    countryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    quickActions: {
      gap: 12,
    },
    quickActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    quickActionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary + '10',
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    tipIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    emptyState: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.subText,
      fontSize: 14,
    },
  });
