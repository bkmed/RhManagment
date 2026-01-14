import React, {
  useState,
  useCallback,
  useMemo,
  useContext,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
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

import { WebNavigationContext } from '../../navigation/WebNavigationContext';
import { useAuth } from '../../context/AuthContext';
import { Permission, rbacService } from '../../services/rbacService';

export const PayrollListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = useContext(WebNavigationContext);
  const [payrollItems, setPayrollItems] = useState<Payroll[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPayrollItems = async () => {
    try {
      let data = await payrollDb.getAll();

      // Role-based filtering (Strict isolation)
      if (user?.role === 'employee') {
        if (user?.employeeId) {
          data = data.filter(
            item => Number(item.employeeId) === Number(user.employeeId),
          );
        } else {
          data = []; // Deny by default if ID is missing
        }
      } else if (user?.role === 'manager' && user?.teamId) {
        // Manager sees their team's payroll
        data = data.filter(item => Number(item.teamId) === Number(user.teamId));
      } else if (user?.role === 'rh' && user?.companyId) {
        // HR sees their company's payroll
        data = data.filter(
          item => Number(item.companyId) === Number(user.companyId),
        );
      } else if (user?.role !== 'admin') {
        // Any other non-admin role with missing affiliations
        data = [];
      }
      // Admin sees everything

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

  // Web Refresh Logic
  const { activeTab, subScreen } = useContext(WebNavigationContext);
  useEffect(() => {
    if (activeTab === 'Payroll' && subScreen === '') {
      loadPayrollItems();
    }
  }, [activeTab, subScreen]);

  const filteredPayrollItems = useMemo(() => {
    if (!searchQuery) return payrollItems;
    const lowerQuery = searchQuery.toLowerCase();
    return payrollItems
      .filter(
        item =>
          (item.name || '').toLowerCase().includes(lowerQuery) ||
          (item.employeeName || '').toLowerCase().includes(lowerQuery) ||
          String(item.amount || '')
            .toLowerCase()
            .includes(lowerQuery),
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [payrollItems, searchQuery]);

  const handlePayrollPress = (payroll: Payroll) => {
    if (Platform.OS === 'web') {
      setActiveTab('Payroll', 'PayrollDetails', { payrollId: payroll.id });
    } else {
      navigation.navigate('PayrollDetails', { payrollId: payroll.id });
    }
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

      {rbacService.hasPermission(user, Permission.MANAGE_PAYROLL) && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (Platform.OS === 'web') {
              setActiveTab('Payroll', 'AddPayroll');
            } else {
              navigation.navigate('AddPayroll');
            }
          }}
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
