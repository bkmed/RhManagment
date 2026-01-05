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
import { companiesDb } from '../database/companiesDb';
import { teamsDb } from '../database/teamsDb';
import { permissionsService } from '../services/permissions';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';
import { formatDate } from '../utils/dateUtils';
import { WebNavigationContext } from '../navigation/WebNavigationContext';
import { Employee, Leave, Claim } from '../database/schema';

// ======= Helper Components =======

const StatCard = ({ title, value, icon, color, onPress }: any) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: color, shadowColor: theme.shadows.medium.shadowColor }]}
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

const ActivityItem = ({ icon, title, subtitle, time }: any) => {
  const { theme } = useTheme();
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

const AdminDashboard = ({ summary, recentActivity, navigateToTab }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.statsContainer}>
        <StatCard
          title={t('navigation.employees')}
          value={summary.totalEmployees}
          icon="👥"
          color={theme.colors.primary}
          onPress={() => navigateToTab('Employees')}
        />
        <StatCard
          title={t('leaves.approvals')}
          value={summary.pendingLeaves}
          icon="⏳"
          color={theme.colors.warning}
          onPress={() => navigateToTab('Leaves', 'LeaveApprovalList')}
        />
      </View>
      <View style={styles.statsContainer}>
        <StatCard
          title={t('navigation.claims')}
          value={summary.pendingClaims}
          icon="📝"
          color={theme.colors.secondary}
          onPress={() => navigateToTab('Claims')}
        />
        <StatCard
          title={t('navigation.payroll')}
          value={summary.totalPayroll}
          icon="💰"
          color={theme.colors.success}
          onPress={() => navigateToTab('Payroll')}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.quickActions')}</Text>
      <View style={styles.managementButtons}>
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigateToTab('Employees', 'AddEmployee')}
        >
          <Text style={styles.managementIcon}>➕</Text>
          <Text style={[styles.managementText, { color: theme.colors.text }]}>{t('employees.add')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigateToTab('Companies')}
        >
          <Text style={styles.managementIcon}>🏢</Text>
          <Text style={[styles.managementText, { color: theme.colors.text }]}>{t('home.companies')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigateToTab('Teams')}
        >
          <Text style={styles.managementIcon}>🚀</Text>
          <Text style={[styles.managementText, { color: theme.colors.text }]}>{t('home.teams')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigateToTab('Leaves', 'TeamVacations')}
        >
          <Text style={styles.managementIcon}>🏖️</Text>
          <Text style={[styles.managementText, { color: theme.colors.text }]}>{t('navigation.leaves')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigateToTab('Analytics', 'PerformanceReview')}
        >
          <Text style={styles.managementIcon}>📈</Text>
          <Text style={[styles.managementText, { color: theme.colors.text }]}>
            {t('performance.title') || 'Performance'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigateToTab('Companies', 'OrgChart')}
        >
          <Text style={styles.managementIcon}>📊</Text>
          <Text style={[styles.managementText, { color: theme.colors.text }]}>
            {t('navigation.orgChart') || 'Organigramme'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.recentActivity')}</Text>
      <View style={[styles.activityCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity: any, index: number) => (
            <ActivityItem
              key={index}
              icon={activity.icon}
              title={activity.title}
              subtitle={activity.subtitle}
              time={formatDate(activity.date)}
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.subText }]}>{t('home.noRecentActivity')}</Text>
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
}: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.statsContainer}>
        <StatCard
          title={t('home.activePayroll')}
          value={summary.payroll}
          icon="💰"
          color={theme.colors.primary}
          onPress={() => navigateToTab('Payroll')}
        />
        <StatCard
          title={t('home.upcomingLeaves')}
          value={summary.upcomingLeaves}
          icon="📅"
          color={theme.colors.success}
          onPress={() => navigateToTab('Leaves')}
        />
      </View>

      <View style={[styles.balanceCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.shadows.medium.shadowColor }]}>
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceTitle, { color: theme.colors.text }]}>{t('leavePolicy.title')}</Text>
          <View style={[styles.managedBadge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.balanceManaged, { color: theme.colors.primary }]}>
              {t('leavePolicy.managedBy')}
            </Text>
          </View>
        </View>

        <View style={styles.balanceGrid}>
          <View style={styles.balanceItem}>
            <Text style={[styles.balanceLabel, { color: theme.colors.subText }]}>{t('leavePolicy.perYear')}</Text>
            <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
              {user?.vacationDaysPerYear || 25}
            </Text>
          </View>
          <View style={[styles.balanceDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.balanceItem}>
            <Text style={[styles.balanceLabel, { color: theme.colors.subText }]}>
              {t('leavePolicy.remaining')}
            </Text>
            <Text
              style={[styles.balanceValue, { color: theme.colors.primary }]}
            >
              {user?.remainingVacationDays ?? 25}
            </Text>
          </View>
          <View style={[styles.balanceDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.balanceItem}>
            <Text style={[styles.balanceLabel, { color: theme.colors.subText }]}>{t('home.statePaidLeaves')}</Text>
            <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
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

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('home.quickActions')}</Text>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.shadows.small.shadowColor }]}
        onPress={() => navigateToTab('Claims', 'AddClaim')}
      >
        <Text style={styles.actionIcon}>📝</Text>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{t('claims.newClaim')}</Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.subText }]}>
            {t('claims.descriptionPlaceholder')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.shadows.small.shadowColor }]}
        onPress={() => navigateToTab('Leaves', 'AddLeave')}
      >
        <Text style={styles.actionIcon}>📅</Text>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{t('home.scheduleLeave')}</Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.subText }]}>
            {t('home.scheduleLeaveSubtitle')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.shadows.small.shadowColor }]}
        onPress={() => navigateToTab('Leaves', 'TeamVacations')}
      >
        <Text style={styles.actionIcon}>🤝</Text>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{t('navigation.teams')}</Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.subText }]}>
            {t('home.viewTeamLeaves')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.shadows.small.shadowColor }]}
        onPress={() => navigateToTab('Profile', 'CareerHub')}
      >
        <Text style={styles.actionIcon}>🚀</Text>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{t('navigation.careerHub')}</Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.subText }]}>
            {t('home.manageCareer')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.shadows.small.shadowColor }]}
        onPress={() => navigateToTab('Companies', 'OrgChart')}
      >
        <Text style={styles.actionIcon}>📊</Text>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            {t('navigation.orgChart') || 'Organigramme'}
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.colors.subText }]}>
            {t('home.viewOrgChart')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

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
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { setActiveTab } = useContext(WebNavigationContext);

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
        // Load Admin Data
        const [employees, allLeaves, allClaims, allPayroll] = await Promise.all(
          [
            employeesDb.getAll(),
            leavesDb.getAll(),
            claimsDb.getAll(),
            payrollDb.getAll(),
          ],
        );

        const pendingLeaves = allLeaves.filter(l => l.status === 'pending');
        const pendingClaims = allClaims.filter(c => c.status === 'pending');

        setSummary({
          totalEmployees: employees.length,
          pendingLeaves: pendingLeaves.length,
          pendingClaims: pendingClaims.length,
          totalPayroll: allPayroll.length,
        });

        // Generate Recent Activity
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
        ].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setRecentActivity(activity);
      } else {
        // Load Employee Data
        let [allPayroll, upcomingLeaves, expiringIllnesses] = await Promise.all(
          [
            payrollDb.getAll(),
            leavesDb.getUpcoming(),
            illnessesDb.getExpiringSoon(),
          ],
        );

        if (user?.employeeId) {
          allPayroll = allPayroll.filter(p => p.employeeId === user.employeeId);
          upcomingLeaves = upcomingLeaves.filter(
            l => l.employeeId === user.employeeId,
          );
          expiringIllnesses = expiringIllnesses.filter(
            i => i.employeeId === user.employeeId,
          );
        }

        setSummary({
          payroll: allPayroll.length,
          upcomingLeaves: upcomingLeaves.length,
          expiringIllness: expiringIllnesses.length,
        });
      }

      // Check notification permission
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.subText }]}>{t('home.greeting')}</Text>
          <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
            {user?.role === 'admin' ? t('home.hrAdmin') : t('home.subtitle')}
          </Text>
        </View>

        {user?.role === 'admin' || user?.role === 'rh' ? (
          <AdminDashboard
            summary={summary}
            recentActivity={recentActivity}
            navigateToTab={navigateToTab}
          />
        ) : (
          <EmployeeDashboard
            user={user}
            summary={summary}
            navigateToTab={navigateToTab}
            hasNotificationPermission={hasNotificationPermission}
            handleEnableNotifications={handleEnableNotifications}
          />
        )}
      </ScrollView>
    </View>
  );
};

// ======= Styles =======

const styles = StyleSheet.create({
  content: {
    padding: 20,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    marginTop: Platform.OS === 'web' ? 20 : 0,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  dashboardContainer: {
    gap: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 22,
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
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 13,
  },
  actionArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  managedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceManaged: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B82F6',
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
    color: '#64748B',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
  },
  senioritySection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '500',
  },
  managementButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  managementCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    flex: 1,
    minWidth: 100,
  },
  managementIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  managementText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityCard: {
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#94A3B8',
  },
});
