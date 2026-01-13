import React, { useState, useMemo, useContext, useCallback } from 'react';
import { useAuth, User } from '../context/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

interface HomeSummary {
  payroll: number;
  upcomingLeaves: number;
  expiringIllness: number;
  totalEmployees: number;
  pendingLeaves: number;
  pendingClaims: number;
  totalPayroll: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress: () => void;
  styles: Record<string, any>;
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  onPress,
  styles,
}: StatCardProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: color + '20',
          borderWidth: 1,
          borderBottomWidth: 4,
          borderBottomColor: color,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconWrapper, { backgroundColor: color + '10' }]}>
        <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statNumber, { color: theme.colors.text }]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.subText }]}>
          {title}
        </Text>
      </View>
      <View
        style={[styles.statDecoration, { backgroundColor: color + '05' }]}
      />
    </TouchableOpacity>
  );
};

interface ActivityItemProps {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  theme: Theme;
  styles: Record<string, any>;
}

const ActivityItem = ({
  icon,
  title,
  subtitle,
  time,
  theme,
  styles,
}: ActivityItemProps) => {
  return (
    <View
      style={[styles.activityItem, { borderBottomColor: theme.colors.border }]}
    >
      <View
        style={[
          styles.activityIconWrapper,
          { backgroundColor: theme.colors.primary + '15' },
        ]}
      >
        <Text style={styles.activityIcon}>{icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.activitySubtitle, { color: theme.colors.subText }]}
        >
          {subtitle}
        </Text>
        <Text style={[styles.activityTime, { color: theme.colors.subText }]}>
          {time}
        </Text>
      </View>
    </View>
  );
};

// ======= Role Dashboards =======

interface AdminDashboardProps {
  summary: HomeSummary;
  recentActivity: ActivityItemProps[];
  navigateToTab: (tab: string, screen?: string) => void;
  styles: Record<string, any>;
  theme: Theme;
}

const AdminDashboard = ({
  summary,
  recentActivity,
  navigateToTab,
  styles,
  theme,
}: AdminDashboardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <View style={styles.dashboardContainer}>
      <View
        style={[
          styles.welcomeSection,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <View>
          <Text style={styles.welcomeTitle}>
            {t('home.greeting')}, {user?.name}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>{t('home.manageCareer')}</Text>
        </View>
        <Text style={{ fontSize: 44 }}>🏢</Text>
      </View>

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
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[
            styles.premiumActionCard,
            { backgroundColor: theme.colors.primary + '10' },
          ]}
          onPress={() => navigateToTab('Employees', 'AddEmployee')}
        >
          <View
            style={[
              styles.premiumActionIcon,
              { backgroundColor: theme.colors.primary + '20' },
            ]}
          >
            <Text style={styles.actionIcon}>➕</Text>
          </View>
          <Text style={styles.premiumActionText}>{t('employees.add')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.premiumActionCard,
            { backgroundColor: theme.colors.secondary + '10' },
          ]}
          onPress={() => navigateToTab('Companies')}
        >
          <View
            style={[
              styles.premiumActionIcon,
              { backgroundColor: theme.colors.secondary + '20' },
            ]}
          >
            <Text style={styles.actionIcon}>🏢</Text>
          </View>
          <Text style={styles.premiumActionText}>{t('home.companies')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.premiumActionCard,
            { backgroundColor: theme.colors.success + '10' },
          ]}
          onPress={() => navigateToTab('Teams')}
        >
          <View
            style={[
              styles.premiumActionIcon,
              { backgroundColor: theme.colors.success + '20' },
            ]}
          >
            <Text style={styles.actionIcon}>🚀</Text>
          </View>
          <Text style={styles.premiumActionText}>{t('home.teams')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.premiumActionCard,
            { backgroundColor: theme.colors.accent + '10' },
          ]}
          onPress={() => navigateToTab('Leaves', 'TeamVacations')}
        >
          <View
            style={[
              styles.premiumActionIcon,
              { backgroundColor: theme.colors.accent + '20' },
            ]}
          >
            <Text style={styles.actionIcon}>🏖️</Text>
          </View>
          <Text style={styles.premiumActionText}>{t('navigation.leaves')}</Text>
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

