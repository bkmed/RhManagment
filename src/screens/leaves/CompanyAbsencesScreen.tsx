import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { leavesDb } from '../../database/leavesDb';
import { employeesDb } from '../../database/employeesDb';
import { teamsDb } from '../../database/teamsDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';
import { Leave } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';
import { rbacService } from '../../services/rbacService';
import { Dropdown } from '../../components/Dropdown';

export const CompanyAbsencesScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [absences, setAbsences] = useState<Leave[]>([]);
    const [filteredAbsences, setFilteredAbsences] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [teams, setTeams] = useState<{ label: string, value: string }[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // RBAC Check
        if (!rbacService.isAdmin(user) && !rbacService.isRH(user)) {
            notificationService.showToast(t('common.unauthorized'), 'error');
            navigation.goBack();
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load Filtering Options (Teams)
            const allTeams = await teamsDb.getAll();
            setTeams(allTeams.map(t => ({ label: t.name, value: t.id.toString() })));

            // Load Absences
            const allLeaves = await leavesDb.getAll();
            // Filter for approved/pending absences (generally "absence" management implies tracking who is away)
            const activeAbsences = allLeaves.filter(l => l.status === 'approved' || l.status === 'pending');

            // Need to enrich with teamId for filtering if not present, but leaves usually rely on employeeId
            // Let's attach teamId to local absence object for filtering
            const allEmployees = await employeesDb.getAll();
            const employeeTeamMap = new Map();
            allEmployees.forEach(e => employeeTeamMap.set(e.id, e.teamId));

            const enrichedAbsences = activeAbsences.map(l => ({
                ...l,
                _teamId: employeeTeamMap.get(l.employeeId)
            })).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

            setAbsences(enrichedAbsences);
            setFilteredAbsences(enrichedAbsences);

        } catch (error) {
            notificationService.showAlert(t('common.error'), t('leaves.loadError'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = absences;

        if (selectedTeamId) {
            result = result.filter(a => (a as any)._teamId?.toString() === selectedTeamId);
        }

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(a => a.employeeName?.toLowerCase().includes(lower));
        }

        setFilteredAbsences(result);
    }, [selectedTeamId, searchQuery, absences]);


    const renderItem = ({ item }: { item: Leave }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.employeeName}</Text>
                <Text style={[styles.cardBadge, getStatusStyle(item.status, theme)]}>
                    {t(`leaveStatus.${item.status}`)}
                </Text>
            </View>
            <Text style={styles.cardSubtitle}>{t(`leaveTypes.${item.type}`)}</Text>
            <Text style={styles.cardDate}>
                {item.startDate ? `${formatDate(item.startDate)} - ${formatDate(item.endDate || item.startDate)}` : formatDate(item.dateTime)}
            </Text>
            {item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('common.searchPlaceholder') || 'Search...'}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <View style={styles.dropdownContainer}>
                    <Dropdown
                        label=""
                        placeholder={t('teams.filterByTeam') || "All Teams"}
                        data={[{ label: t('common.all'), value: '' }, ...teams]}
                        value={selectedTeamId}
                        onSelect={setSelectedTeamId}
                    />
                </View>
            </View>

            <FlatList
                data={filteredAbsences}
                renderItem={renderItem}
                keyExtractor={item => item.id?.toString() || Math.random().toString()}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>{t('leaves.noLeaves')}</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const getStatusStyle = (status: string, theme: Theme) => {
    switch (status) {
        case 'approved':
            return { color: theme.colors.success, backgroundColor: theme.colors.success + '20' };
        case 'pending':
            return { color: theme.colors.warning, backgroundColor: theme.colors.warning + '20' };
        case 'rejected':
        case 'declined':
            return { color: theme.colors.error, backgroundColor: theme.colors.error + '20' };
        default:
            return { color: theme.colors.subText, backgroundColor: theme.colors.border };
    }
}

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: { backgroundColor: theme.colors.background, flex: 1 },
        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        filterContainer: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            gap: theme.spacing.s,
        },
        searchInput: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.spacing.s,
            padding: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
            color: theme.colors.text,
        },
        dropdownContainer: {
            zIndex: 1000,
        },
        listContent: { padding: theme.spacing.m },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        cardTitle: { ...theme.textVariants.subheader, color: theme.colors.text },
        cardBadge: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 'bold',
            overflow: 'hidden',
        },
        cardSubtitle: {
            ...theme.textVariants.body,
            color: theme.colors.subText,
            marginBottom: 4,
        },
        cardDate: {
            ...theme.textVariants.caption,
            color: theme.colors.text,
            marginBottom: theme.spacing.s,
            fontWeight: '600',
        },
        cardNotes: {
            ...theme.textVariants.body,
            color: theme.colors.text,
            fontStyle: 'italic',
            marginTop: theme.spacing.xs,
        },
        emptyText: { ...theme.textVariants.body, color: theme.colors.subText },
    });
