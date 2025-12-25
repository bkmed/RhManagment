import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { doctorsDb } from '../../database/doctorsDb';
import { appointmentsDb } from '../../database/appointmentsDb';
import { Doctor, Appointment } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { LoadingScreen } from '../../components/LoadingScreen';

export const DoctorDetailsScreen = ({ navigation, route }: any) => {
  const { doctorId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  // Déclare le contexte Web uniquement si on est sur web
  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } }; // fallback pour mobile

  const navigateToAddAppointment = () => {
    if (Platform.OS === 'web') {
      if (setActiveTab) {
        setActiveTab('Appointments', 'AddAppointment', {
          doctorName: doctor?.name || '',
        });
      }
    } else {
      navigation.navigate('AddAppointment', {
        doctorName: doctor?.name || '',
      });
    }
  };

  const navigationBack = () => {
    if (Platform.OS === 'web') {
      if (setActiveTab) {
        setActiveTab('Doctors');
      }
    } else {
      navigation.goBack();
    }
  };

  const navigateToAddPrescription = (doctor: Doctor) => {
    if (Platform.OS === 'web') {
      if (setActiveTab) {
        setActiveTab('Prescriptions', 'AddPrescription', {
          doctorName: doctor.name,
        });
      }
    } else {
      navigation.navigate('AddPrescription', {
        doctorName: doctor.name,
      });
    }
  };

  const loadData = async () => {
    try {
      const doctorData = await doctorsDb.getById(doctorId);
      const appointmentsData = await appointmentsDb.getByDoctorId(doctorId);

      if (doctorData) {
        setDoctor(doctorData);
      } else {
        Alert.alert(t('common.error'), t('doctors.notFound'));
        navigationBack();
      }

      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading doctor details:', error);
      Alert.alert(t('common.error'), t('doctors.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [doctorId]),
  );

  const handleEdit = () => {
    navigation.navigate('AddDoctor', { doctorId });
  };

  const handleDelete = () => {
    Alert.alert(
      t('doctors.deleteConfirmTitle'),
      t('doctors.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await doctorsDb.delete(doctorId);
              navigationBack();
            } catch (error) {
              console.error('Error deleting doctor:', error);
              Alert.alert(t('common.error'), t('doctors.deleteError'));
            }
          },
        },
      ],
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTitle}>{item.title}</Text>
        <Text style={styles.appointmentDate}>
          {new Date(item.dateTime).toLocaleDateString()}
          {new Date(item.dateTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      {item.location && (
        <Text style={styles.appointmentDetail}>📍 {item.location}</Text>
      )}
      {item.notes && (
        <Text style={styles.appointmentDetail}>📝 {item.notes}</Text>
      )}
    </View>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  if (!doctor) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.doctorInfoContainer}>
              {doctor.photoUri ? (
                <Image source={{ uri: doctor.photoUri }} style={styles.doctorPhoto} />
              ) : (
                <View style={[styles.doctorPhoto, styles.doctorPhotoPlaceholder]}>
                  <Text style={styles.doctorPhotoPlaceholderText}>
                    {doctor.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.name}>
                  {t('doctors.doctor')} {doctor.name}
                </Text>
                {doctor.specialty && (
                  <Text style={styles.specialty}>
                    {t(`specialties.${doctor.specialty}`, {
                      defaultValue: doctor.specialty,
                    })}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleEdit}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={[styles.actionText, styles.deleteText]}>
                  {t('common.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            {doctor.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('doctors.phone')}</Text>
                <Text style={styles.detailValue}>{doctor.phone}</Text>
              </View>
            )}
            {doctor.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('doctors.email')}</Text>
                <Text style={styles.detailValue}>{doctor.email}</Text>
              </View>
            )}
            {doctor.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('doctors.address')}</Text>
                <Text style={styles.detailValue}>{doctor.address}</Text>
              </View>
            )}
            {doctor.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('doctors.notes')}</Text>
                <Text style={styles.detailValue}>{doctor.notes}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('appointments.title')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigateToAddPrescription(doctor)}
              style={[styles.addButton, styles.secondaryButton]}
            >
              <Text style={[styles.addButtonText, styles.secondaryButtonText]}>
                + {t('doctors.addPrescription')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={navigateToAddAppointment}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>
                + {t('doctors.addAppointment')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {appointments.length > 0 ? (
          appointments.map(item => (
            <View key={item.id} style={styles.appointmentWrapper}>
              {renderAppointment({ item })}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('doctors.noAppointments')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      ...theme.shadows.medium,
      marginBottom: theme.spacing.l,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.m,
    },
    doctorInfoContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
    },
    doctorPhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    doctorPhotoPlaceholder: {
      backgroundColor: theme.colors.primaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    doctorPhotoPlaceholderText: {
      color: theme.colors.primary,
      fontSize: 24,
      fontWeight: 'bold',
    },
    name: {
      ...theme.textVariants.header,
      fontSize: 24,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    specialty: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
      fontSize: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.s,
    },
    actionButton: {
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.s,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    deleteButton: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.error,
    },
    actionText: {
      ...theme.textVariants.body,
      fontSize: 14,
      color: theme.colors.primary,
    },
    deleteText: {
      color: theme.colors.error,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.m,
    },
    detailsSection: {
      gap: theme.spacing.m,
    },
    detailRow: {
      gap: theme.spacing.xs,
    },
    detailLabel: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      textTransform: 'uppercase',
      color: theme.colors.subText,
    },
    detailValue: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
      flexWrap: 'wrap', // Allow wrapping
      gap: theme.spacing.s,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.l,
    },
    addButtonText: {
      ...theme.textVariants.button,
      fontSize: 14,
      color: theme.colors.surface,
    },
    appointmentWrapper: {
      marginBottom: theme.spacing.m,
    },
    appointmentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      ...theme.shadows.small,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    appointmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    appointmentTitle: {
      ...theme.textVariants.body,
      fontWeight: '600',
      color: theme.colors.text,
    },
    appointmentDate: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    appointmentDetail: {
      ...theme.textVariants.caption,
      marginTop: theme.spacing.xs,
      color: theme.colors.subText,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
    },
    emptyText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      flexWrap: 'wrap', // Allow buttons to wrap
      justifyContent: 'flex-end', // Keep them to the right implies standard desktop look, but wrapping handles mobile
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
    },
  });
