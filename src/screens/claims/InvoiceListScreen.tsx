import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { invoicesDb } from '../../database/invoicesDb';
import { employeesDb } from '../../database/employeesDb';
import { companiesDb } from '../../database/companiesDb';
import { teamsDb } from '../../database/teamsDb';
import { Invoice, Employee, Company, Team } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateUtils';
import { Dropdown } from '../../components/Dropdown';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const InvoiceListScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { setActiveTab } = useContext(WebNavigationContext);

  const navigateToDetails = (invoiceId: string) => {
    if (Platform.OS === 'web') {
      setActiveTab('Invoices', 'InvoiceDetails', { invoiceId });
    } else {
      navigation.navigate('InvoiceDetails', { invoiceId });
    }
  };

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'all' | 'mine'>('mine');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );

  const loadData = async () => {
    try {
      const [invoicesData, employeesData, companiesData, teamsData] =
        await Promise.all([
          invoicesDb.getAll(),
          employeesDb.getAll(),
          companiesDb.getAll(),
          teamsDb.getAll(),
        ]);

      setInvoices(invoicesData);
      setEmployees(employeesData);
      setCompanies(companiesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user]),
  );

  const filteredInvoices = useMemo(() => {
    if (activeView === 'mine') {
      return invoices.filter(i => i.employeeId === user?.employeeId);
    }

    if (user?.role === 'admin' || user?.role === 'rh') {
      let filtered = invoices;
      if (selectedCompanyId) {
        filtered = filtered.filter(i => {
          const emp = employees.find(e => e.id === i.employeeId);
          return emp?.companyId === selectedCompanyId;
        });
      }
      if (user.role === 'rh' && user.companyId) {
        filtered = filtered.filter(i => {
          const emp = employees.find(e => e.id === i.employeeId);
          return emp?.companyId === user.companyId;
        });
      }
      return filtered;
    }

    if (user?.role === 'manager') {
      // Find team members
      const teamEmployees = employees.filter(e => e.teamId === user?.teamId);
      const teamEmployeeIds = teamEmployees.map(e => e.id);
      return invoices.filter(i => teamEmployeeIds.includes(i.employeeId));
    }

    return invoices.filter(i => i.employeeId === user?.employeeId);
  }, [invoices, user, activeView, employees, selectedCompanyId]);

  const groupedData = useMemo(() => {
    if (
      activeView === 'mine' ||
      (user?.role !== 'admin' &&
        user?.role !== 'rh' &&
        user?.role !== 'manager')
    ) {
      return [
        { id: 'mine', name: t('invoices.myInvoices'), items: filteredInvoices },
      ];
    }

    if (user?.role === 'manager') {
      return [
        {
          id: 'team',
          name: t('invoices.teamInvoices'),
          items: filteredInvoices,
        },
      ];
    }

    const companiesMap = new Map<number | string, any>();

    filteredInvoices.forEach(invoice => {
      const employee = employees.find(e => e.id === invoice.employeeId);
      const companyId = employee?.companyId || 'other';
      const teamId = employee?.teamId || 'other';

      if (!companiesMap.has(companyId)) {
        const company = companies.find(c => c.id === companyId);
        companiesMap.set(companyId, {
          id: companyId,
          name: company?.name || t('companies.other'),
          teams: new Map(),
        });
      }

      const companyGroup = companiesMap.get(companyId);
      if (!companyGroup.teams.has(teamId)) {
        const team = teams.find(t => t.id === teamId);
        const manager = employees.find(e => e.id === team?.managerId);
        companyGroup.teams.set(teamId, {
          id: teamId,
          name: team?.name || t('common.noTeam'),
          managerName: manager?.name || 'N/A',
          items: [],
        });
      }

      companyGroup.teams.get(teamId).items.push(invoice);
    });

    return Array.from(companiesMap.values()).map(c => ({
      ...c,
      teams: Array.from(c.teams.values()),
    }));
  }, [filteredInvoices, user, activeView, employees, companies, teams, t]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const renderInvoice = (item: Invoice) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() => navigateToDetails(item.id!)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.amount}>
          {item.amount} {item.currency}
        </Text>
        <View
          style={[
            styles.statusTag,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {t(
              `invoices.status${
                item.status.charAt(0).toUpperCase() + item.status.slice(1)
              }`,
            )}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        {activeView === 'all' && user?.role !== 'employee' && (
          <Text style={styles.employeeName}>{item.employeeName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {(user?.role === 'admin' ||
        user?.role === 'rh' ||
        user?.role === 'manager') && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeView === 'mine' && styles.activeTab]}
            onPress={() => setActiveView('mine')}
          >
            <Text
              style={[
                styles.tabText,
                activeView === 'mine' && styles.activeTabText,
              ]}
            >
              {t('invoices.myInvoices')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeView === 'all' && styles.activeTab]}
            onPress={() => setActiveView('all')}
          >
            <Text
              style={[
                styles.tabText,
                activeView === 'all' && styles.activeTabText,
              ]}
            >
              {user?.role === 'manager'
                ? t('invoices.teamInvoices')
                : t('invoices.allInvoices')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeView === 'all' && user?.role === 'admin' && (
        <View
          style={{
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Dropdown
            label={t('companies.selectCompany')}
            data={[
              { label: t('common.all'), value: '' },
              ...companies.map(c => ({ label: c.name, value: String(c.id) })),
            ]}
            value={selectedCompanyId ? String(selectedCompanyId) : ''}
            onSelect={val => setSelectedCompanyId(val || null)}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {groupedData.length === 0 ||
          (groupedData[0].items && groupedData[0].items.length === 0) ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('invoices.empty')}</Text>
            </View>
          ) : (
            groupedData.map((companyGroup: any) => (
              <View key={companyGroup.id} style={styles.companySection}>
                {companyGroup.name !== t('invoices.myInvoices') &&
                  companyGroup.name !== t('invoices.teamInvoices') && (
                    <View style={styles.companyHeader}>
                      <Text style={styles.companyName}>
                        {companyGroup.name}
                      </Text>
                    </View>
                  )}

                {(companyGroup.teams || []).map((teamGroup: any) => (
                  <View key={teamGroup.id} style={styles.teamSection}>
                    {teamGroup.name &&
                      companyGroup.name !== t('invoices.myInvoices') && (
                        <View style={styles.teamHeader}>
                          <View style={styles.teamInfo}>
                            <Text style={styles.teamName}>
                              {teamGroup.name}
                            </Text>
                            <Text style={styles.teamManager}>
                              {t('common.manager')}: {teamGroup.managerName}
                            </Text>
                          </View>
                        </View>
                      )}
                    {teamGroup.items.map((invoice: Invoice) =>
                      renderInvoice(invoice),
                    )}
                  </View>
                ))}

                {companyGroup.items &&
                  companyGroup.items.map((invoice: Invoice) =>
                    renderInvoice(invoice),
                  )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddInvoice')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.colors.primary + '20',
    },
    tabText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      fontWeight: '600',
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    listContent: {
      padding: theme.spacing.m,
      maxWidth: 800,
      width: '100%',
      alignSelf: 'center',
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
    amount: {
      ...theme.textVariants.header,
      fontSize: 18,
      color: theme.colors.primary,
    },
    statusTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    description: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.m,
    },
    date: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    employeeName: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 40,
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    emptyText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    fabText: {
      fontSize: 32,
      color: theme.textVariants.button.color,
      marginTop: -2,
    },
    companySection: {
      marginBottom: theme.spacing.l,
    },
    companyHeader: {
      paddingVertical: theme.spacing.s,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
      marginBottom: theme.spacing.m,
    },
    companyName: {
      ...theme.textVariants.header,
      color: theme.colors.primary,
      fontSize: 18,
    },
    teamSection: {
      marginBottom: theme.spacing.m,
    },
    teamHeader: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.s,
      borderRadius: 8,
      marginBottom: theme.spacing.s,
    },
    teamInfo: {
      flex: 1,
    },
    teamName: {
      ...theme.textVariants.subheader,
      fontSize: 14,
    },
    teamManager: {
      ...theme.textVariants.caption,
      fontStyle: 'italic',
    },
  });
