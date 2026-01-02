import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { servicesDb } from '../../database/servicesDb';
import { Service } from '../../database/schema';
import { Theme } from '../../theme';

export const ManageServicesScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { showModal } = useModal();
    const { showToast } = useToast();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [services, setServices] = useState<Service[]>([]);
    const [newServiceName, setNewServiceName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const all = await servicesDb.getAll();
        setServices(all);
    };

    const handleAdd = async () => {
        if (!newServiceName.trim()) return;
        await servicesDb.add(newServiceName.trim());
        setNewServiceName('');
        loadServices();
    };

    const handleUpdate = async () => {
        if (!editingId || !editingName.trim()) return;
        await servicesDb.update(editingId, editingName.trim());
        setEditingId(null);
        setEditingName('');
        loadServices();
    };

    const handleDelete = (id: number) => {
        showModal({
            title: t('common.confirm'),
            message: t('common.confirmDelete'),
            buttons: [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await servicesDb.delete(id);
                            loadServices();
                            showToast(t('common.success'), 'success');
                        } catch (error) {
                            showToast(t('common.error'), 'error');
                        }
                    }
                },
            ]
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newServiceName}
                    onChangeText={setNewServiceName}
                    placeholder={t('common.add') + ' ' + t('common.service')}
                    placeholderTextColor={theme.colors.subText}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addButtonText}>{t('common.add')}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.list}>
                {services.map(service => (
                    <View key={service.id} style={styles.item}>
                        {editingId === service.id ? (
                            <View style={styles.editRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                                    value={editingName}
                                    onChangeText={setEditingName}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={handleUpdate}>
                                    <Text style={styles.saveText}>{t('common.save')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingId(null)}>
                                    <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.row}>
                                <Text style={styles.name}>{service.name}</Text>
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => {
                                        setEditingId(service.id);
                                        setEditingName(service.name);
                                    }}>
                                        <Text style={styles.editText}>{t('common.edit')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(service.id)}>
                                        <Text style={styles.deleteText}>{t('common.delete')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: Theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.m },
        inputContainer: { flexDirection: 'row', gap: theme.spacing.s, marginBottom: theme.spacing.l },
        input: {
            flex: 1,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.s,
            padding: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
            color: theme.colors.text,
        },
        addButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.spacing.s,
            paddingHorizontal: theme.spacing.l,
            justifyContent: 'center',
        },
        addButtonText: { color: '#FFF', fontWeight: 'bold' },
        list: { flex: 1 },
        item: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.spacing.s,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.s,
            ...theme.shadows.small,
        },
        row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        editRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        name: { fontSize: 16, color: theme.colors.text },
        actions: { flexDirection: 'row', gap: 16 },
        editText: { color: theme.colors.primary },
        deleteText: { color: theme.colors.error },
        saveText: { color: theme.colors.success, fontWeight: 'bold' },
        cancelText: { color: theme.colors.subText },
    });
