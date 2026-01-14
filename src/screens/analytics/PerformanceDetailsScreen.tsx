import React, { useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { RootState } from '../../store';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';
import { performanceDb } from '../../database/performanceDb';
import { deleteReview } from '../../store/slices/performanceSlice';

export const PerformanceDetailsScreen = ({ route, navigation }: any) => {
  const { review } = route.params || {};
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const { setActiveTab } = useContext(WebNavigationContext);
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const employees = useSelector((state: RootState) => state.employees.items);
  const employee = employees.find(e => e.id === review?.employeeId);

  const isManagerOrAdmin =
    user?.role === 'admin' || user?.role === 'rh' || user?.role === 'manager';

  if (!review) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('common.error')}</Text>
      </View>
    );
  }

  const handleDelete = () => {
    showModal({
      title: t('common.delete'),
      message: t('performance.deleteConfirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await performanceDb.delete(review.id);
              dispatch(deleteReview(review.id));
              showToast(t('common.deleteSuccess'), 'success');
              if (Platform.OS === 'web') {
                setActiveTab('Analytics', 'PerformanceReview');
              } else {
                navigation.goBack();
              }
            } catch (error) {
              console.error('Error deleting review:', error);
              showToast(t('common.error'), 'error');
            }
          },
        },
      ],
    });
  };

  const handleEdit = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Analytics', 'AddPerformance', { review });
    } else {
      navigation.navigate('AddPerformance', { review });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('performance.detailTitle')}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('performance.employee')}:</Text>
          <Text style={styles.value}>
            {employee?.name || review.employeeId}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('performance.period')}:</Text>
          <Text style={styles.value}>{review.period}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('performance.date')}:</Text>
          <Text style={styles.value}>{formatDate(review.date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>{t('performance.score')}:</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{review.score}/5</Text>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.label}>{t('performance.comments')}:</Text>
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsText}>{review.comments}</Text>
          </View>
        </View>
      </View>

      {isManagerOrAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>{t('common.delete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={handleEdit}
          >
            <Text style={styles.buttonText}>{t('common.edit')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.l,
      padding: theme.spacing.l,
      ...theme.shadows.medium,
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: theme.spacing.l,
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
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.subText,
    },
    value: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    scoreBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    scoreText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    commentsSection: {
      marginTop: theme.spacing.m,
    },
    commentsContainer: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      marginTop: theme.spacing.s,
    },
    commentsText: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 22,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xl,
      gap: theme.spacing.m,
    },
    button: {
      flex: 1,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    editButton: {
      backgroundColor: theme.colors.secondary,
    },
    buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      marginTop: 50,
    },
  });
