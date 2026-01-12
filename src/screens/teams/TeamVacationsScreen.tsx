import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAuth } from '../../context/AuthContext';
import { Theme } from '../../theme';
import { Employee, Leave } from '../../database/schema';
import { formatDate } from '../../utils/dateUtils';

export const TeamVacationsScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const employees = useSelector((state: RootState) => state.employees.items);
  const leaves = useSelector((state: RootState) => state.leaves.items);
  const teams = useSelector((state: RootState) => state.teams.items);

  const teamMembers = useMemo(() => {
    if (!user?.teamId) return [];
    return employees.filter((emp: Employee) => emp.teamId === user.teamId);
  }, [employees, user?.teamId]);

  const teamName = useMemo(() => {
    if (!user?.teamId) return '';
    return teams.find((t: any) => t.id === user.teamId)?.name || '';
  }, [teams, user?.teamId]);

  const teamLeaves = useMemo(() => {
    const memberIds = teamMembers.map((m: Employee) => m.id);
    return leaves
      .filter((l: Leave) => memberIds.includes(l.employeeId || ''))
      .sort(
        (a: Leave, b: Leave) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
  }, [leaves, teamMembers]);

  const renderItem = ({ item }: { item: Leave }) => {
    const member = teamMembers.find((m: Employee) => m.id === item.employeeId);
    const isMe = item.employeeId === user?.id;

    return (
      <View style={[styles.card, isMe && styles.myCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.memberName}>
            {member?.name || t('common.unknown')}{' '}
            {isMe ? `(${t('common.yes')})` : ''}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status, theme) },
            ]}
          >
            <Text style={styles.statusText}>
              {t(`leaveStatus.${item.status}`)}
            </Text>
          </View>
        </View>
        <Text style={styles.leaveTitle}>{item.title}</Text>
        <Text style={styles.leaveDate}>{formatDate(item.dateTime)}</Text>
        {item.notes && <Text style={styles.leaveReason}>{item.notes}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamTitle}>
          {teamName || t('navigation.teams')}
        </Text>
        <Text style={styles.teamSubtitle}>
          {teamMembers.length} {t('navigation.employees')}
        </Text>
      </View>

      <FlatList
        data={teamLeaves}
        renderItem={renderItem}
        keyExtractor={item => item.id || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('leaves.noLeaves')}</Text>
          </View>
        }
      />
    </View>
  );
};

const getStatusColor = (status: string, theme: Theme) => {
  switch (status) {
    case 'approved':
      return theme.colors.success;
    case 'declined':
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
    header: {
      padding: theme.spacing.l,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...theme.shadows.small,
    },
    teamTitle: {
      ...theme.textVariants.header,
      color: theme.colors.primary,
    },
    teamSubtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginTop: 4,
    },
    listContent: {
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    myCard: {
      borderColor: theme.colors.secondary,
      borderLeftColor: theme.colors.secondary,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.s,
    },
    memberName: {
      ...theme.textVariants.body,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
    },
    leaveTitle: {
      ...theme.textVariants.subheader,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 2,
    },
    leaveDate: {
      ...theme.textVariants.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    leaveReason: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginTop: theme.spacing.s,
      fontStyle: 'italic',
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 50,
    },
    emptyText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
  });
