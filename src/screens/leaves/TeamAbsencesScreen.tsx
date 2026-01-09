import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { leavesDb } from '../../database/leavesDb';
import { employeesDb } from '../../database/employeesDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';
import { Leave, Employee } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

export const TeamAbsencesScreen = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [absences, setAbsences] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeamAbsences();
    }, []);

    const loadTeamAbsences = async () => {
        try {
            if (!user?.employeeId) {
                setAbsences([]);
                return;
            }

            // 1. Get current employee to know their Team ID
            const currentEmployee = await employeesDb.getById(user.employeeId);
            if (!currentEmployee || !currentEmployee.teamId) {
                setAbsences([]); // No team assigned
                return;
            }

            // 2. Get all employees in this team
            const allEmployees = await employeesDb.getAll();
            const teamMemberIds = allEmployees
                .filter(e => e.teamId === currentEmployee.teamId)
                .map(e => e.id);

            if (teamMemberIds.length === 0) {
                setAbsences([]);
                return;
            }

            // 3. Get all leaves and filter by team members
            // (Optimization: leavesDb could have a getByEmployeeIds method, but for now client-side filter)
            const allLeaves = await leavesDb.getAll();
            const teamAbsences = allLeaves.filter(
                l =>
                    teamMemberIds.includes(l.employeeId) &&
                    l.status === 'approved' && // Usually "Absence" implies approved leave? Or show pending too? standard is approved/pending
                    l.type !== 'authorization' // Assuming authorization is just hours, not full absence? Let's show all for now.
            );

            // Sort by date descending
            teamAbsences.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

            setAbsences(teamAbsences);
        } catch (error) {
            notificationService.showAlert(t('common.error'), t('leaves.loadError'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
            <FlatList
                data={absences}
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
