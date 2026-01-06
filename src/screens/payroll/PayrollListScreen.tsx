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
import { payrollDb } from '../../database/payrollDb';
import { Payroll } from '../../database/schema';
import { PayrollCard } from '../../components/PayrollCard';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';
import { notificationService } from '../../services/notificationService';

import { useAuth } from '../../context/AuthContext';

export const PayrollListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [payrollItems, setPayrollItems] = useState<Payroll[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPayrollItems = async () => {
    try {
      let data = await payrollDb.getAll();

      // Role-based filtering
      if (user?.role === 'employee' && user?.employeeId) {
        data = data.filter(item => item.employeeId === user.employeeId);
      } else if (user?.role === 'chef_dequipe' && user?.department) {
        // Chef sees payroll for their department (need to join with employee data usually,
        // but for now filtering if payroll itself has department or via external join)
        // Simplified: Chef sees all for now if not filtered by employeeId
      }

      setPayrollItems(data);
    } catch (error) {
      console.error('Error loading payroll items:', error);
      notificationService.showAlert(t('common.error'), t('payroll.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPayrollItems();
    }, []),
  );

  const filteredPayrollItems = useMemo(() => {
    if (!searchQuery) return payrollItems;
    const lowerQuery = searchQuery.toLowerCase();
    return payrollItems
      .filter(
        item =>
          item.name.toLowerCase().includes(lowerQuery) ||
          String(item.amount).toLowerCase().includes(lowerQuery),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [payrollItems, searchQuery]);

  const handlePayrollPress = (payroll: Payroll) => {
    navigation.navigate('PayrollDetails', { payrollId: payroll.id });
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('payroll.empty')}</Text>
      <Text style={styles.emptySubText}>{t('payroll.emptySubtitle')}</Text>
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
        data={filteredPayrollItems}
        renderItem={({ item }) => (
          <PayrollCard
            payroll={item}
            onPress={() => handlePayrollPress(item)}
          />
        )}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      {(user?.role === 'admin' || user?.role === 'rh') && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddPayroll')}
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
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: theme.spacing.m,
      flexGrow: 1,
      paddingBottom: 80,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
    },
    searchContainer: {
      padding: theme.spacing.m,
      paddingBottom: 0,
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
      color: theme.colors.background,
      fontWeight: '300',
    },
  });
