import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { leavesDb } from '../../database/leavesDb';
import { employeesDb } from '../../database/employeesDb';
import { companiesDb } from '../../database/companiesDb';
import { teamsDb } from '../../database/teamsDb';
import { Leave, Employee, Company, Team } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface TeamGroup {
  id: number | string;
  name: string;
  managerName: string;
  items: Leave[];
}

interface CompanyGroup {
  id: number | string;
  name: string;
  teams: TeamGroup[];
  items: Leave[];
  type?: string;
}
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

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [leavesData, employeesData, companiesData, teamsData] =
        await Promise.all([
          leavesDb.getUpcoming(),
          employeesDb.getAll(),
          companiesDb.getAll(),
          teamsDb.getAll(),
        ]);

      let filteredLeaves = leavesData;
      if (user?.role === 'employee' && user?.employeeId) {
        filteredLeaves = leavesData.filter(
          leave => leave.employeeId === user.employeeId,
        );
      }

      setLeaves(filteredLeaves);
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

  const groupedData = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = leaves.filter(
      leave =>
        leave.title.toLowerCase().includes(lowerQuery) ||
        (leave.employeeName &&
          leave.employeeName.toLowerCase().includes(lowerQuery)),
    );

    if (user?.role !== 'admin' && user?.role !== 'rh') {
      return [{ type: 'direct', items: filtered }];
    }

    // Grouping logic for Admin
    const companiesMap = new Map<number | string, any>();

    filtered.forEach(leave => {
      const employee = employees.find(e => e.id === leave.employeeId);
      const companyId = employee?.companyId || 'other';
      const teamId = employee?.teamId || 'other';

      if (!companiesMap.has(companyId)) {
        const company = companies.find(c => c.id === companyId);
        companiesMap.set(companyId, {
          id: companyId,
          name: company?.name || 'Autres Entreprises',
          teams: new Map(),
        });
      }

      const companyGroup = companiesMap.get(companyId);
      if (!companyGroup.teams.has(teamId)) {
        const team = teams.find(t => t.id === teamId);
        const manager = employees.find(e => e.id === team?.managerId);
        companyGroup.teams.set(teamId, {
          id: teamId,
          name: team?.name || t('common.noTeam'),
          managerName: manager?.name || t('common.na'),
          items: [],
        });
      }

      companyGroup.teams.get(teamId).items.push(leave);
    });

    // Convert Map to Array
    return Array.from(companiesMap.values()).map(c => ({
      ...c,
      teams: Array.from(c.teams.values()),
    }));
  }, [leaves, searchQuery, user?.role, employees, companies, teams]);

  const renderLeave = (item: Leave) => {
    const startStr = formatDate(item.startDate || item.dateTime);
    const endStr = item.endDate ? formatDate(item.endDate) : null;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() =>
          navigation.navigate('LeaveDetails', { leaveId: item.id })
        }
      >
        <View style={styles.dateColumn}>
          <Text style={styles.dateText}>{startStr}</Text>
          {endStr && endStr !== startStr && (
            <Text style={styles.rangeDivider}>{t('common.to')}</Text>
          )}
          {endStr && endStr !== startStr && (
            <Text style={styles.dateText}>{endStr}</Text>
          )}
        </View>

        <View style={styles.detailsColumn}>
          <Text style={styles.title}>{item.title}</Text>
          {item.employeeName && (
            <Text style={styles.employee}>{item.employeeName}</Text>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status, theme) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status, theme) },
              ]}
            >
              {t(`leaveStatus.${item.status}`)}
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

        {groupedData.map((companyGroup: CompanyGroup) => (
          <View key={companyGroup.id} style={styles.companySection}>
            {companyGroup.name !== 'direct' && (
              <View style={styles.companyHeader}>
                <Text style={styles.companyName}>{companyGroup.name}</Text>
              </View>
            )}

            {(companyGroup.teams || []).map((teamGroup: any) => (
              <View key={teamGroup.id} style={styles.teamSection}>
                {teamGroup.name && (
                  <View style={styles.teamHeader}>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{teamGroup.name}</Text>
                      <Text style={styles.teamManager}>
                        {t('roles.chef_dequipe')}: {teamGroup.managerName}
                      </Text>
                    </View>
                  </View>
                )}
                {teamGroup.items.map((leave: Leave) => renderLeave(leave))}
              </View>
            ))}

            {companyGroup.type === 'direct' &&
              companyGroup.items.map((leave: Leave) => renderLeave(leave))}
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
    timeText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginTop: 2,
    },
    rangeDivider: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginVertical: 2,
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
    location: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
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
    emptySubText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
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
      color: theme.colors.background,
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
