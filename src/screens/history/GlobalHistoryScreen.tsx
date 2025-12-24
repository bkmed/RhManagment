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
import { medicationsDb } from '../../database/medicationsDb';
import { MedicationHistory } from '../../database/schema';

type HistoryItem = MedicationHistory & {
    medicationName: string;
};

export const GlobalHistoryScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
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
            const [allHistory, allMedications] = await Promise.all([
                medicationsDb.getAllHistory(),
                medicationsDb.getAll(),
            ]);

            const medicationMap = new Map(
                allMedications.map((m) => [m.id, m.name])
            );

            const enrichedHistory: HistoryItem[] = allHistory.map((item) => ({
                ...item,
                medicationName: medicationMap.get(item.medicationId) || t('history.unknownMedication'),
            })).sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

            setHistory(enrichedHistory);
        } catch (error) {
            console.error('Error loading global history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter((item) =>
        item.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.medicationName}>{item.medicationName}</Text>
                <View style={[styles.badge, styles[`badge${item.status}`]]}>
                    <Text style={styles.badgeText}>{t(`history.status.${item.status}`).toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.row}>
                <Text style={styles.date}>
                    {new Date(item.takenAt).toLocaleDateString()}
                </Text>
                <Text style={styles.time}>
                    {new Date(item.takenAt).toLocaleTimeString()}
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
        medicationName: {
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
        badgetaken: {
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
