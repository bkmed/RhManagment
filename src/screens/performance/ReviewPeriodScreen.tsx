import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { reviewPeriodsDb } from '../../database/reviewPeriodsDb';
import { ReviewPeriod } from '../../database/schema';
import { formatDate } from '../../utils/dateUtils';
import { rbacService } from '../../services/rbacService';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const ReviewPeriodScreen = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [periods, setPeriods] = useState<ReviewPeriod[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [status, setStatus] = useState<'active' | 'closed' | 'planned'>('planned');
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        loadPeriods();
    }, []);

    const loadPeriods = async () => {
        const data = await reviewPeriodsDb.getAll();
        setPeriods(data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
    };

    const handleSave = async () => {
        if (!name) {
            notificationService.showToast(t('common.required'), 'error');
            return;
        }

        try {
            const periodData = {
                name,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                status
            };

            if (editingId) {
                await reviewPeriodsDb.update(editingId, periodData);
            } else {
                await reviewPeriodsDb.add(periodData);
            }

            setModalVisible(false);
            resetForm();
            loadPeriods();
            notificationService.showToast(t('common.success'), 'success');

        } catch (e) {
            console.error(e);
            notificationService.showToast(t('common.error'), 'error');
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            t('common.delete'),
            t('common.confirmDelete'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await reviewPeriodsDb.delete(id);
                        loadPeriods();
                    }
                }
            ]
        );
    };

    const openModal = (period?: ReviewPeriod) => {
        if (period) {
            setName(period.name);
            setStartDate(new Date(period.startDate));
            setEndDate(new Date(period.endDate));
            setStatus(period.status);
            setEditingId(period.id);
        } else {
            resetForm();
        }
        setModalVisible(true);
    };

    const resetForm = () => {
        setName('');
        setStartDate(new Date());
        setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 1))); // Default 1 month
        setStatus('planned');
        setEditingId(null);
    };

    const canManage = rbacService.isAdmin(user) || rbacService.isRH(user);

    const renderItem = ({ item }: { item: ReviewPeriod }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={[styles.statusBadge,
                item.status === 'active' ? styles.statusActive :
                    item.status === 'closed' ? styles.statusClosed : styles.statusPlanned
                ]}>
                    {t(`common.status_${item.status}`) || item.status}
                </Text>
            </View>
            <Text style={styles.dateRange}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>

            {canManage && (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openModal(item)} style={styles.editBtn}>
                        <Text style={styles.actionText}>{t('common.edit')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <Text style={[styles.actionText, styles.deleteText]}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {canManage && (
                <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={periods}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>{t('common.noData')}</Text>}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingId ? t('common.edit') : t('common.add')} {t('performance.reviewPeriod')}
                        </Text>

                        <Text style={styles.label}>{t('common.name')}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Q1 2024 Review"
                            placeholderTextColor={theme.colors.subText}
                        />

                        <DateTimePickerField
                            label={t('common.startDate')}
                            value={startDate}
                            onChange={setStartDate}
                        />

                        <DateTimePickerField
                            label={t('common.endDate')}
                            value={endDate}
                            onChange={setEndDate}
                        />

                        <View style={styles.statusRow}>
                            {['planned', 'active', 'closed'].map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[
                                        styles.statusOption,
                                        status === s && styles.statusOptionSelected
                                    ]}
                                    onPress={() => setStatus(s as any)}
                                >
                                    <Text style={[
                                        styles.statusOptionText,
                                        status === s && styles.statusOptionTextSelected
                                    ]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnCancel}>
                                <Text style={styles.modalBtnTextCancel}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.modalBtnSave}>
                                <Text style={styles.modalBtnTextSave}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    listContent: { padding: theme.spacing.m },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        ...theme.shadows.small
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.s
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden'
    },
    statusActive: { backgroundColor: theme.colors.success + '20', color: theme.colors.success },
    statusClosed: { backgroundColor: theme.colors.subText + '20', color: theme.colors.subText },
    statusPlanned: { backgroundColor: theme.colors.primary + '20', color: theme.colors.primary },
    dateRange: {
        color: theme.colors.subText,
        marginBottom: theme.spacing.m
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.spacing.m
    },
    actionText: {
        color: theme.colors.primary,
        fontWeight: '600'
    },
    deleteText: {
        color: theme.colors.error
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        ...theme.shadows.medium
    },
    fabText: {
        fontSize: 30,
        color: '#fff',
        marginTop: -4
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.subText,
        marginTop: 50
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: theme.spacing.m
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.m,
        padding: theme.spacing.l,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.l,
        textAlign: 'center'
    },
    label: {
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
        fontWeight: '500'
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.spacing.s,
        padding: theme.spacing.m,
        color: theme.colors.text,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.l,
        marginTop: theme.spacing.m
    },
    statusOption: {
        flex: 1,
        padding: theme.spacing.s,
        alignItems: 'center',
        borderRadius: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginHorizontal: 4
    },
    statusOptionSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary
    },
    statusOptionText: {
        color: theme.colors.text,
        textTransform: 'capitalize'
    },
    statusOptionTextSelected: {
        color: '#fff',
        fontWeight: 'bold'
    },
    modalActions: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        marginTop: theme.spacing.s
    },
    modalBtnCancel: {
        flex: 1,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center'
    },
    modalBtnSave: {
        flex: 1,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.s,
        backgroundColor: theme.colors.primary,
        alignItems: 'center'
    },
    modalBtnTextCancel: { color: theme.colors.text, fontWeight: 'bold' },
    modalBtnTextSave: { color: '#fff', fontWeight: 'bold' },
    editBtn: {},
    deleteBtn: {}
});
