import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { prescriptionsDb } from '../../database/prescriptionsDb';
import { medicationsDb } from '../../database/medicationsDb';
import { Medication } from '../../database/schema';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const AddPrescriptionScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const prescriptionId = route?.params?.prescriptionId;
  const isEdit = !!prescriptionId;
  const initialDoctorName = route?.params?.doctorName || '';

  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [selectedMedicationIds, setSelectedMedicationIds] = useState<number[]>([]);
  const [medicationName, setMedicationName] = useState(''); // Fallback or computed
  const [doctorName, setDoctorName] = useState(initialDoctorName);
  const [issueDate, setIssueDate] = useState<Date | null>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [photoUri, setPhotoUri] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    if (isEdit) loadPrescription();
  }, [prescriptionId]);

  useEffect(() => {
    navigation?.setOptions({
      title: isEdit ? t('prescriptions.edit') : t('prescriptions.add'),
    });
  }, [isEdit, navigation, t]);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } };

  const loadMedications = async () => {
    try {
      const data = await medicationsDb.getAll();
      setAllMedications(data);
    } catch (error) {
      console.error('Error loading medications', error);
    }
  };

  const loadPrescription = async () => {
    if (!prescriptionId) return;
    try {
      const prescription = await prescriptionsDb.getById(prescriptionId);
      if (prescription) {
        setMedicationName(prescription.medicationName || '');
        setDoctorName(prescription.doctorName || '');
        setIssueDate(
          prescription.issueDate ? new Date(prescription.issueDate) : new Date(),
        );
        setExpiryDate(prescription.expiryDate ? new Date(prescription.expiryDate) : null);
        setPhotoUri(prescription.photoUri || '');
        setNotes(prescription.notes || '');

        if (prescription.medicationIds) {
          try {
            setSelectedMedicationIds(JSON.parse(prescription.medicationIds));
          } catch (e) {
            console.error('Error parsing medicationIds', e);
          }
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('prescriptions.loadError'));
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => setPhotoUri(event.target.result);
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    Alert.alert(t('prescriptions.addPhoto'), t('prescriptions.chooseOption'), [
      {
        text: t('prescriptions.takePhoto'),
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets && response.assets[0]?.uri) {
              setPhotoUri(response.assets[0].uri);
            }
          });
        },
      },
      {
        text: t('prescriptions.chooseFromLibrary'),
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets && response.assets[0]?.uri) {
              setPhotoUri(response.assets[0].uri);
            }
          });
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const toggleMedicationSelection = (id: number) => {
    if (selectedMedicationIds.includes(id)) {
      setSelectedMedicationIds(selectedMedicationIds.filter(mid => mid !== id));
    } else {
      setSelectedMedicationIds([...selectedMedicationIds, id]);
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (selectedMedicationIds.length === 0 && !medicationName.trim()) {
      newErrors.medicationName = t('common.required');
    }
    if (!issueDate) newErrors.issueDate = t('common.required');

    // Validate Expiry Date > Issue Date
    if (issueDate && expiryDate && expiryDate < issueDate) {
      newErrors.expiryDate = t('common.invalidDateRange');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // Compute medication name from selected IDs if available
      let computedMedicationName = medicationName.trim();
      if (selectedMedicationIds.length > 0) {
        const selectedNames = allMedications
          .filter(m => m.id && selectedMedicationIds.includes(m.id))
          .map(m => m.name);
        computedMedicationName = selectedNames.join(', ');
      }

      const prescriptionData = {
        medicationName: computedMedicationName,
        medicationIds: JSON.stringify(selectedMedicationIds),
        doctorName: doctorName.trim() || undefined,
        issueDate: issueDate!.toISOString().split('T')[0],
        expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : undefined,
        photoUri: photoUri || undefined,
        notes: notes.trim() || undefined,
      };

      let id = prescriptionId;

      if (isEdit && prescriptionId) {
        await prescriptionsDb.update(prescriptionId, prescriptionData);
      } else {
        id = await prescriptionsDb.add(prescriptionData);
      }

      // Notifications
      if (prescriptionData.expiryDate) {
        await notificationService.schedulePrescriptionExpiryReminder(
          id,
          prescriptionData.medicationName,
          prescriptionData.expiryDate,
        );
      } else if (isEdit) {
        await notificationService.cancelPrescriptionReminder(id);
      }

      if (Platform.OS === 'web') {
        // If came from DoctorDetails (has initialDoctorName), return to Doctors
        // Otherwise return to Prescriptions
        if (initialDoctorName) {
          setActiveTab('Doctors');
        } else {
          setActiveTab('Prescriptions');
        }
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      Alert.alert(t('common.error'), t('prescriptions.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                {t('prescriptions.photoButton')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>
          {t('prescriptions.medicationNameLabel')} *
        </Text>

        {/* Medication Selection List */}
        <View style={styles.medicationListContainer}>
          {allMedications.map(med => {
            const isSelected = med.id ? selectedMedicationIds.includes(med.id) : false;
            return (
              <TouchableOpacity
                key={med.id}
                style={[
                  styles.medicationItem,
                  isSelected && styles.medicationItemSelected,
                ]}
                onPress={() => med.id && toggleMedicationSelection(med.id)}
              >
                <Text
                  style={[
                    styles.medicationItemText,
                    isSelected && styles.medicationItemTextSelected,
                  ]}
                >
                  {med.name} {med.dosage ? `(${med.dosage})` : ''}
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
          {allMedications.length === 0 && (
            <Text style={styles.noMedicationsText}>{t('medications.empty')}</Text>
          )}
        </View>

        <Text style={styles.orLabel}>- {t('common.or')} -</Text>

        <TextInput
          style={[styles.input, errors.medicationName && styles.inputError]}
          value={medicationName}
          onChangeText={text => {
            setMedicationName(text);
            if (errors.medicationName)
              setErrors({ ...errors, medicationName: '' });
          }}
          placeholder={t('prescriptions.medicationPlaceholder')} // "Or type manually..."
          placeholderTextColor={theme.colors.subText}
        />
        {errors.medicationName && (
          <Text style={styles.errorText}>{errors.medicationName}</Text>
        )}

        <Text style={styles.label}>{t('prescriptions.doctorNameLabel')}</Text>
        <TextInput
          style={styles.input}
          value={doctorName}
          onChangeText={setDoctorName}
          placeholder={t('prescriptions.doctorPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        {/* Issue Date */}
        <DateTimePickerField
          label={t('prescriptions.issueDateLabel')}
          value={issueDate}
          onChange={setIssueDate}
          mode="date"
          required
          error={errors.issueDate}
        />

        {/* Expiry Date */}
        <DateTimePickerField
          label={t('prescriptions.expiryDateLabel')}
          value={expiryDate}
          onChange={setExpiryDate}
          mode="date"
          minimumDate={issueDate || new Date()}
          error={errors.expiryDate}
        />

        <Text style={styles.label}>{t('prescriptions.notesLabel')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('appointments.notesPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {isEdit
              ? t('prescriptions.updateButton')
              : t('prescriptions.saveButton')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m },
    photoButton: { alignItems: 'center', marginBottom: theme.spacing.l },
    photo: { width: 200, height: 200, borderRadius: theme.spacing.m },
    photoPlaceholder: {
      width: 200,
      height: 200,
      borderRadius: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    photoPlaceholderText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
    },
    label: {
      ...theme.textVariants.body,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      marginTop: theme.spacing.m,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.text,
    },
    notesInput: { minHeight: 100, textAlignVertical: 'top' },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.small,
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    inputError: { borderColor: theme.colors.error },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    medicationListContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.s,
      borderWidth: 1,
      borderColor: theme.colors.border,
      maxHeight: 200, // Scrollable if needed, but wrapper is ScrollView
      overflow: 'hidden',
    },
    medicationItem: {
      padding: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    medicationItemSelected: {
      backgroundColor: theme.colors.primaryBackground,
    },
    medicationItemText: {
      ...theme.textVariants.body,
      color: theme.colors.text,
    },
    medicationItemTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    checkmark: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    noMedicationsText: {
      padding: theme.spacing.m,
      textAlign: 'center',
      color: theme.colors.subText,
      fontStyle: 'italic',
    },
    orLabel: {
      textAlign: 'center',
      marginVertical: theme.spacing.m,
      color: theme.colors.subText,
      fontWeight: '600',
    },
  });
