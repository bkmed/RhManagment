import React, { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useModal } from '../../context/ModalContext';
import { Theme } from '../../theme';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllDevices,
  updateDeviceStatus,
} from '../../store/slices/devicesSlice';
import { useAuth } from '../../context/AuthContext';
import { Device } from '../../database/schema';

export const MyDevicesScreen = () => {
  const { theme } = useTheme();
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const devices = useSelector(selectAllDevices);
  const myDevices = useMemo(
    () => devices.filter((d: Device) => d.assignedToId === user?.employeeId),
    [devices, user?.employeeId],
  );

  const handleReportStatus = (
    id: string,
    currentCondition: 'working' | 'faulty',
  ) => {
    const newCondition = currentCondition === 'working' ? 'faulty' : 'working';
    showModal({
      title: t('common.confirm'),
      message: t('devices.confirmReport', {
        condition: t(`devices.${newCondition}`),
      }),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.yes'),
          onPress: () =>
            dispatch(updateDeviceStatus({ id, condition: newCondition })),
        },
      ],
    });
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceType}>
            {item.type} • S/N: {item.serialNumber}
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

      <TouchableOpacity
        style={[
          styles.reportButton,
          {
            backgroundColor:
              item.condition === 'working'
                ? theme.colors.error
                : theme.colors.success,
          },
        ]}
        onPress={() => item.id && handleReportStatus(item.id, item.condition)}
      >
        <Text style={styles.reportButtonText}>
          {item.condition === 'working'
            ? t('devices.reportFaulty')
            : t('devices.reportWorking')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={myDevices}
        renderItem={renderDevice}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('devices.myMaterial')}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('common.noData')}</Text>
            <Text style={styles.emptySubText}>
              {t('devices.noMaterialAssigned')}
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDevice')}
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
    listContent: {
      padding: theme.spacing.m,
    },
    headerTitle: {
      ...theme.textVariants.header,
      color: theme.colors.text,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.l,
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
      marginBottom: theme.spacing.m,
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
    conditionBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    reportButton: {
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.s,
    },
    reportButtonText: {
      color: theme.colors.surface,
      fontWeight: '600',
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
    },
    emptyText: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    emptySubText: {
      color: theme.colors.subText,
      fontSize: 14,
      marginTop: 8,
      textAlign: 'center',
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
  });
