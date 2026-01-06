import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { employeesDb } from '../../database/employeesDb';
import { Employee } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';
import { notificationService } from '../../services/notificationService';

import { useAuth } from '../../context/AuthContext';

export const EmployeeListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    try {
      let data = await employeesDb.getAll();

      // Role-based filtering
      if (user?.role === 'chef_dequipe' && user?.department) {
        data = data.filter(emp => emp.department === user.department);
      } else if (user?.role === 'employee' && user?.employeeId) {
        data = data.filter(emp => emp.id === user.employeeId);
      }

      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      notificationService.showAlert(t('common.error'), t('employees.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, []),
  );

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const lowerQuery = searchQuery.toLowerCase();
    return employees.filter(emp => {
      const position = emp.position
        ? t(`departments.${emp.position}`, { defaultValue: emp.position })
        : '';
      return (
        emp.name.toLowerCase().includes(lowerQuery) ||
        position.toLowerCase().includes(lowerQuery)
      );
    });
  }, [employees, searchQuery, t]);

  const renderEmployee = ({ item }: { item: Employee }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('EmployeeDetails', { employeeId: item.id })
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.name}>
            {item.name}
          </Text>
          {item.position && (
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>
                {t(`departments.${item.position}`, {
                  defaultValue: item.position,
                })}
              </Text>
            </View>
          )}
        </View>

        {item.phone && <Text style={styles.detail}>📞 {item.phone}</Text>}

        {item.email && <Text style={styles.detail}>✉️ {item.email}</Text>}

        {item.address && <Text style={styles.detail}>📍 {item.address}</Text>}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('employees.empty')}</Text>
      <Text style={styles.emptySubText}>{t('employees.emptySubtitle')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
        />
      </View>
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployee}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      {(user?.role === 'admin' || user?.role === 'rh') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddEmployee')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: theme.spacing.m,
      flexGrow: 1,
      paddingBottom: 80, // Space for FAB
    },
    searchContainer: {
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    card: {
      backgroundColor: theme.colors.surface, // Use surface for card background
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    name: {
      ...theme.textVariants.subheader,
      flex: 1,
      color: theme.colors.text,
    },
    positionBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.spacing.l,
    },
    positionText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: '600',
    },
    detail: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: theme.spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      ...theme.textVariants.subheader,
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
    },
    emptySubText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    fab: {
      position: 'absolute' as any,
      right: theme.spacing.l,
      bottom: theme.spacing.l,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.large,
      zIndex: 999,
    } as any,
    fabText: {
      fontSize: 32,
      color: theme.colors.surface,
      fontWeight: '300',
      marginTop: -2,
    },
  });
