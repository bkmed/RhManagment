import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { addDevice, updateDevice } from '../../store/slices/devicesSlice';
import { selectAllDeviceTypes } from '../../store/slices/deviceTypesSlice';
import { useAuth } from '../../context/AuthContext';
import { Theme } from '../../theme';
import { Dropdown } from '../../components/Dropdown';
import { Device } from '../../database/schema';
import { notificationService } from '../../services/notificationService';

export const AddDeviceScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showModal } = useModal();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const editingDevice = route.params?.device as Device | undefined;
  const deviceTypes = useSelector(selectAllDeviceTypes);

  const [form, setForm] = useState({
    name: editingDevice?.name || '',
    type: editingDevice?.type || '',
    serialNumber: editingDevice?.serialNumber || '',
    condition: editingDevice?.condition || ('working' as Device['condition']),
  });

  const handleSave = () => {
    if (!form.name || !form.type || !form.serialNumber) {
      showModal({
        title: t('common.error'),
        message: t('common.fillRequired'),
      });
      return;
    }

    const deviceData: Device = {
      ...(editingDevice || {}),
      id: editingDevice?.id || Date.now().toString(),
      name: form.name,
      type: form.type,
      serialNumber: form.serialNumber,
      condition: form.condition,
      status: editingDevice?.status || 'assigned',
      assignedTo: editingDevice?.assignedTo || user?.name || '',
      assignedToId: editingDevice?.assignedToId || user?.employeeId || '',
      createdAt: editingDevice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingDevice) {
      dispatch(updateDevice(deviceData));
      notificationService.showToast(t('devices.updateSuccess'), 'success');
    } else {
      dispatch(addDevice(deviceData));
      notificationService.showToast(t('devices.saveSuccess'), 'success');
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.label}>{t('devices.deviceName')} *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={text => setForm({ ...form, name: text })}
            placeholder={t('devices.deviceName')}
            placeholderTextColor={theme.colors.subText}
          />

          <Dropdown
            label={t('devices.type')}
            data={deviceTypes.map(t => ({ label: t, value: t }))}
            value={form.type}
            onSelect={val => setForm({ ...form, type: val })}
            placeholder={t('devices.type')}
          />

          <Text style={styles.label}>{t('devices.serialNumber')} *</Text>
          <TextInput
            style={styles.input}
            value={form.serialNumber}
            onChangeText={text => setForm({ ...form, serialNumber: text })}
            placeholder={t('devices.serialNumber')}
            placeholderTextColor={theme.colors.subText}
          />

          <Dropdown
            label={t('devices.condition')}
            data={[
              { label: t('devices.working'), value: 'working' },
              { label: t('devices.faulty'), value: 'faulty' },
            ]}
            value={form.condition}
            onSelect={val => setForm({ ...form, condition: val as any })}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.m,
    },
    formCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      ...theme.shadows.small,
    },
    label: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
      fontWeight: '600',
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      marginBottom: theme.spacing.l,
      color: theme.colors.text,
      fontSize: 16,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      height: 55,
      borderRadius: theme.spacing.m,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      ...theme.shadows.small,
    },
    saveButtonText: {
      color: theme.colors.surface,
      fontSize: 18,
      fontWeight: '700',
    },
  });