interface EmployeeDashboardProps {
  user: User | null;
  summary: HomeSummary;
  navigateToTab: (tab: string, screen?: string) => void;
  hasNotificationPermission: boolean;
  handleEnableNotifications: () => Promise<void>;
  recentActivity: any[];
  styles: Record<string, any>;
  theme: Theme;
}

const EmployeeDashboard = ({
  user,
  summary,
  navigateToTab,
  hasNotificationPermission,
  handleEnableNotifications,
  recentActivity,
  styles,
  theme,
}: EmployeeDashboardProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.dashboardContainer}>
      <View
        style={[
          styles.welcomeSection,
          { backgroundColor: theme.colors.secondary },
        ]}
      >
        <View>
          <Text style={styles.welcomeTitle}>
            {t('home.greeting')}, {user?.name}! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>{t('home.manageCareer')}</Text>
        </View>
        <Text style={{ fontSize: 44 }}>🏠</Text>
      </View>

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

      <View style={styles.balanceSection}>
        <Text style={styles.sectionTitle}>{t('leavePolicy.title')}</Text>
        <View style={styles.balanceCardsContainer}>
          <View
            style={[
              styles.balanceGridCard,
              { backgroundColor: theme.colors.primary + '10' },
            ]}
          >
            <View
              style={[
                styles.balanceIconWrapper,
                { backgroundColor: theme.colors.primary + '20' },
              ]}
            >
              <Text style={styles.balanceIcon}>📅</Text>
            </View>
            <View>
              <Text style={styles.balanceCardValue}>
                {user?.vacationDaysPerYear || 25}
              </Text>
              <Text style={styles.balanceCardLabel}>
                {t('leavePolicy.perYear')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.balanceGridCard,
              { backgroundColor: theme.colors.success + '10' },
            ]}
          >
            <View
              style={[
                styles.balanceIconWrapper,
                { backgroundColor: theme.colors.success + '20' },
              ]}
            >
              <Text style={styles.balanceIcon}>⏳</Text>
            </View>
            <View>
              <Text
                style={[
                  styles.balanceCardValue,
                  { color: theme.colors.success },
                ]}
              >
                {user?.remainingVacationDays ?? 25}
              </Text>
              <Text style={styles.balanceCardLabel}>
                {t('leavePolicy.remaining')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.balanceGridCard,
              { backgroundColor: theme.colors.warning + '10' },
            ]}
          >
            <View
              style={[
                styles.balanceIconWrapper,
                { backgroundColor: theme.colors.warning + '20' },
              ]}
            >
              <Text style={styles.balanceIcon}>🏥</Text>
            </View>
            <View>
              <Text
                style={[
                  styles.balanceCardValue,
                  { color: theme.colors.warning },
                ]}
              >
                {user?.statePaidLeaves || 0}
              </Text>
              <Text style={styles.balanceCardLabel}>
                {t('home.statePaidLeaves')}
              </Text>
            </View>
          </View>
        </View>

        {user?.hiringDate && (
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('home.hiringDate')}</Text>
              <Text style={styles.infoValue}>
                {formatDate(user.hiringDate)}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('home.seniority')}</Text>
              <Text style={styles.infoValue}>
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
                    parts.push(`${years}${t('common.yearUnit').charAt(0)}`);
                  if (months > 0)
                    parts.push(`${months}${t('common.monthUnit').charAt(0)}`);
                  return (
                    parts.join(' ') || `0${t('common.monthUnit').charAt(0)}`
                  );
                })()}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[
            styles.premiumActionCard,
            { backgroundColor: theme.colors.secondary + '10' },
          ]}
          onPress={() => navigateToTab('Claims', 'AddClaim')}
        >
          <View
            style={[
              styles.premiumActionIcon,
              { backgroundColor: theme.colors.secondary + '20' },
            ]}
          >
            <Text style={{ fontSize: 24 }}>📝</Text>
          </View>
          <Text style={styles.premiumActionText}>{t('claims.newClaim')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.premiumActionCard,
            { backgroundColor: theme.colors.success + '10' },
          ]}
          onPress={() => navigateToTab('Leaves', 'AddLeave')}
        >
          <View
            style={[
              styles.premiumActionIcon,
              { backgroundColor: theme.colors.success + '20' },
            ]}
          >
            <Text style={{ fontSize: 24 }}>📅</Text>
          </View>
          <Text style={styles.premiumActionText}>
            {t('home.scheduleLeave')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.premiumActionCard,
            { backgroundColor: theme.colors.primary + '10' },
          ]}
          onPress={() => navigateToTab('Home', 'CareerHub')}
        >
          <View
            style={[
              styles.premiumActionIcon,
              { backgroundColor: theme.colors.primary + '20' },
            ]}
          >
            <Text style={{ fontSize: 24 }}>🚀</Text>
          </View>
          <Text style={styles.premiumActionText}>
            {t('navigation.careerHub')}
          </Text>
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

