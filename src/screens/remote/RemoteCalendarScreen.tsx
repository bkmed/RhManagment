import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { remoteDb } from '../../database/remoteDb';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { holidaysService } from '../../services/holidaysService';
import { leavesDb } from '../../database/leavesDb';

export const RemoteCalendarScreen = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [remoteDays, setRemoteDays] = useState<any>({});
  const [approvedLeaves, setApprovedLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (!user?.employeeId) {
        setLoading(false);
        return;
      }

      const [remoteData, leavesData] = await Promise.all([
        remoteDb.getByEmployeeId(user.employeeId),
        leavesDb.getApprovedByEmployeeId(user.employeeId),
      ]);

      const mappedRemote = remoteData.reduce((acc: any, curr) => {
        acc[curr.date] = curr.status;
        return acc;
      }, {});

      setRemoteDays(mappedRemote);
      setApprovedLeaves(leavesData);
    } catch (error) {
      Alert.alert(t('common.error'), t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: 'remote' | 'office' | 'none') => {
    try {
      if (!user?.employeeId) {
        Alert.alert(t('common.error'), t('employees.notFound'));
        return;
      }

      if (!selectedDay) return;

      if (status === 'none') {
        const remoteData = await remoteDb.getByEmployeeId(user.employeeId);
        const entry = remoteData.find(r => r.date === selectedDay);
        if (entry?.id) {
          await remoteDb.delete(entry.id);
        }
        const newRemoteDays = { ...remoteDays };
        delete newRemoteDays[selectedDay];
        setRemoteDays(newRemoteDays);
      } else {
        await remoteDb.addOrUpdate({
          employeeId: user.employeeId,
          date: selectedDay,
          status,
        });
        setRemoteDays((prev: { [key: string]: string }) => ({ ...prev, [selectedDay]: status }));
      }
    } catch (error) {
      console.error('Error updating remote status:', error);
      Alert.alert(t('common.error'), t('common.saveError'));
    } finally {
      setModalVisible(false);
      setSelectedDay(null);
    }
  };

  const isDayOnLeave = (dateStr: string) => {
    return approvedLeaves.some(l => {
      const start = l.startDate || l.dateTime.split('T')[0];
      const end = l.endDate || start;
      return dateStr >= start && dateStr <= end;
    });
  };

  const getLeaveTitle = (dateStr: string) => {
    const leave = approvedLeaves.find(l => {
      const start = l.startDate || l.dateTime.split('T')[0];
      const end = l.endDate || start;
      return dateStr >= start && dateStr <= end;
    });
    return leave?.title;
  };

  const onDayPress = (dateStr: string) => {
    if (isDayOnLeave(dateStr)) {
      Alert.alert(t('remote.onLeave'), getLeaveTitle(dateStr));
      return;
    }
    const holiday = holidaysService.getHolidayOnDate(dateStr, user?.country || 'France');
    if (holiday) {
      Alert.alert(t('common.holiday'), holiday.name[t('languages.en') === 'English' ? 'en' : 'fr']);
      return;
    }
    setSelectedDay(dateStr);
    setModalVisible(true);
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Sunday is 0. Padding:
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const status = remoteDays[dateStr];
      const onLeave = isDayOnLeave(dateStr);
      const holiday = holidaysService.getHolidayOnDate(dateStr, user?.country || 'France');
      const isWeekend = holidaysService.isWeekend(date, user?.country);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <TouchableOpacity
          key={d}
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
          ]}
          onPress={() => onDayPress(dateStr)}
        >
          <Text style={[
            styles.dayText,
            isWeekend && !status && !onLeave && styles.weekendText,
            isToday && styles.todayText,
          ]}>
            {d}
          </Text>

          <View style={styles.statusContainer}>
            {status && (
              <View style={[
                styles.statusBadge,
                status.toLowerCase() === 'remote' ? styles.remoteBadge : styles.officeBadge
              ]}>
                <Text style={styles.statusBadgeText}>
                  {status.toLowerCase() === 'remote' ? '🏠 ' + t('remote.remote') : '🏢 ' + t('remote.office')}
                </Text>
              </View>
            )}
            {onLeave && (
              <View style={[styles.statusBadge, styles.leaveBadge]}>
                <Text style={styles.statusBadgeText}>🏖️ {t('remote.onLeave')}</Text>
              </View>
            )}
            {holiday && (
              <View style={[styles.statusBadge, styles.holidayBadge]}>
                <Text style={styles.statusBadgeText}>
                  📅 {holiday.name[i18n.language.startsWith('ar') ? 'fr' : (i18n.language.startsWith('fr') ? 'fr' : 'en')] || holiday.name.fr}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>,
      );
    }
    return days;
  };

  if (loading) return <ActivityIndicator style={styles.centered} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        {!user?.employeeId && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              ℹ️ {t('employees.notFound')} - {t('profile.professionalProfile')} required
            </Text>
          </View>
        )}

        {/* Month Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Text style={styles.navButtonText}>{"<"}</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.monthTitle}>
              {currentMonth.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>TODAY</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Text style={styles.navButtonText}>{">"}</Text>
          </TouchableOpacity>
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
            <View style={[styles.legendBox, styles.remoteBadge]} />
            <Text style={styles.legendText}>{t('remote.remote')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.officeBadge]} />
            <Text style={styles.legendText}>{t('remote.office')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.leaveBadge]} />
            <Text style={styles.legendText}>{t('remote.onLeave')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.holidayBadge]} />
            <Text style={styles.legendText}>{t('common.holiday')}</Text>
          </View>
        </View>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalCenteredView}>
            {/* Backdrop: Absolute fill to catch clicks outside content */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setModalVisible(false)}
            />

            {/* Content: Z-indexed box */}
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('remote.selectStatus')}</Text>
              <Text style={styles.modalSubtitle}>{selectedDay}</Text>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => updateStatus('office')}
              >
                <Text style={styles.optionIcon}>🏢</Text>
                <Text style={styles.optionText}>{t('remote.office')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => updateStatus('remote')}
              >
                <Text style={styles.optionIcon}>🏠</Text>
                <Text style={styles.optionText}>{t('remote.remote')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalOption, styles.noneOption]}
                onPress={() => updateStatus('none')}
              >
                <Text style={styles.optionIcon}>❌</Text>
                <Text style={styles.optionText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
      paddingBottom: theme.spacing.xl,
    },
    centered: { flex: 1, marginTop: 100 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.l
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    monthTitle: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      fontSize: 18,
    },
    navButton: {
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      ...theme.shadows.small,
    },
    navButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    todayButton: {
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: theme.colors.primary + '20',
      borderRadius: 4,
    },
    todayButtonText: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: 'bold',
      fontSize: 10,
    },
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
      minHeight: 60,
      justifyContent: 'flex-start',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
      position: 'relative',
      paddingTop: theme.spacing.xs,
    },
    dayText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    todayCell: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    todayText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    statusContainer: {
      width: '100%',
      paddingHorizontal: 2,
      alignItems: 'center',
    },
    statusBadge: {
      width: '95%',
      paddingVertical: 2,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    statusBadgeText: {
      fontSize: 8,
      fontWeight: 'bold',
      color: theme.colors.surface,
      textAlign: 'center',
      paddingHorizontal: 1,
    },
    remoteBadge: { backgroundColor: theme.colors.primary },
    officeBadge: { backgroundColor: theme.colors.secondary },
    leaveBadge: { backgroundColor: theme.colors.success },
    holidayBadge: { backgroundColor: theme.colors.error },
    weekendDay: { backgroundColor: theme.colors.background },
    weekendText: { color: theme.colors.error + '80' },
    holidayDot: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.error,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.m,
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.m,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    legendBox: { width: 16, height: 16, borderRadius: 4 },
    legendText: { ...theme.textVariants.caption, color: theme.colors.text },
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
    modalCenteredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'relative',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      width: '80%',
      maxWidth: 300,
      ...theme.shadows.medium,
    },
    modalTitle: {
      ...theme.textVariants.subheader,
      textAlign: 'center',
      marginBottom: 4,
      color: theme.colors.text,
    },
    modalSubtitle: {
      ...theme.textVariants.caption,
      textAlign: 'center',
      color: theme.colors.subText,
      marginBottom: theme.spacing.l,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      marginBottom: theme.spacing.s,
      backgroundColor: theme.colors.background,
    },
    optionIcon: { fontSize: 20, marginRight: theme.spacing.m },
    optionText: { ...theme.textVariants.body, fontWeight: '600', color: theme.colors.text },
    noneOption: {
      marginTop: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
  });
