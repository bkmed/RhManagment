import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { remoteDb } from '../../database/remoteDb';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const RemoteCalendarScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [remoteDays, setRemoteDays] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadRemoteData();
  }, [user]);

  const loadRemoteData = async () => {
    try {
      if (!user?.employeeId) {
        setLoading(false);
        return;
      }
      const data = await remoteDb.getByEmployeeId(user.employeeId);
      const mapped = data.reduce((acc: any, curr) => {
        acc[curr.date] = curr.status;
        return acc;
      }, {});
      setRemoteDays(mapped);
    } catch (error) {
      Alert.alert(t('common.error'), t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = async (dateStr: string) => {
    if (!user?.employeeId) return;
    const currentStatus = remoteDays[dateStr];
    const newStatus =
      !currentStatus || currentStatus === 'office' ? 'remote' : 'office';

    try {
      await remoteDb.addOrUpdate({
        employeeId: user.employeeId,
        date: dateStr,
        status: newStatus,
      });
      setRemoteDays({ ...remoteDays, [dateStr]: newStatus });
    } catch (error) {
      Alert.alert(t('common.error'), t('common.saveError'));
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Sunday is 0, we want Monday to be 0 or just handle padding
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      const status = remoteDays[dateStr];

      days.push(
        <TouchableOpacity
          key={d}
          style={[
            styles.dayCell,
            status === 'remote' && styles.remoteDay,
            status === 'office' && styles.officeDay,
          ]}
          onPress={() => toggleDay(dateStr)}
        >
          <Text style={[styles.dayText, !!status && styles.selectedDayText]}>
            {d}
          </Text>
          {status && (
            <Text style={styles.statusLabel}>
              {status === 'remote' ? '🏠' : '🏢'}
            </Text>
          )}
        </TouchableOpacity>,
      );
    }
    return days;
  };

  if (loading) return <ActivityIndicator style={styles.centered} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!user?.employeeId && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            ℹ️ {t('employees.notFound')} - {t('profile.professionalProfile')} required
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.calendarGrid}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <View key={d} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}
        {renderCalendar()}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.remoteDay]} />
          <Text style={styles.legendText}>{t('remote.remote')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.officeDay]} />
          <Text style={styles.legendText}>{t('remote.office')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
    },
    centered: { flex: 1, marginTop: 100 },
    header: { alignItems: 'center', marginBottom: theme.spacing.l },
    monthTitle: { ...theme.textVariants.header, color: theme.colors.text },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.s,
      ...theme.shadows.small,
    },
    dayHeader: {
      width: '14.28%',
      alignItems: 'center',
      paddingVertical: theme.spacing.s,
    },
    dayHeaderText: {
      ...theme.textVariants.caption,
      fontWeight: 'bold',
      color: theme.colors.subText,
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
    },
    dayText: { ...theme.textVariants.body, color: theme.colors.text },
    selectedDayText: { color: theme.colors.surface, fontWeight: 'bold' },
    remoteDay: { backgroundColor: theme.colors.primary },
    officeDay: { backgroundColor: theme.colors.secondary },
    statusLabel: { fontSize: 10, marginTop: 2 },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.xl,
      marginTop: theme.spacing.xl,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    legendBox: { width: 20, height: 20, borderRadius: 4 },
    legendText: { ...theme.textVariants.body, color: theme.colors.text },
    errorContainer: {
      padding: theme.spacing.m,
      backgroundColor: theme.colors.primary + '10',
      borderRadius: theme.spacing.s,
      marginBottom: theme.spacing.m,
    },
    errorText: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      textAlign: 'center',
    },
  });
