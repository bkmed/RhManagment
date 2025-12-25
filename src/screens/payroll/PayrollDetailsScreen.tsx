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
import { medicationsDb } from '../../database/medicationsDb';
import { notificationService } from '../../services/notificationService';
import { Medication } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const MedicationDetailsScreen = ({ navigation, route }: any) => {
  const { medicationId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [medication, setMedication] = useState<Medication | null>(null);
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
      setActiveTab('Medications');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadMedication();
  }, [medicationId]);

  const loadMedication = async () => {
    try {
      const med = await medicationsDb.getById(medicationId);
      setMedication(med);
    } catch (error) {
      Alert.alert(t('medicationDetails.errorLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('medicationDetails.deleteConfirmTitle'),
      t('medicationDetails.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await medicationsDb.delete(medicationId);
              await notificationService.cancelMedicationReminders(medicationId);
              navigateBack();
            } catch (error) {
              Alert.alert(t('medicationDetails.errorDeleteFailed'));
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddMedication', { medicationId });
  };

  const handleViewHistory = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Medications', 'MedicationHistory', { medicationId });
    } else {
      navigation.navigate('MedicationHistory', { medicationId });
    }
  };

  if (loading || !medication) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>
          {t('medicationDetails.loading')}
        </Text>
      </View>
    );
  }

  const times = JSON.parse(medication.times) as string[];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.name}>{medication.name}</Text>
          <Text style={styles.dosage}>{medication.dosage}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('medicationDetails.frequencyLabel')}
          </Text>
          <Text style={styles.value}>{medication.frequency}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('medicationDetails.reminderTimesLabel')}
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
            {t('medicationDetails.startDateLabel')}
          </Text>
          <Text style={styles.value}>{medication.startDate}</Text>
        </View>

        {medication.endDate && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('medicationDetails.endDateLabel')}
            </Text>
            <Text style={styles.value}>{medication.endDate}</Text>
          </View>
        )}

        {medication.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('medicationDetails.notesLabel')}
            </Text>
            <Text style={styles.value}>{medication.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('medicationDetails.remindersLabel')}
          </Text>
          <Text style={styles.value}>
            {medication.reminderEnabled
              ? t('medicationDetails.reminderEnabled')
              : t('medicationDetails.reminderDisabled')}
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleViewHistory}>
          <Text style={styles.buttonText}>
            {t('medicationDetails.viewHistoryButton')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>
            {t('medicationDetails.editButton')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>
            {t('medicationDetails.deleteButton')}
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
    dosage: {
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
