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
import { doctorsDb } from '../../database/doctorsDb';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { Dropdown } from '../../components/Dropdown';
import { MEDICAL_SPECIALTIES } from '../../constants/specialties';
import { isValidEmail, isValidPhone } from '../../utils/validation';

export const AddDoctorScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const doctorId = route?.params?.doctorId;
  const isEdit = !!doctorId;

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
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
    : { setActiveTab: () => { } }; // fallback pour mobile

  const specialtyOptions = useMemo(() => {
    return MEDICAL_SPECIALTIES.map(key => ({
      label: t(`specialties.${key}`),
      value: key,
    }));
  }, [t]);

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Doctors');
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (isEdit) {
      loadDoctor();
    }
  }, [doctorId]);

  useEffect(() => {
    navigation?.setOptions({
      title: isEdit ? t('doctors.edit') : t('doctors.add'),
    });
  }, [isEdit, navigation, t]);

  const loadDoctor = async () => {
    if (!doctorId) return;
    try {
      const doctor = await doctorsDb.getById(doctorId);
      if (doctor) {
        setName(doctor.name || '');
        setSpecialty(doctor.specialty || '');
        setPhone(doctor.phone || '');
        setEmail(doctor.email || '');
        setAddress(doctor.address || '');
        setPhotoUri(doctor.photoUri || '');
        setNotes(doctor.notes || '');
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('doctors.loadError'));
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

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = t('common.required');
    if (email.trim() && !isValidEmail(email.trim()))
      newErrors.email = t('common.invalidEmail');
    if (phone.trim() && !isValidPhone(phone.trim()))
      newErrors.phone = t('common.invalidPhone');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const doctorData = {
        name: name.trim(),
        specialty: specialty || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        photoUri: photoUri || undefined,
        notes: notes || undefined,
      };

      if (isEdit && doctorId) {
        await doctorsDb.update(doctorId, doctorData);
      } else {
        await doctorsDb.add(doctorData);
      }

      navigateBack();
    } catch (error) {
      console.error('Error saving doctor:', error);
      Alert.alert(t('common.error'), t('doctors.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!doctorId) return;
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
              navigateBack();
            } catch (error) {
              Alert.alert(t('common.error'), t('doctors.deleteError'));
            }
          },
        },
      ],
    );
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

        <Text style={styles.label}>{t('doctors.name')} *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={text => {
            setName(text);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          placeholder={t('doctors.namePlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Dropdown
          label={t('doctors.specialty')}
          data={specialtyOptions}
          value={specialty}
          onSelect={setSpecialty}
          placeholder={t('doctors.specialtyPlaceholder')}
        />

        <Text style={styles.label}>{t('doctors.phone')}</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          value={phone}
          onChangeText={text => {
            setPhone(text);
            if (errors.phone) setErrors({ ...errors, phone: '' });
          }}
          placeholder={t('doctors.phonePlaceholder')}
          placeholderTextColor={theme.colors.subText}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>{t('doctors.email')}</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          placeholder={t('doctors.emailPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>{t('doctors.address')}</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder={t('doctors.addressPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={styles.label}>{t('doctors.notes')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('doctors.notesPlaceholder')}
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
            {isEdit ? t('doctors.updateButton') : t('doctors.saveButton')}
          </Text>
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>
              {t('doctors.deleteButton')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.m },
    photoButton: { alignItems: 'center', marginBottom: theme.spacing.l },
    photo: { width: 120, height: 120, borderRadius: 60 },
    photoPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
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
    notesInput: { minHeight: 100, textAlignVertical: 'top' },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
    },
    saveButtonDisabled: { opacity: 0.5 },
    saveButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.xl,
    },
    deleteButtonText: {
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
