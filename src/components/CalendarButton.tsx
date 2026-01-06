import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../services/notificationService';
import { calendarService } from '../services/calendarService';
import { permissionsService } from '../services/permissions';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

interface CalendarButtonProps {
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export const CalendarButton: React.FC<CalendarButtonProps> = ({
  title,
  date,
  time,
  location,
  notes,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handlePress = async () => {
    try {
      const permission = await permissionsService.checkCalendarPermission();

      if (permission !== 'granted') {
        notificationService.showAlert(
          t('common.error'),
          t('leaves.calendarPermissionRequired'),
        );
        return;
      }

      const success = await calendarService.addToCalendar({
        title,
        date,
        time,
        location,
        notes,
        enableReminder: true,
      });

      if (success) {
        notificationService.showAlert(
          t('common.success'),
          t('leaves.addedToCalendar'),
        );
        onSuccess?.();
      } else {
        notificationService.showAlert(
          t('common.error'),
          t('leaves.calendarError'),
        );
        onError?.();
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      notificationService.showAlert(
        t('common.error'),
        t('leaves.calendarError'),
      );
      onError?.();
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{t('leaves.addToCalendar')}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.secondary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
