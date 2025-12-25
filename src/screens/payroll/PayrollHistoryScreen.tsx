import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
} from 'react-native';
import { payrollDb } from '../../database/payrollDb';
import { PayrollHistory } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const PayrollHistoryScreen = ({ route }: any) => {
    const { payrollId } = route.params;
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [history, setHistory] = useState<PayrollHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [payrollId]);

    const loadHistory = async () => {
        try {
            const data = await payrollDb.getHistory(payrollId);
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderHistoryItem = ({ item }: { item: PayrollHistory }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.date}>
                    {new Date(item.paidAt).toLocaleDateString()}
                </Text>
                <View style={[styles.badge, styles[`badge${item.status}` as keyof typeof styles]]}>
                    <Text style={styles.badgeText}>{t(`history.status.${item.status}`).toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.time}>
                {new Date(item.paidAt).toLocaleTimeString()}
            </Text>
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
            <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id?.toString() || ''}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmpty : null}
            />
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
        date: {
            ...theme.textVariants.body,
            fontWeight: '600',
            color: theme.colors.text,
        },
        time: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
            marginBottom: theme.spacing.xs,
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
