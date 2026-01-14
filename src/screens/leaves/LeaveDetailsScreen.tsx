import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { leavesDb } from '../../database/leavesDb';
import { notificationService } from '../../services/notificationService';
import { emailService } from '../../services/emailService';
import { Leave } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDateTime } from '../../utils/dateUtils';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const LeaveDetailsScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const { leaveId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);

  const { setActiveTab } = useContext(WebNavigationContext);

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Leaves', 'LeaveList');
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
    } catch {
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
        newStatus,
      );

      // Open Email Draft for Employee
      await emailService.sendStatusUpdateEmail(
        'employee@example.com', // In a real app, this would be the actual employee email
        newStatus,
        leave.title,
        user?.name || 'HR Manager',
      );

      setLeave({ ...leave, status: newStatus });
      notificationService.showAlert(
        t('common.success'),
        t(`leaves.statusUpdated_${newStatus}`),
      );
    } catch {
      notificationService.showAlert(t('common.error'), t('leaves.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showModal({
      title: t('leaveDetails.deleteConfirmTitle'),
      message: t('leaveDetails.deleteConfirmMessage'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => handleConfirmDelete(),
        },
      ],
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await leavesDb.delete(leaveId);
      await notificationService.cancelLeaveReminder(leaveId);
      showToast(
        t('leaveDetails.deleteSuccess') || t('common.success'),
        'success',
      );
      navigateBack();
    } catch (error) {
      showToast(
        t('leaveDetails.errorDeleteFailed') || t('common.error'),
        'error',
      );
      console.error(error);
    }
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
        <Text style={{ color: theme.colors.text }}>
          {t('leaveDetails.loading')}
        </Text>
      </View>
    );
  }

  const startFull = formatDateTime(leave.startDate || leave.dateTime);
  const endFull = leave.endDate ? formatDateTime(leave.endDate) : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{leave.title}</Text>
          <Text style={styles.typeLabel}>{t(`leaveTypes.${leave.type}`)}</Text>
          <Text style={styles.dateTime}>{startFull}</Text>
          {endFull && endFull !== startFull && (
            <Text style={styles.dateTime}>to {endFull}</Text>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(leave.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(leave.status) },
              ]}
            >
              {t(`leaveStatus.${leave.status}`)}
            </Text>
          </View>
        </View>

        {(user?.role === 'admin' ||
          user?.role === 'rh' ||
          user?.role === 'manager') &&
          leave.status === 'pending' && (
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

        {(leave.employeeName || leave.department) && (
          <View style={styles.section}>
            {leave.employeeName && (
              <>
                <Text style={styles.label}>
                  {t('leaveDetails.employeeLabel')}
                </Text>
                <Text style={styles.value}>{leave.employeeName}</Text>
              </>
            )}
            {leave.department && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>{t('common.service')}</Text>
                <Text style={styles.value}>{leave.department}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>{t('leaves.subject')}</Text>
          <Text style={styles.value}>{leave.title}</Text>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>{t('leaves.cause')}</Text>
            <Text style={styles.value}>{leave.location || '-'}</Text>
          </View>
        </View>

        {leave.photoUri && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('illnesses.photoButton')}</Text>
            <Image
              source={{ uri: leave.photoUri }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginTop: 8,
              }}
              resizeMode="contain"
            />
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
            {leave.reminderEnabled
              ? t('leaveDetails.reminderTimeText')
              : t('leaveDetails.reminderDisabled')}
          </Text>
        </View>

        {(user?.role === 'admin' ||
          user?.role === 'rh' ||
          (user?.role === 'employee' &&
            leave.employeeId === user.employeeId)) && (
          <View style={{ paddingBottom: 20 }}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEdit}
            >
              <Text style={styles.buttonText}>
                {t('leaveDetails.editButton')}
              </Text>
            </TouchableOpacity>

            {(user?.role === 'admin' || user?.role === 'rh') && (
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>
                  {t('leaveDetails.deleteButton')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
      marginTop: 4,
    },
    typeLabel: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      fontWeight: 'bold',
      textTransform: 'uppercase',
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
    case 'approved':
      return '#4CAF50';
    case 'declined':
      return '#F44336';
    default:
      return '#FF9800';
  }
};
