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
import { appointmentsDb } from '../../database/appointmentsDb';
import { notificationService } from '../../services/notificationService';
import { Appointment } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const AppointmentDetailsScreen = ({ navigation, route }: any) => {
  const { appointmentId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } };

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Appointments');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      const appt = await appointmentsDb.getById(appointmentId);
      setAppointment(appt);
    } catch (error) {
      Alert.alert(t('appointmentDetails.errorLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('appointmentDetails.deleteConfirmTitle'),
      t('appointmentDetails.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentsDb.delete(appointmentId);
              await notificationService.cancelAppointmentReminder(
                appointmentId,
              );
              navigateBack();
            } catch (error) {
              Alert.alert(t('appointmentDetails.errorDeleteFailed'));
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddAppointment', { appointmentId });
  };

  if (loading || !appointment) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>{t('appointmentDetails.loading')}</Text>
      </View>
    );
  }

  const formatDateTime = () => {
    const date = new Date(appointment.dateTime);
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
          <Text style={styles.title}>{appointment.title}</Text>
          <Text style={styles.dateTime}>{formatDateTime()}</Text>
        </View>

        {appointment.doctorName && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('appointmentDetails.doctorLabel')}</Text>
            <Text style={styles.value}>Dr. {appointment.doctorName}</Text>
          </View>
        )}

        {appointment.location && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('appointmentDetails.locationLabel')}</Text>
            <Text style={styles.value}>{appointment.location}</Text>
          </View>
        )}

        {appointment.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('appointmentDetails.notesLabel')}</Text>
            <Text style={styles.value}>{appointment.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>{t('appointmentDetails.reminderLabel')}</Text>
          <Text style={styles.value}>
            {appointment.reminderEnabled ? t('appointmentDetails.reminderTimeText') : t('appointmentDetails.reminderDisabled')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => Alert.alert('View History', 'Appointment history tracking is not available yet.')}
        >
          <Text style={styles.buttonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>{t('appointmentDetails.editButton')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>{t('appointmentDetails.deleteButton')}</Text>
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
