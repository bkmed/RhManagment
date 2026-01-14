import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { RootState } from '../../store';
import { useAuth } from '../../context/AuthContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import React, { useContext, useMemo, useEffect } from 'react';
import { PerformanceReview, Employee } from '../../database/schema';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';
import {
  Platform,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';

export const PerformanceReviewScreen = ({ navigation }: any) => {
  const { setActiveTab } = useContext(WebNavigationContext);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isManagerOrAdmin =
    user?.role === 'admin' || user?.role === 'rh' || user?.role === 'manager';

  const employees = useSelector((state: RootState) => state.employees.items);
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

  // Load data on mount
  useEffect(() => {
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

  // handleSaveReview removed - moved to AddPerformanceScreen

  // resetForm removed

  const renderReviewCard = ({ item }: { item: PerformanceReview }) => {
    const employee = employees.find((e: Employee) => e.id === item.employeeId);
    return (
      <TouchableOpacity
        style={styles.reviewCard}
        onPress={() => {
          if (Platform.OS === 'web') {
            setActiveTab('Analytics', 'PerformanceDetails', { review: item });
          } else {
            navigation.navigate('PerformanceDetails', { review: item });
          }
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
        <Text style={styles.commentsText} numberOfLines={3}>
          {item.comments}
        </Text>
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
            onPress={() => {
              if (Platform.OS === 'web') {
                setActiveTab('Analytics', 'AddPerformance');
              } else {
                navigation.navigate('AddPerformance');
              }
            }}
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

      {/* Add/Edit Modal removed - now a page */}
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
  });
