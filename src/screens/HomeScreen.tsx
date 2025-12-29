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

const StatCard = ({ title, value, icon, color, onPress }: any) => (
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

const ActivityItem = ({ icon, title, subtitle, time }: any) => (
  <View style={styles.activityItem}>
    <View style={styles.activityIconWrapper}>
      <Text style={styles.activityIcon}>{icon}</Text>
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySubtitle}>{subtitle}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);

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

      <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
      <View style={styles.managementButtons}>
        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigateToTab('Employees', 'AddEmployee')}
        >
          <Text style={styles.managementIcon}>➕</Text>
          <Text style={styles.managementText}>{t('employees.add')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigateToTab('Companies')}
        >
          <Text style={styles.managementIcon}>🏢</Text>
          <Text style={styles.managementText}>Entreprises</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.managementCard}
          onPress={() => navigateToTab('Teams')}
        >
          <Text style={styles.managementIcon}>🚀</Text>
          <Text style={styles.managementText}>Équipes</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Activité Récente</Text>
      <View style={styles.activityCard}>
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
          <Text style={styles.emptyText}>Aucune activité récente</Text>
        )}
      </View>
    </View>
  );
};

const EmployeeDashboard = ({ user, summary, navigateToTab, hasNotificationPermission, handleEnableNotifications }: any) => {
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

      <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
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
          <Text style={styles.actionTitle}>{t('home.scheduleLeave')}</Text>
          <Text style={styles.actionSubtitle}>{t('home.scheduleLeaveSubtitle')}</Text>
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
  const [hasNotificationPermission, setHasNotificationPermission] = useState(true);

  const loadData = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'rh') {
        // Load Admin Data
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

        // Generate Recent Activity
        const activity = [
          ...pendingLeaves.slice(0, 3).map(l => ({
            icon: '📅',
            title: `Demande de congé: ${l.employeeName || 'Inconnu'}`,
            subtitle: l.title,
            date: l.createdAt,
          })),
          ...pendingClaims.slice(0, 3).map(c => ({
            icon: '📝',
            title: `Nouvelle réclamation: ${c.type}`,
            subtitle: c.description,
            date: c.createdAt,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setRecentActivity(activity);
      } else {
        // Load Employee Data
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
        tab === 'Payroll' ? 'PayrollTab' :
          tab === 'Leaves' ? 'LeavesTab' :
            tab === 'Analytics' ? 'Analytics' :
              tab === 'Employees' ? 'Employees' :
                tab === 'Claims' ? 'Claims' :
                  undefined;

      if (stackScreen) {
        navigation.navigate('Main', {
          screen: stackScreen,
          params: screen ? { screen } : undefined
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.subtitle}>{user?.role === 'admin' ? 'Administration RH' : t('home.subtitle')}</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE', // Light neutral background for premium look
  },
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
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
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
    shadowColor: "#000",
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
    color: '#1E293B',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000",
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
    color: '#1E293B',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  actionArrow: {
    fontSize: 20,
    color: '#94A3B8',
  },
  balanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: "#000",
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
    color: '#1E293B',
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
    color: '#1E293B',
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
    color: '#1E293B',
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
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#1E293B',
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
