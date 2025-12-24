import React, {
  useState,
  useMemo,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { medicationsDb } from '../database/medicationsDb';
import { appointmentsDb } from '../database/appointmentsDb';
import { prescriptionsDb } from '../database/prescriptionsDb';
import { permissionsService } from '../services/permissions';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [summary, setSummary] = useState({
    medications: 0,
    upcomingAppointments: 0,
    expiringPrescriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(true);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
      checkPermission();
    }, []),
  );

  const checkPermission = async () => {
    // Check permission using unified service (works for web & native)
    const status = await permissionsService.checkNotificationPermission();
    setHasNotificationPermission(status === 'granted');
  };

  const handleEnableNotifications = async () => {
    const status = await permissionsService.requestNotificationPermission();
    setHasNotificationPermission(status === 'granted');
  };

  const loadSummary = async () => {
    try {
      const [meds, appts, prescriptions] = await Promise.all([
        medicationsDb.getAll(),
        appointmentsDb.getUpcoming(),
        prescriptionsDb.getExpiringSoon(),
      ]);

      setSummary({
        medications: meds.length,
        upcomingAppointments: appts.length,
        expiringPrescriptions: prescriptions.length,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safe access à WebNavigationContext
  const webContext =
    Platform.OS === 'web'
      ? useContext((require('../navigation/AppNavigator').WebNavigationContext) as React.Context<any>)
      : null;

  const setActiveTab = webContext?.setActiveTab || (() => { });

  const navigateToTab = (tab: string, screen?: string) => {
    if (Platform.OS === 'web') {
      // For web, clear subScreen to go to the list view
      setActiveTab(tab, screen);
    } else {
      // For native, navigate to the appropriate tab
      const stackScreen =
        tab === 'medications' || tab === 'Medications'
          ? 'MedicationsTab'
          : tab === 'appointments' || tab === 'Appointments'
            ? 'AppointmentsTab'
            : tab === 'analytics'
              ? 'Analytics'
              : undefined;

      if (stackScreen) {
        navigation.navigate(
          stackScreen === 'Analytics' ? stackScreen : 'Main',
          stackScreen === 'Analytics'
            ? undefined
            : { screen: stackScreen, params: screen ? { screen } : undefined },
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('home.greeting')}</Text>
          <Text style={styles.appName}>{t('home.appName')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardBlue]}
            onPress={() => navigateToTab('Medications')}
          >
            <Text style={styles.statNumber}>{summary.medications}</Text>
            <Text style={styles.statLabel}>{t('home.activeMedications')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardGreen]}
            onPress={() => navigateToTab('Appointments')}
          >
            <Text style={styles.statNumber}>
              {summary.upcomingAppointments}
            </Text>
            <Text style={styles.statLabel}>
              {t('home.upcomingAppointments')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alerts */}
        {summary.expiringPrescriptions > 0 && (
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {t('home.prescriptionAlert')}
              </Text>
              <Text style={styles.alertMessage}>
                {t('home.prescriptionsExpiring', {
                  count: summary.expiringPrescriptions,
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Medications', 'AddMedication')}
        >
          <Text style={styles.actionIcon}>💊</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('home.addMedication')}</Text>
            <Text style={styles.actionSubtitle}>
              {t('home.addMedicationSubtitle')}
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Appointments', 'AddAppointment')}
        >
          <Text style={styles.actionIcon}>📅</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>
              {t('home.scheduleAppointment')}
            </Text>
            <Text style={styles.actionSubtitle}>
              {t('home.scheduleAppointmentSubtitle')}
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigateToTab('Analytics')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{t('home.viewAnalytics')}</Text>
            <Text style={styles.actionSubtitle}>
              {t('home.viewAnalyticsSubtitle')}
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* Tips Section */}
        {!hasNotificationPermission && (
          <TouchableOpacity
            style={styles.tipCard}
            onPress={handleEnableNotifications}
          >
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{t('home.tip')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// Styles remain unchanged
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
      paddingBottom: 40,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: 30,
      alignItems: 'center',
    },
    greeting: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    statCardBlue: {
      backgroundColor: theme.colors.primary,
    },
    statCardGreen: {
      backgroundColor: theme.colors.success,
    },
    statNumber: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: '#FFF',
      textAlign: 'center',
      opacity: 0.9,
    },
    alertCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.warningBackground,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      alignItems: 'center',
    },
    alertIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    alertContent: {
      flex: 1,
    },
    alertTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 2,
    },
    alertMessage: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    actionIcon: {
      fontSize: 28,
      marginRight: theme.spacing.m,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 2,
    },
    actionSubtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    actionArrow: {
      fontSize: 24,
      color: theme.colors.primary,
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primaryBackground,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginTop: theme.spacing.m,
      alignItems: 'center',
    },
    tipIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    tipText: {
      flex: 1,
      ...theme.textVariants.body,
      color: theme.colors.primary,
      lineHeight: 20,
    },
  });
