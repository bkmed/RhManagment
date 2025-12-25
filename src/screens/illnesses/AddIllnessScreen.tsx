import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
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
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Auto-fill logic for employees
  useEffect(() => {
    if (!isEdit && user?.role === 'employee') {
      setEmployeeName(user.name);
      setDepartment(user.department || '');
      setPayrollName(user.name); // Default payroll name to employee name for simplicity if needed
    }
  }, [user, isEdit]);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? useContext(WebNavigationContext) as any
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
        setDepartment(illness.department || '');
        setLocation(illness.location || '');
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('illnesses.loadError'));
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const input = (window as any).document.createElement('input');
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
        employeeName: (user?.role === 'employee' ? user.name : employeeName).trim() || undefined,
        employeeId: user?.role === 'employee' ? user.employeeId : initialEmployeeId,
        issueDate: issueDate!.toISOString().split('T')[0],
        expiryDate: expiryDate ? expiryDate.toISOString().split('T')[0] : undefined,
        photoUri: photoUri || undefined,
        notes: notes.trim() || undefined,
        department,
        location,
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
      }

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
        <View style={styles.formContainer}>
          {/* Section: Medical Case */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.generalInfo') || t('navigation.personalInfo')}</Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
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
              </View>

              {user?.role !== 'employee' && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>{t('illnesses.employeeNameLabel')}</Text>
                  <TextInput
                    style={styles.input}
                    value={employeeName}
                    onChangeText={setEmployeeName}
                    placeholder={t('illnesses.employeePlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                  />
                </View>
              )}
            </View>

            {user?.role !== 'employee' && (
              <View style={styles.responsiveRow}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>{t('common.service')}</Text>
                  <TextInput
                    style={styles.input}
                    value={department}
                    onChangeText={setDepartment}
                    placeholder={t('common.service')}
                    placeholderTextColor={theme.colors.subText}
                  />
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>{t('common.local')}</Text>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder={t('common.local')}
                    placeholderTextColor={theme.colors.subText}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Section: Period */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.freqWeekly') || t('leaves.time')}</Text>

            <View style={styles.responsiveRow}>
              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('illnesses.issueDateLabel')}
                  value={issueDate}
                  onChange={setIssueDate}
                  mode="date"
                  required
                  error={errors.issueDate}
                />
              </View>

              <View style={styles.fieldContainer}>
                <DateTimePickerField
                  label={t('illnesses.expiryDateLabel')}
                  value={expiryDate}
                  onChange={setExpiryDate}
                  mode="date"
                  minimumDate={issueDate || new Date()}
                />
              </View>
            </View>
          </View>

          {/* Section: Documentation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('payroll.notes')}</Text>

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
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? t('common.loading') : isEdit ? t('illnesses.updateButton') : t('illnesses.saveButton')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m, paddingBottom: theme.spacing.xl },
    formContainer: {
      flex: 1,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      ...theme.shadows.small,
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.primary,
      marginBottom: theme.spacing.l,
      fontSize: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.s,
    },
    responsiveRow: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: theme.spacing.m,
    },
    fieldContainer: {
      flex: 1,
      marginBottom: Platform.OS === 'web' ? 0 : theme.spacing.m,
    },
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
      padding: 4,
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
    notesInput: { height: 100, textAlignVertical: 'top' },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
      maxWidth: Platform.OS === 'web' ? 800 : undefined,
      width: '100%',
      alignSelf: 'center',
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
