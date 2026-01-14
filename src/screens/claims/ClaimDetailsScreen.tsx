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
import { claimsDb } from '../../database/claimsDb';
import { companiesDb } from '../../database/companiesDb';
import { teamsDb } from '../../database/teamsDb';
import { notificationService } from '../../services/notificationService';
import { Claim } from '../../database/schema';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDateTime } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../context/ModalContext';
import { rbacService, Permission } from '../../services/rbacService';
import { WebNavigationContext } from '../../navigation/WebNavigationContext';

export const ClaimDetailsScreen = ({ route, navigation }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useModal();
  const { claimId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { setActiveTab } = useContext(WebNavigationContext);

  useEffect(() => {
    loadClaim();
  }, [claimId]);

  const loadClaim = async () => {
    try {
      const data = await claimsDb.getById(claimId);
      if (data) {
        // Access Control
        const isOwner =
          user?.employeeId &&
          Number(data.employeeId) === Number(user.employeeId);
        const isAdmin = user?.role === 'admin';
        const isRHInCompany =
          user?.role === 'rh' &&
          user?.companyId &&
          Number(data.companyId) === Number(user.companyId);
        const isManagerInTeam =
          user?.role === 'manager' &&
          user?.teamId &&
          Number(data.teamId) === Number(user.teamId);

        if (!isAdmin && !isOwner && !isRHInCompany && !isManagerInTeam) {
          showToast(t('common.accessDenied'), 'error');
          return;
        }
        setClaim(data);

        // Fetch additional names
        if (data.companyId) {
          const comp = await companiesDb.getById(data.companyId);
          if (comp) setCompanyName(comp.name);
        }
        if (data.teamId) {
          const team = await teamsDb.getById(data.teamId);
          if (team) setTeamName(team.name);
        }
      }
    } catch (error) {
      showToast(t('claims.loadError'), 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigateBack = () => {
    if (Platform.OS === 'web') {
      setActiveTab('Claims');
    } else {
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    showModal({
      title: t('claims.deleteConfirmTitle') || t('common.delete'),
      message: t('claims.deleteConfirmMessage') || t('common.confirmDelete'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => handleConfirmDelete(),
        },
      ],
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await claimsDb.delete(claimId);
      showToast(t('claims.deleteSuccess') || t('common.success'), 'success');
      navigateBack();
    } catch (error) {
      showToast(t('claims.deleteError') || t('common.error'), 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'processed' | 'rejected') => {
    if (!claim) return;
    try {
      setLoading(true);
      const updates = {
        status,
        processedByName: user?.name || user?.role?.toUpperCase(),
        updatedAt: new Date().toISOString(),
      };
      await claimsDb.update(claimId, updates);
      setClaim({ ...claim, ...updates });
      notificationService.showAlert(
        t('common.success'),
        t('claims.statusUpdated'),
      );
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('claims.updateError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !claim) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <View style={styles.typeTag}>
              <Text style={styles.typeText}>
                {t(
                  `claims.type${claim.type.charAt(0).toUpperCase() + claim.type.slice(1)
                  }`,
                )}
              </Text>
            </View>
            {claim.isUrgent && (
              <View style={styles.urgentTag}>
                <Text style={styles.urgentText}>
                  {t('common.urgent').toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.date}>{formatDateTime(claim.createdAt)}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(claim.status, theme) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(claim.status, theme) },
              ]}
            >
              {t(
                `claims.status${claim.status.charAt(0).toUpperCase() + claim.status.slice(1)
                }`,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('claims.requester') || 'Requester'}
          </Text>
          <Text style={styles.value}>
            {claim.employeeName || t('common.unknown')}
          </Text>
        </View>

        {companyName ? (
          <View style={styles.section}>
            <Text style={styles.label}>{t('common.company')}</Text>
            <Text style={styles.value}>{companyName}</Text>
          </View>
        ) : null}

        {teamName ? (
          <View style={styles.section}>
            <Text style={styles.label}>{t('common.team')}</Text>
            <Text style={styles.value}>{teamName}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>{t('claims.description')}</Text>
          <Text style={styles.value}>{claim.description}</Text>
        </View>

        {claim.status !== 'pending' && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('claims.handler') || 'Processed By'}
            </Text>
            <Text style={styles.value}>
              {claim.processedByName || t('common.unknown')}
            </Text>
          </View>
        )}

        {claim.photoUri && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('illnesses.photoButton')}</Text>
            <TouchableOpacity
              onPress={() => {
                // Potentially add full screen view later
              }}
            >
              <Image
                source={{ uri: claim.photoUri }}
                style={styles.photo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}

        {rbacService.hasPermission(user, Permission.APPROVE_CLAIMS) &&
          claim.status === 'pending' && (
            <View style={styles.adminActions}>
              {claim.employeeId === user?.employeeId ? (
                <Text style={styles.ownRequestText}>
                  {t('claims.cannotApproveOwn') || 'Cannot approve own request'}
                </Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleUpdateStatus('processed')}
                  >
                    <Text style={styles.buttonText}>{t('claims.process')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleUpdateStatus('rejected')}
                  >
                    <Text style={styles.buttonText}>{t('claims.reject')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

        {(user?.role === 'admin' || user?.role === 'rh') && (
          <View style={{ padding: theme.spacing.m, paddingTop: 0 }}>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const getStatusColor = (status: string, theme: Theme) => {
  switch (status) {
    case 'processed':
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
      marginBottom: theme.spacing.m,
    },
    typeTag: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    typeText: {
      ...theme.textVariants.caption,
      fontWeight: '700',
      color: theme.colors.text,
      textTransform: 'uppercase',
      fontSize: 11,
    },
    urgentTag: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    urgentText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#FFF',
      textTransform: 'uppercase',
    },
    date: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: theme.spacing.m,
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
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: theme.spacing.s,
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
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
  });
