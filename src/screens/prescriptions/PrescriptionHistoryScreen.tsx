import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

import { prescriptionsDb } from '../../database/prescriptionsDb';
import { PrescriptionHistory } from '../../database/schema';

export const PrescriptionHistoryScreen = ({ route }: any) => {
    const { prescriptionId } = route.params;
    const { t } = useTranslation();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [history, setHistory] = useState<PrescriptionHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, [prescriptionId]);

    const loadHistory = async () => {
        try {
            const data = await prescriptionsDb.getHistory(prescriptionId);
            setHistory(data);
        } catch (error) {
            console.error('Error loading prescription history:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderHistoryItem = ({ item }: { item: PrescriptionHistory }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.action}>
                    {t(`prescriptions.history.${item.action}`)}
                </Text>
                <Text style={styles.date}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.time}>
                {new Date(item.date).toLocaleTimeString()}
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
                keyExtractor={(item) => item.id.toString()}
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
        action: {
            ...theme.textVariants.subheader,
            color: theme.colors.text,
            fontWeight: 'bold',
        },
        date: {
            ...theme.textVariants.body,
            color: theme.colors.subText,
        },
        time: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
            marginBottom: theme.spacing.xs,
        },
        notes: {
            ...theme.textVariants.caption,
            color: theme.colors.text,
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
