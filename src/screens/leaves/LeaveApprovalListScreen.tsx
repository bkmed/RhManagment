import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { leavesDb } from '../../database/leavesDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';
import { Leave } from '../../database/schema';

export const LeaveApprovalListScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPendingLeaves();
    }, []);

    const loadPendingLeaves = async () => {
        try {
            const leaves = await leavesDb.getPending();
            setPendingLeaves(leaves);
        } catch (error) {
            notificationService.showAlert(t('common.error'), t('leaves.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (leave: Leave) => {
        try {
            await leavesDb.update(leave.id!, { status: 'approved' });
            // Update employee remaining days if it's a 'leave'
            if (leave.type === 'leave') {
                const { employeesDb } = require('../../database/employeesDb');
                const employee = await employeesDb.getById(leave.employeeId);
                if (employee) {
                    // Try to calculate days if startDate/endDate exist, otherwise 1
                    let days = 1;
                    if (leave.startDate && leave.endDate) {
                        const start = new Date(leave.startDate);
                        const end = new Date(leave.endDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    }

                    await employeesDb.update(employee.id, {
                        remainingVacationDays: Math.max(0, employee.remainingVacationDays - days)
                    });
                }
            }
            notificationService.showAlert(t('common.success'), t('leaveStatus.approved'));
            loadPendingLeaves();
        } catch (error) {
            notificationService.showAlert(t('common.error'), t('common.saveError'));
        }
    };

    const handleDecline = async (id: number) => {
        try {
            await leavesDb.update(id, { status: 'declined' });
            notificationService.showAlert(t('common.success'), t('leaveStatus.declined'));
            loadPendingLeaves();
        } catch (error) {
            notificationService.showAlert(t('common.error'), t('common.saveError'));
        }
    };

    const renderItem = ({ item }: { item: Leave }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBadge}>{t(`leaveTypes.${item.type}`)}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{item.employeeName}</Text>
            <Text style={styles.cardDate}>{formatDate(item.dateTime)}</Text>
            {item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => handleDecline(item.id!)}
                >
                    <Text style={styles.declineText}>{t('leaves.decline')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(item)}
                >
                    <Text style={styles.approveText}>{t('leaves.approve')}</Text>
                </TouchableOpacity>
            </View>
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
                data={pendingLeaves}
                renderItem={renderItem}
                keyExtractor={item => item.id!.toString()}
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

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: { backgroundColor: theme.colors.background, flex: 1 },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
        listContent: { padding: theme.spacing.m },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.l,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
        },
        cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.s },
        cardTitle: { ...theme.textVariants.subheader, color: theme.colors.text },
        cardBadge: {
            backgroundColor: theme.colors.primary + '20',
            paddingHorizontal: theme.spacing.s,
            paddingVertical: 2,
            borderRadius: 4,
            fontSize: 12,
            color: theme.colors.primary,
            fontWeight: 'bold',
        },
        cardSubtitle: { ...theme.textVariants.body, color: theme.colors.subText, marginBottom: 4 },
        cardDate: { ...theme.textVariants.caption, color: theme.colors.subText, marginBottom: theme.spacing.s },
        cardNotes: { ...theme.textVariants.body, color: theme.colors.text, fontStyle: 'italic', marginBottom: theme.spacing.m },
        actions: { flexDirection: 'row', gap: theme.spacing.m },
        actionButton: { flex: 1, padding: theme.spacing.m, borderRadius: theme.spacing.s, alignItems: 'center' },
        approveButton: { backgroundColor: theme.colors.primary },
        declineButton: { borderWidth: 1, borderColor: theme.colors.error },
        approveText: { color: theme.colors.surface, fontWeight: 'bold' },
        declineText: { color: theme.colors.error, fontWeight: 'bold' },
        emptyText: { ...theme.textVariants.body, color: theme.colors.subText },
    });
