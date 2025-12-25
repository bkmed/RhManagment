import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { payrollDb } from '../../database/payrollDb';
import { PayrollHistory, Payroll } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';

type HistoryItem = PayrollHistory & {
    payrollName: string;
};

export const GlobalHistoryScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const [allHistory, allPayroll] = await Promise.all([
                payrollDb.getAllHistory(),
                payrollDb.getAll(),
            ]);

            let filteredHistoryData = allHistory;
            if (user?.role === 'employee' && user?.employeeId) {
                const myPayrollIds = allPayroll.filter(p => p.employeeId === user.employeeId).map(p => p.id);
                filteredHistoryData = allHistory.filter(h => myPayrollIds.includes(h.payrollId));
            }

            const payrollMap = new Map(
                allPayroll.map((p) => [p.id, p.name])
            );

            const enrichedHistory: HistoryItem[] = filteredHistoryData.map((item) => ({
                ...item,
                payrollName: payrollMap.get(item.payrollId) || t('history.unknownPayroll'),
            })).sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

            setHistory(enrichedHistory);
        } catch (error) {
            console.error('Error loading global history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter((item) =>
        item.payrollName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.payrollName}>{item.payrollName}</Text>
                <View style={[styles.badge, styles[`badge${item.status}` as keyof typeof styles]]}>
                    <Text style={styles.badgeText}>{t(`history.status.${item.status}`).toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <Text style={styles.date}>
                    {new Date(item.paidAt).toLocaleDateString()}
                </Text>
                <Text style={styles.time}>
                    {new Date(item.paidAt).toLocaleTimeString()}
                </Text>
            </View>

            {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('history.noHistory')}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('common.searchPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={filteredHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmpty : null}
                onRefresh={loadHistory}
                refreshing={loading}
            />
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
        searchContainer: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        searchInput: {
            backgroundColor: theme.colors.background,
            padding: theme.spacing.s,
            borderRadius: theme.spacing.s,
            color: theme.colors.text,
            ...theme.textVariants.body,
        },
        listContent: {
            padding: theme.spacing.m,
            flexGrow: 1,
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        payrollName: {
            ...theme.textVariants.subheader,
            color: theme.colors.text,
            fontWeight: 'bold',
        },
        date: {
            ...theme.textVariants.body,
            color: theme.colors.text,
        },
        time: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
        },
        badge: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.spacing.l,
        },
        badgepaid: {
            backgroundColor: theme.colors.success,
        },
        badgemissed: {
            backgroundColor: theme.colors.error,
        },
        badgeskipped: {
            backgroundColor: theme.colors.warning,
        },
        badgeText: {
            ...theme.textVariants.caption,
            color: theme.colors.surface,
            fontWeight: '600',
            fontSize: 10,
        },
        notes: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
            marginTop: theme.spacing.xs,
            fontStyle: 'italic',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            ...theme.textVariants.body,
            color: theme.colors.subText,
        },
    });
