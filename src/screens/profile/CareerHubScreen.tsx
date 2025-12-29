import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { RootState } from '../../store';
import { useAuth } from '../../context/AuthContext';
import { Goal } from '../../database/schema';
import { addGoal, updateGoal, deleteGoal } from '../../store/slices/goalsSlice';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';

export const CareerHubScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    const dispatch = useDispatch();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const goals = useSelector((state: RootState) =>
        state.goals.goals.filter(g => g.employeeId === (user?.id ? Number(user.id) : 0))
    );

    const [isModalVisible, setModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);

    const handleSaveGoal = () => {
        if (!title.trim()) return;

        const goalData: Goal = editingGoal ? {
            ...editingGoal,
            title,
            description,
            deadline,
        } : {
            id: Date.now(),
            employeeId: user?.id ? Number(user.id) : 0,
            title,
            description,
            deadline,
            progress: 0,
            status: 'todo',
            createdAt: new Date().toISOString(),
        };

        if (editingGoal) {
            dispatch(updateGoal(goalData));
        } else {
            dispatch(addGoal(goalData));
        }

        setModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setEditingGoal(null);
        setTitle('');
        setDescription('');
        setDeadline(new Date().toISOString().split('T')[0]);
    };

    const handleUpdateProgress = (goal: Goal, newProgress: number) => {
        const status = newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'todo';
        dispatch(updateGoal({ ...goal, progress: newProgress, status }));
    };

    const renderGoalCard = (goal: Goal) => (
        <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
                <View style={styles.goalTitleContainer}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status, theme) }]}>
                        {t(`common.${goal.status}`)}
                    </Text>
                </View>
                <TouchableOpacity onPress={() => {
                    setEditingGoal(goal);
                    setTitle(goal.title);
                    setDescription(goal.description);
                    setDeadline(goal.deadline);
                    setModalVisible(true);
                }}>
                    <Text style={styles.editLink}>{t('profile.edit')}</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.goalDescription}>{goal.description}</Text>

            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{t('common.progress')}</Text>
                    <Text style={styles.progressValue}>{goal.progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${goal.progress}%`, backgroundColor: theme.colors.primary }]} />
                </View>
                <View style={styles.progressActions}>
                    {[0, 25, 50, 75, 100].map(val => (
                        <TouchableOpacity
                            key={val}
                            onPress={() => handleUpdateProgress(goal, val)}
                            style={[styles.progressStep, goal.progress === val && styles.activeStep]}
                        >
                            <Text style={[styles.stepText, goal.progress === val && styles.activeStepText]}>{val}%</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.goalFooter}>
                <Text style={styles.deadlineText}>📅 {t('common.deadline')}: {formatDate(goal.deadline)}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{t('navigation.careerHub')}</Text>
                        <Text style={styles.subtitle}>{t('home.careerGoalsSubtitle') || 'Gérez vos objectifs professionnels'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            resetForm();
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Section */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statBox, { borderLeftColor: theme.colors.primary }]}>
                        <Text style={styles.statVal}>{goals.length}</Text>
                        <Text style={styles.statLabel}>{t('common.total')}</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftColor: theme.colors.success }]}>
                        <Text style={styles.statVal}>{goals.filter(g => g.status === 'completed').length}</Text>
                        <Text style={styles.statLabel}>{t('common.completed')}</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftColor: theme.colors.warning }]}>
                        <Text style={styles.statVal}>{goals.filter(g => g.status === 'in_progress').length}</Text>
                        <Text style={styles.statLabel}>{t('common.in_progress')}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{t('common.myGoals') || 'Mes Objectifs'}</Text>
                {goals.length > 0 ? (
                    goals.map(renderGoalCard)
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>{t('common.noData')}</Text>
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingGoal ? t('common.edit') : t('common.add')} {t('common.goal')}</Text>

                        <Text style={styles.inputLabel}>{t('common.title')}</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Master React Native"
                        />

                        <Text style={styles.inputLabel}>{t('common.description')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your goal..."
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={styles.inputLabel}>{t('common.deadline')}</Text>
                        <TextInput
                            style={styles.input}
                            value={deadline}
                            onChangeText={setDeadline}
                            placeholder="YYYY-MM-DD"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveGoal}
                            >
                                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const getStatusColor = (status: string, theme: Theme) => {
    switch (status) {
        case 'completed': return theme.colors.success;
        case 'in_progress': return theme.colors.primary;
        case 'todo': return theme.colors.subText;
        case 'cancelled': return theme.colors.error;
        default: return theme.colors.primary;
    }
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContent: {
            padding: theme.spacing.m,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.l,
        },
        title: {
            ...theme.textVariants.header,
            color: theme.colors.text,
        },
        subtitle: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
        },
        addButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            ...theme.shadows.small,
        },
        addButtonText: {
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 'bold',
        },
        statsGrid: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            marginBottom: theme.spacing.l,
        },
        statBox: {
            flex: 1,
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.m,
            borderRadius: theme.spacing.m,
            borderLeftWidth: 4,
            ...theme.shadows.small,
        },
        statVal: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        statLabel: {
            fontSize: 10,
            color: theme.colors.subText,
            textTransform: 'uppercase',
        },
        sectionTitle: {
            ...theme.textVariants.subheader,
            marginBottom: theme.spacing.m,
        },
        goalCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            ...theme.shadows.small,
        },
        goalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.s,
        },
        goalTitleContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
        },
        goalTitle: {
            ...theme.textVariants.body,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        statusBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
            fontSize: 10,
            color: '#FFFFFF',
            fontWeight: 'bold',
        },
        editLink: {
            color: theme.colors.primary,
            fontSize: 12,
            fontWeight: '600',
        },
        goalDescription: {
            ...theme.textVariants.caption,
            color: theme.colors.subText,
            marginBottom: theme.spacing.m,
        },
        progressSection: {
            marginBottom: theme.spacing.m,
        },
        progressHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        progressLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.text,
        },
        progressValue: {
            fontSize: 12,
            fontWeight: 'bold',
            color: theme.colors.primary,
        },
        progressTrack: {
            height: 8,
            backgroundColor: theme.colors.border,
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: theme.spacing.s,
        },
        progressBar: {
            height: '100%',
        },
        progressActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 4,
        },
        progressStep: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            backgroundColor: theme.colors.border + '50',
        },
        activeStep: {
            backgroundColor: theme.colors.primary,
        },
        stepText: {
            fontSize: 10,
            color: theme.colors.text,
        },
        activeStepText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
        },
        goalFooter: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingTop: theme.spacing.s,
        },
        deadlineText: {
            fontSize: 11,
            color: theme.colors.subText,
        },
        emptyState: {
            padding: 40,
            alignItems: 'center',
        },
        emptyText: {
            color: theme.colors.subText,
            fontStyle: 'italic',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: theme.spacing.m,
        },
        modalContent: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.l,
            padding: theme.spacing.l,
            ...theme.shadows.medium,
        },
        modalTitle: {
            ...theme.textVariants.header,
            fontSize: 20,
            marginBottom: theme.spacing.l,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
            marginTop: theme.spacing.m,
        },
        input: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.spacing.s,
            padding: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
            color: theme.colors.text,
        },
        textArea: {
            height: 100,
            textAlignVertical: 'top',
        },
        modalActions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: theme.spacing.xl,
            gap: theme.spacing.m,
        },
        modalButton: {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.s,
            borderRadius: theme.spacing.s,
        },
        cancelButton: {
            backgroundColor: theme.colors.border,
        },
        saveButton: {
            backgroundColor: theme.colors.primary,
        },
        cancelButtonText: {
            color: theme.colors.text,
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontWeight: 'bold',
        },
    });