// ======= Main HomeScreen =======

export const HomeScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { setActiveTab } = useContext(WebNavigationContext);
  const { width } = useWindowDimensions();
  const isWebMobile = Platform.OS === 'web' && width < 600;

  const styles = useMemo(
    () => createStyles(theme, isWebMobile),
    [theme, isWebMobile],
  );

  const [summary, setSummary] = useState<HomeSummary>({
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

        setSummary(prev => ({
          ...prev,
          totalEmployees: employees.length,
          pendingLeaves: pendingLeaves.length,
          pendingClaims: pendingClaims.length,
          totalPayroll: allPayroll.length,
        }));

        const activity = [
          ...pendingLeaves.map(l => ({
            icon: '📅',
            title: `${t('leaves.approvals')}: ${l.employeeName || t('common.unknown')
              }`,
            subtitle: l.title,
            date: l.createdAt || new Date().toISOString(),
          })),
          ...pendingClaims.map(c => ({
            icon: '📝',
            title: t('claims.newClaim'),
            subtitle: c.description,
            date: c.createdAt || new Date().toISOString(),
          })),
          ...employees.slice(-5).map(e => ({
            icon: '👤',
            title: t('employees.add'),
            subtitle: e.name,
            date: e.createdAt || new Date().toISOString(),
          })),
          ...allPayroll.slice(-3).map(p => ({
            icon: '💰',
            title: t('navigation.payroll'),
            subtitle: `${p.employeeId}: ${p.amount} ${p.currency || ''}`,
            date: p.createdAt || new Date().toISOString(),
          })),
        ]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 10);

        setRecentActivity(activity);
      } else {
        let [allPayroll, upcomingLeaves, expiringIllnesses] = await Promise.all(
          [
            payrollDb.getAll(),
            leavesDb.getUpcoming(),
            illnessesDb.getExpiringSoon(),
          ],
        );

        const userRole = user?.role;
        if (userRole === 'employee') {
          if (user?.employeeId) {
            allPayroll = allPayroll.filter(
              p => p.employeeId === user.employeeId,
            );
            upcomingLeaves = upcomingLeaves.filter(
              l => l.employeeId === user.employeeId,
            );
            expiringIllnesses = expiringIllnesses.filter(
              i => i.employeeId === user.employeeId,
            );
          } else {
            allPayroll = [];
            upcomingLeaves = [];
            expiringIllnesses = [];
          }
        } else if (userRole === 'manager') {
          if (user?.teamId) {
            allPayroll = allPayroll.filter(p => p.teamId === user.teamId);
            upcomingLeaves = upcomingLeaves.filter(
              l => l.teamId === user.teamId,
            );
            expiringIllnesses = expiringIllnesses.filter(
              i => i.teamId === user.teamId,
            );
          }
        } else if (userRole === 'rh') {
          if (user?.companyId) {
            allPayroll = allPayroll.filter(p => p.companyId === user.companyId);
            upcomingLeaves = upcomingLeaves.filter(
              l => l.companyId === user.companyId,
            );
            expiringIllnesses = expiringIllnesses.filter(
              i => i.companyId === user.companyId,
            );
          }
        }

        setSummary(prev => ({
          ...prev,
          payroll: allPayroll.length,
          upcomingLeaves: upcomingLeaves.length,
          expiringIllness: expiringIllnesses.length,
        }));

        // Fetch activity for Employees/Managers
        const [leaves, claims] = await Promise.all([
          leavesDb.getAll(),
          claimsDb.getAll(),
        ]);

        let filteredLeaves = leaves;
        let filteredClaims = claims;
        const filteredPayroll = allPayroll;

        if (userRole === 'employee') {
          filteredLeaves = leaves.filter(l => l.employeeId === user?.employeeId);
          filteredClaims = claims.filter(c => c.employeeId === user?.employeeId);
          // allPayroll already filtered for employee
        } else if (userRole === 'manager') {
          filteredLeaves = leaves.filter(l => l.teamId === user?.teamId);
          filteredClaims = claims.filter(c => c.teamId === user?.teamId);
          // allPayroll already filtered for manager
        }

        const activity = [
          ...filteredLeaves.slice(-3).map(l => ({
            icon: '📅',
            title: t('navigation.leaves'),
            subtitle: `${l.title} (${t(`common.${l.status}`)})`,
            date: l.createdAt || l.startDate || new Date().toISOString(),
          })),
          ...filteredClaims.slice(-3).map(c => ({
            icon: '📝',
            title: t('navigation.claims'),
            subtitle: `${c.description} (${t(`common.${c.status}`)})`,
            date: c.createdAt || new Date().toISOString(),
          })),
          ...filteredPayroll.slice(-3).map(p => ({
            icon: '💰',
            title: t('navigation.payroll'),
            subtitle: `${p.amount} ${p.currency || ''}`,
            date: p.createdAt || new Date().toISOString(),
          })),
        ]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 5);

        setRecentActivity(activity);
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
        <View
          style={{
            height: Platform.OS === 'web' ? (width < 768 ? 80 : 20) : 0,
          }}
        />

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
            recentActivity={recentActivity}
            styles={styles}
            theme={theme}
          />
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme, isWebMobile?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    dashboardContainer: {
      flex: 1,
      paddingHorizontal: isWebMobile ? 16 : 24,
    },
    welcomeSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderRadius: 24,
      marginVertical: 24,
      ...theme.shadows.medium,
      ...(Platform.OS === 'web' &&
        ({
          backgroundImage:
            'linear-gradient(135deg, #0052CC 0%, #00A3BF 100%)' as any,
        } as any)),
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    statsContainer: {
      flexDirection: isWebMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      gap: isWebMobile ? 12 : 20,
    },
    statCard: {
      flex: 1,
      padding: 20,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      ...theme.shadows.medium,
      ...(Platform.OS === 'web' &&
        ({
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
          },
        } as any)),
    },
    statIconWrapper: {
      marginRight: 20,
    },
    statDecoration: {
      position: 'absolute',
      right: -20,
      bottom: -20,
      width: 80,
      height: 80,
      borderRadius: 40,
      zIndex: -1,
    },
    statArrow: {
      fontSize: 20,
      color: theme.colors.subText,
      marginLeft: 'auto',
    },
    balanceSection: {
      marginTop: 8,
    },
    balanceCardsContainer: {
      flexDirection: isWebMobile ? 'column' : 'row',
      gap: 16,
      marginBottom: 20,
    },
    balanceGridCard: {
      flex: 1,
      padding: 16,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    balanceIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    balanceIcon: {
      fontSize: 20,
    },
    balanceCardValue: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color: theme.colors.text,
    },
    balanceCardLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.subText,
      textAlign: 'center',
      marginTop: 2,
    },
    infoRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    infoCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.small,
    },
    infoLabel: {
      fontSize: 12,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: isWebMobile ? 12 : 16,
      marginBottom: 32,
    },
    premiumActionCard: {
      flex: isWebMobile ? 0 : 1,
      width: isWebMobile ? '45%' : 'auto',
      minWidth: isWebMobile ? 110 : 140,
      padding: 16,
      borderRadius: 24,
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: 'transparent',
      ...(Platform.OS === 'web' &&
        ({
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-5px)',
            borderColor: 'rgba(0,0,0,0.1)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
          },
        } as any)),
    },
    premiumActionIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.small,
    },
    premiumActionText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    scrollContent: {
      paddingBottom: 60,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 24,
      paddingTop: Platform.OS === 'ios' ? 20 : 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      display: 'none',
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.subText,
      fontSize: 14,
      textAlign: 'center',
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary + '10',
      padding: 20,
      borderRadius: 24,
      alignItems: 'center',
      marginTop: 24,
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
      gap: 16,
    },
    tipIcon: {
      fontSize: 28,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
      lineHeight: 20,
    },
    activityCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 16,
      marginBottom: 24,
      ...theme.shadows.small,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    activityIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    activityIcon: {
      fontSize: 20,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    },
    activitySubtitle: {
      fontSize: 13,
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 11,
      fontWeight: '500',
    },
  });
