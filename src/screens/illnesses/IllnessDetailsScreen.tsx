import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { prescriptionsDb } from '../../database/prescriptionsDb';
import { Prescription } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { LoadingScreen } from '../../components/LoadingScreen';

export const PrescriptionDetailsScreen = ({ navigation, route }: any) => {
  const { prescriptionId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
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
      setActiveTab('Prescriptions');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  const loadPrescription = async () => {
    try {
      const presc = await prescriptionsDb.getById(prescriptionId);
      setPrescription(presc);
    } catch (error) {
      Alert.alert(t('common.errorTitle'), t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.deleteTitle'),
      t('common.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await prescriptionsDb.delete(prescriptionId);
              navigateBack();
            } catch (error) {
              Alert.alert(t('common.errorTitle'), t('common.deleteFailed'));
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddPrescription', { prescriptionId });
  };

  const handleViewHistory = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Prescriptions', 'PrescriptionHistory', { prescriptionId });
    } else {
      navigation.navigate('PrescriptionHistory', { prescriptionId });
    }
  };

  if (loading || !prescription) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {prescription.photoUri && (
          <Image source={{ uri: prescription.photoUri }} style={styles.photo} />
        )}

        <View style={styles.section}>
          <Text style={styles.medicationName}>
            {prescription.medicationName}
          </Text>
        </View>

        {prescription.doctorName && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('prescriptions.doctorNameLabel')}
            </Text>
            <Text style={styles.value}>
              {t('prescriptions.doctor')} {prescription.doctorName}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>{t('prescriptions.issueDateLabel')}</Text>
          <Text style={styles.value}>
            {new Date(prescription.issueDate).toLocaleDateString()}
          </Text>
        </View>

        {prescription.expiryDate && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('prescriptions.expiryDateLabel')}
            </Text>
            <Text style={styles.value}>
              {new Date(prescription.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {prescription.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('prescriptions.notesLabel')}</Text>
            <Text style={styles.value}>{prescription.notes}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleViewHistory}
        >
          <Text style={styles.buttonText}>{t('common.viewHistory')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>{t('common.edit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>{t('common.delete')}</Text>
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
    photo: {
      width: '100%',
      height: 300,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.border,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    medicationName: {
      ...theme.textVariants.header,
      color: theme.colors.text,
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
