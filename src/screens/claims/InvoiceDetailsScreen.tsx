import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { invoicesDb } from '../../database/invoicesDb';
import { notificationService } from '../../services/notificationService';
import { Invoice } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { rbacService, Permission } from '../../services/rbacService';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const InvoiceDetailsScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const { invoiceId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { setActiveTab } = useContext(WebNavigationContext);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const data = await invoicesDb.getById(invoiceId);
      if (data) {
        // Access Control
        const isOwner = user?.employeeId && data.employeeId === user.employeeId;
        const isAdmin = user?.role === 'admin';
        const isRHInCompany =
          user?.role === 'rh' &&
          user?.companyId &&
          data.companyId === user.companyId;
        const isManagerInTeam =
          user?.role === 'manager' &&
          user?.teamId &&
          data.teamId === user.teamId;

        if (!isAdmin && !isOwner && !isRHInCompany && !isManagerInTeam) {
          showToast(t('common.accessDenied'), 'error');
          navigateBack();
          return;
        }
        setInvoice(data);
      } else {
        showToast(t('invoices.loadError'), 'error');
        navigateBack();
      }
    } catch (error) {
      showToast(t('invoices.loadError'), 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Invoices');
    } else {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Invoices', 'AddInvoice', { invoiceId });
    } else {
      navigation.navigate('AddInvoice', { invoiceId });
    }
  };

  const handleDelete = () => {
    showModal({
      title: t('invoices.deleteConfirmTitle'),
      message: t('invoices.deleteConfirm'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await invoicesDb.delete(invoiceId);
              showToast(t('invoices.deleteSuccess'), 'success');
              navigateBack();
            } catch (error) {
              showToast(t('invoices.deleteError'), 'error');
              console.error(error);
            }
          },
        },
      ],
    });
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!invoice) return;
    try {
      setLoading(true);
      const updates = {
        status,
        updatedAt: new Date().toISOString(),
      };
      await invoicesDb.update(invoiceId, updates);
      setInvoice({ ...invoice, ...updates });
      notificationService.showAlert(
        t('common.success'),
        t('invoices.updateSuccess'),
      );
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('invoices.saveError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !invoice) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Section */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.amountText}>
              {invoice.amount.toLocaleString()} {invoice.currency}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(invoice.status, theme) + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(invoice.status, theme) },
                ]}
              >
                {t(
                  `invoices.status${
                    invoice.status.charAt(0).toUpperCase() +
                    invoice.status.slice(1)
                  }`,
                )}
              </Text>
            </View>
          </View>
          <Text style={styles.date}>{formatDate(invoice.createdAt)}</Text>
        </View>

        {/* Requester Section */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('invoices.employeeName')}</Text>
          <Text style={styles.value}>
            {invoice.employeeName || t('common.unknown')}
          </Text>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('invoices.description')}</Text>
          <Text style={styles.value}>{invoice.description || '-'}</Text>
        </View>

        {/* Photo Section */}
        {invoice.photoUri && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('invoices.photoButton')}</Text>
            <Image
              source={{ uri: invoice.photoUri }}
              style={styles.photo}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Admin Actions */}
        {rbacService.hasPermission(user, Permission.APPROVE_CLAIMS) &&
          invoice.status === 'pending' && (
            <View style={styles.adminActions}>
              {invoice.employeeId === user?.employeeId ? (
                <Text style={styles.ownRequestText}>
                  {t('invoices.cannotApproveOwn')}
                </Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleUpdateStatus('approved')}
                  >
                    <Text style={styles.buttonText}>{t('common.approve')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleUpdateStatus('rejected')}
                  >
                    <Text style={styles.buttonText}>{t('common.reject')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

        {/* Edit/Delete Actions */}
        {(rbacService.hasPermission(user, Permission.EDIT_EMPLOYEES) ||
          invoice.employeeId === user?.employeeId) && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>{t('common.edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status: string, theme: Theme) => {
  switch (status) {
    case 'approved':
      return theme.colors.success;
    case 'rejected':
      return theme.colors.error;
    default:
      return theme.colors.warning;
  }
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
      paddingBottom: 40,
      maxWidth: 600,
      width: '100%',
      alignSelf: 'center',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    amountText: {
      ...theme.textVariants.header,
      color: theme.colors.primary,
      fontSize: 28,
      fontWeight: 'bold',
    },
    date: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      fontSize: 14,
      fontWeight: '500',
    },
    label: {
      ...theme.textVariants.caption,
      marginBottom: 6,
      color: theme.colors.subText,
      fontWeight: '700',
      textTransform: 'uppercase',
      fontSize: 11,
      letterSpacing: 0.5,
    },
    value: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      lineHeight: 24,
    },
    statusBadge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    adminActions: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginTop: theme.spacing.m,
    },
    button: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: 12,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    approveButton: {
      backgroundColor: theme.colors.success,
    },
    rejectButton: {
      backgroundColor: theme.colors.error,
    },
    buttonText: {
      ...theme.textVariants.button,
      color: '#FFF',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    photo: {
      width: '100%',
      height: 350,
      borderRadius: 16,
      marginTop: theme.spacing.m,
    },
    ownRequestText: {
      color: theme.colors.subText,
      fontStyle: 'italic',
      textAlign: 'center',
      flex: 1,
      marginTop: theme.spacing.m,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginTop: theme.spacing.m,
    },
    editButton: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    editButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.primary,
    },
    deleteButton: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    deleteButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.error,
    },
  });
