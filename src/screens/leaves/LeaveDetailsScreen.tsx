import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { leavesDb } from '../../database/leavesDb';
import { notificationService } from '../../services/notificationService';
import { Leave } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

import { useAuth } from '../../context/AuthContext';

export const LeaveDetailsScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { leaveId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext) as any
    : { setActiveTab: (tab: string, screen?: string, params?: any) => { } };

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
      Alert.alert(t('leaveDetails.errorLoadFailed'));
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
              Alert.alert(t('leaveDetails.errorDeleteFailed'));
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddLeave', { leaveId });
  };

  if (loading || !leave) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>{t('leaveDetails.loading')}</Text>
      </View>
    );
  }

  const formatDateTime = () => {
    const date = new Date(leave.dateTime);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{leave.title}</Text>
          <Text style={styles.dateTime}>{formatDateTime()}</Text>
        </View>

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
  });
