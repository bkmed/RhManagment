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
  Switch,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { illnessesDb } from '../../database/illnessesDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { DateTimePickerField } from '../../components/DateTimePickerField';

export const AddIllnessScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const illnessId = route?.params?.illnessId;
  const isEdit = !!illnessId;
  const initialEmployeeName = route?.params?.employeeName || '';
  const initialEmployeeId = route?.params?.employeeId;

  const [payrollName, setPayrollName] = useState('');
  const [employeeName, setEmployeeName] = useState(initialEmployeeName);
  const [issueDate, setIssueDate] = useState<Date | null>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [photoUri, setPhotoUri] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext)
    : { setActiveTab: () => { } };

  useEffect(() => {
    navigation?.setOptions({
      title: isEdit ? t('illnesses.edit') : t('illnesses.add'),
    });
    if (isEdit) loadIllness();
  }, [illnessId]);

  const loadIllness = async () => {
    if (!illnessId) return;
    try {
      const illness = await illnessesDb.getById(illnessId);
      if (illness) {
        setPayrollName(illness.payrollName || '');
        setEmployeeName(illness.employeeName || '');
        setIssueDate(illness.issueDate ? new Date(illness.issueDate) : new Date());
        setExpiryDate(illness.expiryDate ? new Date(illness.expiryDate) : null);
        setPhotoUri(illness.photoUri || '');
        setNotes(illness.notes || '');
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('illnesses.loadError'));
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

    Alert.alert(t('illnesses.addPhoto'), t('illnesses.chooseOption'), [
      {
        text: t('illnesses.takePhoto'),
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets && response.assets[0]?.uri) {
              setPhotoUri(response.assets[0].uri);
            }
          });
        },
      },
      {
        text: t('illnesses.chooseFromLibrary'),
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

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!payrollName.trim()) newErrors.payrollName = t('common.required');
    if (!issueDate) newErrors.issueDate = t('common.required');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const illnessData = {
        payrollName: payrollName.trim(),
        employeeName: employeeName.trim() || undefined,
        employeeId: initialEmployeeId,
        issueDate: issueDate!.toISOString().split('T')[0],
        expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : undefined,
        photoUri: photoUri || undefined,
        notes: notes.trim() || undefined,
      };

      let id: number;
      if (isEdit && illnessId) {
        await illnessesDb.update(illnessId, illnessData);
        id = illnessId;
      } else {
        id = await illnessesDb.add(illnessData);
      }

      if (expiryDate) {
        await notificationService.scheduleIllnessExpiryReminder(
          id,
          payrollName,
          expiryDate.toISOString(),
        );
      } else {
        await notificationService.cancelIllnessReminder(id);
      }

      // If came from EmployeeDetails (has initialEmployeeName), return to Employees
      // Otherwise return to Illnesses
      if (Platform.OS === 'web') {
        if (initialEmployeeName) {
          setActiveTab('Employees');
        } else {
          setActiveTab('Illnesses');
        }
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving illness:', error);
      Alert.alert(t('common.error'), t('illnesses.saveError'));
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
                {t('illnesses.photoButton')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>{t('illnesses.payrollNameLabel')} *</Text>
        <TextInput
          style={[styles.input, errors.payrollName && styles.inputError]}
          value={payrollName}
          onChangeText={text => {
            setPayrollName(text);
            if (errors.payrollName) setErrors({ ...errors, payrollName: '' });
          }}
          placeholder={t('illnesses.payrollPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.payrollName && (
          <Text style={styles.errorText}>{errors.payrollName}</Text>
        )}

        <Text style={styles.label}>{t('illnesses.employeeNameLabel')}</Text>
        <TextInput
          style={styles.input}
          value={employeeName}
          onChangeText={setEmployeeName}
          placeholder={t('illnesses.employeePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        <DateTimePickerField
          label={t('illnesses.issueDateLabel')}
          value={issueDate}
          onChange={setIssueDate}
          mode="date"
          required
          error={errors.issueDate}
        />

        <DateTimePickerField
          label={t('illnesses.expiryDateLabel')}
          value={expiryDate}
          onChange={setExpiryDate}
          mode="date"
          minimumDate={issueDate || new Date()}
        />

        <Text style={styles.label}>{t('illnesses.notesLabel')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('illnesses.notesLabel')}
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
            {isEdit ? t('illnesses.updateButton') : t('illnesses.saveButton')}
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
    photo: { width: 150, height: 100, borderRadius: theme.spacing.s },
    photoPlaceholder: {
      width: 150,
      height: 100,
      borderRadius: theme.spacing.s,
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
      textAlign: 'center',
      fontSize: 12,
    },
    label: {
      ...theme.textVariants.caption,
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
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    notesInput: { minHeight: 100, textAlignVertical: 'top' },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.xl,
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
  });
