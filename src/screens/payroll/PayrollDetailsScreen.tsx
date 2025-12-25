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
import { payrollDb } from '../../database/payrollDb';
import { notificationService } from '../../services/notificationService';
import { Payroll } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const PayrollDetailsScreen = ({ navigation, route }: any) => {
  const { payrollId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext) as any
    : { setActiveTab: () => { } };

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Payroll');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [payrollId]);

  const loadPayroll = async () => {
    try {
      const item = await payrollDb.getById(payrollId);
      setPayroll(item);
    } catch (error) {
      Alert.alert(t('payrollDetails.errorLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('payrollDetails.deleteConfirmTitle'),
      t('payrollDetails.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await payrollDb.delete(payrollId);
              await notificationService.cancelPayrollReminders(payrollId);
              navigateBack();
            } catch (error) {
              Alert.alert(t('payrollDetails.errorDeleteFailed'));
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddPayroll', { payrollId });
  };

  const handleViewHistory = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Payroll', 'PayrollHistory', { payrollId });
    } else {
      navigation.navigate('PayrollHistory', { payrollId });
    }
  };

  if (loading || !payroll) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>
          {t('payrollDetails.loading')}
        </Text>
      </View>
    );
  }

  const times = JSON.parse(payroll.times) as string[];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.name}>{payroll.name}</Text>
          <Text style={styles.amount}>{payroll.amount}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('payrollDetails.frequencyLabel')}
          </Text>
          <Text style={styles.value}>{payroll.frequency}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('payrollDetails.reminderTimesLabel')}
          </Text>
          <View style={styles.timesContainer}>
            {times.map((time, index) => (
              <View key={index} style={styles.timeBadge}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('payrollDetails.startDateLabel')}
          </Text>
          <Text style={styles.value}>{payroll.startDate}</Text>
        </View>

        {payroll.endDate && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('payrollDetails.endDateLabel')}
            </Text>
            <Text style={styles.value}>{payroll.endDate}</Text>
          </View>
        )}

        {payroll.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('payrollDetails.notesLabel')}
            </Text>
            <Text style={styles.value}>{payroll.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('payrollDetails.remindersLabel')}
          </Text>
          <Text style={styles.value}>
            {payroll.reminderEnabled
              ? t('payrollDetails.reminderEnabled')
              : t('payrollDetails.reminderDisabled')}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleViewHistory}>
          <Text style={styles.buttonText}>
            {t('payrollDetails.viewHistoryButton')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>
            {t('payrollDetails.editButton')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>
            {t('payrollDetails.deleteButton')}
          </Text>
        </TouchableOpacity>
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
    name: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: 4,
    },
    amount: {
      ...theme.textVariants.subheader,
      color: theme.colors.subText,
      fontWeight: '600',
    },
    label: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    value: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    timesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    timeBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    timeText: {
      ...theme.textVariants.caption,
      color: theme.colors.surface,
      fontWeight: '600',
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
