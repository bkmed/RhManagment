import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { leavesDb } from '../../database/leavesDb';
import { notificationService } from '../../services/notificationService';
import { emailService } from '../../services/emailService';
import { Leave } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const LeaveDetailsScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { leaveId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);

  const { setActiveTab } = useContext(WebNavigationContext);

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Leaves');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadLeave();
  }, [leaveId]);

  const loadLeave = async () => {
    try {
      const data = await leavesDb.getById(leaveId);
      setLeave(data);
    } catch (error) {
      showToast(t('leaveDetails.errorLoadFailed'), 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'approved' | 'declined') => {
    if (!leave) return;
    try {
      setLoading(true);
      await leavesDb.update(leaveId, { ...leave, status: newStatus });
      setLeave({ ...leave, status: newStatus });

      // Notify Employee (Simulated via local notification for now)
      await notificationService.notifyLeaveRequestDecision(
        leaveId,
        leave.title,
        newStatus
      );

      // Open Email Draft for Employee
      await emailService.sendStatusUpdateEmail(
        'employee@example.com', // In a real app, this would be the actual employee email
        newStatus,
        leave.title,
        user?.name || 'HR Manager'
      );

      Alert.alert(t('common.success'), t(`leaves.statusUpdated_${newStatus}`));
    } catch (error) {
      Alert.alert(t('common.error'), t('leaves.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('leaveDetails.deleteConfirmTitle'),
      t('leaveDetails.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await leavesDb.delete(leaveId);
              await notificationService.cancelLeaveReminder(leaveId);
              navigateBack();
            } catch (error) {
              showToast(t('leaveDetails.errorDeleteFailed'), 'info');
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Leaves', 'AddLeave', { leaveId });
    } else {
      navigation.navigate('AddLeave', { leaveId });
    }
  };

  if (loading || !leave) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>{t('leaveDetails.loading')}</Text>
      </View>
    );
  }

  const formatDateTime = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date(leave.dateTime);
    const d = date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const tStr = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    return { d, tStr };
  };

  const start = formatDateTime(leave.startDate);
  const end = leave.endDate ? formatDateTime(leave.endDate) : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{leave.title}</Text>
          <Text style={styles.dateTime}>
            {start.d} {!end && `at ${start.tStr}`}
          </Text>
          {end && end.d !== start.d && (
            <Text style={styles.dateTime}>to {end.d}</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(leave.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(leave.status) }]}>
              {t(`leaveStatus.${leave.status}`)}
            </Text>
          </View>
        </View>

        {(user?.role === 'admin' || user?.role === 'rh' || user?.role === 'chef_dequipe') && leave.status === 'pending' && (
          <View style={styles.approvalActions}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={() => handleStatusChange('approved')}
            >
              <Text style={styles.buttonText}>{t('leaves.approve')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={() => handleStatusChange('declined')}
            >
              <Text style={styles.buttonText}>{t('leaves.decline')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {leave.employeeName && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('leaveDetails.employeeLabel')}</Text>
            <Text style={styles.value}>{leave.employeeName}</Text>
          </View>
        )}

        {leave.location && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('leaveDetails.locationLabel')}</Text>
            <Text style={styles.value}>{leave.location}</Text>
          </View>
        )}

        {leave.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('leaveDetails.notesLabel')}</Text>
            <Text style={styles.value}>{leave.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>{t('leaveDetails.reminderLabel')}</Text>
          <Text style={styles.value}>
            {leave.reminderEnabled ? t('leaveDetails.reminderTimeText') : t('leaveDetails.reminderDisabled')}
          </Text>
        </View>

        {(user?.role === 'admin' || user?.role === 'rh' || (user?.role === 'employee' && leave.employeeId === user.employeeId)) && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEdit}
            >
              <Text style={styles.buttonText}>{t('leaveDetails.editButton')}</Text>
            </TouchableOpacity>

            {(user?.role === 'admin' || user?.role === 'rh') && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>{t('leaveDetails.deleteButton')}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    title: {
      ...theme.textVariants.header,
      marginBottom: theme.spacing.s,
      color: theme.colors.text,
    },
    dateTime: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
    },
    label: {
      ...theme.textVariants.caption,
      marginBottom: 4,
      color: theme.colors.subText,
    },
    value: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.m,
    },
    editButton: {
      backgroundColor: theme.colors.secondary,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    buttonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: theme.spacing.m,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    approvalActions: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginBottom: theme.spacing.m,
    },
    approveButton: {
      flex: 1,
      backgroundColor: '#4CAF50',
    },
    declineButton: {
      flex: 1,
      backgroundColor: '#F44336',
    },
  });

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return '#4CAF50';
    case 'declined': return '#F44336';
    default: return '#FF9800';
  }
};
