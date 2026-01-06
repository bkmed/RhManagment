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

const StatCard = ({ title, value, icon, color, onPress, styles }: StatCardProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        {
          backgroundColor: Platform.OS === 'web' ? (theme.colors.surface + 'B3') : theme.colors.surface + 'E6',
          borderColor: color + '40',
        }
      ]}
      onPress={onPress}
    >
      <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
        <Text style={[styles.statIcon, { color: color }]}>{icon}</Text>
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statNumber, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{title}</Text>
      </View>
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

const ActivityItem = ({ icon, title, subtitle, time, theme, styles }: ActivityItemProps) => {
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

interface AdminDashboardProps {
  summary: HomeSummary;
  recentActivity: ActivityItemProps[];
  navigateToTab: (tab: string, screen?: string) => void;
  styles: Record<string, any>;
  theme: Theme;
}

const AdminDashboard = ({ summary, recentActivity, navigateToTab, styles, theme }: AdminDashboardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <View style={styles.dashboardContainer}>
      <View style={[styles.welcomeSection, { backgroundColor: theme.colors.primary }]}>
        <View>
          <Text style={styles.welcomeTitle}>{t('home.greeting')}, {user?.name}! 👋</Text>
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
          <View style={[styles.actionIconWrapper, { backgroundColor: theme.colors.accent + '15' }]}>
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

interface EmployeeDashboardProps {
  user: User | null;
  summary: HomeSummary;
  navigateToTab: (tab: string, screen?: string) => void;
  hasNotificationPermission: boolean;
  handleEnableNotifications: () => Promise<void>;
  styles: Record<string, any>;
  theme: Theme;
}

const EmployeeDashboard = ({
  user,
  summary,
  navigateToTab,
  hasNotificationPermission,
  handleEnableNotifications,
  styles,
  theme,
}: EmployeeDashboardProps) => {
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
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { setActiveTab } = useContext(WebNavigationContext);
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        const [employees, allLeaves, allClaims, allPayroll] = await Promise.all([
          employeesDb.getAll(),
          leavesDb.getAll(),
          claimsDb.getAll(),
          payrollDb.getAll(),
        ]);

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
            title: `${t('leaves.approvals')}: ${l.employeeName || t('common.unknown')}`,
            subtitle: l.title,
            date: l.createdAt,
          })),
          ...pendingClaims.map(c => ({
            icon: '📝',
            title: t('claims.newClaim'),
            subtitle: c.description,
            date: c.createdAt,
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
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);

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

        setSummary(prev => ({
          ...prev,
          payroll: allPayroll.length,
          upcomingLeaves: upcomingLeaves.length,
          expiringIllness: expiringIllnesses.length,
        }));
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
        <View style={{ height: Platform.OS === 'web' ? 20 : 0 }} />

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
    },
    dashboardContainer: {
      flex: 1,
      paddingHorizontal: 24,
    },
    welcomeSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderRadius: 24,
      marginVertical: 24,
      ...theme.shadows.medium,
      ...(Platform.OS === 'web' && {

        backgroundImage: 'linear-gradient(135deg, #0052CC 0%, #00A3BF 100%)' as any,

      } as any),
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 16,
    },
    statCard: {
      flex: 1,
      padding: 20,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      ...theme.shadows.small,
      ...(Platform.OS === 'web' && {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        background: theme.colors.surface + 'B3', // 70% opacity
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        }

      } as any),
    },
    statIconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    statIcon: {
      fontSize: 24,
    },
    statInfo: {
      flex: 1,
    },
    statNumber: {
      fontSize: 22,
      fontWeight: 'bold',
    },
    statLabel: {
      fontSize: 13,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: 24,
      marginBottom: 16,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      minWidth: '45%',
      padding: 16,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 12,
      ...theme.shadows.small,
      ...(Platform.OS === 'web' && {
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.colors.primary,
          transform: 'scale(1.02)',
        }

      } as any),
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
      marginBottom: 100,
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
    scrollContent: {
      paddingBottom: 40,
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
      display: 'none', // Hidden as we use GlassHeader
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
