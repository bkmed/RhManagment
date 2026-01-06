import React, { useState, useMemo, useEffect } from 'react';
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
import { employeesDb } from '../../database/employeesDb';
import { notificationService } from '../../services/notificationService';
import { servicesDb } from '../../database/servicesDb';
import { departmentsDb } from '../../database/departmentsDb';
import { Employee, Service, Department } from '../../database/schema';
import { Theme } from '../../theme';
import { useToast } from '../../context/ToastContext';
import { Dropdown } from '../../components/Dropdown';
import { MultiSelectDropdown } from '../../components/MultiSelectDropdown';
import { useSelector } from 'react-redux';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { useContext } from 'react';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const AddTeamScreen = ({ navigation, route }: any) => {
    const editId = route?.params?.id;
    const isEdit = !!editId;

    const { theme } = useTheme();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { setActiveTab } = useContext(WebNavigationContext) as any;

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [companyId, setCompanyId] = useState<number | undefined>(undefined);
    const [service, setService] = useState('');

    const companies = useSelector(selectAllCompanies);
    const [managerId, setManagerId] = useState<number | undefined>(undefined);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [, setLoading] = useState(true);

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
            setEmployees(emps);
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

                    // Filter employees who belong to this team to select them initially
                    // Note: This assumes we want to pre-select current members.
                    // In teamsDb.add/update, we update employees.teamId.
                    const teamMembers = emps.filter(e => e.teamId === editId);
                    setSelectedMemberIds(teamMembers.map(m => (m.id || 0).toString()));
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

        if (selectedMemberIds.length < 2) {
            newErrors.members = t('teams.validation.minMembers') || 'Select at least 2 members';
        } else if (selectedMemberIds.length > 10) {
            newErrors.members = t('teams.validation.maxMembers') || 'Max 10 members allowed';
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
                    managerId: managerId || 0,
                });
            } else {
                // 1. Create Team
                teamId = await teamsDb.add({
                    name,
                    department,
                    service,
                    companyId,
                    managerId: managerId || 0,
                });
            }

            // 2. Update Manager's teamId
            if (managerId) {
                await employeesDb.update(managerId, { teamId });
            }

            // 3. Update Members' teamId
            for (const memberIdStr of selectedMemberIds) {
                const memberId = Number(memberIdStr);
                await employeesDb.update(memberId, { teamId });
            }

            showToast(t('common.success'), 'success');
            if (Platform.OS === 'web') {
                setActiveTab('Teams');
            } else {
                navigation.goBack();
            }
        } catch (error: any) {
            console.error('Error saving team:', error);
            const errorMessage = error?.message || t('common.saveError');
            notificationService.showAlert(t('common.error'), errorMessage);
        }
    };

    const employeeOptions = useMemo(() => {
        return employees.map(e => ({ label: e.name, value: (e.id || 0).toString() }));
    }, [employees]);

    const departmentOptions = useMemo(() => {
        return departments.map(d => ({ label: d.name, value: d.name }));
    }, [departments]);

    const serviceOptions = useMemo(() => {
        return services.map(s => ({ label: s.name, value: s.name }));
    }, [services]);

    // Filter out selected manager from member options
    const memberOptions = useMemo(() => {
        return employeeOptions.filter(e => Number(e.value) !== managerId);
    }, [employeeOptions, managerId]);

    // Reset members selection if the selected manager was in it
    useEffect(() => {
        if (managerId && selectedMemberIds.includes(managerId.toString())) {
            setSelectedMemberIds(prev => prev.filter(id => id !== managerId.toString()));
        }
    }, [managerId]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>{isEdit ? t('teams.edit') || 'Edit Team' : (t('teams.details') || 'Team Details')}</Text>

                    {/* Company (Dropdown) */}
                    <View style={styles.fieldContainer}>
                        <Dropdown
                            label={t('companies.title')}
                            data={companies.map(c => ({ label: c.name, value: String(c.id) }))}
                            value={companyId ? String(companyId) : ''}
                            onSelect={(val) => setCompanyId(Number(val))}
                            placeholder={t('companies.selectCompany')}
                        />
                    </View>

                    {/* Name */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('teams.name') || t('common.name')}</Text>
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
                        <Text style={styles.label}>{t('teams.department') || 'Department'}</Text>
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
                        <Text style={styles.label}>{t('teams.teamLeader') || "Team Leader (Chef d'équipe)"}</Text>
                        <Dropdown
                            label={t('teams.selectTeamLeader') || 'Select Team Leader'}
                            data={employeeOptions}
                            value={managerId ? managerId.toString() : ''}
                            onSelect={(val: string) => setManagerId(Number(val))}
                            error={errors.manager}
                        />
                    </View>

                    {/* Members Selection */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('teams.members') || 'Team Members (Min 2, Max 10)'}</Text>
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
    });
