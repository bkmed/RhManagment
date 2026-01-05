import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllDevices, addDevice, deleteDevice } from '../../store/slices/devicesSlice';
import { Device } from '../../database/schema';

export const ManageDevicesScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [deviceForm, setDeviceForm] = useState({
        name: '',
        type: '',
        serialNumber: '',
        status: 'available' as Device['status']
    });

    const devices = useSelector(selectAllDevices);

    const filteredDevices = useMemo(() => {
        return devices.filter(d =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.assignedTo && d.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, devices]);

    const handleAddDevice = () => {
        if (!deviceForm.name || !deviceForm.serialNumber) {
            Alert.alert(t('common.error'), t('common.fillRequired'));
            return;
        }

        const newDevice: Device = {
            id: Date.now(),
            name: deviceForm.name,
            type: deviceForm.type || 'Other',
            serialNumber: deviceForm.serialNumber,
            status: deviceForm.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        dispatch(addDevice(newDevice));
        setIsModalVisible(false);
        setDeviceForm({ name: '', type: '', serialNumber: '', status: 'available' });
    };

    const handleDeleteDevice = (id: number) => {
        Alert.alert(
            t('common.deleteTitle'),
            t('common.deleteMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => dispatch(deleteDevice(id))
                }
            ]
        );
    };

    const getStatusColor = (status: Device['status']) => {
        switch (status) {
            case 'available': return theme.colors.success;
            case 'assigned': return theme.colors.primary;
            case 'maintenance': return theme.colors.warning;
            default: return theme.colors.subText;
        }
    };

    const renderDevice = ({ item }: { item: Device }) => (
        <TouchableOpacity
            style={styles.card}
            onLongPress={() => item.id && handleDeleteDevice(item.id)}
        >
            <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <Text style={styles.deviceType}>{item.type} • {item.serialNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {t(`common.${item.status}`) || item.status}
                    </Text>
                </View>
            </View>
            {item.assignedTo && (
                <View style={styles.assignmentInfo}>
                    <Text style={styles.assignedToLabel}>{t('employees.assigned')}:</Text>
                    <Text style={styles.assignedToValue}>{item.assignedTo}</Text>
                </View>
            )}
        </TouchableOpacity>
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
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {t('navigation.manageDevices')}
                        </Text>

                        <TextInput
                            style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Device Name"
                            placeholderTextColor={theme.colors.subText}
                            value={deviceForm.name}
                            onChangeText={(text) => setDeviceForm({ ...deviceForm, name: text })}
                        />

                        <TextInput
                            style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Device Type (e.g. Laptop)"
                            placeholderTextColor={theme.colors.subText}
                            value={deviceForm.type}
                            onChangeText={(text) => setDeviceForm({ ...deviceForm, type: text })}
                        />

                        <TextInput
                            style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Serial Number"
                            placeholderTextColor={theme.colors.subText}
                            value={deviceForm.serialNumber}
                            onChangeText={(text) => setDeviceForm({ ...deviceForm, serialNumber: text })}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.border }]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={{ color: theme.colors.text }}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleAddDevice}
                            >
                                <Text style={{ color: theme.colors.surface }}>{t('common.add')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsModalVisible(true)}
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
