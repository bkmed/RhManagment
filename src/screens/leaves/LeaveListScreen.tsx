import React, { useState, useCallback, useMemo, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { leavesDb } from '../../database/leavesDb';
import { employeesDb } from '../../database/employeesDb';
import { companiesDb } from '../../database/companiesDb';
import { teamsDb } from '../../database/teamsDb';
import { Leave, Employee, Company, Team, Illness } from '../../database/schema';
import { illnessesDb } from '../../database/illnessesDb';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchInput } from '../../components/SearchInput';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';


export const LeaveListScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<ParamListBase>;
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [leaves, setLeaves] = useState<(Leave | Illness)[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [leavesData, illnessesData, employeesData, companiesData, teamsData] =
        await Promise.all([
          leavesDb.getAll(),
          illnessesDb.getAll(),
          employeesDb.getAll(),
          companiesDb.getAll(),
          teamsDb.getAll(),
        ]);

      // Normalize illnesses to look like leaves for the list display
      const normalizedIllnesses = illnessesData.map(i => ({
        ...i,
        title: i.payrollName || t('leaveTypes.sick_leave'),
        startDate: i.issueDate,
        endDate: i.expiryDate,
        type: 'sick_leave' as const,
        dateTime: i.issueDate,
        status: 'approved' // Illnesses are usually auto-approved or handled differently
      }));

      const allAbsences = [...leavesData, ...normalizedIllnesses];
      let filteredAbsences = allAbsences;

      // Apply Visibility Rules based on Role
      if (user?.role === 'employee' && user?.employeeId) {
        const empId = Number(user.employeeId);
        filteredAbsences = allAbsences.filter(
          a => Number((a as any).employeeId) === empId,
        );
      } else if (user?.role === 'manager' && user?.teamId) {
        // Manager sees own + team members
        const empId = Number(user.employeeId);
        const tId = Number(user.teamId);
        filteredAbsences = allAbsences.filter(
          a =>
            Number((a as any).employeeId) === empId ||
            Number((a as any).teamId) === tId,
        );
      } else if (user?.role === 'rh' && user?.companyId) {
        // HR sees own + company members
        const empId = Number(user.employeeId);
        const cId = Number(user.companyId);
        filteredAbsences = allAbsences.filter(
          a =>
            Number((a as any).employeeId) === empId ||
            Number((a as any).companyId) === cId,
        );
      }
      // Admin sees everything (filteredAbsences = allAbsences)

      // Sort by date desc
      filteredAbsences.sort((a, b) => new Date((b as any).startDate || (b as any).dateTime).getTime() - new Date((a as any).startDate || (a as any).dateTime).getTime());

      setLeaves(filteredAbsences);
      setEmployees(employeesData);
      setCompanies(companiesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast(t('leaves.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  // Web Refresh Logic
  const { activeTab } = useContext(WebNavigationContext);
  useEffect(() => {
    if (activeTab === 'Leaves') {
      loadData();
    }
  }, [activeTab]);

  const groupedData = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = leaves.filter(
      leave =>
        (leave as any).title?.toLowerCase().includes(lowerQuery) ||
        ((leave as any).employeeName &&
          (leave as any).employeeName.toLowerCase().includes(lowerQuery)),
    );

    if (user?.role !== 'admin' && user?.role !== 'rh') {
      return [{ type: 'direct', id: 'direct', name: 'direct', teams: [], items: filtered }];
    }

    // Grouping logic for Admin/HR
    const companiesMap = new Map<number | string, any>();

    filtered.forEach(leave => {
      const employee = employees.find(e => e.id === (leave as any).employeeId);
      const companyId = employee?.companyId || 'other';
      const teamId = employee?.teamId || 'other';

      if (!companiesMap.has(companyId)) {
        const company = companies.find(c => c.id === companyId);
        companiesMap.set(companyId, {
          id: companyId,
          name: company?.name || `${t('common.other')} ${t('home.companies')}`,
          teamsMap: new Map(),
        });
      }

      const companyGroup = companiesMap.get(companyId);
      if (!companyGroup.teamsMap.has(teamId)) {
        const team = teams.find(t => t.id === teamId);
        const manager = employees.find(e => e.id === team?.managerId);
        companyGroup.teamsMap.set(teamId, {
          id: teamId,
          name: team?.name || t('common.noTeam'),
          managerName: manager?.name || t('common.na'),
          items: [],
        });
      }

      companyGroup.teamsMap.get(teamId).items.push(leave);
    });

    // Convert Map to Array structure expected by UI
    return Array.from(companiesMap.values()).map(c => ({
      ...c,
      teams: Array.from(c.teamsMap.values()),
      items: [] // In hierarchical mode, items are in teams
    }));
  }, [leaves, searchQuery, user?.role, employees, companies, teams]);

  const renderLeaveItem = (item: any) => {
    const startStr = formatDate((item.startDate || item.dateTime) as string);
    const endStr = item.endDate ? formatDate(item.endDate) : null;
    const isIllness = 'payrollName' in item;
    const itemTitle = item.title || item.payrollName || t('leaveTypes.sick_leave');

    return (
      <TouchableOpacity
        key={`${isIllness ? 'ill' : 'leave'}-${item.id}`}
        style={styles.card}
        onPress={() =>
          isIllness
            ? navigation.navigate('IllnessDetails', { illnessId: item.id })
            : navigation.navigate('LeaveDetails', { leaveId: item.id })
        }
      >
        <View style={styles.dateColumn}>
          <Text style={styles.dateText}>{startStr}</Text>
          {endStr && endStr !== startStr && (
            <Text style={styles.captionText}>{t('common.to')}</Text>
          )}
          {endStr && endStr !== startStr && (
            <Text style={styles.dateText}>{endStr}</Text>
          )}
        </View>

        <View style={styles.detailsColumn}>
          <Text style={styles.title}>{itemTitle}</Text>
          {item.employeeName && (
            <Text style={styles.employee}>{item.employeeName}</Text>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status || 'approved', theme) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status || 'approved', theme) },
              ]}
            >
              {isIllness ? t('leaveTypes.sick_leave') : t(`leaveStatus.${item.status}`)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
        />
      </View>

      {user?.role !== 'employee' && (
        <TouchableOpacity
          style={styles.approvalLink}
          onPress={() => navigation.navigate('LeaveApprovalList')}
        >
          <Text style={styles.approvalLinkText}>
            🔔 {t('leaves.approvals')}
          </Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.listContent}>
        {groupedData.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('leaves.noLeaves')}</Text>
          </View>
        )}

        {groupedData.map((group: any) => (
          <View key={group.id} style={styles.companySection}>
            {group.id !== 'direct' && (
              <View style={styles.companyHeader}>
                <Text style={styles.companyName}>{group.name}</Text>
              </View>
            )}

            {group.teams.map((team: any) => (
              <View key={team.id} style={styles.teamSection}>
                <View style={styles.teamHeader}>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamManager}>
                      {t('roles.manager')}: {team.managerName}
                    </Text>
                  </View>
                </View>
                {team.items.map((item: any) => renderLeaveItem(item))}
              </View>
            ))}

            {group.items && group.items.length > 0 && group.items.map((item: any) => renderLeaveItem(item))}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddLeave')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: theme.spacing.m,
      flexGrow: 1,
      paddingBottom: 80,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
    },
    searchContainer: {
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      flexDirection: 'row',
      ...theme.shadows.small,
    },
    dateColumn: {
      width: 80,
      marginRight: theme.spacing.m,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    dateText: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
    },
    captionText: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginTop: 2,
      fontSize: 10,
    },
    detailsColumn: {
      flex: 1,
    },
    title: {
      ...theme.textVariants.subheader,
      marginBottom: 4,
      color: theme.colors.text,
    },
    employee: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      ...theme.textVariants.subheader,
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
    },
    fab: {
      position: 'absolute',
      right: theme.spacing.l,
      bottom: theme.spacing.l,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
      zIndex: 999,
    },
    fabText: {
      fontSize: 32,
      color: theme.colors.surface,
      fontWeight: '300',
      marginTop: -2,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    approvalLink: {
      marginHorizontal: theme.spacing.m,
      marginBottom: theme.spacing.s,
      padding: theme.spacing.m,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.spacing.s,
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
      alignItems: 'center',
    },
    approvalLinkText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    companySection: {
      marginBottom: theme.spacing.l,
    },
    companyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.s,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      marginBottom: theme.spacing.m,
    },
    companyName: {
      ...theme.textVariants.header,
      color: theme.colors.primary,
      fontSize: 20,
    },
    teamSection: {
      marginLeft: theme.spacing.m,
      marginBottom: theme.spacing.m,
    },
    teamHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.s,
      borderRadius: theme.spacing.s,
    },
    teamInfo: {
      flex: 1,
    },
    teamName: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontSize: 16,
    },
    teamManager: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontStyle: 'italic',
    },
  });

const getStatusColor = (status: string, theme: Theme) => {
  switch (status) {
    case 'approved':
      return theme.colors.success;
    case 'declined':
      return theme.colors.error;
    default:
      return theme.colors.warning;
  }
};
