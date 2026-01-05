import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { illnessesDb } from '../../database/illnessesDb';
import { employeesDb } from '../../database/employeesDb';
import { companiesDb } from '../../database/companiesDb';
import { teamsDb } from '../../database/teamsDb';
import { Illness, Employee, Company, Team } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';
import { formatDate } from '../../utils/dateUtils';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

export const IllnessListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [illnesses, setIllnesses] = useState<Illness[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mine' | 'all'>('mine');
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(null);
  const [filterTeamId, setFilterTeamId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [illData, empData, compData, teamData] = await Promise.all([
        illnessesDb.getAll(),
        employeesDb.getAll(),
        companiesDb.getAll(),
        teamsDb.getAll(),
      ]);
      setIllnesses(illData);
      setEmployees(empData);
      setCompanies(compData);
      setTeams(teamData);
    } catch (error) {
      console.error('Error loading data:', error);
      notificationService.showAlert(t('common.error'), t('illnesses.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user]),
  );

  const filteredIllnesses = useMemo(() => {
    let data = illnesses;

    if (activeTab === 'mine') {
      data = data.filter(ill => ill.employeeId === user?.employeeId);
    } else {
      if (user?.role === 'chef_dequipe') {
        const teamMembers = employees.filter(e => e.teamId === user?.teamId).map(e => e.id);
        data = data.filter(ill => teamMembers.includes(ill.employeeId));
      } else if (user?.role === 'employee') {
        data = data.filter(ill => ill.employeeId === user?.employeeId);
      } else {
        // Admin / RH filters
        if (filterCompanyId !== null) {
          data = data.filter(ill => {
            const emp = employees.find(e => e.id === ill.employeeId);
            return filterCompanyId === -1 ? !emp?.companyId : emp?.companyId === filterCompanyId;
          });
        }
        if (filterTeamId !== null) {
          data = data.filter(ill => {
            const emp = employees.find(e => e.id === ill.employeeId);
            return filterTeamId === -1 ? !emp?.teamId : emp?.teamId === filterTeamId;
          });
        }
      }
    }

    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(
      illness =>
        illness.payrollName.toLowerCase().includes(lowerQuery) ||
        (illness.employeeName && illness.employeeName.toLowerCase().includes(lowerQuery)),
    );
  }, [illnesses, searchQuery, activeTab, user, employees, filterCompanyId, filterTeamId]);

  const groupedData = useMemo(() => {
    if (activeTab === 'mine') {
      return [{ id: 'mine', title: t('illnesses.myIllnesses'), items: filteredIllnesses }];
    }

    const companyGroups: any[] = [];
    const compMap = new Map<number | string, any>();

    filteredIllnesses.forEach(ill => {
      const emp = employees.find(e => e.id === ill.employeeId);
      const compId = emp?.companyId || 'other';
      const teamId = emp?.teamId || 'other';

      if (!compMap.has(compId)) {
        const comp = companies.find(c => c.id === compId);
        compMap.set(compId, {
          id: compId,
          name: comp?.name || t('common.none'),
          teams: new Map()
        });
      }

      const compGroup = compMap.get(compId);
      if (!compGroup.teams.has(teamId)) {
        const team = teams.find(t => t.id === teamId);
        compGroup.teams.set(teamId, {
          id: teamId,
          name: team?.name || t('payroll.none'),
          items: []
        });
      }
      compGroup.teams.get(teamId).items.push(ill);
    });

    return Array.from(compMap.values()).map(c => ({
      ...c,
      teams: Array.from(c.teams.values())
    }));
  }, [filteredIllnesses, activeTab, user, employees, companies, teams, t]);

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.floor(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 30 && diffDays >= 0;
  };

  const renderIllness = (item: Illness) => {
    const expiryWarning = item.expiryDate && isExpiringSoon(item.expiryDate);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, expiryWarning && styles.cardWarning]}
        onPress={() =>
          navigation.navigate('IllnessDetails', {
            illnessId: item.id,
          })
        }
      >
        {item.photoUri && (
          <Image
            source={{ uri: item.photoUri }}
            style={styles.thumbnail as any}
          />
        )}

        <View style={styles.details}>
          <Text style={styles.payrollName}>{item.payrollName}</Text>
          {item.employeeName && (
            <Text style={styles.employee}>
              {t('illnesses.employee')} {item.employeeName}
            </Text>
          )}
          <Text style={styles.date}>
            {t('illnesses.issued')}: {formatDate(item.issueDate)}
          </Text>
          {item.expiryDate && (
            <Text
              style={[styles.expiry, expiryWarning && styles.expiryWarning]}
            >
              {t('illnesses.expires')}: {formatDate(item.expiryDate)}
              {expiryWarning && ' ⚠️'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
        />

        {(user?.role === 'admin' || user?.role === 'rh' || user?.role === 'chef_dequipe') && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'mine' && styles.activeTab]}
              onPress={() => setActiveTab('mine')}
            >
              <Text style={[styles.tabText, activeTab === 'mine' && styles.activeTabText]}>
                {t('illnesses.myIllnesses')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                {user?.role === 'chef_dequipe' ? t('illnesses.teamIllnesses') : t('illnesses.allIllnesses')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'all' && (user?.role === 'admin' || user?.role === 'rh') && (
          <View style={styles.filterWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <TouchableOpacity
                onPress={() => { setFilterCompanyId(null); setFilterTeamId(null); }}
                style={[styles.filterChip, filterCompanyId === null && styles.activeFilterChip]}
              >
                <Text style={[styles.filterChipText, filterCompanyId === null && styles.activeFilterChipText]}>{t('common.allCompanies')}</Text>
              </TouchableOpacity>
              {companies.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => { setFilterCompanyId(c.id); setFilterTeamId(null); }}
                  style={[styles.filterChip, filterCompanyId === c.id && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, filterCompanyId === c.id && styles.activeFilterChipText]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => { setFilterCompanyId(-1); setFilterTeamId(null); }}
                style={[styles.filterChip, filterCompanyId === -1 && styles.activeFilterChip]}
              >
                <Text style={[styles.filterChipText, filterCompanyId === -1 && styles.activeFilterChipText]}>{t('common.none')}</Text>
              </TouchableOpacity>
            </ScrollView>

            {filterCompanyId !== null && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll} style={{ marginTop: 8 }}>
                <TouchableOpacity
                  onPress={() => setFilterTeamId(null)}
                  style={[styles.filterChip, filterTeamId === null && styles.activeFilterChip]}
                >
                  <Text style={[styles.filterChipText, filterTeamId === null && styles.activeFilterChipText]}>{t('common.noTeam')}</Text>
                </TouchableOpacity>
                {teams.filter(t => t.companyId === filterCompanyId).map(team => (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => setFilterTeamId(team.id)}
                    style={[styles.filterChip, filterTeamId === team.id && styles.activeFilterChip]}
                  >
                    <Text style={[styles.filterChipText, filterTeamId === team.id && styles.activeFilterChipText]}>{team.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {groupedData.length === 0 || (groupedData[0].items && groupedData[0].items.length === 0 && groupedData[0].id === 'mine') ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('illnesses.empty')}</Text>
            </View>
          ) : (
            groupedData.map(group => (
              <View key={group.id} style={styles.section}>
                {group.id !== 'mine' && group.id !== 'team' && (
                  <Text style={styles.sectionTitle}>{group.name}</Text>
                )}
                {group.teams ? group.teams.map((tGroup: any) => (
                  <View key={tGroup.id} style={styles.teamSection}>
                    <Text style={styles.teamTitle}>{tGroup.name}</Text>
                    {tGroup.items.map((ill: Illness) => renderIllness(ill))}
                  </View>
                )) : group.items.map((ill: Illness) => renderIllness(ill))}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {(user?.role === 'admin' || user?.role === 'rh' || user?.role === 'chef_dequipe') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddIllness')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
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
    header: {
      backgroundColor: theme.colors.surface,
      paddingTop: Platform.OS === 'ios' ? 0 : theme.spacing.s,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.m,
      marginTop: theme.spacing.s,
    },
    tab: {
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      marginRight: theme.spacing.s,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      fontWeight: '600',
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    section: {
      marginBottom: theme.spacing.l,
    },
    sectionTitle: {
      ...theme.textVariants.header,
      fontSize: 18,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      paddingHorizontal: theme.spacing.s,
    },
    teamSection: {
      marginBottom: theme.spacing.m,
      paddingLeft: theme.spacing.s,
    },
    teamTitle: {
      ...theme.textVariants.subheader,
      fontSize: 14,
      color: theme.colors.primary,
      marginBottom: theme.spacing.s,
      textTransform: 'uppercase',
    },
    filterWrapper: {
      paddingVertical: theme.spacing.s,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterScroll: {
      paddingHorizontal: theme.spacing.m,
      gap: theme.spacing.s,
    },
    filterChip: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: 6,
      borderRadius: 15,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeFilterChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    activeFilterChipText: {
      color: '#FFF',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      flexDirection: 'row',
      ...theme.shadows.small,
    },
    cardWarning: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
    },
    thumbnail: {
      width: 80,
      height: 80,
      borderRadius: theme.spacing.s,
      marginRight: theme.spacing.m,
      backgroundColor: theme.colors.border,
    },
    details: {
      flex: 1,
    },
    payrollName: {
      ...theme.textVariants.subheader,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    employee: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: theme.spacing.xs,
    },
    date: {
      ...theme.textVariants.caption,
      marginBottom: 2,
      color: theme.colors.subText,
    },
    expiry: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    expiryWarning: {
      color: theme.colors.warning,
      fontWeight: '600',
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
      position: 'absolute' as any,
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
      elevation: 10,
    } as any,
    fabText: {
      fontSize: 32,
      color: theme.colors.surface,
      fontWeight: '300',
      marginTop: -2,
    },
  });
