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
import { departmentsDb } from '../../database/departmentsDb';
import { Department } from '../../database/schema';
import { Theme } from '../../theme';

export const ManageDepartmentsScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    const all = await departmentsDb.getAll();
    setDepartments(all);
  };

  const handleAdd = async () => {
    if (!newDepartmentName.trim()) return;
    await departmentsDb.add(newDepartmentName.trim());
    setNewDepartmentName('');
    loadDepartments();
  };

  const handleUpdate = async () => {
    if (!editingId || !editingName.trim()) return;
    await departmentsDb.update(editingId, editingName.trim());
    setEditingId(null);
    setEditingName('');
    loadDepartments();
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
              await departmentsDb.delete(id);
              loadDepartments();
              showToast(t('common.success'), 'success');
            } catch (error) {
              showToast(t('common.error'), 'error');
              console.error(error);
            }
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newDepartmentName}
          onChangeText={setNewDepartmentName}
          placeholder={
            t('common.add') + ' ' + (t('common.department') || 'Department')
          }
          placeholderTextColor={theme.colors.subText}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {departments.map(dept => (
          <View key={dept.id} style={styles.item}>
            {editingId === dept.id ? (
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
                <Text style={styles.name}>{dept.name}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(dept.id);
                      setEditingName(dept.name);
                    }}
                  >
                    <Text style={styles.editText}>{t('common.edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(dept.id)}>
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
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
    },
    inputContainer: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.l,
    },
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
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    name: { fontSize: 16, color: theme.colors.text },
    actions: { flexDirection: 'row', gap: 16 },
    editText: { color: theme.colors.primary },
    deleteText: { color: theme.colors.error },
    saveText: { color: theme.colors.success, fontWeight: 'bold' },
    cancelText: { color: theme.colors.subText },
  });
