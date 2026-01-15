import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { employeesDb } from '../../database/employeesDb';
import { companiesDb } from '../../database/companiesDb';
import { teamsDb } from '../../database/teamsDb';
import { Employee, Company, Team } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';
import { notificationService } from '../../services/notificationService';

import { useAuth } from '../../context/AuthContext';
import { Permission, rbacService } from '../../services/rbacService';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { leavesDb } from '../../database/leavesDb';
import { illnessesDb } from '../../database/illnessesDb';
import { Illness, Leave } from '../../database/schema';
import { AbsenceStatusBadge } from '../../components/AbsenceStatusBadge';
import { getUserAbsenceStatus } from '../../utils/absenceStatus';
import { useModal } from '../../context/ModalContext';
import { Dropdown } from '../../components/Dropdown';

export const EmployeeListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = useContext(WebNavigationContext);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [illnesses, setIllnesses] = useState<Illness[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);

  const loadEmployees = async () => {
    try {
      const [empData, compData, teamData, illData, leaveData] =
        await Promise.all([
          employeesDb.getAll(showInactive), // Pass showInactive flag
          companiesDb.getAll(),
          teamsDb.getAll(),
          illnessesDb.getAll(),
          leavesDb.getAll(),
        ]);

      let data = empData;

      // Role-based filtering
      if (user?.role === 'manager' && user?.department) {
        data = data.filter(emp => emp.department === user.department);
      } else if (user?.role === 'employee' && user?.employeeId) {
        data = data.filter(emp => emp.id === user.employeeId);
      }

      setEmployees(data);
      setCompanies(compData);
      setTeams(teamData);
      setIllnesses(illData);
      setLeaves(leaveData);
    } catch (error) {
      console.error('Error loading employees:', error);
      notificationService.showAlert(
        t('common.error'),
        t('employees.loadError'),
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [showInactive]), // Reload when showInactive toggles
  );

  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Apply company filter
    if (companyFilter) {
      result = result.filter(emp => String(emp.companyId) === companyFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(emp => {
        const position = emp.position
          ? t(`departments.${emp.position}`, { defaultValue: emp.position })
          : '';
        const companyName =
          companies.find(c => String(c.id) === String(emp.companyId))?.name || '';
        const teamName =
          teams.find(t => String(t.id) === String(emp.teamId))?.name || '';

        return (
          emp.name.toLowerCase().includes(lowerQuery) ||
          position.toLowerCase().includes(lowerQuery) ||
          (emp.email && emp.email.toLowerCase().includes(lowerQuery)) ||
          companyName.toLowerCase().includes(lowerQuery) ||
          teamName.toLowerCase().includes(lowerQuery)
        );
      });
    }

    return result;
  }, [employees, searchQuery, companyFilter, t, companies, teams]);

  const toggleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      // Deselect all
      setSelectedEmployees(new Set());
    } else {
      // Select all
      const allIds = new Set(filteredEmployees.map(emp => emp.id || ''));
      setSelectedEmployees(allIds);
    }
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const isSelected = selectedEmployees.has(item.id || '');

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && selectionMode && styles.cardSelected]}
        onPress={() => {
          if (selectionMode) {
            toggleSelection(item.id || '');
          } else {
            if (Platform.OS === 'web') {
              setActiveTab('Employees', 'EmployeeDetails', {
                employeeId: item.id,
              });
            } else {
              navigation.navigate('EmployeeDetails', { employeeId: item.id });
            }
          }
        }}
      >
        <View style={styles.headerRow}>
          {selectionMode && (
            <TouchableOpacity
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}
              onPress={() => toggleSelection(item.id || '')}
            >
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          )}
          <Text style={[styles.name, selectionMode && { flex: 0.8 }]}>{item.name}</Text>
          <View style={styles.badges}>
            <AbsenceStatusBadge
              status={getUserAbsenceStatus(item.id || '', illnesses, leaves)}
              compact
            />
            {item.position && (
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>
                  {t(`departments.${item.position}`, {
                    defaultValue: item.position,
                  })}
                </Text>
              </View>
            )}
          </View>

          {item.phone && <Text style={styles.detail}>📞 {item.phone}</Text>}

          {item.email && <Text style={styles.detail}>✉️ {item.email}</Text>}

          {item.address && <Text style={styles.detail}>📍 {item.address}</Text>}

          <View style={styles.affiliations}>
            {item.companyId && (
              <Text style={styles.affiliationText}>
                🏢{' '}
                {companies.find(c => String(c.id) === String(item.companyId))
                  ?.name || item.companyId}
              </Text>
            )}
            {item.teamId && (
              <Text style={styles.affiliationText}>
                👥{' '}
                {teams.find(t => String(t.id) === String(item.teamId))?.name ||
                  item.teamId}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const toggleSelection = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleDeactivateSelected = async () => {
    if (selectedEmployees.size === 0) return;

    showModal({
      title: t('common.deactivate'),
      message: `${t('employees.deactivateConfirmMessage')} (${selectedEmployees.size})`,
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.deactivate'),
          style: 'destructive',
          onPress: async () => {
            try {
              for (const empId of selectedEmployees) {
                await employeesDb.deactivate(empId, user?.id || '');
              }
              notificationService.showAlert(
                t('common.success'),
                t('employees.deactivatedSuccessfully')
              );
              setSelectedEmployees(new Set());
              setSelectionMode(false);
              await loadEmployees();
            } catch (error) {
              notificationService.showAlert(
                t('common.error'),
                t('employees.deactivateError')
              );
            }
          },
        },
      ],
    });
  };


  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('employees.empty')}</Text>
      <Text style={styles.emptySubText}>{t('employees.emptySubtitle')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
        />

        {/* Company Filter */}
        {rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES) && companies.length > 1 && (
          <View style={{ marginTop: 8 }}>
            <Dropdown
              label=""
              data={[
                { label: t('common.allCompanies'), value: '' },
                ...companies.map(c => ({ label: c.name, value: String(c.id) }))
              ]}
              value={companyFilter}
              onSelect={setCompanyFilter}
              placeholder={t('common.company')}
            />
          </View>
        )}

        {/* Selection Mode Controls */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {rbacService.hasPermission(user, Permission.DELETE_EMPLOYEES) && (
            <TouchableOpacity
              style={[styles.actionButton, selectionMode && styles.actionButtonActive]}
              onPress={() => {
                setSelectionMode(!selectionMode);
                setSelectedEmployees(new Set());
              }}
            >
              <Text style={styles.actionButtonText}>
                {selectionMode ? t('common.cancel') : '☑️ ' + t('common.select')}
              </Text>
            </TouchableOpacity>
          )}

          {selectionMode && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={toggleSelectAll}
            >
              <Text style={styles.actionButtonText}>
                {selectedEmployees.size === filteredEmployees.length ? '☐ ' : '☑️ '}
                {selectedEmployees.size === filteredEmployees.length
                  ? t('common.deselectAll') || 'Deselect All'
                  : t('common.selectAll') || 'Select All'}
              </Text>
            </TouchableOpacity>
          )}

          {selectionMode && selectedEmployees.size > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteActionButton]}
              onPress={handleDeleteSelected}
            >
              <Text style={styles.actionButtonText}>
                🗑️ {t('common.delete')} ({selectedEmployees.size})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      {rbacService.hasPermission(user, Permission.ADD_EMPLOYEES) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (Platform.OS === 'web') {
              setActiveTab('Employees', 'AddEmployee');
            } else {
              navigation.navigate('AddEmployee');
            }
          }}
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
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: theme.spacing.m,
      flexGrow: 1,
      paddingBottom: 80, // Space for FAB
    },
    searchContainer: {
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    card: {
      backgroundColor: theme.colors.surface, // Use surface for card background
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    badges: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      alignItems: 'center',
    },
    name: {
      ...theme.textVariants.subheader,
      flex: 1,
      color: theme.colors.text,
    },
    positionBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.l,
    },
    positionText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    detail: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: theme.spacing.xs,
    },
    affiliations: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginTop: theme.spacing.s,
      paddingTop: theme.spacing.s,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    affiliationText: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
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
      ...theme.shadows.large,
      zIndex: 999,
    } as any,
    fabText: {
      fontSize: 32,
      color: theme.colors.surface,
      fontWeight: '300',
      marginTop: -2,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButtonActive: {
      backgroundColor: theme.colors.secondary,
    },
    deleteActionButton: {
      backgroundColor: theme.colors.error,
    },
    actionButtonText: {
      color: theme.colors.surface,
      fontWeight: '600',
      fontSize: 14,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    checkboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: 'bold',
    },
    cardSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10', // Semi-transparent overlay
    },
  });
