import React, { useState, useMemo, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { teamsDb } from '../../database/teamsDb';
import { useModal } from '../../context/ModalContext';
import { employeesDb } from '../../database/employeesDb';
import { notificationService } from '../../services/notificationService';
import { servicesDb } from '../../database/servicesDb';
import { departmentsDb } from '../../database/departmentsDb';
import { Employee, Service, Department } from '../../database/schema';
import { Theme } from '../../theme';
import { Dropdown } from '../../components/Dropdown';
import { MultiSelectDropdown } from '../../components/MultiSelectDropdown';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useAuth } from '../../context/AuthContext';
import { rbacService } from '../../services/rbacService';

export const AddTeamScreen = ({ navigation, route }: any) => {
  const editId = route?.params?.id;
  const isEdit = !!editId;

  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = useContext(WebNavigationContext) as any;

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [service, setService] = useState('');

  const allCompanies = useSelector(selectAllCompanies);
  const [managerId, setManagerId] = useState<string | undefined>(undefined);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [, setLoading] = useState(true);

  // Filter companies based on role
  const companies = useMemo(() => {
    if (rbacService.isAdmin(user)) {
      return allCompanies;
    }
    if (rbacService.isRH(user) && user?.companyId) {
      return allCompanies.filter(
        (c: any) => String(c.id) === String(user.companyId),
      );
    }
    return [];
  }, [allCompanies, user]);

  // Set default company only once on mount or when companies finish loading
  useEffect(() => {
    if (!isEdit && rbacService.isRH(user) && user?.companyId && !companyId) {
      setCompanyId(String(user.companyId));
    }
  }, [user, isEdit]);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [emps, depts, servs] = await Promise.all([
        employeesDb.getAll(),
        departmentsDb.getAll(),
        servicesDb.getAll(),
      ]);

      // Filter employees for RH users
      let filteredEmps = emps;
      if (rbacService.isRH(user) && user?.companyId) {
        filteredEmps = emps.filter(
          e => String(e.companyId) === String(user.companyId),
        );
      }

      setEmployees(filteredEmps);
      setDepartments(depts);
      setServices(servs);

      if (isEdit) {
        const team = await teamsDb.getById(editId);
        if (team) {
          setName(team.name);
          setDepartment(team.department);
          setService(team.service || '');
          setCompanyId(team.companyId);
          setManagerId(team.managerId);

          const teamMembers = emps.filter(e => e.teamId === editId);
          setSelectedMemberIds(teamMembers.map(m => m.id || ''));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('common.required');
    if (!department) newErrors.department = t('common.required');
    if (!companyId) newErrors.company = t('common.required');

    if (selectedMemberIds.length < 2) {
      newErrors.members =
        t('teams.validation.minMembers') || 'Select at least 2 members';
    } else if (selectedMemberIds.length > 10) {
      newErrors.members =
        t('teams.validation.maxMembers') || 'Max 10 members allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let teamId = editId;
      if (isEdit) {
        // 1. Update Team
        await teamsDb.update(editId, {
          name,
          department,
          service,
          companyId,
          managerId: managerId || '',
        });
      } else {
        // 1. Create Team
        teamId = await teamsDb.add({
          name,
          department,
          service,
          companyId,
          managerId: managerId || '',
        });
      }

      // 3. Update Members' teamId and companyId
      for (const memberId of selectedMemberIds) {
        await employeesDb.update(memberId, {
          teamId,
          // Ensure they are attached to the company too
          ...(companyId ? { companyId } : {}),
        });
      }

      // Also update manager
      if (managerId) {
        await employeesDb.update(managerId, {
          teamId,
          ...(companyId ? { companyId } : {}),
        });
      }

      showModal({
        title: t('common.success'),
        message: isEdit
          ? t('teams.updateSuccess') || t('common.saved')
          : t('teams.saveSuccess') || t('common.saved'),
        buttons: [
          {
            text: t('common.ok'),
            onPress: () => {
              if (Platform.OS === 'web') {
                setActiveTab('Teams', 'TeamList');
              } else {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Main', { screen: 'Teams' });
                }
              }
            },
          },
        ],
      });
    } catch (error: any) {
      console.error('Error saving team:', error);
      const errorMessage = error?.message || t('common.saveError');
      notificationService.showAlert(t('common.error'), errorMessage);
    }
  };

  // Filter out employees who:
  // 1. Are already managers (handled by excluding current manager in dropdown, but here we filter generally)
  // 2. Are assigned to another team (strict 1 team policy)
  // 3. Do not belong to the selected company (if company selected)
  // 4. If no company selected, they must not belong to any company (or strictly force company selection?) -> Assuming if team has company, employee must match.
  const eligibleEmployees = useMemo(() => {
    return employees.filter(e => {
      // 1. Check Company Constraint
      if (companyId) {
        // If team denotes a specific company, employee MUST match that company
        // OR be unassigned (optional, but usually we want them in the DB to match)
        // safely compare as strings
        const empCompanyId = e.companyId ? String(e.companyId) : undefined;
        const targetCompanyId = String(companyId);

        if (empCompanyId && empCompanyId !== targetCompanyId) {
          return false;
        }
        // If employee has no company, they are technically eligible to be added
        // (and will be assigned to this company on save)
      } else if (rbacService.isRH(user) && user.companyId) {
        // If no specific company selected for team (unlikely for RH),
        // RH can still ONLY see their own employees
        const empCompanyId = e.companyId ? String(e.companyId) : undefined;
        const userCompanyId = String(user.companyId);
        if (empCompanyId && empCompanyId !== userCompanyId) {
          return false;
        }
      }

      // 2. Check Team Constraint
      // Must not be in another team.
      // If isEdit, allow if e.teamId === editId.
      const currentTeamId = e.teamId ? String(e.teamId) : undefined;
      const targetTeamId = isEdit ? String(editId) : undefined;

      if (currentTeamId) {
        if (isEdit) {
          // If editing, exclude if in ANOTHER team
          if (currentTeamId !== targetTeamId) return false;
        } else {
          // If creating, exclude if in ANY team
          return false;
        }
      }

      return true;
    });
  }, [employees, companyId, isEdit, editId, user]);

  const employeeOptions = useMemo(() => {
    return eligibleEmployees.map(e => ({
      label: e.name,
      value: e.id || '',
    }));
  }, [eligibleEmployees]);

  const departmentOptions = useMemo(() => {
    return departments.map(d => ({ label: d.name, value: d.name }));
  }, [departments]);

  const serviceOptions = useMemo(() => {
    return services.map(s => ({ label: s.name, value: s.name }));
  }, [services]);

  // Filter out selected manager from member options
  const memberOptions = useMemo(() => {
    // Also exclude the currently selected manager from being a "member" (manager is separate role in team)
    return employeeOptions.filter(e => e.value !== managerId);
  }, [employeeOptions, managerId]);

  // Reset members selection if the selected manager was in it
  useEffect(() => {
    if (managerId && selectedMemberIds.includes(managerId.toString())) {
      setSelectedMemberIds(prev =>
        prev.filter(id => id !== managerId.toString()),
      );
    }
  }, [managerId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isEdit
              ? t('teams.edit') || 'Edit Team'
              : t('teams.details') || 'Team Details'}
          </Text>

          {/* Company (Dropdown) */}
          <View style={styles.fieldContainer}>
            <Dropdown
              label={t('companies.title')}
              data={companies.map(c => ({
                label: c.name,
                value: String(c.id),
              }))}
              value={companyId ? String(companyId) : ''}
              onSelect={val => setCompanyId(val || undefined)}
              placeholder={t('companies.selectCompany')}
            />
          </View>

          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {t('teams.name') || t('common.name')}
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder={t('teams.namePlaceholder') || 'e.g. Engineering'}
              placeholderTextColor={theme.colors.subText}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Department (Dropdown) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {t('teams.department') || 'Department'}
            </Text>
            <Dropdown
              label={t('common.selectDepartment') || 'Select Department'}
              data={departmentOptions}
              value={department}
              onSelect={setDepartment}
              error={errors.department}
            />
          </View>

          {/* Service (Dropdown) - Optional/New */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('common.service') || 'Service'}</Text>
            <Dropdown
              label={t('common.selectService') || 'Select Service'}
              data={serviceOptions}
              value={service}
              onSelect={setService}
            />
          </View>

          {/* Team Leader Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              {t('teams.teamLeader') || "Team Leader (Chef d'équipe)"}
            </Text>
            <Dropdown
              label={t('teams.selectTeamLeader') || 'Select Team Leader'}
              data={employeeOptions}
              value={managerId || ''}
              onSelect={(val: string) => setManagerId(val || undefined)}
              error={errors.manager}
            />
          </View>

          {/* Members Selection */}
          <View style={styles.fieldContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.label}>
                {t('teams.members') || 'Team Members'}
              </Text>
              <Text
                style={[
                  styles.memberCount,
                  (selectedMemberIds.length === 0 ||
                    selectedMemberIds.length > 10) &&
                    styles.errorText,
                ]}
              >
                {selectedMemberIds.length} / 10
              </Text>
            </View>
            <MultiSelectDropdown
              label={t('teams.selectMembers') || 'Select Members'}
              data={memberOptions}
              selectedValues={selectedMemberIds}
              onSelect={setSelectedMemberIds}
              error={errors.members}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      ...theme.shadows.medium,
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: theme.spacing.l,
      textAlign: 'center',
    },
    fieldContainer: {
      marginBottom: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      alignItems: 'center',
      marginTop: theme.spacing.m,
      ...theme.shadows.small,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    memberCount: {
      ...theme.textVariants.caption,
      fontWeight: 'bold',
      color: theme.colors.subText,
    },
  });
