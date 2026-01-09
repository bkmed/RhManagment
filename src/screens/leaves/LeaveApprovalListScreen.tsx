import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { leavesDb } from '../../database/leavesDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { formatDate } from '../../utils/dateUtils';
import { Leave } from '../../database/schema';
import { useAuth } from '../../context/AuthContext';
import { rbacService, Permission } from '../../services/rbacService';
import { employeesDb } from '../../database/employeesDb';

export const LeaveApprovalListScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingLeaves();
  }, []);

  const loadPendingLeaves = async () => {
    try {
      let leaves = await leavesDb.getPending();
      const currentUser = await employeesDb.getById(user?.employeeId!);

      // RBAC Filtering
      if (rbacService.isRH(user) || rbacService.isAdmin(user)) {
        // RH/Admin see all pending leaves
        setPendingLeaves(leaves);
      } else if (rbacService.hasPermission(user, Permission.APPROVE_LEAVES)) {
        // Managers see only their team's leaves (excluding themselves typically, but let's include all to be safe for now, filtering out their own requests if needed)
        // Logic: Get users in manager's team
        // If user is chef_dequipe (Manager), they should have a teamId or Department?
        // Let's assume manager filters by teamId matching the leave creator's teamId

        // We need to fetch employees to match IDs to teams if leaves don't have teamId
        // Leaves have employeeId.

        const allEmployees = await employeesDb.getAll();
        const myTeamIds = allEmployees
          .filter(e => e.teamId === currentUser?.teamId && e.id !== currentUser?.id) // Filter out self?
          .map(e => e.id);

        if (myTeamIds.length > 0) {
          leaves = leaves.filter(l => myTeamIds.includes(l.employeeId));
          setPendingLeaves(leaves);
        } else {
          setPendingLeaves([]); // No team members found or no team assigned
        }
      } else {
        // Employees shouldn't be here, but just in case
        setPendingLeaves([]);
      }
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('leaves.loadError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leave: Leave) => {
    try {
      await leavesDb.update(leave.id!, { status: 'approved' });
      // Update employee remaining days if it's a 'leave'
      if (leave.type === 'leave') {
        const { employeesDb } = require('../../database/employeesDb');
        const employee = await employeesDb.getById(leave.employeeId);
        if (employee) {
          // Try to calculate days if startDate/endDate exist, otherwise 1
          let days = 1;
          if (leave.startDate && leave.endDate) {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }

          await employeesDb.update(employee.id, {
            remainingVacationDays: Math.max(
              0,
              employee.remainingVacationDays - days,
            ),
          });
        }
      }
      notificationService.showAlert(
        t('common.success'),
        t('leaveStatus.approved'),
      );
      loadPendingLeaves();
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('common.saveError'));
      console.error(error);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      await leavesDb.update(id, { status: 'declined' });
      notificationService.showAlert(
        t('common.success'),
        t('leaveStatus.declined'),
      );
      loadPendingLeaves();
    } catch (error) {
      notificationService.showAlert(t('common.error'), t('common.saveError'));
      console.error(error);
    }
  };

  const renderItem = ({ item }: { item: Leave }) => {
    const isOwnRequest = item.employeeId === user?.employeeId;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardBadge}>{t(`leaveTypes.${item.type}`)}</Text>
        </View>
        <Text style={styles.cardSubtitle}>{item.employeeName}</Text>
        <Text style={styles.cardDate}>{formatDate(item.dateTime)}</Text>
        {item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}

        <View style={styles.actions}>
          {isOwnRequest ? (
            <Text style={styles.ownRequestText}>
              {t('leaves.cannotApproveOwn') || 'Cannot approve own request'}
            </Text>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDecline(item.id!)}
              >
                <Text style={styles.declineText}>{t('leaves.decline')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(item)}
              >
                <Text style={styles.approveText}>{t('leaves.approve')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingLeaves}
        renderItem={renderItem}
        keyExtractor={item => item.id!.toString()}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('leaves.noLeaves')}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { backgroundColor: theme.colors.background },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    listContent: { padding: theme.spacing.m },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    cardTitle: { ...theme.textVariants.subheader, color: theme.colors.text },
    cardBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    cardSubtitle: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    cardDate: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
    },
    cardNotes: {
      ...theme.textVariants.body,
      color: theme.colors.text,
      fontStyle: 'italic',
      marginBottom: theme.spacing.m,
    },
    actions: { flexDirection: 'row', gap: theme.spacing.m },
    actionButton: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
    },
    approveButton: { backgroundColor: theme.colors.primary },
    declineButton: { borderWidth: 1, borderColor: theme.colors.error },
    approveText: { color: theme.colors.surface, fontWeight: 'bold' },
    declineText: { color: theme.colors.error, fontWeight: 'bold' },
    emptyText: { ...theme.textVariants.body, color: theme.colors.subText },
    ownRequestText: {
      color: theme.colors.subText,
      fontStyle: 'italic',
      textAlign: 'center',
      flex: 1,
    },
  });
