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
import { useSelector } from 'react-redux';
import { selectQuestionOccurrences } from '../../store/slices/analyticsSlice';
import { selectAllDevices } from '../../store/slices/devicesSlice';
import { useAuth } from '../../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

export const AnalyticsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const questionOccurrences = useSelector(selectQuestionOccurrences);
  const allDevices = useSelector(selectAllDevices);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [adherenceChart, setAdherenceChart] = useState<{
    labels: string[];
    data: number[];
  } | null>(null);
  const [leavesChart, setLeavesChart] = useState<{
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
      let data, adherence, leaves;

      if (user?.role === 'employee') {
        [data, adherence] = await Promise.all([
          analyticsService.getPersonalAnalytics(user.employeeId!),
          analyticsService.getPayrollAdherence(), // We might want a personal adherence but history filter is complex
          // For employees, we don't show the "Upcoming Leaves" bar chart of the whole company
        ]);
        leaves = { labels: [], data: [] };
      } else {
        [data, adherence, leaves] = await Promise.all([
          analyticsService.getAnalytics(),
          analyticsService.getPayrollAdherence(),
          analyticsService.getUpcomingLeavesChart(),
        ]);
      }

      setAnalytics(data);
      setAdherenceChart(adherence);
      setLeavesChart(leaves);

      // Log analytics view event
      googleAnalytics.logEvent('view_analytics_dashboard', {
        total_payroll: data.totalPayroll,
        upcoming_leaves: data.upcomingLeaves,
        adherence_rate: data.payrollAdherence,
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
    labelColor: () => theme.colors.text, // Adapt text color
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
        <Text style={styles.title}>{t('analytics.hrAnalytics')}</Text>

        {/* Summary Cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardBlue]}>
            <Text style={styles.cardNumber}>{analytics.totalPayroll}</Text>
            <Text style={styles.cardLabel}>{t('analytics.payroll')}</Text>
          </View>

          <View style={[styles.card, styles.cardGreen]}>
            <Text style={styles.cardNumber}>{analytics.upcomingLeaves}</Text>
            <Text style={styles.cardLabel}>{t('analytics.leaves')}</Text>
          </View>
        </View>

        <View style={styles.cardsRow}>
          <View style={[styles.card, styles.cardOrange]}>
            <Text style={styles.cardNumber}>{analytics.expiringIllness}</Text>
            <Text style={styles.cardLabel}>
              {t('analytics.illnessExpiring')}
            </Text>
          </View>

          <View style={[styles.card, styles.cardPurple]}>
            <Text style={styles.cardNumber}>{analytics.payrollAdherence}%</Text>
            <Text style={styles.cardLabel}>{t('analytics.adherence')}</Text>
          </View>
        </View>

        {/* Payroll Adherence Chart */}
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

        {/* Upcoming Leaves Chart (Admin/RH/Manager Only) */}
        {user?.role !== 'employee' && leavesChart && leavesChart.data.some(val => val > 0) && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>
              {t('analytics.upcomingLeavesChart')}
            </Text>
            <BarChart
              data={{
                labels: leavesChart.labels,
                datasets: [{ data: leavesChart.data }],
              }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Keep green for success/leaves
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </View>
        )}

        {/* HR Insights (Personalized for employees) */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>
            {user?.role === 'employee' ? t('analytics.personalInsights') || 'Mes Insights' : t('analytics.hrInsights')}
          </Text>

          {analytics.payrollAdherence >= 90 && (
            <View style={[styles.insightCard, styles.insightGood]}>
              <Text style={styles.insightEmoji}>✅</Text>
              <Text style={styles.insightText}>
                {t('analytics.excellentAdherence', {
                  adherence: analytics.payrollAdherence,
                })}
              </Text>
            </View>
          )}

          {analytics.expiringIllness > 0 && (
            <View style={[styles.insightCard, styles.insightWarning]}>
              <Text style={styles.insightEmoji}>⚠️</Text>
              <Text style={styles.insightText}>
                {t('analytics.illnessesExpiring', {
                  count: analytics.expiringIllness,
                })}
              </Text>
            </View>
          )}

          {user?.role !== 'employee' && analytics.upcomingLeaves > 0 && (
            <View style={[styles.insightCard, styles.insightInfo]}>
              <Text style={styles.insightEmoji}>📅</Text>
              <Text style={styles.insightText}>
                {t('analytics.upcomingLeavesInsight', {
                  count: analytics.upcomingLeaves,
                })}
              </Text>
            </View>
          )}

          {user?.role === 'employee' && analytics.upcomingLeaves > 0 && (
            <View style={[styles.insightCard, styles.insightInfo]}>
              <Text style={styles.insightEmoji}>🏖️</Text>
              <Text style={styles.insightText}>
                {t('analytics.myUpcomingLeavesInsight', {
                  count: analytics.upcomingLeaves,
                }) || `Vous avez ${analytics.upcomingLeaves} congés à venir.`}
              </Text>
            </View>
          )}
        </View>

        {/* AI Question Analytics Section (Admin only) */}
        {(user?.role === 'admin' || user?.role === 'rh') &&
          questionOccurrences.length > 0 && (
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>
                {t('analytics.questionOccurrences') || 'Question Occurrences'}
              </Text>
              {questionOccurrences.map((occurrence, index) => (
                <View
                  key={index}
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: theme.colors.surface,
                      justifyContent: 'space-between',
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Text style={styles.insightEmoji}>📊</Text>
                    <Text style={[styles.insightText, { fontStyle: 'italic' }]}>
                      "{occurrence.text}"
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.occurrenceBadge,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Text style={styles.occurrenceText}>
                      {occurrence.count}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        {/* Material Distribution (Admin only) */}
        {(user?.role === 'admin' || user?.role === 'rh') && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Material Distribution</Text>
            <View style={styles.cardsRow}>
              <View
                style={[styles.card, { backgroundColor: theme.colors.success }]}
              >
                <Text style={styles.cardNumber}>{allDevices.length}</Text>
                <Text style={styles.cardLabel}>Total Material</Text>
              </View>
              <View
                style={[styles.card, { backgroundColor: theme.colors.error }]}
              >
                <Text style={styles.cardNumber}>
                  {allDevices.filter(d => d.condition === 'faulty').length}
                </Text>
                <Text style={styles.cardLabel}>Faulty Material</Text>
              </View>
            </View>
          </View>
        )}
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
    timestamp: {
      fontSize: 12,
      marginTop: 4,
    },
    occurrenceBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 12,
    },
    occurrenceText: {
      color: '#FFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
