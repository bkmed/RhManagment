import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

interface Device {
    id: string;
    name: string;
    type: string;
    serialNumber: string;
    status: 'available' | 'assigned' | 'maintenance';
    assignedTo?: string;
}

const MOCK_DEVICES: Device[] = [
    { id: '1', name: 'MacBook Pro 14"', type: 'Laptop', serialNumber: 'MBP14-2024-001', status: 'assigned', assignedTo: 'John Smith' },
    { id: '2', name: 'iPhone 15 Pro', type: 'Mobile', serialNumber: 'IP15P-2024-042', status: 'available' },
    { id: '3', name: 'iPad Air', type: 'Tablet', serialNumber: 'IPA-2023-015', status: 'maintenance' },
];

export const ManageDevicesScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDevices = useMemo(() => {
        return MOCK_DEVICES.filter(device =>
            device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (device.assignedTo && device.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery]);

    const getStatusColor = (status: Device['status']) => {
        switch (status) {
            case 'available': return theme.colors.success;
            case 'assigned': return theme.colors.primary;
            case 'maintenance': return theme.colors.warning;
            default: return theme.colors.subText;
        }
    };

    const renderDevice = ({ item }: { item: Device }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
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
                    <Text style={styles.assignedToLabel}>{t('devices.assignedTo')}:</Text>
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
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('devices.empty')}</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => { }}>
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
        },
        fabText: {
            fontSize: 32,
            color: theme.colors.surface,
            fontWeight: '300',
        },
    });
