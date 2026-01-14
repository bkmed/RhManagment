import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';
import { AbsenceStatus, formatAbsencePeriod } from '../utils/absenceStatus';

interface AbsenceStatusBadgeProps {
  status: AbsenceStatus;
  compact?: boolean;
}

export const AbsenceStatusBadge: React.FC<AbsenceStatusBadgeProps> = ({
  status,
  compact = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!status.isAbsent) return null;

  const icon = status.type === 'sick' ? '🏥' : '🏖️';
  const bgColor =
    status.type === 'sick' ? theme.colors.error : theme.colors.warning;

  const period =
    status.startDate && status.endDate
      ? formatAbsencePeriod(status.startDate, status.endDate)
      : status.startDate
      ? formatAbsencePeriod(status.startDate)
      : '';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={styles.icon}>{icon}</Text>
      {!compact && period && <Text style={styles.text}>{period}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.s,
      gap: theme.spacing.xs,
    },
    icon: {
      fontSize: 14,
    },
    text: {
      fontSize: 11,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
