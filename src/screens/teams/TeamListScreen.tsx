import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { teamsDb } from '../../database/teamsDb';
import { employeesDb } from '../../database/employeesDb';
import { Team, Employee } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useContext } from 'react';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';

export const TeamListScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { showModal } = useModal();
    const { showToast } = useToast();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { setActiveTab } = useContext(WebNavigationContext) as any;

    const [teams, setTeams] = useState<Team[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [teamsData, employeesData] = await Promise.all([
                teamsDb.getAll(),
                employeesDb.getAll(),
            ]);
            setTeams(teamsData);
            setEmployees(employeesData);
        } catch (error) {
            console.error('Error loading team data:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, []),
    );

    const handleEdit = (team: Team) => {
        if (Platform.OS === 'web') {
            setActiveTab('Teams', 'AddTeam', { id: team.id });
        } else {
            navigation.navigate('AddTeam', { id: team.id });
        }
    };

    const handleDelete = (team: Team) => {
        showModal({
            title: t('common.deleteTitle'),
            message: `${t('common.deleteMessage')}\n"${team.name}"`,
            buttons: [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await teamsDb.delete(team.id);
                            showToast(t('common.success'), 'success');
                            loadData();
                        } catch (error) {
                            console.error('Error deleting team:', error);
                            showToast(t('common.deleteFailed'), 'error');
                        }
                    },
                },
            ],
        });
    };

    const renderItem = ({ item }: { item: Team }) => {
        const manager = employees.find(e => e.id === item.managerId);
        return (
            <View style={styles.card}>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.detailText}>🏢 {t('teams.department')}: {item.department}</Text>
                    <Text style={styles.detailText}>👤 {t('teams.manager')}: {manager?.name || 'N/A'}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEdit(item)}
                    >
                        <Text style={styles.actionText}>{t('common.edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item)}
                    >
                        <Text style={styles.actionText}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                    style={{ marginTop: 20 }}
                />
            ) : (
                <FlatList
                    data={teams}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('teams.empty')}</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    if (Platform.OS === 'web') {
                        setActiveTab('Teams', 'AddTeam');
                    } else {
                        navigation.navigate('AddTeam');
                    }
                }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
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
            maxWidth: 800,
            width: '100%',
            alignSelf: 'center',
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        info: {
            flex: 1,
        },
        actions: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
        },
        editButton: {
            backgroundColor: theme.colors.primary + '20',
        },
        deleteButton: {
            backgroundColor: theme.colors.error + '20',
        },
        actionText: {
            ...theme.textVariants.caption,
            fontSize: 12,
            fontWeight: '600',
        },
        name: {
            ...theme.textVariants.subheader,
            color: theme.colors.text,
            fontSize: 18,
            marginBottom: 4,
        },
        detailText: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
            marginTop: 2,
        },
        emptyContainer: {
            alignItems: 'center',
            marginTop: 40,
        },
        emptyText: {
            ...theme.textVariants.body,
            color: theme.colors.subText,
        },
        fab: {
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.medium,
            elevation: 6,
        },
        fabText: {
            fontSize: 32,
            color: '#FFF',
            marginTop: -2,
        },
    });
