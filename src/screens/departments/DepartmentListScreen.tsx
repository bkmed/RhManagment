import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { departmentsDb } from '../../database/departmentsDb';
import { Department } from '../../database/schema';
import { Theme } from '../../theme';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const DepartmentListScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { showToast } = useToast();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = React.useContext(WebNavigationContext) as any;

  const companyId = route?.params?.companyId;

  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    loadDepartments();
  }, [companyId]);

  const loadDepartments = async () => {
    if (companyId) {
      const all = await departmentsDb.getByCompany(companyId);
      setDepartments(all);
    } else {
      const all = await departmentsDb.getAll();
      setDepartments(all);
    }
  };

  const handleBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab?.('CompanySettings', '');
    } else {
      navigation.goBack();
    }
  };

  const handleAdd = () => {
    if (Platform.OS === 'web') {
      setActiveTab?.('Departments', 'AddDepartment', { companyId });
    } else {
      navigation.navigate('AddDepartment', { companyId });
    }
  };

  const handleEdit = (id: string) => {
    if (Platform.OS === 'web') {
      setActiveTab?.('Departments', 'AddDepartment', {
        departmentId: id,
        companyId,
      });
    } else {
      navigation.navigate('AddDepartment', { departmentId: id, companyId });
    }
  };

  const handleDelete = (id: string) => {
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹ {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('departments.title')}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ {t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {departments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('departments.empty')}</Text>
          </View>
        ) : (
          departments.map(dept => (
            <View key={dept.id} style={styles.item}>
              <View style={styles.row}>
                <Text style={styles.name}>{dept.name}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(dept.id)}>
                    <Text style={styles.editText}>{t('common.edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(dept.id)}>
                    <Text style={styles.deleteText}>{t('common.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.l,
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      fontSize: 24,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.m,
    },
    backButton: {
      padding: theme.spacing.s,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: '600',
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.spacing.s,
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.s,
    },
    addButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
    list: { flex: 1 },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
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
    name: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      gap: 16,
    },
    editText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    deleteText: {
      color: theme.colors.error,
      fontSize: 14,
      fontWeight: '600',
    },
  });
