import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Permission, rbacService } from '../../services/rbacService';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { selectAllAnnouncements } from '../../store/slices/announcementsSlice';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllDepartments } from '../../store/slices/departmentsSlice';
import { selectAllServices } from '../../store/slices/servicesSlice';
import { selectAllLeaves } from '../../store/slices/leavesSlice';
import { selectAllClaims } from '../../store/slices/claimsSlice';
import { selectAllIllnesses } from '../../store/slices/illnessesSlice';
import { Employee, Team, Announcement, Leave, Claim, Illness } from '../../database/schema';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'employee' | 'team' | 'announcement' | 'company' | 'department' | 'service' | 'leave' | 'claim' | 'illness';
  originalItem: any;
}

export const SearchOverlay = ({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: SearchResult) => void;
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const employees = useSelector(selectAllEmployees);
  const teams = useSelector(selectAllTeams);
  const announcements = useSelector(selectAllAnnouncements);
  const companies = useSelector(selectAllCompanies);
  const departments = useSelector(selectAllDepartments);
  const services = useSelector(selectAllServices);
  const leaves = useSelector(selectAllLeaves);
  const claims = useSelector(selectAllClaims);
  const illnesses = useSelector(selectAllIllnesses);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const results = useMemo(() => {
    if (!query.trim()) return [];

    // RBAC Checks
    const canViewEmployees = rbacService.hasPermission(user, Permission.VIEW_EMPLOYEES);
    const canViewTeams = rbacService.hasPermission(user, Permission.MANAGE_TEAMS) || canViewEmployees; // Assuming view employees implies view teams context

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search Employees
    if (canViewEmployees) {
      employees.forEach((e: Employee) => {
        // Scope Filtering
        if (rbacService.isAdmin(user)) {
          // Admin sees everyone
        } else if (rbacService.isRH(user)) {
          // RH sees company employees
          if (e.companyId !== user?.companyId) return;
        } else if (rbacService.isManager(user)) {
          // Manager sees team members (including self usually)
          if (e.teamId !== user?.teamId) return;
        } else if (rbacService.isEmployee(user)) {
          // Employee sees teammates if in a team, otherwise nobody
          if (!user?.teamId || e.teamId !== user?.teamId) return;
        } else {
          // Others see nobody
          return;
        }

        const name = e.name || '';
        const email = e.email || '';
        if (
          name.toLowerCase().includes(lowerQuery) ||
          email.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: String(e.id),
            title: name,
            subtitle: e.position || email || '',
            type: 'employee',
            originalItem: e,
          });
        }
      });
    }

    // Search Teams
    //const canViewAllTeams = rbacService.isAdmin(user) || rbacService.isRH(user);
    const canViewMyTeam = rbacService.isManager(user) || rbacService.isEmployee(user);

    if (canViewTeams) {
      teams.forEach((tm: Team) => {
        // Scope Filtering
        if (rbacService.isRH(user) && tm.companyId !== user?.companyId) return;
        if (canViewMyTeam && tm.id !== user?.teamId) return;

        const teamName = tm.name || '';
        if (teamName.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: String(tm.id),
            title: teamName,
            subtitle: tm.department || '',
            type: 'team',
            originalItem: tm,
          });
        }
      });
    }
    // Search Announcements
    if (user?.companyId) {
      announcements.forEach((a: Announcement) => {
        if (a.companyId !== user.companyId) return;

        const title = a.title || '';
        const content = a.content || '';
        if (
          title.toLowerCase().includes(lowerQuery) ||
          content.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: String(a.id),
            title: title,
            subtitle: formatDate(a.createdAt),
            type: 'announcement',
            originalItem: a,
          });
        }
      });
    }

    // Search Leaves, Claims, Illnesses (personal data)
    const canViewAllPersonal = rbacService.isAdmin(user);
    const myEmpId = Number(user?.employeeId);
    const myCompanyId = Number(user?.companyId);
    const myTeamId = Number(user?.teamId);

    // Search Leaves
    leaves.forEach((l: Leave) => {
      const isOwner = Number(l.employeeId) === myEmpId;
      const isRHInCompany = rbacService.isRH(user) && Number((l as any).companyId) === myCompanyId;
      const isManagerInTeam = rbacService.isManager(user) && Number((l as any).teamId) === myTeamId;

      if (!canViewAllPersonal && !isOwner && !isRHInCompany && !isManagerInTeam) return;

      if ((l.title || '').toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: String(l.id),
          title: l.title || '',
          subtitle: formatDate(l.startDate || l.dateTime),
          type: 'leave',
          originalItem: l,
        });
      }
    });

    // Search Claims
    claims.forEach((c: Claim) => {
      const isOwner = Number(c.employeeId) === myEmpId;
      const isRHInCompany = rbacService.isRH(user) && Number((c as any).companyId) === myCompanyId;
      const isManagerInTeam = rbacService.isManager(user) && Number((c as any).teamId) === myTeamId;

      if (!canViewAllPersonal && !isOwner && !isRHInCompany && !isManagerInTeam) return;

      if ((c.description || '').toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: String(c.id),
          title: t(`claims.type${c.type.charAt(0).toUpperCase() + c.type.slice(1)}`),
          subtitle: c.description,
          type: 'claim',
          originalItem: c,
        });
      }
    });

    // Search Illnesses
    illnesses.forEach((i: Illness) => {
      const isOwner = Number(i.employeeId) === myEmpId;
      const isRHInCompany = rbacService.isRH(user) && Number(i.companyId) === myCompanyId;
      const isManagerInTeam = rbacService.isManager(user) && Number(i.teamId) === myTeamId;

      if (!canViewAllPersonal && !isOwner && !isRHInCompany && !isManagerInTeam) return;

      if ((i.payrollName || '').toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: String(i.id),
          title: i.payrollName,
          subtitle: formatDate(i.issueDate),
          type: 'illness',
          originalItem: i,
        });
      }
    });

    // Search Companies
    if (rbacService.hasPermission(user, Permission.MANAGE_COMPANY)) {
      companies.forEach((c: any) => {
        if (c.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: String(c.id),
            title: c.name,
            subtitle: c.country || '',
            type: 'company',
            originalItem: c,
          });
        }
      });
    }

    // Search Departments & Services
    if (rbacService.hasPermission(user, Permission.MANAGE_SETTINGS)) {
      departments.forEach((d: any) => {
        if (d.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: String(d.id),
            title: d.name,
            subtitle: t('navigation.departments'),
            type: 'department',
            originalItem: d,
          });
        }
      });
      services.forEach((s: any) => {
        if (s.name.toLowerCase().includes(lowerQuery)) {
          searchResults.push({
            id: String(s.id),
            title: s.name,
            subtitle: t('navigation.services'),
            type: 'service',
            originalItem: s,
          });
        }
      });
    }

    return searchResults;
  }, [query, employees, teams, announcements, leaves, claims, illnesses]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return '👥';
      case 'team':
        return '🤝';
      case 'announcement':
        return '📢';
      case 'company':
        return '🏢';
      case 'department':
        return '🏛️';
      case 'service':
        return '⚙️';
      case 'leave':
        return '🏖️';
      case 'claim':
        return '📝';
      case 'illness':
        return '🤒';
      default:
        return '🔍';
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
      onPress={() => onSelect(item)}
    >
      <View
        style={[
          styles.typeIcon,
          { backgroundColor: `${theme.colors.primary}15` },
        ]}
      >
        <Text style={{ fontSize: 18 }}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.resultText}>
        <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.resultSubtitle, { color: theme.colors.subText }]}>
          {item.subtitle}
        </Text>
      </View>
      <Text style={[styles.typeLabel, { color: theme.colors.subText }]}>
        {t(
          `navigation.${item.type === 'employee'
            ? 'employees'
            : item.type === 'team'
              ? 'teams'
              : item.type === 'announcement'
                ? 'announcements'
                : item.type === 'leave'
                  ? 'leaves'
                  : item.type === 'claim'
                    ? 'claims'
                    : item.type === 'illness'
                      ? 'illness'
                      : item.title
          }`,
        )}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
      >
        <View
          style={[styles.content, { backgroundColor: theme.colors.surface }]}
        >
          <View
            style={[
              styles.searchBar,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={query}
              onChangeText={setQuery}
              placeholder={t('common.searchPlaceholderGlobal')}
              placeholderTextColor={theme.colors.subText}
              autoFocus
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={item => `${item.type}-${item.id}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              query ? (
                <View style={styles.emptyContainer}>
                  <Text style={{ color: theme.colors.subText }}>
                    No results found for "{query}"
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === 'web' ? 20 : 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 8,
  },
  closeButton: {
    paddingLeft: 16,
  },
  list: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: 13,
  },
  typeLabel: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});
