import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';
import { Dropdown } from '../../components/Dropdown';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllDevices,
  addDevice,
  updateDevice,
  deleteDevice,
} from '../../store/slices/devicesSlice';
import { selectAllEmployees } from '../../store/slices/employeesSlice';
import {
  selectAllDeviceTypes,
  addDeviceType,
  deleteDeviceType,
} from '../../store/slices/deviceTypesSlice';
import { Device } from '../../database/schema';

export const ManageDevicesScreen = () => {
  const { theme } = useTheme();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const initialFormState = {
    id: undefined as string | undefined,
    name: '',
    type: '',
    serialNumber: '',
    status: 'available' as Device['status'],
    condition: 'working' as Device['condition'],
    assignedToId: undefined as string | undefined,
    assignedTo: undefined as string | undefined,
  };

  const [deviceForm, setDeviceForm] = useState(initialFormState);

  const devices = useSelector(selectAllDevices);
  const employees = useSelector(selectAllEmployees);
  const deviceTypes = useSelector(selectAllDeviceTypes);

  const [newType, setNewType] = useState('');
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);

  const filteredDevices = useMemo(() => {
    return devices.filter(
      (d: Device) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.assignedTo &&
          d.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [searchQuery, devices]);

  const handleSaveDevice = () => {
    if (!deviceForm.name || !deviceForm.serialNumber || !deviceForm.type) {
      showModal({
        title: t('common.error'),
        message: t('common.fillRequired'),
      });
      return;
    }

    const deviceData: Device = {
      id: deviceForm.id || Date.now().toString(),
      name: deviceForm.name,
      type: deviceForm.type,
      serialNumber: deviceForm.serialNumber,
      status: deviceForm.status,
      condition: deviceForm.condition,
      assignedToId: deviceForm.assignedToId,
      assignedTo: deviceForm.assignedTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (deviceForm.id) {
      dispatch(updateDevice(deviceData));
    } else {
      dispatch(addDevice(deviceData));
    }

    setIsModalVisible(false);
    setDeviceForm(initialFormState);
  };

  const handleEditDevice = (device: Device) => {
    setDeviceForm({
      id: device.id,
      name: device.name,
      type: device.type,
      serialNumber: device.serialNumber,
      status: device.status,
      condition: device.condition,
      assignedToId: device.assignedToId,
      assignedTo: device.assignedTo,
    });
    setIsModalVisible(true);
  };

  const handleDeleteDevice = (id: string) => {
    showModal({
      title: t('common.deleteTitle'),
      message: t('common.deleteMessage'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => dispatch(deleteDevice(id)),
        },
      ],
    });
  };

  const getStatusColor = (status: Device['status']) => {
    switch (status) {
      case 'available':
        return theme.colors.success;
      case 'assigned':
        return theme.colors.primary;
      case 'maintenance':
        return theme.colors.warning;
      default:
        return theme.colors.subText;
    }
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceType}>
            {item.type} • {item.serialNumber}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditDevice(item)}
          >
            <Text style={[styles.actionIcon, { color: theme.colors.primary }]}>
              ✎
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => item.id && handleDeleteDevice(item.id)}
          >
            <Text style={[styles.actionIcon, { color: theme.colors.error }]}>
              🗑
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '15' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {t(`common.${item.status}`) || item.status}
          </Text>
        </View>
        <View
          style={[
            styles.conditionBadge,
            {
              backgroundColor:
                item.condition === 'faulty'
                  ? theme.colors.error + '15'
                  : theme.colors.success + '15',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  item.condition === 'faulty'
                    ? theme.colors.error
                    : theme.colors.success,
              },
            ]}
          >
            {item.condition === 'faulty'
              ? `🚨 ${t('devices.faulty')}`
              : `✅ ${t('devices.working')}`}
          </Text>
        </View>
      </View>

      {item.assignedTo && (
        <View style={styles.assignmentInfo}>
          <Text style={styles.assignedToLabel}>{t('employees.assigned')}:</Text>
          <Text style={styles.assignedToValue}>{item.assignedTo}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
        />
      </View>

      <FlatList
        data={filteredDevices}
        renderItem={renderDevice}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('common.noData')}</Text>
          </View>
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setDeviceForm(initialFormState);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {deviceForm.id ? t('common.edit') : t('common.add')}{' '}
              {t('navigation.manageDevices')}
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
              placeholder={t('devices.deviceName')}
              placeholderTextColor={theme.colors.subText}
              value={deviceForm.name}
              onChangeText={text =>
                setDeviceForm({ ...deviceForm, name: text })
              }
            />

            <Dropdown
              label={t('devices.assigned')}
              data={[
                { label: t('devices.unassigned'), value: '' },
                ...employees.map(e => ({ label: e.name, value: e.id || '' })),
              ]}
              value={
                deviceForm.assignedToId ? String(deviceForm.assignedToId) : ''
              }
              onSelect={val => {
                const emp = employees.find(e => e.id === val);
                if (emp) {
                  setDeviceForm({
                    ...deviceForm,
                    status: 'assigned',
                    assignedToId: emp.id,
                    assignedTo: emp.name,
                  });
                } else {
                  setDeviceForm({
                    ...deviceForm,
                    status: 'available',
                    assignedToId: undefined,
                    assignedTo: undefined,
                  });
                }
              }}
              placeholder={t('devices.assignTo')}
            />

            <Dropdown
              label={t('devices.condition')}
              data={[
                { label: t('devices.working'), value: 'working' },
                { label: t('devices.faulty'), value: 'faulty' },
              ]}
              value={deviceForm.condition}
              onSelect={val =>
                setDeviceForm({ ...deviceForm, condition: val as any })
              }
            />

            <View style={{ marginBottom: theme.spacing.m }}>
              <Dropdown
                label={t('devices.type')}
                data={deviceTypes.map(t => ({ label: t, value: t }))}
                value={deviceForm.type}
                onSelect={val => setDeviceForm({ ...deviceForm, type: val })}
                placeholder={t('devices.type')}
              />

              <TouchableOpacity
                style={styles.addTypeButton}
                onPress={() => setIsTypeModalVisible(true)}
              >
                <Text style={styles.addTypeButtonText}>
                  + {t('devices.addType')}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
              placeholder={t('devices.serialNumber')}
              placeholderTextColor={theme.colors.subText}
              value={deviceForm.serialNumber}
              onChangeText={text =>
                setDeviceForm({ ...deviceForm, serialNumber: text })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.border },
                ]}
                onPress={() => {
                  setIsModalVisible(false);
                  setDeviceForm(initialFormState);
                }}
              >
                <Text style={{ color: theme.colors.text }}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleSaveDevice}
              >
                <Text style={{ color: theme.colors.surface }}>
                  {deviceForm.id ? t('common.save') : t('common.add')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isTypeModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('devices.manageTypes')}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: theme.colors.text, borderColor: theme.colors.border },
              ]}
              placeholder={t('devices.typePlaceholder')}
              value={newType}
              onChangeText={setNewType}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.border },
                ]}
                onPress={() => setIsTypeModalVisible(false)}
              >
                <Text style={{ color: theme.colors.text }}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => {
                  if (newType.trim()) {
                    dispatch(addDeviceType(newType.trim()));
                    setDeviceForm({ ...deviceForm, type: newType.trim() });
                    setNewType('');
                    setIsTypeModalVisible(false);
                  }
                }}
              >
                <Text style={{ color: theme.colors.surface }}>
                  {t('common.add')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.typeList}>
              <Text style={[styles.label, { marginTop: 20 }]}>
                {t('devices.existingTypes')}
              </Text>
              <View style={styles.typeTags}>
                {deviceTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.typeTag}
                    onLongPress={() => {
                      if (
                        [
                          'Laptop',
                          'Mouse',
                          'Keyboard',
                          'Screen',
                          'Other',
                        ].includes(type)
                      ) {
                        showModal({
                          title: t('common.error'),
                          message: t('devices.builtInTypeWarning'),
                        });
                        return;
                      }
                      showModal({
                        title: t('common.deleteTitle'),
                        message: `${t('common.delete')} "${type}"?`,
                        buttons: [
                          { text: t('common.cancel'), style: 'cancel' },
                          {
                            text: t('common.delete'),
                            style: 'destructive',
                            onPress: () => dispatch(deleteDeviceType(type)),
                          },
                        ],
                      });
                    }}
                  >
                    <Text style={styles.typeTagText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setDeviceForm(initialFormState);
          setIsModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    listContent: {
      padding: theme.spacing.m,
      paddingBottom: 80,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    actionIcon: {
      fontSize: 20,
    },
    deviceName: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      fontSize: 16,
    },
    deviceType: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginTop: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.m,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    conditionBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: 8,
    },
    assignmentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.s,
      paddingTop: theme.spacing.s,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    assignedToLabel: {
      fontSize: 12,
      color: theme.colors.subText,
      marginRight: 4,
    },
    assignedToValue: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    addTypeButton: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.s,
      marginTop: 4,
    },
    addTypeButtonText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    typeList: {
      marginTop: theme.spacing.m,
    },
    typeTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    typeTag: {
      backgroundColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    typeTagText: {
      fontSize: 12,
      color: theme.colors.text,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.subText,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
    },
    emptyText: {
      color: theme.colors.subText,
      fontSize: 16,
    },
    fab: {
      position: 'absolute',
      right: theme.spacing.l,
      bottom: theme.spacing.l,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.large,
      elevation: 5,
    },
    fabText: {
      fontSize: 32,
      color: theme.colors.surface,
      fontWeight: '300',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxWidth: 400,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      ...theme.shadows.large,
    },
    modalTitle: {
      ...theme.textVariants.header,
      fontSize: 20,
      marginBottom: theme.spacing.l,
      textAlign: 'center',
    },
    modalInput: {
      height: 50,
      borderWidth: 1,
      borderRadius: theme.spacing.s,
      paddingHorizontal: theme.spacing.m,
      marginBottom: theme.spacing.m,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.m,
    },
    modalButton: {
      flex: 1,
      height: 50,
      borderRadius: theme.spacing.s,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: theme.spacing.s,
    },
  });
