import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

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
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

  // Format date/time for the button (YYYY-MM-DD and HH:MM)
  // The library expects separate date and time

  // Calculate end time (default 1 hour)
  const [hours, minutes] = time.split(':').map(Number);
  const endDateObj = new Date();
  endDateObj.setHours(hours + 1);
  endDateObj.setMinutes(minutes);
  const endTime = `${endDateObj
    .getHours()
    .toString()
    .padStart(2, '0')}:${endDateObj.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <AddToCalendarButton
        name={title}
        options={['Apple', 'Google', 'Outlook.com', 'Yahoo', 'iCal']}
        location={location}
        startDate={date}
        endDate={date}
        startTime={time}
        endTime={endTime}
        timeZone="currentBrowser"
        description={notes}
        language={i18n.language as any}
        buttonStyle="custom"
        customCss={`
                    --btn-background: ${theme.colors.secondary};
                    --btn-text: #FFFFFF;
                    --font: 'System', sans-serif;
                    --btn-shadow: none;
                    --btn-border: none;
                    --btn-radius: 8px;
                    --btn-padding: 12px 20px;
                    --btn-font-weight: 600;
                    --btn-font-size: 16px;
                `}
        label={t('leaves.addToCalendar')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
});
