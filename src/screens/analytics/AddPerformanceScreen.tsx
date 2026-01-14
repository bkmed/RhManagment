import React, { useState, useMemo, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { performanceDb } from '../../database/performanceDb';
import { addReview, updateReview } from '../../store/slices/performanceSlice';
import {
  PerformanceReview,
  Company,
  Team,
  Employee,
} from '../../database/schema';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const AddPerformanceScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = useContext(WebNavigationContext);

  const companies = useSelector((state: RootState) => state.companies.items);
  const allTeams = useSelector((state: RootState) => state.teams.items);
  const employees = useSelector((state: RootState) => state.employees.items);

  const editingReview = route?.params?.review as PerformanceReview | undefined;
  const isEditing = !!editingReview;

  // Form State
  const [tempCompanyId, setTempCompanyId] = useState<string | null>(null);
  const [tempTeamId, setTempTeamId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [period, setPeriod] = useState('');
  const [score, setScore] = useState('5');
  const [comments, setComments] = useState('');

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && editingReview) {
      setSelectedEmployeeId(editingReview.employeeId);
      setPeriod(editingReview.period);
      setScore(editingReview.score.toString());
      setComments(editingReview.comments);

      const emp = employees.find(e => e.id === editingReview.employeeId);
      if (emp) {
        setTempCompanyId(emp.companyId || 'none');
        setTempTeamId(emp.teamId || 'none');
      }
    }
  }, [isEditing, editingReview, employees]);

  const filteredTeams = useMemo(() => {
    let teams = [...allTeams];
    if (tempCompanyId && tempCompanyId !== 'none') {
      teams = teams.filter(t => String(t.companyId) === String(tempCompanyId));
    }
    if (user?.role === 'manager' && user.teamId) {
      teams = teams.filter(t => t.id === user.teamId);
    }
    return teams;
  }, [allTeams, tempCompanyId, user]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // 1. Company Filter
      if (user?.role === 'rh' || user?.role === 'manager') {
        if (String(emp.companyId) !== String(user.companyId)) return false;
      } else if (tempCompanyId && tempCompanyId !== 'none') {
        if (String(emp.companyId) !== String(tempCompanyId)) return false;
      }

      // 2. Team Filter
      if (user?.role === 'manager') {
        if (String(emp.teamId) !== String(user.teamId)) return false;
      } else if (tempTeamId && tempTeamId !== 'none') {
        if (String(emp.teamId) !== String(tempTeamId)) return false;
      }

      // Exclude self-review
      if (emp.id === user?.employeeId) return false;

      return true;
    });
  }, [employees, tempCompanyId, tempTeamId, user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedEmployeeId)
      newErrors.employee = t('performance.errorEmployeeRequired');
    if (!period.trim()) newErrors.period = t('performance.errorPeriodRequired');
    if (!comments.trim())
      newErrors.comments = t('performance.errorCommentsRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const reviewData: PerformanceReview = {
        id: isEditing ? editingReview!.id : Date.now().toString(),
        employeeId: selectedEmployeeId!,
        reviewerId: user?.id || '',
        period,
        score: Number(score),
        comments,
        date: isEditing
          ? editingReview!.date
          : new Date().toISOString().split('T')[0],
        createdAt: isEditing
          ? editingReview!.createdAt
          : new Date().toISOString(),
      };

      if (isEditing) {
        await performanceDb.update(reviewData);
        dispatch(updateReview(reviewData));
        showToast(t('performance.updateSuccess'), 'success');
      } else {
        await performanceDb.add(reviewData);
        dispatch(addReview(reviewData));
        showToast(t('performance.addSuccess'), 'success');
      }

      navigateBack();
    } catch (error) {
      console.error('Error saving review:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Analytics', 'PerformanceReview');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? t('common.edit') : t('performance.newReview')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {/* Team Selector */}
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
                {filteredTeams.map((t_item: Team) => (
                  <TouchableOpacity
                    key={t_item.id}
                    onPress={() => {
                      setTempTeamId(t_item.id!);
                      setSelectedEmployeeId(null);
                    }}
                    style={[
                      styles.chip,
                      tempTeamId === t_item.id && styles.activeChip,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tempTeamId === t_item.id && styles.activeChipText,
                      ]}
                    >
                      {t_item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

        <Text style={styles.inputLabel}>{t('performance.employee')} *</Text>
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
            <Text style={styles.emptyFilterText}>{t('common.noData')}</Text>
          )}
        </ScrollView>
        {errors.employee && (
          <Text style={styles.errorText}>{errors.employee}</Text>
        )}

        <Text style={styles.inputLabel}>{t('performance.period')} *</Text>
        <TextInput
          style={[styles.input, errors.period && styles.inputError]}
          value={period}
          onChangeText={setPeriod}
          placeholder={t('performance.periodPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.period && <Text style={styles.errorText}>{errors.period}</Text>}

        <Text style={styles.inputLabel}>{t('performance.score')}</Text>
        <View style={styles.scoreContainer}>
          {['1', '2', '3', '4', '5'].map(val => (
            <TouchableOpacity
              key={val}
              onPress={() => setScore(val)}
              style={[styles.scoreOption, score === val && styles.activeScore]}
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

        <Text style={styles.inputLabel}>{t('performance.comments')} *</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors.comments && styles.inputError,
          ]}
          value={comments}
          onChangeText={setComments}
          placeholder={t('performance.feedbackPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          multiline
        />
        {errors.comments && (
          <Text style={styles.errorText}>{errors.comments}</Text>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingTop: Platform.OS === 'ios' ? 50 : theme.spacing.m,
    },
    backButton: {
      padding: theme.spacing.s,
    },
    backIcon: {
      fontSize: 24,
      color: theme.colors.primary,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    content: {
      padding: theme.spacing.m,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.s,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: theme.spacing.m,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputError: {
      borderColor: '#FF3B30',
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 12,
      marginTop: 4,
    },
    selectorScroll: {
      marginBottom: theme.spacing.s,
    },
    chip: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.s,
    },
    activeChip: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      color: theme.colors.text,
      fontSize: 14,
    },
    activeChipText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    scoreContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.m,
    },
    scoreOption: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    activeScore: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    scoreOptionText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    activeScoreText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    footer: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
    },
    saveBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      padding: theme.spacing.m,
      alignItems: 'center',
    },
    saveBtnText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    emptyFilterText: {
      color: theme.colors.subText,
      fontStyle: 'italic',
      alignSelf: 'center',
    },
  });
