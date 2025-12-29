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
import { formatDate, formatDateTime } from '../../utils/dateUtils';

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
                    {formatDate(item.paidAt)}
                </Text>
                <View style={[styles.badge, styles[`badge${item.status}` as keyof typeof styles] as any]}>
                    <Text style={styles.badgeText}>{t(`history.status.${item.status}`).toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.time}>
                {formatDateTime(item.paidAt)}
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
            backgroundColor: theme.colors.background,
        },
        listContent: {
            padding: theme.spacing.m,
            flexGrow: 1,
            maxWidth: 600,
            width: '100%',
            alignSelf: 'center',
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        date: {
            ...theme.textVariants.body,
            fontWeight: '700',
            color: theme.colors.text,
        },
        time: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
            marginBottom: theme.spacing.s,
            fontWeight: '500',
        },
        badge: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 8,
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
            fontSize: 10,
            color: '#FFF',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        notes: {
            ...theme.textVariants.caption,
            color: theme.colors.text,
            marginTop: theme.spacing.s,
            paddingTop: theme.spacing.s,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
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
