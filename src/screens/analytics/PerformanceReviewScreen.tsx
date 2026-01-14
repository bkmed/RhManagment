import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { RootState } from '../../store';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import {
  PerformanceReview,
  Employee,
  Company,
  Team,
} from '../../database/schema';
import { addReview } from '../../store/slices/performanceSlice';
import { selectAllCompanies } from '../../store/slices/companiesSlice';
import { selectAllTeams } from '../../store/slices/teamsSlice';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';

export const PerformanceReviewScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { showModal } = useModal();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isManagerOrAdmin =
    user?.role === 'admin' || user?.role === 'rh' || user?.role === 'manager';

  const reviews = useSelector((state: RootState) => {
    const allReviews = state.performance.reviews;
    const allEmployees = state.employees.items;

    if (user?.role === 'admin') return allReviews;

    if (user?.role === 'rh') {
      // Filter by company
      const companyEmployees = allEmployees.filter(
        (e: Employee) => e.companyId === user.companyId,
      );
      const companyEmpIds = companyEmployees.map((e: Employee) => e.id);
      return allReviews.filter((r: PerformanceReview) =>
        companyEmpIds.includes(r.employeeId),
      );
    }

    if (user?.role === 'manager') {
      // Filter by team
      const teamEmployees = allEmployees.filter(
        (e: Employee) => e.teamId === user.teamId,
      );
      const teamEmpIds = teamEmployees.map((e: Employee) => e.id);
      return allReviews.filter((r: PerformanceReview) =>
        teamEmpIds.includes(r.employeeId),
      );
    }

    // Employee: Only own reviews
    return allReviews.filter(
      (r: PerformanceReview) => r.employeeId === (user?.id || user?.employeeId),
    );
  });

  const companies = useSelector(selectAllCompanies);
  const allTeams = useSelector(selectAllTeams);
  const employees = useSelector((state: RootState) => state.employees.items);

  const [isModalVisible, setModalVisible] = useState(false);

  // Filter States for Modal
  const [tempCompanyId, setTempCompanyId] = useState<string | 'none' | null>(
    null,
  );
  const [tempTeamId, setTempTeamId] = useState<string | 'none' | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(
    null,
  );
  const [isDetailVisible, setDetailVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [score, setScore] = useState('5');
  const [comments, setComments] = useState('');
  const [period, setPeriod] = useState(t('performance.periodPlaceholder'));

  // Initialize filters based on Role when modal opens
  React.useEffect(() => {
    if (isModalVisible) {
      if (user?.role === 'rh' && user.companyId) {
        setTempCompanyId(user.companyId);
      }
      if (user?.role === 'manager') {
        if (user.companyId) setTempCompanyId(user.companyId);
        if (user.teamId) setTempTeamId(user.teamId);
      }
    }
  }, [isModalVisible, user]);

  // Filtered lists for the modal
  const filteredTeams = useMemo(() => {
    // If Manager, locked to own team (handled by effect, but safety check?)
    // Actually, for dropdown display:
    let teams = allTeams;
    if (tempCompanyId && tempCompanyId !== 'none') {
      teams = teams.filter(t => t.companyId === tempCompanyId);
    }
    // If manager, further restrict?
    if (user?.role === 'manager' && user.teamId) {
      teams = teams.filter(t => t.id === user.teamId);
    }
    return teams;
  }, [allTeams, tempCompanyId, user]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // 1. Company Filter (RH and Manager MUST be in the same company)
      if (user?.role === 'rh') {
        if (emp.companyId !== user?.companyId) return false;
      } else if (user?.role === 'manager') {
        if (emp.companyId !== user?.companyId) return false;
      } else if (tempCompanyId && tempCompanyId !== 'none') {
        if (emp.companyId !== tempCompanyId) return false;
      }

      // 2. Team Filter (Manager MUST be in the same team)
      if (user?.role === 'manager') {
        if (emp.teamId !== user?.teamId) return false;
      } else if (tempTeamId && tempTeamId !== 'none') {
        if (emp.teamId !== tempTeamId) return false;
      }

      // If RH, we might not have a team selected, which is fine (shows all in company)
      // If Admin, they can see anyone and filter by company/team optionally

      // Exclude the reviewer themselves if they are an employee? 
      // Usually managers don't review themselves here.
      if (emp.id === user?.employeeId) return false;

      return true;
    });
  }, [employees, tempCompanyId, tempTeamId, user]);

  // Load data on mount
  React.useEffect(() => {
    const loadData = async () => {
      const { performanceDb } = require('../../database/performanceDb');
      const { employeesDb } = require('../../database/employeesDb');
      const { teamsDb } = require('../../database/teamsDb');
      const { setReviews } = require('../../store/slices/performanceSlice');
      const { setEmployees } = require('../../store/slices/employeesSlice');
      const { setTeams } = require('../../store/slices/teamsSlice');

      try {
        const [allReviews, allEmployees, allTeamsList] = await Promise.all([
          performanceDb.getAll(),
          employeesDb.getAll(),
          teamsDb.getAll(),
        ]);

        dispatch(setReviews(allReviews));
        dispatch(setEmployees(allEmployees));
        dispatch(setTeams(allTeamsList));
      } catch (error) {
        console.error('Error loading performance data:', error);
      }
    };
    loadData();
  }, [dispatch]);

  const handleSaveReview = async () => {
    const { performanceDb } = require('../../database/performanceDb');
    const { updateReview } = require('../../store/slices/performanceSlice');

    if (!selectedEmployeeId || !comments.trim()) return;

    const reviewData: PerformanceReview = {
      id: isEditing && selectedReview ? selectedReview.id : Date.now().toString(),
      employeeId: selectedEmployeeId,
      reviewerId: user?.id || '',
      period,
      score: Number(score),
      comments,
      date: isEditing && selectedReview ? selectedReview.date : new Date().toISOString().split('T')[0],
      createdAt: isEditing && selectedReview ? selectedReview.createdAt : new Date().toISOString(),
    };

    if (isEditing) {
      await performanceDb.update(reviewData);
      dispatch(updateReview(reviewData));
    } else {
      await performanceDb.add(reviewData);
      dispatch(addReview(reviewData));
    }

    setModalVisible(false);
    setIsEditing(false);
    setSelectedReview(null);
    resetForm();
  };

  const handleDeleteReview = async (id: string) => {
    const { performanceDb } = require('../../database/performanceDb');
    const { deleteReview } = require('../../store/slices/performanceSlice');

    try {
      await performanceDb.delete(id);
      dispatch(deleteReview(id));
      setDetailVisible(false);
      setSelectedReview(null);
      showToast(t('common.deleteSuccess') || t('common.success'), 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const handleEditClick = () => {
    if (!selectedReview) return;
    setIsEditing(true);
    setSelectedEmployeeId(selectedReview.employeeId);
    setScore(selectedReview.score.toString());
    setComments(selectedReview.comments);
    setPeriod(selectedReview.period);

    const emp = employees.find(e => e.id === selectedReview.employeeId);
    if (emp) {
      setTempCompanyId(emp.companyId || 'none');
      setTempTeamId(emp.teamId || 'none');
    }

    setDetailVisible(false);
    setModalVisible(true);
  };

  const resetForm = () => {
    setTempCompanyId(null);
    setTempTeamId(null);
    setSelectedEmployeeId(null);
    setScore('5');
    setComments('');
    setPeriod(t('performance.periodPlaceholder'));
    setIsEditing(false);
  };

  const renderReviewCard = ({ item }: { item: PerformanceReview }) => {
    const employee = employees.find((e: Employee) => e.id === item.employeeId);
    return (
      <TouchableOpacity
        style={styles.reviewCard}
        onPress={() => {
          setSelectedReview(item);
          setDetailVisible(true);
        }}
      >
        <View style={styles.reviewHeader}>
          <View>
            <Text style={styles.periodText}>{item.period}</Text>
            <Text style={styles.employeeName}>
              {employee?.name ||
                `${t('performance.employeeIdLabel')} ${item.employeeId}`}
            </Text>
          </View>
          <View
            style={[
              styles.scoreBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.scoreText}>{item.score}/5</Text>
          </View>
        </View>
        <Text style={styles.commentsText} numberOfLines={3}>{item.comments}</Text>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('performance.title')}</Text>
          <Text style={styles.subtitle}>
            {isManagerOrAdmin
              ? t('performance.managerSubtitle')
              : t('performance.employeeSubtitle')}
          </Text>
        </View>
        {isManagerOrAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonLabel}>{t('common.add')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewCard}
        keyExtractor={item => item.id!.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('common.noData')}</Text>
          </View>
        }
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('performance.newReview')}</Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {user?.role === 'admin' && (
                <>
                  <Text style={styles.inputLabel}>{t('common.company')}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.selectorScroll}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setTempCompanyId('none');
                        setTempTeamId(null);
                        setSelectedEmployeeId(null);
                      }}
                      style={[
                        styles.chip,
                        tempCompanyId === 'none' && styles.activeChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          tempCompanyId === 'none' && styles.activeChipText,
                        ]}
                      >
                        {t('common.none')}
                      </Text>
                    </TouchableOpacity>
                    {companies.map((c: Company) => (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => {
                          setTempCompanyId(c.id!);
                          setTempTeamId(null);
                          setSelectedEmployeeId(null);
                        }}
                        style={[
                          styles.chip,
                          tempCompanyId === c.id && styles.activeChip,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            tempCompanyId === c.id && styles.activeChipText,
                          ]}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Team Selector - Visible if Admin/RH OR if company is selected/implicit */}
              {user?.role !== 'manager' &&
                ((tempCompanyId && tempCompanyId !== 'none') ||
                  user?.role === 'rh') && (
                  <>
                    <Text style={styles.inputLabel}>{t('common.team')}</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.selectorScroll}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setTempTeamId('none');
                          setSelectedEmployeeId(null);
                        }}
                        style={[
                          styles.chip,
                          tempTeamId === 'none' && styles.activeChip,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            tempTeamId === 'none' && styles.activeChipText,
                          ]}
                        >
                          {t('common.none')}
                        </Text>
                      </TouchableOpacity>
                      {filteredTeams.map((t: Team) => (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => {
                            setTempTeamId(t.id!);
                            setSelectedEmployeeId(null);
                          }}
                          style={[
                            styles.chip,
                            tempTeamId === t.id && styles.activeChip,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              tempTeamId === t.id && styles.activeChipText,
                            ]}
                          >
                            {t.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

              <Text style={styles.inputLabel}>{t('performance.employee')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectorScroll}
              >
                {filteredEmployees.map((emp: Employee) => (
                  <TouchableOpacity
                    key={emp.id}
                    onPress={() => setSelectedEmployeeId(emp.id!)}
                    style={[
                      styles.chip,
                      selectedEmployeeId === emp.id && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedEmployeeId === emp.id && styles.activeChipText,
                      ]}
                    >
                      {emp.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                {filteredEmployees.length === 0 && (
                  <Text style={styles.emptyFilterText}>
                    {t('common.noData')}
                  </Text>
                )}
              </ScrollView>

              <Text style={styles.inputLabel}>{t('performance.period')}</Text>
              <TextInput
                style={styles.input}
                value={period}
                onChangeText={setPeriod}
                placeholder={t('performance.periodPlaceholder')}
                placeholderTextColor={theme.colors.subText}
              />

              <Text style={styles.inputLabel}>{t('performance.score')}</Text>
              <View style={styles.scoreContainer}>
                {['1', '2', '3', '4', '5'].map(val => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setScore(val)}
                    style={[
                      styles.scoreOption,
                      score === val && styles.activeScore,
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreOptionText,
                        score === val && styles.activeScoreText,
                      ]}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>{t('performance.comments')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={comments}
                onChangeText={setComments}
                placeholder={t('performance.feedbackPlaceholder')}
                placeholderTextColor={theme.colors.subText}
                multiline
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !selectedEmployeeId && { opacity: 0.5 },
                ]}
                onPress={handleSaveReview}
                disabled={!selectedEmployeeId}
              >
                <Text style={styles.saveBtnText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={isDetailVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReview && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={styles.modalTitle}>{t('performance.detailTitle')}</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('performance.employee')}:</Text>
                    <Text style={styles.detailValue}>
                      {employees.find(e => e.id === selectedReview.employeeId)?.name || selectedReview.employeeId}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('performance.period')}:</Text>
                    <Text style={styles.detailValue}>{selectedReview.period}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('performance.date')}:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedReview.date)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('performance.score')}:</Text>
                    <View style={[styles.scoreBadge, { backgroundColor: theme.colors.primary, borderBottomWidth: 0 }]}>
                      <Text style={styles.scoreText}>{selectedReview.score}/5</Text>
                    </View>
                  </View>

                  <Text style={styles.detailLabel}>{t('performance.comments')}:</Text>
                  <View style={styles.commentsContainer}>
                    <Text style={styles.commentsTextDetail}>{selectedReview.comments}</Text>
                  </View>
                </ScrollView>

                {isManagerOrAdmin && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.button, styles.deleteButtonDetail]}
                      onPress={() => {
                        showModal({
                          title: t('common.delete'),
                          message: t('performance.deleteConfirm'),
                          buttons: [
                            { text: t('common.cancel'), style: 'cancel' },
                            {
                              text: t('common.delete'),
                              style: 'destructive',
                              onPress: () => handleDeleteReview(selectedReview.id!),
                            },
                          ],
                        });
                      }}
                    >
                      <Text style={styles.buttonText}>{t('common.delete')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.editButtonDetail]}
                      onPress={handleEditClick}
                    >
                      <Text style={styles.buttonText}>{t('common.edit')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.m,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      ...theme.textVariants.header,
      fontSize: 20,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: theme.spacing.s,
    },
    addButtonLabel: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    listContent: {
      padding: theme.spacing.m,
    },
    reviewCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    reviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.s,
    },
    periodText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    employeeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    scoreBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scoreText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    commentsText: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: theme.spacing.s,
    },
    dateText: {
      fontSize: 10,
      color: theme.colors.subText,
      textAlign: 'right',
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      color: theme.colors.subText,
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
      maxHeight: '85%',
    },
    modalScroll: {
      maxHeight: '100%',
    },
    modalTitle: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: theme.spacing.m,
    },
    selectorScroll: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 8,
      backgroundColor: theme.colors.background,
    },
    activeChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    activeChipText: {
      color: '#FFF',
    },
    emptyFilterText: {
      fontSize: 12,
      color: theme.colors.subText,
      fontStyle: 'italic',
      marginTop: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },
    scoreContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    scoreOption: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeScore: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    scoreOptionText: {
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    activeScoreText: {
      color: '#FFF',
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
    cancelBtn: {
      padding: theme.spacing.m,
    },
    cancelBtnText: {
      color: theme.colors.subText,
    },
    saveBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.spacing.s,
    },
    saveBtnText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    detailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.l,
    },
    closeBtn: {
      fontSize: 20,
      color: theme.colors.subText,
      padding: 4,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
      paddingBottom: theme.spacing.s,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.subText,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    commentsContainer: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      marginTop: theme.spacing.s,
    },
    commentsTextDetail: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 22,
    },
    button: {
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.spacing.s,
      minWidth: 100,
      alignItems: 'center',
    },
    deleteButtonDetail: {
      backgroundColor: theme.colors.error,
    },
    editButtonDetail: {
      backgroundColor: theme.colors.secondary,
    },
    buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
  });
