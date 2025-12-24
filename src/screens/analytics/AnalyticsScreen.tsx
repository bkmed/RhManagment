import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LineChart, BarChart } from 'react-native-chart-kit';
import {
  analyticsService,
  AnalyticsData,
} from '../../services/analyticsService';
import { googleAnalytics } from '../../services/googleAnalytics';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [adherenceChart, setAdherenceChart] = useState<{
    labels: string[];
    data: number[];
  } | null>(null);
  const [appointmentsChart, setAppointmentsChart] = useState<{
    labels: string[];
    data: number[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log screen view for analytics
    googleAnalytics.logScreenView('AnalyticsScreen', 'analytics');
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [data, adherence, appointments] = await Promise.all([
        analyticsService.getAnalytics(),
        analyticsService.getMedicationAdherence(),
        analyticsService.getUpcomingAppointmentsChart(),
      ]);

      setAnalytics(data);
      setAdherenceChart(adherence);
      setAppointmentsChart(appointments);

      // Log analytics view event
      googleAnalytics.logEvent('view_analytics_dashboard', {
        total_medications: data.totalMedications,
        upcoming_appointments: data.upcomingAppointments,
        adherence_rate: data.medicationAdherence,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Keep brand blue for chart line
    labelColor: (opacity = 1) => theme.colors.text, // Adapt text color
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  // Responsive width
  const chartWidth = Math.min(screenWidth - 32, 800); // Max 800px on web

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('analytics.healthAnalytics')}</Text>

        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardBlue]}>
            <Text style={styles.cardNumber}>{analytics.totalMedications}</Text>
            <Text style={styles.cardLabel}>{t('analytics.medications')}</Text>
          </View>

          <View style={[styles.card, styles.cardGreen]}>
            <Text style={styles.cardNumber}>
              {analytics.upcomingAppointments}
            </Text>
            <Text style={styles.cardLabel}>{t('analytics.appointments')}</Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardOrange]}>
            <Text style={styles.cardNumber}>
              {analytics.expiringPrescriptions}
            </Text>
            <Text style={styles.cardLabel}>{t('analytics.expiringSoon')}</Text>
          </View>

          <View style={[styles.card, styles.cardPurple]}>
            <Text style={styles.cardNumber}>
              {analytics.medicationAdherence}%
            </Text>
            <Text style={styles.cardLabel}>{t('analytics.adherence')}</Text>
          </View>
        </View>

        {/* Medication Adherence Chart */}
        {adherenceChart && adherenceChart.data.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>
              {t('analytics.adherenceChart')}
            </Text>
            <LineChart
              data={{
                labels: adherenceChart.labels,
                datasets: [{ data: adherenceChart.data }],
              }}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
          </View>
        )}

        {/* Upcoming Appointments Chart */}
        {appointmentsChart && appointmentsChart.data.some(val => val > 0) && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>
              {t('analytics.upcomingAppointmentsChart')}
            </Text>
            <BarChart
              data={{
                labels: appointmentsChart.labels,
                datasets: [{ data: appointmentsChart.data }],
              }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Keep green for success/appointments
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </View>
        )}

        {/* Health Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>
            {t('analytics.healthInsights')}
          </Text>

          {analytics.medicationAdherence >= 90 && (
            <View style={[styles.insightCard, styles.insightGood]}>
              <Text style={styles.insightEmoji}>✅</Text>
              <Text style={styles.insightText}>
                {t('analytics.excellentAdherence', {
                  adherence: analytics.medicationAdherence,
                })}
              </Text>
            </View>
          )}

          {analytics.expiringPrescriptions > 0 && (
            <View style={[styles.insightCard, styles.insightWarning]}>
              <Text style={styles.insightEmoji}>⚠️</Text>
              <Text style={styles.insightText}>
                {t('analytics.prescriptionsExpiring', {
                  count: analytics.expiringPrescriptions,
                })}
              </Text>
            </View>
          )}

          {analytics.upcomingAppointments > 0 && (
            <View style={[styles.insightCard, styles.insightInfo]}>
              <Text style={styles.insightEmoji}>📅</Text>
              <Text style={styles.insightText}>
                {t('analytics.upcomingAppointmentsInsight', {
                  count: analytics.upcomingAppointments,
                })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      maxWidth: 1200, // Max width for web
      alignSelf: 'center',
      width: '100%',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: 20,
    },
    cardsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    card: {
      flex: 1,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    cardBlue: {
      backgroundColor: '#007AFF', // Keep solid colors for stats cards
    },
    cardGreen: {
      backgroundColor: '#34C759',
    },
    cardOrange: {
      backgroundColor: '#FF9500',
    },
    cardPurple: {
      backgroundColor: '#AF52DE',
    },
    cardNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 4,
    },
    cardLabel: {
      fontSize: 14,
      color: '#FFF',
      opacity: 0.9,
    },
    chartSection: {
      marginTop: 24,
      marginBottom: 16,
    },
    chartTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 12,
    },
    chart: {
      borderRadius: 16,
    },
    insightsSection: {
      marginTop: 24,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 16,
    },
    insightCard: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: 'center',
    },
    insightGood: {
      backgroundColor: theme.colors.successBackground,
    },
    insightWarning: {
      backgroundColor: theme.colors.warningBackground,
    },
    insightInfo: {
      backgroundColor: theme.colors.primaryBackground,
    },
    insightEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
  });
